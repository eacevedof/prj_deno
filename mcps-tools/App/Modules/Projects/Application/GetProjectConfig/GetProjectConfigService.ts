import { GetProjectConfigDto } from "App/Modules/Projects/Application/GetProjectConfig/GetProjectConfigDto.ts";
import { GotProjectConfigDto } from "App/Modules/Projects/Application/GetProjectConfig/GotProjectConfigDto.ts";
import { ProjectsException } from "App/Modules/Projects/Domain/Exceptions/ProjectsException.ts";
import {
    ProjectsReaderPostgresRepository
} from "App/Modules/Projects/Infrastructure/Repositories/ProjectsReaderPostgresRepository.ts";

export class GetProjectConfigService {

    private getProjectConfigDto!: GetProjectConfigDto;

    private readonly projectsReaderPostgresRepository: ProjectsReaderPostgresRepository;

    private projectId!: number;

    constructor() {
        this.projectsReaderPostgresRepository = ProjectsReaderPostgresRepository.getInstance();
    }

    public static getInstance(): GetProjectConfigService {
        return new GetProjectConfigService();
    }

    public async invoke(getProjectConfigDto: GetProjectConfigDto): Promise<GotProjectConfigDto>
    {
        this.getProjectConfigDto = getProjectConfigDto;
        
        this.failIfWrongInput();

        await this.failIfWrongProjectAuthToken();

        return GotProjectConfigDto.fromPrimitives({
            projectConfig: await this.projectsReaderPostgresRepository.getProjectConfigByProjectId(
                this.projectId
            ),
        });
    }

    private failIfWrongInput(): void 
    {
        if (!this.getProjectConfigDto.getProjectAuthToken())
            ProjectsException.unauthorizedCustom("project auth token is required");
    }

    private async failIfWrongProjectAuthToken(): Promise<void>
    {
        const projectId: number|null = await this.projectsReaderPostgresRepository.getProjectIdByProjectAuthToken(
            this.getProjectConfigDto.getProjectAuthToken()
        );

        if (!projectId)
            ProjectsException.unauthorizedCustom("invalid token");

        this.projectId = projectId as number;
    }


}  