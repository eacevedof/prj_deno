import { RedisMinuteEnum } from "App/Modules/Shared/Infrastructure/Enums/RedisMinuteEnum.ts";
import { ProjectConfigKeyEnum } from "App/Modules/Projects/Domain/Enums/ProjectConfigKeyEnum.ts";
import { GenericRowType, StringRowType } from "App/Modules/Shared/Infrastructure/Types/GenericRowType.ts";
import { AbstractPostgresRepository } from "App/Modules/Shared/Infrastructure/Repositories/AbstractPostgresRepository.ts";

export class ProjectsReaderPostgresRepository extends AbstractPostgresRepository {

    public static getInstance(): ProjectsReaderPostgresRepository
    {
        return new ProjectsReaderPostgresRepository();
    }

    public async getProjectIdByProjectAuthToken(projectApiKey: string): Promise<number|null>
    {
        const configApiKey: string = ProjectConfigKeyEnum.PROJECT_AUTH_TOKEN.valueOf();
        const sql: string = `
        -- getProjectIdByApiKey
        SELECT project_id
        FROM app_project_config
        WHERE 1=1
        AND config_key = '${configApiKey}'
        AND config_value = '${this.getEscapedSqlString(projectApiKey)}'
        LIMIT 1
        `;
        //this.logSql(sql);
        const result: GenericRowType[] = await this.queryRedis(sql, RedisMinuteEnum.EIGHT_HOURS);
        if (!result) return null;

        this.mapColumnToInt(result, "project_id");
        // @ts-ignore
        return result[0]?.project_id || null;
    }

    public async getProjectConfigByProjectId(projectId: number): Promise<StringRowType[]>
    {
        const configApiKey: string = ProjectConfigKeyEnum.PROJECT_AUTH_TOKEN.valueOf();
        const sql: string = `
        -- getProjectConfigByProjectId
        SELECT config_key, config_value
        FROM app_project_config
        WHERE 1=1
        AND project_id = '${projectId}'
        AND config_key != '${configApiKey}'
        ORDER BY config_key
        `;
        const result: GenericRowType[] = await this.queryRedis(sql, RedisMinuteEnum.EIGHT_HOURS);
        if (!result) return [];

        this.mapColumToString(result, "config_key")
            .mapColumToString(result, "config_value");

        return result as StringRowType[];
    }

    public async getProjectIdByDeviceToken(deviceToken: string): Promise<StringRowType[]>
    {
        const configApiKey: string = ProjectConfigKeyEnum.PROJECT_AUTH_TOKEN.valueOf();
        const sql: string = `
        -- getProjectConfigByProjectId
        SELECT config_key, config_value
        FROM app_project_config
        WHERE 1=1
        AND project_id = '${deviceToken}'
        AND config_key != '${configApiKey}'
        ORDER BY config_key
        `;
        const result: GenericRowType[] = await this.queryRedis(sql, RedisMinuteEnum.EIGHT_HOURS);
        if (!result) return [];

        this.mapColumToString(result, "config_key")
            .mapColumToString(result, "config_value");

        return result as StringRowType[];
    }

    public async getProjectIdByProjectUuid(projectUuid: string): Promise<number|null>
    {
        projectUuid = this.getEscapedSqlString(projectUuid);
        const sql: string = `
        -- getProjectIdByProjectUuid
        SELECT id
        FROM app_projects ap
        WHERE 1=1
        AND ap.project_uuid = '${projectUuid}'
        LIMIT 1
        `;
        const result: GenericRowType[] = await this.queryRedis(sql, RedisMinuteEnum.EIGHT_HOURS);
        if (!result) return null;

        return Number(result[0]?.id) || null;
    }

}