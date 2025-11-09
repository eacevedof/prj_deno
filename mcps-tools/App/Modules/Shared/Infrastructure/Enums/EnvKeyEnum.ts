import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";

export enum EnvKeyEnum {
    APP_ENV                 = "APP_ENV",
    APP_NAME                = "APP_NAME",
    APP_URL                 = "APP_URL",
    APP_PORT                = "APP_PORT",

    APP_ELASTIC_URL         = "APP_ELASTIC_URL",
    APP_ELASTIC_USERNAME    = "APP_ELASTIC_USERNAME",
    APP_ELASTIC_PASSWORD    = "APP_ELASTIC_PASSWORD",
    APP_REDIS_URL           = "APP_REDIS_URL",
    APP_REDIS_DB_DOMAINS       = "APP_REDIS_DB_DOMAINS",
    APP_REDIS_DB_STREAMS       = "APP_REDIS_DB_STREAMS",

    APP_DB_HOST             = "APP_DB_HOST",
    APP_DB_PORT             = "APP_DB_PORT",
    APP_DB_NAME             = "APP_DB_NAME",
    APP_DB_USER             = "APP_DB_USER",
    APP_DB_PWD              = "APP_DB_PWD",
    APP_DB_POOL_SIZE        = "APP_DB_POOL_SIZE",

    APP_SHARED_FOLDER_PATH  = "APP_SHARED_FOLDER_PATH",

    APP_TUNNEL_SERVER       = "APP_TUNNEL_SERVER",
    APP_TUNNEL_PORT         = "APP_TUNNEL_PORT",
    APP_TUNNEL_USER         = "APP_TUNNEL_USER",
    APP_TUNNEL_KEY_FILE     = "APP_TUNNEL_KEY_FILE",

    APP_ALERT_EMAIL_TO      = "APP_ALERT_EMAIL_TO",
}

export function getEnv(envKey: EnvKeyEnum): string|null {
    return Deno.env.get(envKey) ?? null;
}

export function getEnvs(): Record<string, string> {
    const envs: Record<string, string> = {};
    Object.values(EnvKeyEnum).forEach((key: string) => {
        const value: string|null = getEnv(key as EnvKeyEnum);
        if (value !== null) {
            envs[key] = value;
        }
    });
    return envs;
}

export function isEnvironment(appEnv: EnvironmentEnum): boolean {
    return getEnv(EnvKeyEnum.APP_ENV) === appEnv;
}

/**
 * Construye la URL completa de Elastic con credenciales embebidas
 * @returns URL en formato https://username:password@host:port
 */
export function getElasticApiUrlWithCredentials(): string {
    const baseUrl = getEnv(EnvKeyEnum.APP_ELASTIC_URL);
    const username = getEnv(EnvKeyEnum.APP_ELASTIC_USERNAME);
    const password = getEnv(EnvKeyEnum.APP_ELASTIC_PASSWORD);

    if (!baseUrl) return "";
    if (!username || !password) return baseUrl;

    try {
        const url = new URL(baseUrl);
        url.username = username;
        url.password = password;
        return url.toString();
    } catch (error) {
        console.error("[EnvKeyEnum] Error building Elastic URL:", error);
        return baseUrl;
    }
}