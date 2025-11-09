export interface ResponseDtoPrimitives {
	code?: number;
	message?: string;
	data?: unknown;
}

export class ResponseDto {

	private readonly code: number;
	private readonly status: string;
	private readonly message: string;
	private readonly data: unknown;

	constructor(primitives: ResponseDtoPrimitives) {
		this.code = primitives.code ?? 200;
		this.status = this.getStatusByCode();
		this.message = primitives.message ?? "";
		this.data = primitives.data ?? [];
	}

	private getStatusByCode(): string {
		const responseCode:string = this.code.toString();
		return responseCode.startsWith("2") ? "success" : "error";
	}

	static fromPrimitives(primitives: ResponseDtoPrimitives): ResponseDto {
		return new ResponseDto(primitives);
	}

	public toPrimitives(): Record<string, unknown> {
		return {
			code: this.code,
			status: this.status,
			message: this.message,
			data: this.data,
		};
	}

}
