import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";

export class NotificationsException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("NotificationsException", statusCode, message);
    }

    public static badRequestCustom(message: string): void {
        throw new NotificationsException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        );
    }
    
    public static unexpectedCustom(message: string): void {
        throw new NotificationsException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        );
    }

}
