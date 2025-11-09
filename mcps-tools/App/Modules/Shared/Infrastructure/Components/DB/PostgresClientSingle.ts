import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";
import { EnvKeyEnum, getEnv, isEnvironment } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

//https://deno-postgres.com/#/
export class PostgresClientSingle {

    private static instance: PostgresClientSingle;
    private client: Client | null = null;

    public static getInstance(): PostgresClientSingle {
        if (PostgresClientSingle.instance) {
            return PostgresClientSingle.instance;
        }
        PostgresClientSingle.instance = new PostgresClientSingle();
        return PostgresClientSingle.instance;
    }

    public getClientByEnv(): Client {
        if (!this.client) {
            this.client = new Client(this.getConnConfigByEnv());
        }
        return this.client;
    }

    public async closeConnection(): Promise<void> {
        if (this.client) {
            await this.client.end();
        }
    }

    public static async closeAllConnections(): Promise<void> {
        if (PostgresClientSingle.instance) {
            await PostgresClientSingle.instance.closeConnection();
            PostgresClientSingle.instance.client = null;
        }
    }

    private getConnConfigByEnv(): object {

        let postgresPort: string = getEnv(EnvKeyEnum.APP_DB_PORT) ?? "";
        if (!postgresPort) postgresPort = "5432";

        const connection: {
            hostname: string;
            port: number;
            database: string;
            user: string;
            password: string;
            controls?: {
                debug?: {
                    queries?: boolean;
                    notices?: boolean;
                    results?: boolean;
                }
            }
        } = {

            hostname: getEnv(EnvKeyEnum.APP_DB_HOST) || "localhost",
            port: Number(postgresPort),
            database: getEnv(EnvKeyEnum.APP_DB_NAME) || "postgres",
            user: getEnv(EnvKeyEnum.APP_DB_USER) || "postgres",
            password: getEnv(EnvKeyEnum.APP_DB_PWD) || "postgres",
        }

        console.log("PostgresClientSingle connection config:", connection);
        if (isEnvironment(EnvironmentEnum.PRODUCTION))
            return connection;

        connection.controls = {
            debug: {
                queries: true,
                notices: true,
                results: true,
            }
        }
        return connection;
    }

}