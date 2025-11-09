import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

export class NotFoundController {

    public static getInstance(): NotFoundController {
        return new NotFoundController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {

        this.logNotFoundRequest(lzRequest);

        return CustomResponse.fromResponseDtoPrimitives({
            code: HttpResponseCodeEnum.NOT_FOUND,
            message: HttpResponseMessageEnum.NOT_FOUND,
            data: null,
        })
    }

    private logNotFoundRequest(lzRequest: InterfaceCustomRequest): void {
        Logger.getInstance().logSecurity({
            request: {
                method: lzRequest.method,
                url: lzRequest.url.href +"?"+ lzRequest.url.search,
                url_params: lzRequest.urlParams,
                headers: lzRequest.headers,
                body: lzRequest.body,
                userAgent: lzRequest.userAgent,
            },
            response_code: HttpResponseCodeEnum.NOT_FOUND
        }, "[not found request]");
    }

}
