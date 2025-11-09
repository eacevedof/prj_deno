import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";

export class StaticAssetsException extends DomainException {
    private constructor(statusCode: number, message: string) {
        super("StaticAssetsException", statusCode, message)
    }

    public static badRequestCustom(message: string): void {
        throw new StaticAssetsException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message,
        )
    }

    public static notFoundCustom(message: string): void {
        throw new StaticAssetsException(
            HttpResponseCodeEnum.NOT_FOUND,
            message,
        )
    }

}