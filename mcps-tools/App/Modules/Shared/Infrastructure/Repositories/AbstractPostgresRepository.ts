import { RedisClientType } from "npm:redis@^5.6.0";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";
import { EnvKeyEnum, getEnv, isEnvironment } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

import { RedisMinuteEnum } from "App/Modules/Shared/Infrastructure/Enums/RedisMinuteEnum.ts";
import { GenericRowType } from "App/Modules/Shared/Infrastructure/Types/GenericRowType.ts";
import { LoadFromFileType } from "App/Modules/Shared/Infrastructure/Types/LoadFromFileType.ts";

import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { Encoder } from "App/Modules/Shared/Infrastructure/Components/Encoder.ts";
import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";

import { RedisClientSingle } from "App/Modules/Shared/Infrastructure/Components/DB/RedisClientSingle.ts";
import { RedisClientMux } from "App/Modules/Shared/Infrastructure/Components/DB/RedisClientMux.ts";

import { PostgresClientSingle } from "App/Modules/Shared/Infrastructure/Components/DB/PostgresClientSingle.ts";
import { PostgresPoolClient } from "App/Modules/Shared/Infrastructure/Components/DB/PostgresPoolClient.ts";

export abstract class AbstractPostgresRepository {

    protected environment: string = getEnv(EnvKeyEnum.APP_ENV) || EnvironmentEnum.DEVELOPMENT.valueOf();

    protected lastId: number | null = null;
    protected affectedRows: number = 0;

    private encoder: Encoder = Encoder.getInstance();
    private dateTimer: DateTimer = DateTimer.getInstance();

    private redisSingleClient: RedisClientType = RedisClientSingle.getInstance().getDomainsClient();
    private redisClientV2: RedisClientMux = RedisClientMux.getInstance();

    private postgresSingleClient: Client = PostgresClientSingle.getInstance().getClientByEnv();
    private postgresPoolClient!: PostgresPoolClient;

    private loadPostgresPoolClient(): void {
        if (this.postgresPoolClient) return;
        this.postgresPoolClient = PostgresPoolClient.getInstance();
    }

    protected async query(sql: string): Promise<GenericRowType[]> {
        //this.logSql(sql, "query");
        const result = await (this.postgresSingleClient as any).queryObject(sql);
        return (result && (result as any).rows) ?
            (result as any).rows as GenericRowType[] :
            [];
    }

    protected async queryRedis(
        sql: string,
        ttl: number = RedisMinuteEnum.ONE_HOUR
    ): Promise<GenericRowType[]> {

        const redisResult: string|null = await this.getFromRedis(sql);
        if (redisResult) {
            //console.log("REEEEEEEEDDDDDDDIIIIIISSSSSSSSS query hit:", sql);
            return JSON.parse(redisResult) as GenericRowType[];
        }

        this.loadPostgresPoolClient();
        this.logSql(sql, "queryRedis");
        const rows: GenericRowType[] = await this.postgresPoolClient.query(sql);
        if (!rows) return [];

        await this.saveInRedis(sql, rows, ttl);
        return rows;
    }

    private async getFromRedis(sql: string): Promise<string | null> {
        const mainTableName: string = this.getTableNameFromSql(sql);
        const redisKey: string = `${this.environment}:sql:${mainTableName}:${this.encoder.getMd5Hash(sql)}`;

        const redisClient: RedisClientType = await this.redisClientV2.getRedisDomainsClient();
        const result = await redisClient.get(redisKey);
        return result as string | null;
    }

    private getTableNameFromSql(sql: string): string  {
        const match = sql.match(/from\s+([a-zA-Z0-9_\.]+)/i);
        return match ? match[1] : "";
    }

    private async saveInRedis(
        sql: string,
        result: GenericRowType[],
        ttlMinutes: number
    ): Promise<void> {
        const mainTableName: string = this.getTableNameFromSql(sql);
        const redisKey: string = `${this.environment}:sql:${mainTableName}:${this.encoder.getMd5Hash(sql)}`;
        const jsonData: string = JSON.stringify(result);

        const redisClient: RedisClientType = await this.redisClientV2.getRedisDomainsClient();
        await redisClient.set(redisKey, jsonData, { EX: ttlMinutes * 60 });
    }

    protected async command(sql: string): Promise<void> {

        if (!/^\s*(insert into |update |delete from )/i.test(sql)) {
            throw new Error("AbstractPostgresRepository.command. Only INSERT, UPDATE, or DELETE are allowed.");
        }

        this.loadPostgresPoolClient();
        const result = await this.postgresPoolClient.command(sql);
        this.lastId = result.lastId;
        this.affectedRows = result.affectedRows;
    }

    protected getEscapedSqlString(str: string): string {
        return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }

    protected mapColumnToInt<T extends Record<string, unknown>>(objects: T[], column: string): this {
        for (const obj of objects) {
            //@ts-ignore
            obj[column] = obj[column] === null || obj[column] === undefined ? null : Number(obj[column]);
        }
        return this;
    }

    protected mapColumToString<T extends Record<string, unknown>>(objects: T[], column: string): this {
        for (const obj of objects) {
            (obj as Record<string, unknown>)[column] = obj[column]?.toString() ?? "";
        }
        return this;
    }

    protected mapColumToStringDate<T extends Record<string, unknown>>(objects: T[], column: string): this {
        for (const obj of objects) {
            (obj as Record<string, unknown>)[column] = this.dateTimer.getDateYmdHisAsString(obj[column] as Date) ?? "";
        }
        return this;
    }

    protected getIntegersSqlIn(entityIds: number[]): string {
        if (!entityIds || entityIds.length === 0) return '';
        const uniqueIds = Array.from(
            new Set(entityIds.map(id => Number(id)))).sort((a, b) => a - b
        );
        return uniqueIds.join(', ');
    }

    protected getStringsSqlIn(entityUuids: string[]): string {
        if (!entityUuids || entityUuids.length === 0) return '';
        const uniqueUuids = Array.from(
            new Set(entityUuids.map(uuid => this.getEscapedSqlString(String(uuid))))
        ).sort();
        return `'${uniqueUuids.join("', '")}'`;
    }

    protected getLastId(): number | null {
        return this.lastId;
    }

    protected getAffectedRows(): number {
        return this.affectedRows;
    }

    protected logSql(sql: string, title: string = ""): void {
        if (!isEnvironment(EnvironmentEnum.PRODUCTION)) {
            const now: string = DateTimer.getInstance().getNowYmdHis();
            cli.echoBlue(`[${now}] ${sql}`)
        }
        Logger.getInstance().logSql(sql, title);
    }

    protected async loadFromFile(loadParams: LoadFromFileType): Promise<number> {
        const csvColumns: string = loadParams.targetColumns.join(", ");

        let sql: string = `
        COPY ${loadParams.targetTable} (${csvColumns})
        FROM '${loadParams.sourceFile}'
        WITH (
            FORMAT ${loadParams.sourceFileFormat},
            HEADER ${loadParams.includeHeader ? "true" : "false"},
            DELIMITER '${loadParams.sourceFileDelimiter}'
        );
        `;
        this.logSql(sql, "loadFromFile");
        await this.query(sql)

        sql = `SELECT COUNT(*) n FROM ${loadParams.targetTable} t`;
        this.logSql(sql, "loadFromFile");
        const result: GenericRowType[] = await this.query(sql);
        if (result.length) return Number(result[0].n);
        return 0;
    }

    /**
     * execute select query using connection pool
     * for http api use - does not use redis cache
     */
    protected async pgQueryPool(sql: string): Promise<GenericRowType[]> {
        this.loadPostgresPoolClient();
        //this.logSql(sql, "pgQueryPool");
        return await this.postgresPoolClient.query(sql);
    }

    /**
     * execute select query with redis cache using connection pool
     * for http api use - recommended for frequently accessed data
     * example: await this.queryRedisPool("SELECT * FROM users WHERE id = 1", RedisMinuteEnum.ONE_HOUR)
     */
    protected async queryRedisPool(
        sql: string,
        ttl: number = RedisMinuteEnum.ONE_HOUR
    ): Promise<GenericRowType[]> {
        const redisResult: string | null = await this.getFromRedisPool(sql);
        if (redisResult) {
            return JSON.parse(redisResult) as GenericRowType[];
        }

        this.loadPostgresPoolClient();
        //this.logSql(sql, "queryRedisPool");
        const rows: GenericRowType[] = await this.postgresPoolClient.query(sql);

        if (!rows || rows.length === 0) return [];

        await this.saveInRedisPool(sql, rows, ttl);
        return rows;
    }

    /**
     * execute insert/update/delete using connection pool
     * for http api use
     */
    protected async commandPool(sql: string): Promise<void> {
        this.loadPostgresPoolClient();
        this.logSql(sql, "commandPool");
        const result: object = await this.postgresPoolClient.command(sql);

        this.lastId = (result as any).lastId;
        this.affectedRows = (result as any).affectedRows;
    }

    /**
     * get value from redis using connection pool
     * private - used internally by queryRedisPool
     */
    private async getFromRedisPool(sql: string): Promise<string | null> {
        const mainTableName: string = this.getTableNameFromSql(sql);
        const redisKey: string = `${this.environment}:sql:${mainTableName}:${this.encoder.getMd5Hash(sql)}`;

        const redisClient: RedisClientType = await this.redisClientV2.getRedisDomainsClient();
        const result = await redisClient.get(redisKey);
        return result as string | null;
    }

    /**
     * save value to redis using connection pool
     * private - used internally by queryRedisPool
     */
    private async saveInRedisPool(
        sql: string,
        result: GenericRowType[],
        ttlMinutes: number
    ): Promise<void> {
        const mainTableName: string = this.getTableNameFromSql(sql);

        const redisKey: string = `${this.environment}:sql:${mainTableName}:${this.encoder.getMd5Hash(sql)}`;
        const jsonData: string = JSON.stringify(result);

        const redisClient: RedisClientType = await this.redisClientV2.getRedisDomainsClient();
        await redisClient.set(redisKey, jsonData, { EX: ttlMinutes * 60 });
    }

}