import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { InterfaceControllerBase } from "App/Modules/Shared/Infrastructure/Controllers/InterfaceControllerBase.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";

export const customControllerInvoker = async (
    lzRequest: InterfaceCustomRequest,
    controller: InterfaceControllerBase,
): Promise<Response> => {
    const lzResponse: CustomResponse = await controller.invoke(lzRequest);

    const lzResponseData: Record<string, unknown> = lzResponse.toPrimitives();
    const isJson: boolean = lzResponseData.mediaType === "application/json";

    const responseStatus = {
        status: lzResponseData.statusCode,
        headers: {
            "Content-Type": `${lzResponseData.mediaType}; charset=UTF-8`,
            //@ts-ignore
            ...lzResponseData.headers,
        },
    }
    const responseBody: string = isJson
        ? JSON.stringify(lzResponseData.body)
        : lzResponseData.body as string;

    //@ts-ignore
    return new Response(responseBody, responseStatus);
};