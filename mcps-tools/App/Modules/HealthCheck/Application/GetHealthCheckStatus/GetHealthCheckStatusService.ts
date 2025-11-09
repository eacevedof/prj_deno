import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";

import { EnvironmentReaderRawRepository } from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvironmentReaderRawRepository.ts";
import { UsersReaderPostgresRepository } from "App/Modules/Users/Infrastructure/Repositories/UsersReaderPostgresRepository.ts";

import { GetHealthCheckStatusDto } from "App/Modules/HealthCheck/Application/GetHealthCheckStatus/GetHealthCheckStatusDto.ts";

export class GetHealthCheckStatusService {

    private readonly environmentReaderRawRepository: EnvironmentReaderRawRepository = EnvironmentReaderRawRepository.getInstance();
    private readonly usersReaderPostgresRepository: UsersReaderPostgresRepository = UsersReaderPostgresRepository.getInstance();

    public static getInstance(): GetHealthCheckStatusService {
        return new GetHealthCheckStatusService();
    }

    public async invoke(
        GetHealthCheckStatusDto: GetHealthCheckStatusDto
    ): Promise<Record<string, string|number|null>> {
        return {
            version: this.environmentReaderRawRepository.getAppVersion(),
            updated_at: this.environmentReaderRawRepository.getAppVersionUpdate(),
            server_tz: DateTimer.getInstance().getTimezone(),
            request_ip: GetHealthCheckStatusDto.remoteIp,
            request_time: GetHealthCheckStatusDto.requestTime,
            response_time: DateTimer.getInstance().getNowYmdHis(),
            db_ok: await this.usersReaderPostgresRepository.getFirstUserIdForHealthCheck(),
        }
    }


}
