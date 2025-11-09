import { join } from "https://deno.land/std/path/mod.ts";

import { Filer } from "App/Modules/Shared/Infrastructure/Components/Filer.ts";
import { AbstractPostgresRepository } from "App/Modules/Shared/Infrastructure/Repositories/AbstractPostgresRepository.ts";

const PATH_MIGRATIONS: string = join(Deno.cwd(), "database", "migrations") + "/";

export class RunMigrationsWriterRepository extends AbstractPostgresRepository {

    public static getInstance(): RunMigrationsWriterRepository {
        return new RunMigrationsWriterRepository();
    }

    public async dropMigrationsTable(): Promise<void> {
        const sql: string = `DROP TABLE IF EXISTS public.sys_migrations`;
        await this.query(sql);
    }

    public async createMigrationsTable(): Promise<void> {
        const sql: string = await this.getFileContentSql("0000-create-sys-migrations-table.sql");
        if (!sql) return;
        await this.query(sql);
    }

    private async getFileContentSql(filename: string): Promise<string> {
        try {
            const content: string = await Filer.getInstance().fileGetContent(
                PATH_MIGRATIONS + filename
            );
            return content.trim();
        }
        catch {
            return "";
        }
    }

    public async runSqlFromSqlFile(filename: string): Promise<void> {
        const sql: string = await this.getFileContentSql(filename);
        if (!sql) return;
        this.logSql(sql);
        await this.query(sql);
    }

    public async saveMigration(filename: string, batch: number): Promise<void> {
        const sql: string = `
        -- saveMigrationFile
        INSERT INTO sys_migrations (migration_file, batch, created_at)
        VALUES ('${this.getEscapedSqlString(filename)}', ${batch}, NOW())
        `;
        this.logSql(sql);
        await this.query(sql);
    }

}