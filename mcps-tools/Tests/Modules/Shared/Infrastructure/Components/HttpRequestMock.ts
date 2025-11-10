import { AuthKeyEnum } from "App/Modules/Authenticator/Domain/Enums/AuthKeyEnum.ts";
import { CustomRequestBodyTypeEnum } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestBodyTypeEnum.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";

export class HttpRequestMock {

    private headers: Record<string, string> = {};
    private postParams: Record<string, string> = {};
    private routeParams: Record<string, string> = {};
    private remoteIp: string = "127.0.0.1";
    private url: URL = new URL("http://host.docker.internal:8080/test");

    public static getInstance(): HttpRequestMock {
        return new HttpRequestMock();
    }
    public setBearerToken(token: string): HttpRequestMock {
        this.headers["Authorization"] = `Bearer ${token}`;
        return this;
    }

    public setPostParams(params: Record<string, string>): HttpRequestMock {
        this.postParams = { ...this.postParams, ...params };
        return this;
    }

    public setRouteParams(params: Record<string, string>): HttpRequestMock {
        this.routeParams = { ...this.routeParams, ...params };
        return this;
    }

    public setRemoteIp(ip: string): HttpRequestMock {
        this.remoteIp = ip;
        return this;
    }

    public setUrl(url: string): HttpRequestMock {
        // Replace localhost with host.docker.internal
        const dockerUrl = url.replace("localhost", "host.docker.internal");
        this.url = new URL(dockerUrl);
        return this;
    }

    public getMockedInstance(): InterfaceCustomRequest {
        return {
            body: null,
            hasBody: false,
            bodyType: CustomRequestBodyTypeEnum.FORM_DATA,
            headers: this.headers,
            remote_ip: this.remoteIp,
            mediators_ips: [],
            method: "POST",
            secure: false,
            url: {
                href: this.url.href,
                protocol: this.url.protocol,
                hostname: this.url.hostname,
                port: this.url.port,
                pathname: this.url.pathname
            },
            urlSearch: {},
            urlParams: this.routeParams,
            userAgent: {
                browser: { name: "test", version: "1.0", major: "1" },
                cpu: { architecture: "x64" },
                device: { model: "test", type: "desktop", vendor: "test" },
                engine: { name: "test", version: "1.0" },
                os: { name: "test", version: "1.0" },
                ua: "test-user-agent"
            },
            
            getHeader: (key: string): string => {
                return this.headers[key] || "";
            },
            
            getPostParameter: (key: string, def: unknown = ""): unknown => {
                return this.postParams[key] || def;
            },
            
            getGetParameter: (key: string, def: string = ""): string => {
                return def;
            },
            
            getUrlParameter: (key: string, def: string = ""): string => {
                return this.routeParams[key] || def;
            },
            
            getUrlInfo: (key: string, def?: string): string => {
                return def || "";
            },
            
            getDomain: (): string => {
                return this.url.hostname;
            }
        };
    }
}