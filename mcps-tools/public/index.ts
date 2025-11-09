import { EnvKeyEnum, getEnv, getEnvs } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";
import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";
import { customRequester } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequester.ts";
import { RedisClientMux } from "App/Modules/Shared/Infrastructure/Components/DB/RedisClientMux.ts";
import { PostgresPoolClient } from "App/Modules/Shared/Infrastructure/Components/DB/PostgresPoolClient.ts";

// ========================================================================
// VALIDATE REDIS AVAILABILITY (NON-BLOCKING)
// ========================================================================
RedisClientMux.getInstance().doesRedisPing()
    .then((isRedisAvailable) => {
        if (isRedisAvailable) {
            cli.echoGreen(`[${now}] Redis connection validated successfully`);
            return;
        }
        cli.echoYellow(`[${now}] Redis connection failed, but server will continue`);
    })
    .catch((error) => {
        cli.echoRed(`[${now}] Redis validation error (server continues):`);
        console.error(error);
        Deno.exit(1);
    });

// ========================================================================
// INITIALIZE CONNECTION POOLS
// ========================================================================
const now: string = DateTimer.getInstance().getNowYmdHis();
cli.echoYellow(`[${now}] Initializing PostgreSQL pool...`);
try {
    await PostgresPoolClient.getInstance().initialize();
    cli.echoGreen(`[${now}] PostgreSQL pool initialized successfully`);
}
catch (error) {
    cli.echoRed(`[${now}] Failed to initialize PostgreSQL pool:`);
    console.error(error);
    Deno.exit(1);
}

// ========================================================================
// START HTTP SERVER
// ========================================================================
const port: number = parseInt(getEnv(EnvKeyEnum.APP_PORT) || "3000");
cli.echoGreen(`[${now}] Starting Deno server on port ${port}`);

const denoServer = Deno.serve({ port, hostname: "0.0.0.0" }, customRequester);

// ========================================================================
// GRACEFUL SHUTDOWN HANDLERS
// ========================================================================
const shutdownDenoServer = async (): Promise<void> => {
    cli.echoYellow("\n[SHUTDOWN] Received shutdown signal, closing connections...");
    try {
        await RedisClientMux.getInstance().shutdown();
        await PostgresPoolClient.getInstance().cleanPoolShutdown();
        cli.echoGreen("[SHUTDOWN] Connection pools closed successfully");
    }
    catch (error) {
        cli.echoRed("[SHUTDOWN] Error closing connection pools:");
        console.error(error);
    }
    try {
        await denoServer.shutdown();
        cli.echoGreen("[SHUTDOWN] Server stopped");
    }
    catch (error) {
        cli.echoRed("[SHUTDOWN] Error stopping server:");
        console.error(error);
    }
    cli.echoGreen("[SHUTDOWN] Exiting process");
    Deno.exit(0);
};

Deno.addSignalListener("SIGINT", shutdownDenoServer); //(Ctrl+C)
Deno.addSignalListener("SIGTERM", shutdownDenoServer); //docker stop

cli.echoGreen(`[${now}] Server running on http://0.0.0.0:${port}`);