import { EnvKeyEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { getEnv, getElasticApiUrlWithCredentials } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";

import { EnvVarType } from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvVarType.ts";
import { SysUserEmailEnum } from "App/Modules/Users/Domain/Enums/SysUserEmailEnum.ts";

export class EnvironmentReaderRawRepository {

    private readonly envVars: EnvVarType;
    private static instance?: EnvironmentReaderRawRepository;

    private constructor() {
        this.envVars = {
            app_version: "v.0.0.8",
            app_version_update: "2025-10-12",
            environment: getEnv(EnvKeyEnum.APP_ENV) ?? EnvironmentEnum.PRODUCTION,
            app_name: getEnv(EnvKeyEnum.APP_NAME) ?? "env-app-name",
            base_url: getEnv(EnvKeyEnum.APP_URL) ?? "env-base-url",
            elastic_api_url: getElasticApiUrlWithCredentials(),
            log_paths: Deno.cwd() + "/storage/logs",
            alert_email_to: getEnv(EnvKeyEnum.APP_ALERT_EMAIL_TO) ?? SysUserEmailEnum.DEVELOPMENT_EMAIL,
        };
    }

    public static getInstance(): EnvironmentReaderRawRepository {
        if (EnvironmentReaderRawRepository.instance) return EnvironmentReaderRawRepository.instance;
        EnvironmentReaderRawRepository.instance = new EnvironmentReaderRawRepository();
        return EnvironmentReaderRawRepository.instance;
    }

    public isLocal(): boolean {
        return this.getEnvironment() === EnvironmentEnum.LOCAL;
    }

    public isProduction(): boolean {
        return this.getEnvironment() === EnvironmentEnum.PRODUCTION;
    }

    public getEnvironment(): EnvironmentEnum {
        return this.envVars.environment as EnvironmentEnum;
    }

    public getAppName(): string {
        return this.envVars.app_name;
    }

    public getBaseUrl(): string {
        return this.envVars.base_url;
    }

    public getLogPath(): string {
        return this.envVars.log_paths;
    }

    public getAppVersion(): string {
        return this.envVars.app_version;
    }

    public getAppVersionUpdate(): string {
        return this.envVars.app_version_update;
    }

    public getEnvVars(): EnvVarType {
        return this.envVars;
    }

    public getAlertEmailTo(): string {
        return "userexam@example.ex";
        return this.envVars.alert_email_to || SysUserEmailEnum.DEVELOPMENT_EMAIL;
    }

}
