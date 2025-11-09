import { Uuider } from "App/Modules/Shared/Infrastructure/Components/Uuider.ts";

import { UsersWriterPostgresRepository } from "App/Modules/Users/Infrastructure/Repositories/UsersWriterPostgresRepository.ts";
import { UsersReaderPostgresRepository } from "App/Modules/Users/Infrastructure/Repositories/UsersReaderPostgresRepository.ts";

import { CreateUserDto } from "App/Modules/Users/Application/Services/CreateUser/CreateUserDto.ts";
import { CreatedUserDto } from "App/Modules/Users/Application/Services/CreateUser/CreatedUserDto.ts";
import { UsersException } from "App/Modules/Users/Domain/Exceptions/UsersException.ts";
import { ProjectsReaderPostgresRepository } from "App/Modules/Projects/Infrastructure/Repositories/ProjectsReaderPostgresRepository.ts";

export class CreateUserService {

    private createUserDto!: CreateUserDto;

    private readonly uuider: Uuider;

    private readonly projectsReaderPostgresRepository: ProjectsReaderPostgresRepository;
    private readonly usersWriterPostgresRepository: UsersWriterPostgresRepository;
    private readonly usersReaderPostgresRepository: UsersReaderPostgresRepository;

    private createdUserUuid!: string|null;
    private projectId!: number;

    constructor() {
        this.uuider = Uuider.getInstance();
        this.projectsReaderPostgresRepository = ProjectsReaderPostgresRepository.getInstance();
        this.usersWriterPostgresRepository = UsersWriterPostgresRepository.getInstance();
        this.usersReaderPostgresRepository = UsersReaderPostgresRepository.getInstance();
    }

    public static getInstance(): CreateUserService {
        return new CreateUserService();
    }

    public async invoke(createUserDto: CreateUserDto): Promise<CreatedUserDto> 
    {
        this.createUserDto = createUserDto;
        
        this.failIfWrongInput();

        await this.failIfUserAlreadyExists();

        await this.createUser();

        return CreatedUserDto.fromPrimitives({
            userUuid: this.createdUserUuid!,
        });
    }

    private failIfWrongInput(): void 
    {
        if (!this.createUserDto.getProjectUuid())
            UsersException.badRequestCustom("project_uuid is required.");

        if (!this.createUserDto.getProjectUserUuid())
            UsersException.badRequestCustom("project_user_uuid is required.");

    }

    private async failIfUserAlreadyExists(): Promise<void>
    {
        const projectId: number|null = await this.projectsReaderPostgresRepository.getProjectIdByProjectUuid(
            this.createUserDto.getProjectUuid()
        );
        if (!projectId)
            UsersException.notFoundCustom(`project ${this.createUserDto.getProjectUuid()} not found`);

        this.projectId = projectId as number;
        const userUuid:string = await this.usersReaderPostgresRepository.getUserUuidByProjectIdAndProjectUserUuid(
            this.projectId,
            this.createUserDto.getProjectUserUuid()
        );

        if (userUuid)
            UsersException.conflictCustom(
              `user ${userUuid} already exists for this project ${this.createUserDto.getProjectUserUuid()} and user ${this.createUserDto.getProjectUserUuid()}`
            );
    }

    public async createUser(): Promise<void> 
    {
        this.createdUserUuid = await this.usersWriterPostgresRepository.createUser({
            projectId: this.projectId,
            projectUserUuid: this.createUserDto.getProjectUserUuid(),
            userUuid: this.uuider.getRandomUuidWithPrefix("usr"),
        });

        if (!this.createdUserUuid)
            UsersException.unexpectedCustom("user creation failed");

    }

}  