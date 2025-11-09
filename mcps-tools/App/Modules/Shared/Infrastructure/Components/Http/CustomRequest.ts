import { Context, Request } from "https://deno.land/x/oak@v17.1.4/mod.ts";
//import { Request } from "https://deno.land/x/oak@v17.1.4/request.ts";
import { CustomRequestBodyTypeEnum } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestBodyTypeEnum.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";

//Request: https://deno.land/x/oak@v17.1.4/request.ts
export const getDefaultCustomRequestByRouterContext = (
    routerContext: Context
): InterfaceCustomRequest => {

    const httpRequest: Request = routerContext.request

    const customRequest: InterfaceCustomRequest = {
        body: null,
        hasBody: httpRequest.body.has,
        bodyType: httpRequest.body.type() as CustomRequestBodyTypeEnum || CustomRequestBodyTypeEnum.UNKNOWN,
        headers: Object.fromEntries(httpRequest.headers.entries()),
        remote_ip: tryToGetRemoteIp(httpRequest),
        mediators_ips: tryToGetProxiesIps(httpRequest), //en caso de balaceadores o proxies
        method: httpRequest.method,
        secure: httpRequest.secure, //true si es https
        url: {
            protocol: httpRequest.url.protocol,
            hostname: httpRequest.url.hostname,
            port: httpRequest.url.port,
            pathname: httpRequest.url.pathname,
            search: httpRequest.url.search,
            href: httpRequest.url.href
        },
        urlSearch: getAllUrlParameters(httpRequest),
        //@ts-ignore
        urlParams: routerContext?.params ?? {}, //esto no existe hasta llamar a router.method(...)
        userAgent: {
            os: httpRequest.userAgent.os,
            ua: httpRequest.userAgent.ua,
            browser: httpRequest.userAgent.browser,
            cpu: httpRequest.userAgent.cpu,
            device: httpRequest.userAgent.device,
            engine: httpRequest.userAgent.engine
        },

        getHeader: (key: string): string => {
            return customRequest.headers[key] ?? "";
        },

        //GET parameters
        getGetParameter: (key: string, def:string = ""): string => {
            if (customRequest.urlParams && key in customRequest.urlSearch) {
                // @ts-ignore
                return customRequest.urlParams[key];
            }
            return def;
        },

        //POST parameters
        getPostParameter: (key: string, def:unknown = null): unknown => {
            if (customRequest.body && key in customRequest.body) {
                // @ts-ignore
                return customRequest.body[key];
            }
            return def;
        },

        getUrlParameter: (key: string, def:string = ""): string => {
            if (customRequest.urlParams && key in customRequest.urlParams) {
                // @ts-ignore
                return customRequest.urlParams[key];
            }
            return def;
        },

        getUrlInfo: (key: string, def:string = ""): string => {
            if (customRequest.url && key in customRequest.url) {
                // @ts-ignore
                return customRequest.url[key];
            }
            return def;
        },

        getDomain: (): string => {
            const url: URL = new URL(httpRequest.url.href);
            const port: string = url.port ? `:${url.port}` : "";
            return `${url.protocol}//${url.hostname}${port}`;
        }
    }
    return customRequest
}

function getAllUrlParameters(httpRequest: Request): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of httpRequest.url.searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

function tryToGetRemoteIp(httpRequest: Request): string {
    try {
        return httpRequest.ip;
    }
    catch (error) {
        console.error("customRequests.tryToGetRemoteIp:", error, httpRequest.headers);
        // not found ip in request try from headers
        const headers: Headers = httpRequest.headers;

        // read proxy headers
        const csvProxyIps = headers.get("x-forwarded-for");
        if (csvProxyIps) return csvProxyIps.split(",")[0].trim();

        const xRealIp = headers.get("x-real-ip");
        if (xRealIp) return xRealIp;

        // other proxy headers
        const cfConnectingIp = headers.get("cf-connecting-ip");
        if (cfConnectingIp) return cfConnectingIp;

        const xClientIp = headers.get("x-client-ip");
        if (xClientIp) return xClientIp;

        return "unknown";
    }
}

function tryToGetProxiesIps(httpRequest: Request): string[] {
    try {
        return httpRequest.ips;
    }
    catch (error) {
        console.error("customRequests.tryToGetProxiesIps:", error, httpRequest);
        const csvProxyIps = httpRequest.headers.get("x-forwarded-for");
        if (csvProxyIps)
            return csvProxyIps.split(",").map(ip => ip.trim());

        return [];
    }
}

/*
asyncInvokeController.lzRequest
 {
  body: { domain: "eaf.com" },
  hasBody: true,
  bodyType: "json",
  headers: {
    accept: "**",
"content-length": "21",
    "content-type": "application/json",
    host: "localhost:4300",
    "appmsaph-device-auth": "aph-dev-auth-pZtqGPGeEfXefo9CXWrkKPkKMyZBpiLUbuo",
    "user-agent": "curl/7.81.0"
},
remote_ip: "172.18.0.1",
    mediators_ips: [],
    method: "POST",
    secure: false,
    url: {
    protocol: "http:",
    hostname: "localhost",
    port: "4300",
    pathname: "/v1/mod-name/check-if-domain-is-dangerous",
    search: "",
    href: "http://localhost:4300/v1/mod-name/check-if-domain-is-dangerous"
    },
urlSearch: {},
urlParams: {},
userAgent: {
    os: { name: undefined, version: undefined },
    ua: "curl/7.81.0",
    browser: { name: undefined, version: undefined, major: undefined },
    cpu: { architecture: undefined },
    device: { model: undefined, type: undefined, vendor: undefined },
    engine: { name: undefined, version: undefined }
},
getHeader: [Function: getHeader],
getBodyParameter: [Function: getBodyParameter],
getUrlSearch: [Function: getUrlSearch],
getUrlParameter: [Function: getUrlParameter],
getUrlInfo: [Function: getUrlInfo],
getDomain: [Function: getDomain]
}
*/