import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { AbstractApiController } from "App/Modules/Shared/Infrastructure/Controllers/AbstractApiController.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { FailIfWrongAppAuthTokenDto } from "App/Modules/Authenticator/Application/Services/FailIfWrongAppAuthToken/FailIfWrongAppAuthTokenDto.ts";
import { FailIfWrongAppAuthTokenService } from "App/Modules/Authenticator/Application/Services/FailIfWrongAppAuthToken/FailIfWrongAppAuthTokenService.ts";
import { AuthenticatorException } from "App/Modules/Authenticator/Application/Domain/Exceptions/AuthenticatorException.ts";

import { GetProjectConfigDto } from "App/Modules/Projects/Application/GetProjectConfig/GetProjectConfigDto.ts";
import { GetProjectConfigService } from "App/Modules/Projects/Application/GetProjectConfig/GetProjectConfigService.ts";
import { GotProjectConfigDto } from "App/Modules/Projects/Application/GetProjectConfig/GotProjectConfigDto.ts";
import { ProjectsException } from "App/Modules/Projects/Domain/Exceptions/ProjectsException.ts";


export class GetProjectConfigController extends AbstractApiController
{
    public static getInstance(): GetProjectConfigController {
        return new GetProjectConfigController()
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            await FailIfWrongAppAuthTokenService.getInstance().invoke(
                FailIfWrongAppAuthTokenDto.fromHttpRequest(lzRequest)
            );

            const gotUserDevicesByUserUuidDto: GotProjectConfigDto = await GetProjectConfigService.getInstance().invoke(
                GetProjectConfigDto.fromHttpRequest(lzRequest)
            );

            return CustomResponse.fromResponseDtoPrimitives({
                message: "project config",
                data: gotUserDevicesByUserUuidDto.toPrimitives(),
            })

        }
        catch (error) {
            if (error instanceof AuthenticatorException ||
                error instanceof ProjectsException) {
                return CustomResponse.fromResponseDtoPrimitives({
                    code: error.getStatusCode(),
                    message: error.getMessage(),
                })
            }

            this.handleUnknownError(error, GetProjectConfigController.name.concat(`.invoke`));

            return CustomResponse.fromResponseDtoPrimitives({
                code: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
                message: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR,
            })

        } // catch

    }// invoke

}