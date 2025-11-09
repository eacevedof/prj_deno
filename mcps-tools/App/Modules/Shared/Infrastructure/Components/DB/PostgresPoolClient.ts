import { Pool, PoolClient } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { GenericRowType } from "App/Modules/Shared/Infrastructure/Types/GenericRowType.ts";

/**
 * PostgreSQL Connection Pool for high-concurrency scenarios (HTTP API, WebSockets, etc.)
 * DO NOT use for ETL/CLI scripts - use PostgresClient singleton instead
 */
export class PostgresPoolClient {

    private static instance: PostgresPoolClient | null = null;

    private readonly dbHost: string;
    private readonly dbPort: number;
    private readonly dbName: string;
    private readonly dbUser: string;
    private readonly dbPassword: string;
    private readonly pgPoolSize: number;

    private pgPool: Pool | null = null;
    private isInitialized: boolean = false;

    private constructor() {
        this.dbHost = getEnv(EnvKeyEnum.APP_DB_HOST) ?? "cont-db-postgres";
        this.dbPort = parseInt(getEnv(EnvKeyEnum.APP_DB_PORT) ?? "5432", 10);
        this.dbName = getEnv(EnvKeyEnum.APP_DB_NAME) ?? "db_anti_phishing";
        this.dbUser = getEnv(EnvKeyEnum.APP_DB_USER) ?? "postgres";
        this.dbPassword = getEnv(EnvKeyEnum.APP_DB_PWD) ?? "root";
        //en bd esta configurado a 500 a dia de hoy 2024-10-14
        this.pgPoolSize = parseInt(getEnv(EnvKeyEnum.APP_DB_POOL_SIZE) ?? "20", 10);
        console.log("PostgresPoolClient", {
            dbHost: this.dbHost,
            dbPort: this.dbPort,
            dbName: this.dbName,
            dbUser: this.dbUser,
            pgPoolSize: this.pgPoolSize
        })
    }

    public static getInstance(): PostgresPoolClient {
        if (PostgresPoolClient.instance) return PostgresPoolClient.instance;

        PostgresPoolClient.instance = new PostgresPoolClient();
        return PostgresPoolClient.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            Logger.getInstance().logWarning("PostgresPoolClient already initialized", "postgres-pool");
            return;
        }

        this.pgPool = new Pool(
            {
                hostname: this.dbHost,
                port: this.dbPort,
                database: this.dbName,
                user: this.dbUser,
                password: this.dbPassword,
                tls: {
                    enabled: false,
                },
            },
            this.pgPoolSize,
            true // lazy = true (create connections on demand)
        );

        const pgClient: PoolClient = await this.pgPool.connect();
        await pgClient.queryObject("SELECT 1 as test");
        pgClient.release();

        this.isInitialized = true;
        Logger.getInstance().logDebug(
            `Postgres pool initialized successfully (max connections: ${this.pgPoolSize})`,
            "postgres-pool"
        );
    }

    /**
     * read only query - SELECT
     */
    public async query(sql: string): Promise<GenericRowType[]> {
        if (!this.isInitialized || !this.pgPool) {
            throw new Error("PostgresPoolClient not initialized. Call initializeRedisPool() first.");
        }
        const pgClient: PoolClient = await this.pgPool.connect();
        try {
            const { rows } = await pgClient.queryObject(sql);
            return rows as GenericRowType[] || [];
        }
        finally {
            pgClient.release();
        }
    }

    /**
     * Execute an INSERT/UPDATE/DELETE command
     * Returns affected rows and last inserted ID (for INSERT)
     */
    public async command(sql: string): Promise<{
        lastId: number | null;
        affectedRows: number
    }> {
        if (!this.isInitialized || !this.pgPool) {
            throw new Error("PostgresPoolClient not initialized. Call initializeRedisPool() first.");
        }

        // Validate command type
        const cleanedSql: string = sql
            .replace(/--.*$/gm, "") // Remove line comments
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
            .trim();

        if (!/^\s*(insert into |update |delete from )/i.test(cleanedSql)) {
            throw new Error("PostgresPoolClient.command: Only INSERT, UPDATE, or DELETE are allowed.");
        }

        const pgClient: PoolClient = await this.pgPool.connect();
        try {
            if (/^\s*insert into /i.test(sql)) {
                const result = await pgClient.queryObject<{ id: number }>(sql);
                return {
                    lastId: result.rows[0]?.id ?? null,
                    affectedRows: result.rowCount ?? 0
                };
            }

            if (/^\s*(update |delete from )/i.test(sql)) {
                const result = await pgClient.queryObject(sql);
                return {
                    lastId: null,
                    affectedRows: result.rowCount ?? 0
                };
            }

            throw new Error("Unexpected SQL command format");
        }
        finally {
            pgClient.release(); // Return connection to pool
        }
    }

    private getPoolStatus(): { size: number; available: number } {
        if (!this.pgPool) {
            return { size: 0, available: 0 };
        }

        return {
            size: this.pgPoolSize,
            available: this.pgPool.available
        };
    }

    public async cleanPoolShutdown(): Promise<void> {
        if (!this.pgPool) {
            Logger.getInstance().logWarning(
                "PostgresPoolClient not initialized, nothing to cleanPoolShutdown",
                "postgres-pool"
            );
            return;
        }

        Logger.getInstance().logDebug(
            "Shutting down Postgres connection pool...",
            "postgres-pool"
        );
        await this.pgPool.end();
        this.pgPool = null;
        this.isInitialized = false;
        Logger.getInstance().logDebug(
            "Postgres pool cleanPoolShutdown complete",
            "postgres-pool"
        );
    }

}
