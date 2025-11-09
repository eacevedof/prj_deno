export class Zipper {

    public static getInstance(): Zipper {
        return new Zipper();
    }

    public async zipFiles(rawFilePath: string, zipFilePath: string): Promise<void> {
        const rawStream = await Deno.open(rawFilePath);
        const zipStream = await Deno.open(zipFilePath, {
            create: true,
            write: true,
        });
        await rawStream.readable
            .pipeThrough(new CompressionStream("gzip"))
            .pipeTo(zipStream.writable);
    }

    public async unzipFile(zipFilePath: string, rawFilePath: string): Promise<void> {
        const zipStream = await Deno.open(zipFilePath);
        const rawStream = await Deno.open(rawFilePath, {
            create: true,
            write: true,
        });
        await zipStream.readable
            .pipeThrough(new DecompressionStream("gzip"))
            .pipeTo(rawStream.writable);
    }
}