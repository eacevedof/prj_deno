import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { GetStaticAssetDto } from "App/Modules/StaticAssets/Application/GetStaticAsset/GetStaticAssetDto.ts";
import { GetStaticAssetService } from "App/Modules/StaticAssets/Application/GetStaticAsset/GetStaticAssetService.ts";
import { StaticAssetsException } from "App/Modules/StaticAssets/Domain/Exceptions/StaticAssetsException.ts";

export class GetStaticAssetController {

    public static getInstance(): GetStaticAssetController {
        return new GetStaticAssetController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            const staticAssetResult = await GetStaticAssetService.getInstance().invoke(
                GetStaticAssetDto.fromHttpRequest(lzRequest)
            );

            return CustomResponse.getInstance({
                statusCode: 200,
                mediaType: staticAssetResult.mimeType,
                body: staticAssetResult.content
            });
        }
        catch (error) {
            if (error instanceof StaticAssetsException) {
                return CustomResponse.getInstance({
                    statusCode: error.getStatusCode(),
                    mediaType: "text/plain",
                    body: error.getMessage()
                });
            }

            Logger.getInstance().logException(error);

            return CustomResponse.getInstance({
                statusCode: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
                mediaType: "text/plain",
                body: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR
            });
        }
    }

}