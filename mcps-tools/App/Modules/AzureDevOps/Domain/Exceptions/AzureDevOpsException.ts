import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";

export class AzureDevOpsException extends DomainException {
    private constructor(statusCode: number, message: string) {
        super("AzureDevOpsException", statusCode, message)
    }

    public static unexpectedCustom(message: string): void {
        throw new AzureDevOpsException(
            HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
            message
        )
    }

    public static badRequestCustom(message: string): void {
        throw new AzureDevOpsException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        )
    }

    public static notFoundCustom(message: string): void {
        throw new AzureDevOpsException(
            HttpResponseCodeEnum.NOT_FOUND,
            message,
        )
    }

    public static unauthorizedCustom(message: string): void {
        throw new AzureDevOpsException(
            HttpResponseCodeEnum.UNAUTHORIZED,
            message,
        )
    }
}