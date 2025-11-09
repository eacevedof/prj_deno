import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { AbstractHttpDto } from "App/Modules/Shared/Infrastructure/Components/Http/AbstractHttpDto.ts";

export class DeleteUserDto extends AbstractHttpDto{

    private readonly userUuid: string;

    constructor(primitives: {
        userUuid: string;
        remoteIp?: string;
        requestUri?: string;
    }) {
        super(primitives);
        this.userUuid = primitives.userUuid.trim();
    }

    public static fromPrimitives(primitives: {
        userUuid: string;
    }): DeleteUserDto {
        return new DeleteUserDto(primitives);
    }

    public static fromHttpRequest(httpRequest: InterfaceCustomRequest): DeleteUserDto {
        return new DeleteUserDto({
            userUuid: httpRequest.getUrlParameter("userUuid", ""),
            remoteIp: httpRequest.remote_ip,
            requestUri: httpRequest.url.href,
        });
    }

    public getUserUuid(): string {
        return this.userUuid;
    }

}
