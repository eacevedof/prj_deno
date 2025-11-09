import { Context, Request } from "https://deno.land/x/oak@v17.1.4/mod.ts";

import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";

import { AppGlobalMap } from "App/Modules/Shared/Infrastructure/Bootstrap/AppGlobalMap.ts";
import { EnvironmentReaderRawRepository } from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvironmentReaderRawRepository.ts";
import { getDefaultCustomRequestByRouterContext } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequest.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { CustomRequestBodyTypeEnum } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestBodyTypeEnum.ts";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";

export const asyncInvokeController = async (
    routerContext: Context,
    controller: {
        invoke: (lzRequest: InterfaceCustomRequest) => Promise<CustomResponse>
    }
): Promise<void> => {
    const environmentReaderRawRepository: EnvironmentReaderRawRepository = EnvironmentReaderRawRepository.getInstance();
    const customRequest: InterfaceCustomRequest = getDefaultCustomRequestByRouterContext(routerContext);
    //console.log("asyncInvokeController.lzRequest 1", lzRequest)
    customRequest.body = await getResolvedRequestBody(routerContext.request);
    //console.log("lzRequest.body", lzRequest.body)

    if (!environmentReaderRawRepository.isProduction())
        console.log("asyncInvokeController.lzRequest\n", customRequest);

    AppGlobalMap.getInstance();
    Logger.getInstance({
        request_ip: customRequest.remote_ip,
        request_uri: customRequest.url.href,
    });
    //console.log("asyncInvokeController.lzRequest 3", lzRequest)
    const customResponse: CustomResponse = await controller.invoke(customRequest);
    //console.log("asyncInvokeController.lzRequest 4", lzRequest)

    const primitives: Record<string, unknown> = customResponse.toPrimitives();

    routerContext.response.status = primitives.statusCode as number;
    routerContext.response.body = primitives.body as Body;
}

const getResolvedRequestBody = async (
    // https://deno.land/x/oak@v17.1.4/request.ts
    httpRequest: Request
): Promise<Record<string, unknown>> => {
    if (!httpRequest.hasBody) return {};

    const bodyType: CustomRequestBodyTypeEnum = httpRequest.body.type() as CustomRequestBodyTypeEnum;

    switch (bodyType) {
        case CustomRequestBodyTypeEnum.FORM_DATA: {
            const formData = await httpRequest.body.formData();
            const result: Record<string, unknown> = {};
            for (const [key, value] of formData.entries()) {
                result[key] = value;
            }
            return result;
        }
        case CustomRequestBodyTypeEnum.FORM: {
            const params = await httpRequest.body.form();
            const result: Record<string, unknown> = {};
            for (const [key, value] of params.entries()) {
                result[key] = value;
            }
            return result;
        }
        case CustomRequestBodyTypeEnum.JSON:
            return await httpRequest.body.json();
        default:
            cli.echoYellow("unknown body type, skipping input data");
    }
    return {};
}
