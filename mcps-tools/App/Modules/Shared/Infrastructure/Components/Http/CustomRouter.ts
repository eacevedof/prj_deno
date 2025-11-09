import { CliTs as clits } from "App/Modules/Shared/Infrastructure/Components/Cli/CliTs.ts";
import { customControllerInvoker } from "App/Modules/Shared/Infrastructure/Components/Http/CustomControllerInvoker.ts";
import { AppRouteType } from "App/Modules/Shared/Infrastructure/Components/Http/AppRouteType.ts";
import { HttpRequestMethodEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpRequestMethodEnum.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { routes } from "App/Modules/Shared/Infrastructure/Routes/router.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { GetStaticAssetController } from "App/Modules/StaticAssets/Infrastructure/Controllers/GetStaticAssetController.ts";
import { NotFoundController } from "App/Modules/Shared/Infrastructure/Controllers/NotFoundController.ts";

export async function routeFinder(lzRequest: InterfaceCustomRequest): Promise<Response> {
    clits.echo("routeFinder 1");
    const requestUrl: string = lzRequest.url.pathname;
    if (lzRequest.method === HttpRequestMethodEnum.GET && requestUrl.startsWith("/assets/")) {
        clits.echo("routeFinder 2 assets");
        const lzResponse: CustomResponse = await GetStaticAssetController.getInstance().invoke(lzRequest);
        clits.echo("routeFinder 3 assets resolved");
        const lzResponseData: Record<string, unknown> = lzResponse.toPrimitives();
        clits.echo("routeFinder 4 response");
        return new Response(
            lzResponseData.body as string, {
                status: lzResponseData.statusCode as number,
                headers: {
                    "Content-Type": lzResponseData.mediaType as string + "; charset=UTF-8",
                    // @ts-ignore
                    ...lzResponseData.headers
                }
            }
        );
    }

    clits.echo("routeFinder 5 no assets");
    const { route, urlParams } = getRouteFromDenoRequest(lzRequest);
    clits.echo("routeFinder 6");
    lzRequest.urlParams = urlParams;
    clits.echo("routeFinder 7");
    if (route) {
        clits.echo("routeFinder 8");
        const r = await customControllerInvoker(lzRequest, route.controller);
        clits.echo("routeFinder 9");
        return r
    }

    return await customControllerInvoker(lzRequest, NotFoundController.getInstance());
}

const getRouteFromDenoRequest = function (lzRequest: InterfaceCustomRequest): {
    route: AppRouteType | null;
    urlParams: Record<string, string>
}
{
    const requestMethod: string = lzRequest.method;
    const requestUri: string = lzRequest.url.pathname;

    for (const route of routes) {
        if (route.method !== requestMethod) continue;
        if (route.pattern === requestUri) return { route, urlParams: {} };

        const routeParts: string[] = route.pattern.split("/");
        const pathParts: string[] = requestUri.split("/");

        if (routeParts.length !== pathParts.length) continue;

        const params: Record<string, string> = {};
        let matches:boolean = true;

        for (let i = 0; i < routeParts.length; i++) {
            const routePart: string = routeParts[i];
            const pathPart: string = pathParts[i];

            if (routePart.startsWith(":")) {
                const paramName = routePart.slice(1);
                params[paramName] = pathPart;
            }
            else if (routePart !== pathPart) {
                matches = false;
                break;
            }
        }

        if (matches) {
            return { route, urlParams: params };
        }
    }

    return { route: null, urlParams: {} };
}
