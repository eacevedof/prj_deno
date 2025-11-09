import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { AbstractApiController } from "App/Modules/Shared/Infrastructure/Controllers/AbstractApiController.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { FailIfWrongAppAuthTokenDto } from "App/Modules/Authenticator/Application/Services/FailIfWrongAppAuthToken/FailIfWrongAppAuthTokenDto.ts";
import { FailIfWrongAppAuthTokenService } from "App/Modules/Authenticator/Application/Services/FailIfWrongAppAuthToken/FailIfWrongAppAuthTokenService.ts";
import { AuthenticatorException } from "App/Modules/Authenticator/Application/Domain/Exceptions/AuthenticatorException.ts";

import { DeleteUserDto } from "App/Modules/Users/Application/Services/DeleteUser/DeleteUserDto.ts";
import { DeleteUserService } from "App/Modules/Users/Application/Services/DeleteUser/DeleteUserService.ts";
import { DeletedUserDto } from "App/Modules/Users/Application/Services/DeleteUser/DeletedUserDto.ts";
import { UsersException } from "App/Modules/Users/Domain/Exceptions/UsersException.ts";

export class DeleteUserController extends AbstractApiController {

    public static getInstance(): DeleteUserController {
        return new DeleteUserController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            await FailIfWrongAppAuthTokenService.getInstance().invoke(
                FailIfWrongAppAuthTokenDto.fromHttpRequest(lzRequest)
            );

            const deletedUserDto: DeletedUserDto = await DeleteUserService.getInstance().invoke(
                DeleteUserDto.fromHttpRequest(lzRequest)
            )

            return CustomResponse.fromResponseDtoPrimitives({
                message: "user deleted successfully",
                data: deletedUserDto.toPrimitives(),
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

            this.handleUnknownError(error, DeleteUserController.name.concat(`.invoke`));

            return CustomResponse.fromResponseDtoPrimitives({
                code: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
                message: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR,
            })
        }
    }

}
