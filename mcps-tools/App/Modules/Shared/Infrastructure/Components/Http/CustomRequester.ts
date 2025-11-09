import { CliTs as clits } from "App/Modules/Shared/Infrastructure/Components/Cli/CliTs.ts";
import { HttpRequestMethodEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpRequestMethodEnum.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { getCustomRequestFromDenoRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestFactory.ts";
import { routeFinder } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRouter.ts";
import { CustomRequestException } from "App/Modules/Shared/Infrastructure/Exceptions/CustomRequestException.ts";

export async function customRequester(
    denoRequest: Request,
    info: Deno.ServeHandlerInfo
): Promise<Response> {

    clits.echo("customRequester 1")
    const corsHeaders: Record<string, string> = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": `${HttpRequestMethodEnum.GET}, ${HttpRequestMethodEnum.POST}, ${HttpRequestMethodEnum.PUT}, ${HttpRequestMethodEnum.DELETE}, ${HttpRequestMethodEnum.OPTIONS}`,
        "Access-Control-Allow-Headers": "Content-Type, Authorization, appmsaph-auth, appmsaph-device-auth",
    };

    // handle preflight requests
    if (denoRequest.method === HttpRequestMethodEnum.OPTIONS) {
        clits.echo("customRequester 2")
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    try {
        clits.echo("customRequester 3")
        //esto puede romper por un json de entrada mal formado
        const lzRequest: InterfaceCustomRequest = await getCustomRequestFromDenoRequest(denoRequest);
        //console.log("denoRequest: ", denoRequest, "lzRequest: ", lzRequest);

        const remoteIp: string = lzRequest.remote_ip;
        if (remoteIp === "unknown" || remoteIp === "")
            lzRequest.remote_ip = info.remoteAddr.hostname || "unknown";

        /*console.log("seeting metadata: ", {
            request_ip: lzRequest.remote_ip,
            request_uri: lzRequest.url.pathname,
        });*/
        Logger.getInstance({
            request_ip: lzRequest.remote_ip,
            request_uri: lzRequest.url.pathname,
        });

        const denoResponse: Response = await routeFinder(lzRequest);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            denoResponse.headers.set(key, value);
        });
        clits.echo("customRequester 6")
        return denoResponse;
    }
    catch (error: unknown) {
        clits.echo("customRequester 4 error")
        Logger.getInstance().logException(error, "public/index.ts");

        if (error instanceof CustomRequestException) {
            return new Response(
                JSON.stringify({
                    code: error.getStatusCode(),
                    status: "error",
                    message: error.getMessage(),
                    data: []
                }), {
                    status: error.getStatusCode(),
                    headers: {
                        "Content-Type": "application/json",
                        ...corsHeaders
                    },
                }
            );
        }

        clits.echo("customRequester 5 error response")
        return new Response(
            JSON.stringify({
                code: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR.valueOf(),
                status: "error",
                message: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR.valueOf(),
                data: error instanceof Error ? error.message : String(error)
            }), {
                status: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR.valueOf(),
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                },
            }
        );// deno Response

    }
}
