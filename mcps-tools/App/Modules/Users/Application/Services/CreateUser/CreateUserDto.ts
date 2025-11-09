import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { AbstractHttpDto } from "App/Modules/Shared/Infrastructure/Components/Http/AbstractHttpDto.ts";

export class CreateUserDto extends AbstractHttpDto{

    private readonly projectUuid: string;
    private readonly projectUserUuid: string;

    constructor(primitives: {
        projectUuid: string;
        projectUserUuid: string;
        remoteIp?: string;
        requestUri?: string;
    }) {
        super(primitives);
        this.projectUuid     = primitives.projectUuid.trim();
        this.projectUserUuid = primitives.projectUserUuid.trim();
    }

    public static fromPrimitives(
        primitives: {
            projectUuid: string;
            projectUserUuid: string;
        },
    ): CreateUserDto {
        return new CreateUserDto(primitives);
    }

    public static fromHttpRequest(httpRequest: InterfaceCustomRequest): CreateUserDto {
        return new CreateUserDto({
            projectUuid: httpRequest.getPostParameter("project_uuid", "") as string,
            projectUserUuid: httpRequest.getPostParameter("project_user_uuid", "") as string,
            remoteIp: httpRequest.remote_ip,
            requestUri: httpRequest.url.href,
        });
    }

    public getProjectUuid(): string {
        return this.projectUuid;
    }

    public getProjectUserUuid(): string {
        return this.projectUserUuid;
    }

}
