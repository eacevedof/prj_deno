import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { GetHealthCheckStatusDto } from "App/Modules/HealthCheck/Application/GetHealthCheckStatus/GetHealthCheckStatusDto.ts";
import { GetHealthCheckStatusService } from "App/Modules/HealthCheck/Application/GetHealthCheckStatus/GetHealthCheckStatusService.ts";

export class GetHealthCheckStatusController {

    public static getInstance(): GetHealthCheckStatusController {
        return new GetHealthCheckStatusController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            const now: string = new Date().toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
/*
            const healthCheckResult: Record<string, string|number|null> =
                await GetHealthCheckStatusService.getInstance().invoke(
                    GetHealthCheckStatusDto.fromHttpRequest(lzRequest)
                )
*/

            return CustomResponse.fromResponseDtoPrimitives({
                message: "get-health-check-status",
                data: "now "+ now,
            })

/*            return CustomResponse.fromResponseDtoPrimitives({
                message: "get-health-check-status",
                data: healthCheckResult,
            })*/
        }
        catch (error) {
            Logger.getInstance().logException(error);

            return CustomResponse.fromResponseDtoPrimitives({
                code: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
                message: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR,
            })
        }
    }

}
