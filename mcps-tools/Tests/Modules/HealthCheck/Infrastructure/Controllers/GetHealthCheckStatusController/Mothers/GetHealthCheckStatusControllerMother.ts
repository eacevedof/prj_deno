import { GetHealthCheckStatusController } from "App/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController.ts";

export class GetHealthCheckStatusControllerMother {

    public static getControllerInstance(): GetHealthCheckStatusController {
        return GetHealthCheckStatusController.getInstance();
    }
}
