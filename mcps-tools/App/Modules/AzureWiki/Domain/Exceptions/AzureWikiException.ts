import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";

export class AzureWikiException extends DomainException {
    private constructor(statusCode: number, message: string) {
        super("AzureWikiException", statusCode, message)
    }

    public static unexpectedCustom(message: string): void {
        throw new AzureWikiException(
            HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
            message
        )
    }

    public static badRequestCustom(message: string): void {
        throw new AzureWikiException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        )
    }

    public static notFoundCustom(message: string): void {
        throw new AzureWikiException(
            HttpResponseCodeEnum.NOT_FOUND,
            message,
        )
    }

    public static unauthorizedCustom(message: string): void {
        throw new AzureWikiException(
            HttpResponseCodeEnum.UNAUTHORIZED,
            message,
        )
    }
}