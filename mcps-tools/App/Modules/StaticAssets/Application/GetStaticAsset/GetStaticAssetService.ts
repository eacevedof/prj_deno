import { GetStaticAssetDto } from "App/Modules/StaticAssets/Application/GetStaticAsset/GetStaticAssetDto.ts";
import { StaticAssetsException } from "App/Modules/StaticAssets/Domain/Exceptions/StaticAssetsException.ts";

export class GetStaticAssetService {

    private getStaticAssetDto: GetStaticAssetDto | null = null;

    private cleanAssetPath: string = "";

    public static getInstance(): GetStaticAssetService {
        return new GetStaticAssetService();
    }

    public async invoke(getStaticAssetDto: GetStaticAssetDto): Promise<{
        content: string;
        mimeType: string;
    }> {
        this.getStaticAssetDto = getStaticAssetDto;

        this.failIfWrongInput();
        await this.failIfAssetFileNotFound();

        return {
            content: await Deno.readTextFile(this.cleanAssetPath),
            mimeType: this.getMimeType(this.cleanAssetPath),
        };
    }

    private failIfWrongInput(): void {
        const assetPath: string = this.getStaticAssetDto!.getAssetPath() || "";
        if (assetPath.includes("..") || assetPath.includes("~")) {
            StaticAssetsException.badRequestCustom("invalid asset path");
        }
    }

    private async failIfAssetFileNotFound(): Promise<void> {
        const localAssetsPath: string = `${Deno.cwd()}/public/${this.tryToGetCleanedAssetPathOrFail()}`;
        try {
            await Deno.stat(localAssetsPath);
            this.cleanAssetPath = localAssetsPath;
        }
        catch (error) {
            console.error("failIfAssetFileNotFound", error)
            StaticAssetsException.notFoundCustom("file not found (1)");
        }
    }

    private tryToGetCleanedAssetPathOrFail(): string {
        const filePath: string = this.getStaticAssetDto!.getAssetPath() || "";
        if (!filePath) StaticAssetsException.notFoundCustom("file not found (2)");

        const cleanPath: string = filePath.replace(/^\/+/, "");
        if (!cleanPath) StaticAssetsException.notFoundCustom("file not found (3)");

        if (!cleanPath.startsWith("assets/"))
            StaticAssetsException.notFoundCustom("file not found (4)");

        return cleanPath;
    }

    private getMimeType(assetPath: string): string {
        const extension = assetPath.split(".").pop()?.toLowerCase();
        
        switch (extension) {
            case "css": return "text/css";
            case "js": return "text/javascript";
            case "png": return "image/png";
            case "jpg":
            case "jpeg": return "image/jpeg";
            case "gif": return "image/gif";
            case "svg": return "image/svg+xml";
            case "ico": return "image/x-icon";
            default: return "text/plain";
        }
    }

}