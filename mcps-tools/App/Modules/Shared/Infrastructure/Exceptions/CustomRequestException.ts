import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";

export class CustomRequestException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("CustomRequestException", statusCode, message)
    }

    public static badRequestCustom(message: string): void {
        throw new CustomRequestException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        )
    }

}