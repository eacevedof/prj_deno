import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";
import { HttpResponseTypeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseTypeEnum.ts";

import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";

import { EnvironmentReaderRawRepository } from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvironmentReaderRawRepository.ts";

import { DocumentationViewDto } from "App/Modules/Documentation/Infrastructure/Views/DocumentationViewDto.ts";
import { DocumentationView } from "App/Modules/Documentation/Infrastructure/Views/DocumentationView.ts";

export class DocumentationWebController {

    private environmentReaderRawRepository: EnvironmentReaderRawRepository = EnvironmentReaderRawRepository.getInstance();

    public static getInstance(): DocumentationWebController {
        return new DocumentationWebController();
    }

    public async invoke(): Promise<CustomResponse> {
        try {
            const htmlContent: string = await DocumentationView.getInstance().invoke(
                DocumentationViewDto.fromPrimitives({
                    appVersion: this.environmentReaderRawRepository.getAppVersion(),
                    appVersionUpdate: this.environmentReaderRawRepository.getAppVersionUpdate(),
                    appBaseUrl: this.environmentReaderRawRepository.getBaseUrl()
                })
            );

            return CustomResponse.getInstance()
                .setMediaType(HttpResponseTypeEnum.TEXT_HTML)
                .setBody(htmlContent)
        }
        catch (error) {
            Logger.getInstance().logException(error);
            return CustomResponse.getInstance()
                .setMediaType(HttpResponseTypeEnum.TEXT_HTML)
                .setStatusCode(HttpResponseCodeEnum.INTERNAL_SERVER_ERROR)
                .setBody(`<h1>Error: ${HttpResponseMessageEnum.INTERNAL_SERVER_ERROR}</h1>`)
        }
    }

}
