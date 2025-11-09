import { CustomRequestBodyTypeEnum } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestBodyTypeEnum.ts";

export interface InterfaceCustomRequest {
    body: object|null;
    hasBody: boolean;
    bodyType: CustomRequestBodyTypeEnum;
    headers: Record<string, string>;
    remote_ip: string;
    mediators_ips: string[];
    method: string;
    secure: boolean;
    url: Record<string, string>;
    urlSearch: Record<string, string>;
    urlParams: Record<string, string>;
    userAgent: {
        browser: { name?: string; version?: string; major?: string };
        cpu: { architecture?: string };
        device: { model?: string; type?: string; vendor?: string };
        engine: { name?: string; version?: string };
        os: { name?: string; version?: string };
        ua: string;
    }

    getHeader: (key: string) => string;
    getPostParameter: (key: string, def:unknown) => unknown;
    getGetParameter: (key: string, def:string) => string;
    getUrlParameter: (key: string, def:string) => string;
    getUrlInfo: (key: string, def?:string) => string;
    getDomain: () => string;
}