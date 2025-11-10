import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { AbstractApiController } from "App/Modules/Shared/Infrastructure/Controllers/AbstractApiController.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { AuthKeyEnum } from "App/Modules/Authenticator/Domain/Enums/AuthKeyEnum.ts";
import { FailIfWrongAppAuthTokenDto } from "App/Modules/Authenticator/Application/FailIfWrongAppAuthToken/FailIfWrongAppAuthTokenDto.ts";
import { FailIfWrongAppAuthTokenService } from "App/Modules/Authenticator/Application/FailIfWrongAppAuthToken/FailIfWrongAppAuthTokenService.ts";
import { AuthenticatorException } from "App/Modules/Authenticator/Domain/Exceptions/AuthenticatorException.ts";

import { CreateUserDto } from "App/Modules/Users/Application/Services/CreateUser/CreateUserDto.ts";
import { CreateUserService } from "App/Modules/Users/Application/Services/CreateUser/CreateUserService.ts";
import { CreatedUserDto } from "App/Modules/Users/Application/Services/CreateUser/CreatedUserDto.ts";
import { UsersException } from "App/Modules/Users/Domain/Exceptions/UsersException.ts";

export class CreateUserController extends AbstractApiController {

    public static getInstance(): CreateUserController {
        return new CreateUserController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            await FailIfWrongAppAuthTokenService.getInstance().invoke(
                FailIfWrongAppAuthTokenDto.fromPrimitives({
                    appAuthToken: lzRequest.getHeader(AuthKeyEnum.PROJECT_AUTH_TOKEN),
                })
            );

            const createdUserDto: CreatedUserDto = await CreateUserService.getInstance().invoke(
                CreateUserDto.fromHttpRequest(lzRequest)
            )

            return CustomResponse.fromResponseDtoPrimitives({
                code: HttpResponseCodeEnum.CREATED,
                message: "user created successfully",
                data: createdUserDto.toPrimitives(),
            })
        }
        catch (error) {
            if (
                error instanceof AuthenticatorException ||
                error instanceof UsersException
            ) {
                return CustomResponse.fromResponseDtoPrimitives({
                    code: error.getStatusCode(),
                    message: error.getMessage(),
                })
            }

            this.handleUnknownError(error, CreateUserController.name.concat(`.invoke`));

            return CustomResponse.fromResponseDtoPrimitives({
                code: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
                message: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR,
            })
        }
    }

}