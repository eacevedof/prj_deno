import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";

export class ExternalApiForwardException extends DomainException {
    private constructor(statusCode: number, message: string) {
        super("ExternalApiForwardException", statusCode, message)
    }

    public static badRequestCustom(message: string): void {
        throw new ExternalApiForwardException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        )
    }

    public static notFoundCustom(message: string): void {
        throw new ExternalApiForwardException(
            HttpResponseCodeEnum.NOT_FOUND,
            message,
        )
    }

    public static unauthorizedCustom(message: string): void {
        throw new ExternalApiForwardException(
            HttpResponseCodeEnum.UNAUTHORIZED,
            message,
        )
    }

    public static unexpectedCustom(message: string): void {
        throw new ExternalApiForwardException(
            HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
            message
        )
    }

}