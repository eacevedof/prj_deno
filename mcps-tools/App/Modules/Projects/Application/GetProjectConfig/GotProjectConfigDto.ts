import { AbstractHttpDto } from "App/Modules/Shared/Infrastructure/Components/Http/AbstractHttpDto.ts";

export class GotProjectConfigDto extends AbstractHttpDto {

    private readonly projectConfig: Record<string, string>[];

    constructor(primitives: {
        projectConfig: Record<string, string>[];
        remoteIp?: string;
        requestUri?: string;
    }) {
        super(primitives);
        this.projectConfig = primitives.projectConfig;
    }

    public static fromPrimitives(
        primitives: {
            projectConfig: Record<string, string>[];
        },
    ): GotProjectConfigDto {
        return new GotProjectConfigDto(primitives);
    }

    public toPrimitives(): Record<string, unknown> {
        return {
            project_config: this.projectConfig,
        };
    }

}