import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { AbstractHttpDto } from "App/Modules/Shared/Infrastructure/Components/Http/AbstractHttpDto.ts";
import { AuthKeyEnum } from "App/Modules/Authenticator/Application/Domain/Enums/AuthKeyEnum.ts";

export class FailIfWrongAppAuthTokenDto extends AbstractHttpDto{

    private readonly appAuthToken: string;

    private readonly onlyAllowedTokens?: string[];
    private readonly onlyForbiddenTokens?: string[];

    constructor(primitives: {
        appAuthToken: string;
        onlyAllowedTokens?: string[];
        onlyForbiddenTokens?: string[];

        requestMethod?: string;
        userAgent?: string;
        remoteIp?: string;
        requestUri?: string;
    }) {
        super(primitives);
        this.appAuthToken = primitives.appAuthToken.trim();
        this.onlyAllowedTokens = primitives.onlyAllowedTokens ?? [];
        this.onlyForbiddenTokens = primitives.onlyForbiddenTokens ?? [];
    }

    public static fromPrimitives(
        primitives: {
            appAuthToken: string;
            onlyAllowedTokens?: string[];
            onlyForbiddenTokens?: string[];
        },
    ): FailIfWrongAppAuthTokenDto {
        return new FailIfWrongAppAuthTokenDto(primitives);
    }

    public static fromHttpRequest(httpRequest: InterfaceCustomRequest): FailIfWrongAppAuthTokenDto {
        return new FailIfWrongAppAuthTokenDto({
            appAuthToken: httpRequest.getHeader(AuthKeyEnum.PROJECT_AUTH_TOKEN),

            requestMethod: httpRequest.method,
            userAgent: httpRequest.userAgent.ua,
            remoteIp: httpRequest.remote_ip,
            requestUri: httpRequest.url.href,
        });
    }

    public static fromHttpRequestAndAllowed(
        httpRequest: InterfaceCustomRequest,
        onlyAllowedTokens?: string[],
        onlyForbiddenTokens?: string[],
    ): FailIfWrongAppAuthTokenDto {
        return new FailIfWrongAppAuthTokenDto({
            appAuthToken: httpRequest.getHeader(AuthKeyEnum.PROJECT_AUTH_TOKEN),
            onlyAllowedTokens: onlyAllowedTokens ?? [],
            onlyForbiddenTokens: onlyForbiddenTokens ?? [],

            requestMethod: httpRequest.method,
            userAgent: httpRequest.userAgent.ua,
            remoteIp: httpRequest.remote_ip,
            requestUri: httpRequest.url.href,
        });
    }

    public getAppAuthToken(): string {
        return this.appAuthToken;
    }

    public getOnlyAllowedTokens(): string[] {
        return this.onlyAllowedTokens ?? [];
    }

    public getOnlyForbiddenTokens(): string[] {
        return this.onlyForbiddenTokens ?? [];
    }

}
