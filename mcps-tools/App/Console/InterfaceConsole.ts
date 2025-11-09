import { CustomCliArgs } from "App/Modules/Shared/Infrastructure/Components/Cli/CustomCliArgs.ts";

export interface InterfaceConsole {
    invoke(lzCliArgs?: CustomCliArgs): void;
}