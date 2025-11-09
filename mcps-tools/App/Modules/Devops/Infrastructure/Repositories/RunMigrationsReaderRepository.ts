import { AbstractPostgresRepository } from "App/Modules/Shared/Infrastructure/Repositories/AbstractPostgresRepository.ts";

export class RunMigrationsReaderRepository extends AbstractPostgresRepository {

    public static getInstance(): RunMigrationsReaderRepository {
        return new RunMigrationsReaderRepository();
    }

    public async doesTableExist(tableName: string): Promise<boolean> {
        const sql: string = `
        -- doesTableExist
        SELECT COUNT(*) AS n_rows
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '${this.getEscapedSqlString(tableName)}'
        `;
        this.logSql(sql);
        const result: Record<string, string|number|null>[] = await this.query(sql);
        if (!result || result.length === 0) return false;

        //@ts-ignore
        return Boolean(Number(result[0].n_rows));
    }

    public async getCurrentDatabase(): Promise<string> {
        const sql: string = `
        -- getCurrentDatabase
        SELECT current_database() AS database_name
        `;
        this.logSql(sql);
        const result: Record<string, string|number|null>[] = await this.query(sql);
        if (!result || result.length === 0) return "";
        // @ts-ignore
        return result[0].database_name;
    }

    public async getRanMigrationsFiles(): Promise<Record<string, string|number|null>[]> {
        const sql: string = `
        -- getRanMigrationsFiles
        SELECT id, migration_file
        FROM sys_migrations
        ORDER BY migration_file
        `;
        this.logSql(sql);
        const result: Record<string, string|number|null>[] = await this.query(sql);
        if (!result || result.length === 0) return [];
        this.mapColumnToInt(result, "id");

        return result;
    }

    public async getMaxBatch(): Promise<number> {
        const sql: string = `
        -- getMaxBatch
        SELECT MAX(batch) AS max_batch
        FROM sys_migrations
        `;
        this.logSql(sql);
        const result: Record<string, string|number|null>[] = await this.query(sql);
        if (!result || result.length === 0) return 0;

        return Number(result[0].max_batch) || 0;
    }

}
