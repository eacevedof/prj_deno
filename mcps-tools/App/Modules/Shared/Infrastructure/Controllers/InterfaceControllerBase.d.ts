import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";

export interface InterfaceControllerBase {
    invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse>;
}