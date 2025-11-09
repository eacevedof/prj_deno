import { ensureDir } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

export class Cacher {

    private readonly cacheFolder: string = join(Deno.cwd(), "storage", "cache") + "/";
    private readonly cacheFilePath: string;

    constructor(cacheFileName: string) {
        this.cacheFilePath = join(this.cacheFolder, cacheFileName);
    }

    public static getInstance(cacheFileName: string): Cacher {
        return new Cacher(cacheFileName);
    }

    async get(key: string): Promise<any | null> {
        try {
            const fileContent: string = await Deno.readTextFile(this.cacheFilePath);
            const jsonObj = JSON.parse(fileContent);

            const cacheEntry = jsonObj[key] ?? null;
            if (!cacheEntry) return null;

            const tsNowInMilliSeconds = Date.now();
            if (tsNowInMilliSeconds < cacheEntry.expiry) {
                return cacheEntry.value;
            }

            delete jsonObj[key];
            await Deno.writeTextFile(
                this.cacheFilePath,
                JSON.stringify(jsonObj, null, 2),
            );
            return null;
        }
        catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                return null; // Cache file does not exist
            }
            throw error;
        }
    }

    async add(key: string, value: any, ttlMinutes: number): Promise<void> {
        let cache: { [key: string]: { value: any; expiry: number } } = {};
        try {
            const data = await Deno.readTextFile(this.cacheFilePath);
            cache = JSON.parse(data);
        } catch (error) {
            if (!(error instanceof Deno.errors.NotFound)) {
                throw error;
            }
        }

        const now = Date.now();
        const expiry = now + ttlMinutes * 60 * 1000;

        cache[key] = { value, expiry };
        await ensureDir(this.cacheFolder);
        await Deno.writeTextFile(
            this.cacheFilePath,
            JSON.stringify(cache, null, 2),
        );
    }

}
