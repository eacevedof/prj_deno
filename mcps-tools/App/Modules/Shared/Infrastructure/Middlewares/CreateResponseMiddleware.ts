import { Context, Response } from "https://deno.land/x/oak@v17.1.4/mod.ts";

import {CliColor as cli} from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";


export async function CreateResponseMiddleware(
    routerContext: Context,
    next: () => Promise<unknown>
): Promise<void> {

    cli.echoGreen("CreateResponseMiddleware invoked");
    console.log(routerContext.response)
    await next()
}
