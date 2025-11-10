import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";

export class FunctionalAnalysisException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("FunctionalAnalysisException", statusCode, message)
    }

    public static unauthorizedCustom(message: string): void {
        throw new FunctionalAnalysisException(
            HttpResponseCodeEnum.UNAUTHORIZED,
            message,
        )
    }

}