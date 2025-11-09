export class CliTs {

    public static echo(anyVar: unknown): void {
        const microseconds: bigint = BigInt(Math.floor(performance.now() * 1000));
        const microPart: number = Number(microseconds % 1000000n);//ultimos 6 dig

        const timestamp: string = `${(new Date()).toISOString().slice(0, -1)}${microPart.toString().padStart(6, "0")}Z`;
        console.log(`[${timestamp}]`, anyVar);
    }

}