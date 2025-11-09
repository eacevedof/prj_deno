import { AbstractCommand } from "App/Console/Commands/AbstractCommand.ts";
import { InterfaceConsole } from "App/Console/InterfaceConsole.ts";

import { RunMigrationsService } from "App/Modules/Devops/Application/Services/RunMigrations/RunMigrationsService.ts";

//@ts-ignore
export default class DeployCommand extends AbstractCommand implements InterfaceConsole {

    private readonly runMigrationsService: RunMigrationsService;

    constructor() {
        super();
        this.runMigrationsService = RunMigrationsService.getInstance();
    }

    public static getInstance(): DeployCommand {
        return new DeployCommand();
    }

    public async invoke(): Promise<void> {
        this.echoStart("DeployCommand");
        //await this.sleepSeconds(60);
        await this.runMigrationsService.invoke();

        this.echoEnd("DeployCommand");
    }

}