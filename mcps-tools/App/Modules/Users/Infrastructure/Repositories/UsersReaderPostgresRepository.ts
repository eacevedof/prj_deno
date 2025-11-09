import { AbstractPostgresRepository } from "App/Modules/Shared/Infrastructure/Repositories/AbstractPostgresRepository.ts";
import {GenericRowType} from "App/Modules/Shared/Infrastructure/Types/GenericRowType.ts";
import {RedisMinuteEnum} from "App/Modules/Shared/Infrastructure/Enums/RedisMinuteEnum.ts";

export class UsersReaderPostgresRepository extends AbstractPostgresRepository {

    public static getInstance(): UsersReaderPostgresRepository
    {
        return new UsersReaderPostgresRepository();
    }

    public async getFirstUserIdForHealthCheck(): Promise<number|null>
    {
        const sql: string = `
        -- getFirstUserIdForHealthCheck
        SELECT id
        FROM app_users
        WHERE 1=1
        LIMIT 1;
        `;
        this.logSql(sql);
        const result: GenericRowType[] = await this.pgQueryPool(sql);
        if (result.length) return Number(result[0].id);
        return null;
    }

    public async getUserIdByUserUuid(userUuid: string): Promise<number|null>
    {
        const sql: string = `
        -- getUserIdByUserUuid
        SELECT id
        FROM app_users
        WHERE 1=1
        AND user_uuid = '${this.getEscapedSqlString(userUuid)}';
        `;
        //this.logSql(sql);
        const result: GenericRowType[] = await this.queryRedis(sql, RedisMinuteEnum.EIGHT_HOURS);
        if (result.length) return  Number(result[0].id);
        return null;
    }

    public async getUserUuidByProjectIdAndProjectUserUuid(
        projectId: number,
        projectUserUuid: string
    ): Promise<string>
    {
        const sql: string = `
        -- getUserUuidByProjectIdAndProjectUserUuid
        SELECT au.user_uuid
        FROM app_users au
        WHERE 1=1
        AND au.project_id = ${projectId}
        AND au.project_user_uuid = '${this.getEscapedSqlString(projectUserUuid)}';
        `;
        this.logSql(sql);
        const result: GenericRowType[] = await this.pgQueryPool(sql);
        if (result.length) return String(result[0].user_uuid);
        return "";
    }

    public async getUserIdWithSoftDeleteByUserUuid(userUuid: string): Promise<GenericRowType|null>
    {
        const sql: string = `
        -- getUserIdWithSoftDeleteByUserUuid
        SELECT id, deleted_at
        FROM app_users
        WHERE 1=1
        AND user_uuid = '${this.getEscapedSqlString(userUuid)}';
        `;
        this.logSql(sql);
        const result: GenericRowType[] = await this.pgQueryPool(sql);
        if (result.length) return result[0];
        return null;
    }

}