import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { AbstractHttpDto } from "App/Modules/Shared/Infrastructure/Components/Http/AbstractHttpDto.ts";
import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";

export class GetHealthCheckStatusDto extends AbstractHttpDto {

    readonly remoteIp: string;
    readonly requestTime: string;

    private constructor(primitives: {
        remoteIp: string;
        requestTime: string;
        requestUri?: string;
    }) {
        super(primitives);
        this.remoteIp = primitives.remoteIp;
        this.requestTime = primitives.requestTime;
    }

    public static fromHttpRequest(lzRequest: InterfaceCustomRequest): GetHealthCheckStatusDto {
        return new GetHealthCheckStatusDto({
            remoteIp: lzRequest.remote_ip,
            requestTime: DateTimer.getInstance().getNowYmdHis(),
        });
    }
}
