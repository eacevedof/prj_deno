import { AbstractHttpDto } from "App/Modules/Shared/Infrastructure/Components/Http/AbstractHttpDto.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { ProjectInputKeyEnum } from "App/Modules/Projects/Domain/Enums/ProjectInputKeyEnum.ts";

export class GetProjectConfigDto extends AbstractHttpDto {

    private readonly projectAuthToken: string;

    constructor(primitives: {
        projectAuthToken: string;
        remoteIp?: string;
        requestUri?: string;
    }) {
        super(primitives);
        this.projectAuthToken = primitives.projectAuthToken.trim();
    }


    public static fromHttpRequest(httpRequest: InterfaceCustomRequest): GetProjectConfigDto {
        return new GetProjectConfigDto({
            projectAuthToken: httpRequest.getHeader(ProjectInputKeyEnum.PROJECT_AUTH_TOKEN.valueOf()) || "",
            remoteIp: httpRequest.remote_ip,
            requestUri: httpRequest.url.href,
        });
    }

    public getProjectAuthToken(): string {
        return this.projectAuthToken;
    }

}
