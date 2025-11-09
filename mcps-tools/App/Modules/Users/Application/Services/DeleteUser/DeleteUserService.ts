import { UsersReaderPostgresRepository } from "App/Modules/Users/Infrastructure/Repositories/UsersReaderPostgresRepository.ts";
import { UsersWriterPostgresRepository } from "App/Modules/Users/Infrastructure/Repositories/UsersWriterPostgresRepository.ts";

import { DeleteUserDto } from "App/Modules/Users/Application/Services/DeleteUser/DeleteUserDto.ts";
import { DeletedUserDto } from "App/Modules/Users/Application/Services/DeleteUser/DeletedUserDto.ts";
import { UsersException } from "App/Modules/Users/Domain/Exceptions/UsersException.ts";
import {GenericRowType} from "App/Modules/Shared/Infrastructure/Types/GenericRowType.ts";

export class DeleteUserService {

    private deleteUserDto!: DeleteUserDto;

    private readonly usersReaderPostgresRepository: UsersReaderPostgresRepository;
    private readonly usersWriterPostgresRepository: UsersWriterPostgresRepository;

    private userId!: number;
    private userDeletedAt: string = "";

    constructor() {
        this.usersReaderPostgresRepository = UsersReaderPostgresRepository.getInstance();
        this.usersWriterPostgresRepository = UsersWriterPostgresRepository.getInstance();
    }

    public static getInstance(): DeleteUserService {
        return new DeleteUserService();
    }

    public async invoke(deleteUserDto: DeleteUserDto): Promise<DeletedUserDto> 
    {
        this.deleteUserDto = deleteUserDto;
        
        this.failIfWrongInput();

        await this.tryToLoadUserIdOrFail();

        await this.softDeleteUserByUserId();

        //incluir usuario en redis con soft-delete

        return DeletedUserDto.fromPrimitives({
            userDeletedAt: this.userDeletedAt
        });
    }

    private failIfWrongInput(): void 
    {
        if (!this.deleteUserDto.getUserUuid())
            UsersException.badRequestCustom("user_uuid is required");
    }

    private async tryToLoadUserIdOrFail(): Promise<void>
    {
        const userEntity:GenericRowType|null = await this.usersReaderPostgresRepository.getUserIdWithSoftDeleteByUserUuid(
            this.deleteUserDto.getUserUuid()
        );

        if (!userEntity)
            UsersException.notFoundCustom("user not found (1)");

        //@ts-ignore
        if (userEntity.deleted_at)
            UsersException.notFoundCustom("user not found (2)");

        //@ts-ignore
        this.userId = userEntity.id;
    }

    private async softDeleteUserByUserId(): Promise<void>
    {
        this.userDeletedAt = await this.usersWriterPostgresRepository.softDeleteUserByUserId(
            this.userId
        );

        if (!this.userDeletedAt)
            UsersException.unexpectedCustom("user deletion failed");

    }

}  