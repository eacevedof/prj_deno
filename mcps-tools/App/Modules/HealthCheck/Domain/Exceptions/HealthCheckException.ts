import { DomainException } from "App/Modules/Shared/Domain/Exceptions/DomainException.ts";
export class HealthCheckException extends DomainException {

    private constructor(statusCode: number, message: string) {
        super("HealthCheckException", statusCode, message)
    }

}