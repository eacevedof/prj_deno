import { ResponseDto, ResponseDtoPrimitives } from "App/Modules/Shared/Infrastructure/Components/ResponseDto.ts";

// docu: https://deno.land/x/oak@v17.1.4/response.ts
export class CustomResponse {

    private readonly headers: Record<string, string> = {};
    private statusCode: number = 200;
    private mediaType: string = "application/json";
    private isBodyWritable: boolean = true;
    private body: Record<string, unknown> | string; //string for HTML or text responses

    public constructor(primitives = {
        headers: {},
        statusCode: 200,
        mediaType: "application/json",
        isWritable: true,
        body: {}
    }) {
        this.headers = primitives.headers ?? {};
        this.statusCode = primitives.statusCode;
        this.mediaType = primitives.mediaType;
        this.isBodyWritable = primitives.isWritable;
        this.body = primitives.body ?? {};
    }

    public static getInstance(primitives: {
        headers?: Record<string, string>,
        statusCode?: number,
        mediaType?: string,
        isWritable?: boolean,
        body?: Record<string, unknown> | string
    } = {} ): CustomResponse {

        return new CustomResponse({
            headers: primitives.headers || {},
            statusCode: primitives.statusCode || 200,
            mediaType: primitives.mediaType || "application/json",
            isWritable: primitives.isWritable || true,
            body: primitives.body || {}
        });
    }

    public static fromResponseDtoPrimitives(
        responseDtoPrimitives: ResponseDtoPrimitives
    ): CustomResponse {
        const responseDto: ResponseDto = ResponseDto.fromPrimitives(
            responseDtoPrimitives
        );

        return CustomResponse.getInstance({
            statusCode: responseDtoPrimitives.code,
            body: responseDto.toPrimitives()
        });
    }

    public addHeader(key: string, value: string): CustomResponse {
        this.headers[key] = value;
        return this
    }

    public setStatusCode(statusCode: number): CustomResponse {
        this.statusCode = statusCode;
        return this
    }

    public setMediaType(mediaType: string): CustomResponse {
        this.mediaType = mediaType;
        return this
    }

    public bodyWritable(isWritable: boolean): CustomResponse {
        this.isBodyWritable = isWritable;
        return this
    }

    public setBody(body: Record<string, unknown>|string): CustomResponse {
        this.body = body;
        return this
    }

    public setBodyFromResponseDto(responseDto: ResponseDto): CustomResponse {
        this.body = responseDto.toPrimitives()
        return this
    }

    public toPrimitives(): Record<string, unknown> {
        return {
            headers: this.headers,
            statusCode: this.statusCode,
            mediaType: this.mediaType,
            isBodyWritable: this.isBodyWritable,
            body: this.body,
        };
    }

}

/**
 * response: Response {
 *   body: undefined,
 *   headers: Headers { "access-control-allow-origin": "*" },
 *   status: 404,
 *   type: undefined,
 *   writable: true
 * }
 */