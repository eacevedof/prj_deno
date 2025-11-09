import { AbstractPostgresRepository } from "App/Modules/Shared/Infrastructure/Repositories/AbstractPostgresRepository.ts";
import {GenericRowType} from "App/Modules/Shared/Infrastructure/Types/GenericRowType.ts";

export class UsersWriterPostgresRepository extends AbstractPostgresRepository {

    public static getInstance(): UsersWriterPostgresRepository 
    {
        return new UsersWriterPostgresRepository();
    }

    public async createUser(newUser: {
        projectId: number,
        projectUserUuid: string,
        userUuid: string,
    }): Promise<string> 
    {
        const { projectId, projectUserUuid, userUuid } = newUser;

        const sql:string = `
        -- createUser
        INSERT INTO app_users 
        (project_id, project_user_uuid, user_uuid)
        VALUES 
        (
        ${projectId}, 
        '${this.getEscapedSqlString(projectUserUuid)}', 
        '${this.getEscapedSqlString(userUuid)}'
        )
        
        RETURNING user_uuid;
        `;
        this.logSql(sql);
        const result: GenericRowType[] = await this.pgQueryPool(sql);

        return String(result[0]?.user_uuid ?? "");
    }

    public async softDeleteUserByUserId(userId: number): Promise<string>
    {
        const sql:string = `
        -- softDeleteUserByUserId
        UPDATE app_users
            SET deleted_at = NOW()
        WHERE 1=1
        AND id = ${userId}
        
        RETURNING deleted_at;
        `;
        this.logSql(sql);
        const result: Record<string, string|number|null>[] = await this.pgQueryPool(sql);

        //@ts-ignore
        return result[0]?.deleted_at ?? "";
    }
    
}