import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";

export class UsersException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("UsersException", statusCode, message)
    }

    public static unexpectedCustom(message: string): void {
        throw new UsersException(
            HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
            message
        )
    }

    public static badRequestCustom(message: string): void {
        throw new UsersException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        )
    }

    public static notFoundCustom(message: string): void {
        throw new UsersException(
            HttpResponseCodeEnum.NOT_FOUND,
            message,
        )
    }

    public static conflictCustom(message: string): void {
        throw new UsersException(
            HttpResponseCodeEnum.CONFLICT,
            message,
        )
    }

}