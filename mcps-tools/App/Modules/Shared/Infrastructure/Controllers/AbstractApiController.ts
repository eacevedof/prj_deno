import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { SendAlertEmailService } from "App/Modules/Mailings/Application/SendAlertEmail/SendAlertEmailService.ts";

export abstract class AbstractApiController {

    protected handleUnknownError(error: unknown, location:string="-"): void {
        const errorInstance: Error = error instanceof Error ? error : new Error(String(error));
        Logger.getInstance().logException(errorInstance);
        //if (!(globalThis as any).IS_TEST_MODE)
        //    SendAlertEmailService.getInstance().invoke(errorInstance, location);
    }

}