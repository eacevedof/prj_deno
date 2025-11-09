import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";

export class FirebaseException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("FirebaseException", statusCode, message);
    }

    public static unexpectedCustom(message: string): void {
        throw new FirebaseException(
            HttpResponseCodeEnum.BAD_REQUEST,
            message
        );
    }

}

