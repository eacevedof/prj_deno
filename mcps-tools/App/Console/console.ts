import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";

import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { Server } from "App/Modules/Shared/Infrastructure/Components/Server.ts";

import { CustomCliArgs } from "App/Modules/Shared/Infrastructure/Components/Cli/CustomCliArgs.ts";
import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";

import { commands } from "App/Console/Commands/Commands.ts";

const customCliArgs: CustomCliArgs = CustomCliArgs.getInstance();
const dateTimer: DateTimer = DateTimer.getInstance();

let now: string = dateTimer.getNowYmdHis();
cli.echoGreen(`[${now}] command: running deno console commands`);

const appCommand: string = customCliArgs.getArg(0);

const appCommandNamespace: string = commands[appCommand] || "";
if (!appCommandNamespace) {
    cli.dieRed(`[${now}] command: "${appCommand}" not found.`);
}

const serverIp: string = await Server.getInstance().getServerIp();

Logger.getInstance({
    request_ip: serverIp,
    request_uri: appCommandNamespace,
})

now = dateTimer.getNowYmdHis();
console.info(`[${now}] command: trying to run "${appCommandNamespace}"`);
try {
    const { default: CommandClass } = await import(appCommandNamespace);
    CommandClass.getInstance().invoke(customCliArgs);
}
catch (error: unknown) {

    let errorMessage: string = "";
    if (error instanceof Error) errorMessage = error.message;
    if (typeof error !== "string") errorMessage = JSON.stringify(error);

    Logger.getInstance().logException(error, "console.ts");

    now = dateTimer.getNowYmdHis();
    console.error(error)
    cli.dieRed(`[${now}] command: error "${appCommandNamespace}": ${errorMessage}`);
}
