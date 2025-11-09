import {InterfaceControllerBase} from "App/Modules/Shared/Infrastructure/Controllers/InterfaceControllerBase.d.ts";

export type AppRouteType = {
    method: string;
    pattern: string;
    controller: InterfaceControllerBase;
};