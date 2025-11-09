import { AbstractCommand } from "App/Console/Commands/AbstractCommand.ts";
import { InterfaceConsole } from "App/Console/InterfaceConsole.ts";

import { CheckAppService } from "App/Modules/Devops/Application/Services/CheckApp/CheckAppService.ts";
import { CustomCliArgs } from "App/Modules/Shared/Infrastructure/Components/Cli/CustomCliArgs.ts";

//@ts-ignore
export default class CheckAppCommand extends AbstractCommand implements InterfaceConsole {

    private readonly checkAppService: CheckAppService;

    constructor() {
        super();
        this.checkAppService = CheckAppService.getInstance();
    }

    public static getInstance(): CheckAppCommand {
        return new CheckAppCommand();
    }

    public async invoke(): Promise<void> {
        this.echoStart("CheckAppCommand");

        await this.checkAppService.invoke();

        this.echoEnd("CheckAppCommand");
    }

}