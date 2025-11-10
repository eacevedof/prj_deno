import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";

export class AuthenticatorException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("AuthenticatorException", statusCode, message)
    }

    public static unauthorizedCustom(message: string): void {
        throw new AuthenticatorException(
            HttpResponseCodeEnum.UNAUTHORIZED,
            message,
        )
    }

}