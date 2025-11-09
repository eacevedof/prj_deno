import { HttpRequestMethodEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpRequestMethodEnum.ts";
import { CustomRequestBodyTypeEnum } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestBodyTypeEnum.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomRequestException } from "App/Modules/Shared/Infrastructure/Exceptions/CustomRequestException.ts";

export const getCustomRequestFromDenoRequest = async function (denoRequest: Request): Promise<InterfaceCustomRequest> {

    const url = getUrl(denoRequest);
    const {body, bodyType} = await getRequestBodyOrFail(denoRequest);
    const headers: Record<string, string> = getHeaders(denoRequest);
    const urlSearch: Record<string, string> = getUrlSearchParams(denoRequest);

    const lzRequest: InterfaceCustomRequest = {
        hasBody: body ? true : false,
        body,
        bodyType,
        headers,
        remote_ip: tryToGetRemoteIp(denoRequest),
        mediators_ips: tryToGetProxiesIps(denoRequest),
        method: denoRequest.method,
        secure: url.protocol === "https:",
        url,
        urlSearch,
        urlParams: {},
        //@ts-ignore
        userAgent: getUserAgent(headers["user-agent"] || ""),

        getHeader: (key: string): string => {
            return headers[key] || "";
        },

        getPostParameter: (key: string, def: unknown = null): unknown => {
            if (!lzRequest.body) return def;
            if (typeof lzRequest.body !== "object") return def;
            if (!(key in lzRequest.body)) return def;
            return (lzRequest.body as Record<string, unknown>)[key];
        },

        getGetParameter: (key: string, def: string = ""): string => {
            return lzRequest.urlSearch[key] || def;
        },

        getUrlParameter: (key: string, def: string = ""): string => {
            return lzRequest.urlParams[key] || def;
        },

        getUrlInfo: (key: string, def: string = ""): string => {
            const urlObj = lzRequest.url as any;
            return urlObj[key] || def;
        },

        getDomain: (): string => {
            const port: string = lzRequest.url.port ? `:${lzRequest.url.port}` : "";
            return `${lzRequest.url.protocol}//${lzRequest.url.hostname}${port}`;
        }
    };

    return lzRequest;
};

const getUrl = (denoRequest: Request):{
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    href: string;
} =>  {
    const url: URL = new URL(denoRequest.url);
    return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        href: url.href
    };
}

const getHeaders = (denoRequest: Request): Record<string, string> => {
    const headers: Record<string, string> = {};
    for (const [key, value] of denoRequest.headers.entries()) {
        headers[key] = value;
    }
    return headers;
}

const getRequestBodyOrFail = async (denoRequest: Request): Promise<{
    body: Record<string, unknown>|null,
    bodyType: CustomRequestBodyTypeEnum
}> => {
    const emptyObjet = {
        body: null,
        bodyType: CustomRequestBodyTypeEnum.UNKNOWN
    }

    if (denoRequest.method === HttpRequestMethodEnum.GET || denoRequest.method === HttpRequestMethodEnum.DELETE || !denoRequest.body) {
        return emptyObjet;
    }

    const contentType: string = denoRequest.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try {
            return {
                body: await denoRequest.json(),
                bodyType: CustomRequestBodyTypeEnum.JSON
            };
        }
        catch (error) {
            console.error("error parsing JSON body:", error);
            CustomRequestException.badRequestCustom("wrong json body");
        }
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
        try {
            const formData: FormData = await denoRequest.formData();
            return {
                body: Object.fromEntries(formData.entries()),
                bodyType: CustomRequestBodyTypeEnum.FORM,
            }
        }
        catch (error) {
            console.error("error parsing form body:", error);
            CustomRequestException.badRequestCustom("wrong form body");
        }
    }

    if (contentType.includes("text/")) {
        try {
            return {
                body: { text: await denoRequest.text() },
                bodyType: CustomRequestBodyTypeEnum.TEXT,
            }
        }
        catch (error) {
            console.error("error parsing text body:", error);
            CustomRequestException.badRequestCustom("wrong text body");
        }
    }
    return emptyObjet;
};

const getUrlSearchParams = (denoRequest: Request): Record<string, string> => {
    const url: URL = new URL(denoRequest.url);
    const urlSearch: Record<string, string> = {};
    for (const [key, value] of url.searchParams.entries()) {
        urlSearch[key] = value;
    }
    return urlSearch;
}

const tryToGetRemoteIp = (denoRequest: Request): string => {
    const headers: Headers = denoRequest.headers;
    /**
    headers: {
        accept: "* / *",
        "accept-encoding": "gzip",
        "content-length": "141",
        "content-type": "application/json",
        host: "appms-someappxxx.examplebsntechservices.com",
        "appmsaph-device-auth": "aph-dev-auth-vNpd2gHWCSrBMPtTkWM6an3ogMsiuv5Kh0N",
        "user-agent": "curl/8.5.0",
        "x-forwarded-for": "192.168.100.23",
        "x-forwarded-host": "appms-someappxxx.examplebsntechservices.com",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
        "x-forwarded-server": "1d627d7ce675",
        "x-real-ip": "192.168.100.23"
    }
    */
    //console.log("dnoRequest.headers:", headers);
    const xForwardedFor: string | null = headers.get("x-forwarded-for");
    if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

    const xRealIp: string | null = headers.get("x-real-ip");
    if (xRealIp) return xRealIp;

    const cfConnectingIp: string | null = headers.get("cf-connecting-ip");
    if (cfConnectingIp) return cfConnectingIp;

    const xClientIp: string | null = headers.get("x-client-ip");
    if (xClientIp) return xClientIp;

    try {
        // @ts-ignore - This is experimental and might not be available
        const connInfo = denoRequest.connectionInfo;
        if (connInfo && connInfo.remoteAddr) {
            return connInfo.remoteAddr.hostname || connInfo.remoteAddr;
        }
    }
    catch (error) {
        console.error("tryToGetRemoteIp error",error)
    }
    return "unknown";
};

const tryToGetProxiesIps = (denoRequest: Request): string[] => {
    const xForwardedFor = denoRequest.headers.get("x-forwarded-for");
    if (xForwardedFor) {
        return xForwardedFor.split(",").map(ip => ip.trim());
    }
    return [];
};

const getUserAgent = (userAgentString: string): object => {
    return {
        os: { name: undefined, version: undefined },
        ua: userAgentString,
        browser: { name: undefined, version: undefined, major: undefined },
        cpu: { architecture: undefined },
        device: { model: undefined, type: undefined, vendor: undefined },
        engine: { name: undefined, version: undefined }
    };
};

