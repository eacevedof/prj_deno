import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";

import { AppKeyEnum } from "App/Modules/Shared/Infrastructure/Bootstrap/AppKeyEnum.ts";
import { AppGlobalMap } from "App/Modules/Shared/Infrastructure/Bootstrap/AppGlobalMap.ts";

import { SysAuthTokenEnum } from "App/Modules/Authenticator/Domain/Enums/SysAuthTokenEnum.ts";
import { FailIfWrongAppAuthTokenDto } from "App/Modules/Authenticator/Application/FailIfWrongAppAuthToken/FailIfWrongAppAuthTokenDto.ts";
import { AuthenticatorException } from "App/Modules/Authenticator/Domain/Exceptions/AuthenticatorException.ts";
import { ProjectsReaderPostgresRepository } from "App/Modules/Projects/Infrastructure/Repositories/ProjectsReaderPostgresRepository.ts";

export class FailIfWrongAppAuthTokenService {

    private checkAppAuthTokenDto!: FailIfWrongAppAuthTokenDto;

    private readonly logger: Logger = Logger.getInstance();
    private readonly appGlobalMap: AppGlobalMap = AppGlobalMap.getInstance();

    private readonly projectsReaderPostgresRepository: ProjectsReaderPostgresRepository = ProjectsReaderPostgresRepository.getInstance();

    public static getInstance(): FailIfWrongAppAuthTokenService {
        return new FailIfWrongAppAuthTokenService();
    }

    public async invoke(checkAppAuthTokenDto: FailIfWrongAppAuthTokenDto): Promise<void>
    {
        this.checkAppAuthTokenDto = checkAppAuthTokenDto;

        this.failIfWrongInput();

        await this.failIfWrongAppAuthToken();

        this.checkAllowedSysAuthTokensOrFail();
    }

    private failIfWrongInput(): void
    {
        if (!this.checkAppAuthTokenDto.getAppAuthToken()) {
            this.logSecurityOnWrongToken();
            AuthenticatorException.unauthorizedCustom("missing app auth token");
        }
    }

    private async failIfWrongAppAuthToken(): Promise<void> {
        const projectId: number | null = await this.projectsReaderPostgresRepository.getProjectIdByProjectAuthToken(
            this.checkAppAuthTokenDto.getAppAuthToken()
        )
        if (!projectId) {
            this.logSecurityOnWrongToken();
            AuthenticatorException.unauthorizedCustom("wrong app auth token");
        }

        this.appGlobalMap.set(AppKeyEnum.PROJECT_ID, projectId);
    }

    private checkAllowedSysAuthTokensOrFail(): void {
        if (this.checkAppAuthTokenDto.getAppAuthToken() === SysAuthTokenEnum.ROOT)
            return;

        if (this.checkAppAuthTokenDto.getOnlyAllowedTokens().length > 0) {
            if (!this.checkAppAuthTokenDto.getOnlyAllowedTokens().includes(
                this.checkAppAuthTokenDto.getAppAuthToken() as SysAuthTokenEnum
            )) {
                this.logSecurityOnWrongToken("[app auth token not allowed (1)]");
                AuthenticatorException.unauthorizedCustom("app auth token not allowed (1)");
            }
        }

        if (this.checkAppAuthTokenDto.getOnlyForbiddenTokens().length > 0) {
            if (this.checkAppAuthTokenDto.getOnlyForbiddenTokens().includes(
                this.checkAppAuthTokenDto.getAppAuthToken() as SysAuthTokenEnum
            )) {
                this.logSecurityOnWrongToken("[app auth token not allowed (2)]");
                AuthenticatorException.unauthorizedCustom("app auth token not allowed (2)");
            }
        }
    }

    private logSecurityOnWrongToken(title: string = "[invalid app auth token]"): void {
        this.logger.logSecurity({
            request: {
                apiToken: this.checkAppAuthTokenDto.getAppAuthToken(),
                method: this.checkAppAuthTokenDto.getRequestMethod(),
                url: this.checkAppAuthTokenDto.getRequestUrl(),
                userAgent: this.checkAppAuthTokenDto.getUserAgent(),
            },
            response_code: HttpResponseCodeEnum.UNAUTHORIZED,
        }, title);
    }

}
