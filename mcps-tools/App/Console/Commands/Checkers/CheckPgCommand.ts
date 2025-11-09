import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

import { CliColor as cli} from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";
import { PostgresClientSingle } from "App/Modules/Shared/Infrastructure/Components/DB/PostgresClientSingle.ts";
import { PostgresPoolClient } from "App/Modules/Shared/Infrastructure/Components/DB/PostgresPoolClient.ts";
import { InterfaceConsole } from "App/Console/InterfaceConsole.ts";
import { AbstractCommand } from "App/Console/Commands/AbstractCommand.ts";

/**
 * deno task check-pg
 */
export default class CheckPgCommand extends AbstractCommand implements InterfaceConsole {

    public static getInstance(): CheckPgCommand {
        return new CheckPgCommand();
    }

    public async invoke(): Promise<void> {
        this.echoStart("CheckPgCommand");
        this.echoStep("https://deno.land/x/postgres@v0.17.0/mod.ts");
        try {
            await this.checkPgConnectionSingle();
            cli.echoYellow("\n" + "=".repeat(50) + "\n");
            await this.checkPgConnectionPool();
        }
        catch (error) {
            console.error("error raw:\n",error);
            this.logger.logException(error);
            cli.dieRed(error.stack ?? error);
        }
        this.echoEnd("CheckPgCommand");
    }

    private async checkPgConnectionSingle(): Promise<void> {
        this.echoStep("Connecting single PostgreSQL...");

        const pgClient: Client = PostgresClientSingle.getInstance().getClientByEnv();
        await pgClient.connect();
        this.echoStep("✓ PostgreSQL connection established");

        const result = await pgClient.queryArray("SELECT 1 as test, NOW() as current_time");
        console.log("query result",result)
        cli.echoGreen("PostgreSQL connection is working correctly!");

        await pgClient.end();
        this.echoStep("✓ Connection closed");
    }

    private async checkPgConnectionPool(): Promise<void> {
        this.echoStep("Initializing PostgreSQL Pool...");

        const pgPoolClient: PostgresPoolClient = PostgresPoolClient.getInstance();
        await pgPoolClient.initialize();

        const result = await pgPoolClient.query("SELECT 1 as test, NOW() as current_time");
        console.log("pool query result:", result);

        await pgPoolClient.cleanPoolShutdown();
        this.echoStep("✓ Pool shutdown complete");
    }
}