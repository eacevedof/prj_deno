import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { AbstractHttpDto } from "App/Modules/Shared/Infrastructure/Components/Http/AbstractHttpDto.ts";

export class GetStaticAssetDto extends AbstractHttpDto {

    private readonly assetPath: string;

    constructor(primitives: {
        assetPath: string;
        remoteIp?: string;
        requestUri?: string;
    }) {
        super(primitives);
        this.assetPath = primitives.assetPath.trim();
    }

    public static fromHttpRequest(lzRequest: InterfaceCustomRequest): GetStaticAssetDto {
        return new GetStaticAssetDto({
            assetPath: lzRequest.url.pathname,
            remoteIp: lzRequest.remote_ip,
            requestUri: lzRequest.url.href,
        });
    }

    public getAssetPath(): string {
        return this.assetPath;
    }
}