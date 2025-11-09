import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";

export abstract class DomainException extends Error {

    private readonly statusCode: number;

    protected constructor(
        name: string,
        code: HttpResponseCodeEnum,
        message: string
    ) {
        super(message);

        this.name = name;
        this.statusCode = code;
        this.message = message;
    }

    public getStatusCode(): number {
        return this.statusCode;
    }

    public getMessage(): string {
        return this.message;
    }

}