import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";

export class ProjectsException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("ProjectsException", statusCode, message)
    }

    public static unauthorizedCustom(message: string): void {
        throw new ProjectsException(
            HttpResponseCodeEnum.UNAUTHORIZED,
            message,
        )
    }

    public static unexpectedCustom(message: string): void {
        throw new ProjectsException(
            HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
            message
        )
    }

    public static badRequestCustom(message: string): void {
        throw new ProjectsException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        )
    }

    public static notFoundCustom(message: string): void {
        throw new ProjectsException(
            HttpResponseCodeEnum.NOT_FOUND,
            message,
        )
    }

    public static conflictCustom(message: string): void {
        throw new ProjectsException(
            HttpResponseCodeEnum.CONFLICT,
            message,
        )
    }

}