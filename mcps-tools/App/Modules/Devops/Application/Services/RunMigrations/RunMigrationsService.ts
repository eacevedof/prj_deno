import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";
import { Filer } from "App/Modules/Shared/Infrastructure/Components/Filer.ts";

import { RunMigrationsReaderRepository } from "App/Modules/Devops/Infrastructure/Repositories/RunMigrationsReaderRepository.ts";
import { RunMigrationsWriterRepository } from "App/Modules/Devops/Infrastructure/Repositories/RunMigrationsWriterRepository.ts";

const PATH_MIGRATIONS: string =  join(Deno.cwd(), "database", "migrations") + "/";

export class RunMigrationsService {

    private static readonly MIGRATIONS_TABLE: string = "sys_migrations";

    private readonly filer: Filer;
    private readonly pathMigrations: string;
    private readonly runMigrationsReaderRepository: RunMigrationsReaderRepository;
    private readonly runMigrationsWriterRepository: RunMigrationsWriterRepository;

    private sqlMigrationsFiles: string[] = [];
    private sqlFilesToBeRan: string[] = [];

    private constructor() {
        this.filer = Filer.getInstance();
        this.pathMigrations = PATH_MIGRATIONS;
        this.runMigrationsReaderRepository = RunMigrationsReaderRepository.getInstance();
        this.runMigrationsWriterRepository = RunMigrationsWriterRepository.getInstance();
    }

    public static getInstance(): RunMigrationsService {
        return new RunMigrationsService();
    }

    public async invoke(): Promise<void> {
        //@eaf para forzar la bd desde 0
        //await this.runMigrationsWriterRepository.dropMigrationsTable();

        await this.createMigrationsTableIfDoesNotExist();

        await this.loadMigrationsFiles();
        if (!this.sqlMigrationsFiles.length) {
            this.print("No migrations files found");
            return;
        }

        await this.loadFilesToBeRan();
        if (!this.sqlFilesToBeRan.length) {
            this.print("No migrations files to be ran");
            return;
        }

        await this.runMigrations();
    }

    private async createMigrationsTableIfDoesNotExist(): Promise<void> {
        const exists: boolean = await this.runMigrationsReaderRepository.doesTableExist(
          RunMigrationsService.MIGRATIONS_TABLE
        );
        if (exists) {
            this.print("migrations table wont be created, already exists");
            return;
        }
        this.print("creating migrations table");
        await this.runMigrationsWriterRepository.createMigrationsTable();
    }

    private async loadMigrationsFiles(): Promise<void> {
        let sqlFiles: string[];
        try {
            sqlFiles = await this.filer.getFilesInDirectory(this.pathMigrations);
        }
        catch {
            cli.dieRed(`Error reading migrations directory: ${this.pathMigrations}`);
        }
        sqlFiles = sqlFiles.filter(
            file => file.endsWith(".sql") && !file.startsWith("0000-")
        );
        if (!sqlFiles.length) return;
        sqlFiles.sort();
        this.sqlMigrationsFiles = sqlFiles;
    }

    private async loadFilesToBeRan(): Promise<void> {
        const ranFiles: Record<string, string|number|null>[] = await this.runMigrationsReaderRepository.getRanMigrationsFiles();
        if (!ranFiles) return;

        const ranFilesNames: string[] = ranFiles.
            map((f: Record<string, string|number|null>) => f.migration_file?.toString()).
            filter((name): name is string => typeof name === "string");

        this.sqlFilesToBeRan = this.sqlMigrationsFiles.filter(
            (sqlFile: string) => !ranFilesNames.includes(sqlFile)
        );
    }

    private async runMigrations(): Promise<void> {
        const maxBatch:number = await this.runMigrationsReaderRepository.getMaxBatch();
        const batch:number = maxBatch + 1;

        this.print(`running migrations batch: ${batch}`);
        for (const sqlFile of this.sqlFilesToBeRan) {
            this.print(`running migration: ${sqlFile}`);
            await this.runMigrationsWriterRepository.runSqlFromSqlFile(sqlFile);
            this.print(`save migration: ${sqlFile}`);
            await this.runMigrationsWriterRepository.saveMigration(sqlFile, batch);
        }
    }

    private print(mixed: any): void {
        if (typeof mixed === "string") {
            cli.echoGreen(mixed);
            return;
        }
        console.dir(mixed);
        console.log("\n");
    }

}