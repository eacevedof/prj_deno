import {getEnv, EnvKeyEnum} from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

const environment: string = getEnv(EnvKeyEnum.APP_ENV) || "development";

export const StreamNameEnum = {
    STREAM_DOMAIN_PENDING: `${environment}:stream-domain-pending`,
    STREAM_DOMAIN_CALCULATED_RISK: `${environment}:stream-domain-calculated-risk`,
} as const;