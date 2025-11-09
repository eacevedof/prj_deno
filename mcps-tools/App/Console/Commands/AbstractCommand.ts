import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";
import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";

export abstract class AbstractCommand {

    private static dateTimer: DateTimer = DateTimer.getInstance();
    protected readonly logger: Logger = Logger.getInstance();

    protected dtStart: string = "";
    protected dtEnd: string = "";

    protected echoStart(message: string): void {
        this.dtStart = this.getDateTimer().getNowYmdHis();
        cli.echoOrange(`[${this.dtStart}] start: ${message}`);
    }

    protected echoEnd(message: string): void {
        this.dtEnd = this.getDateTimer().getNowYmdHis();
        cli.echoOrange(`[${this.dtStart}] [${this.dtEnd}] end: ${message}`);
    }

    protected echoStep(message: string): void {
        cli.echoGreen(`[${this.getDateTimer().getNowYmdHis()}]: ${message}`);
    }

    private getDateTimer(): DateTimer {
        return AbstractCommand.dateTimer;
    }

    protected sleepSeconds(secs: number): Promise<void> {
        secs = secs || 1;
        secs = secs * 1000;
        return new Promise(resolve => setTimeout(resolve, secs));
    }

}