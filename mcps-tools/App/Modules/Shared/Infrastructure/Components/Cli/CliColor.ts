export class CliColor {


    public static dieRed(text: string): never {
        this.echoRed(text);
        Deno.exit(1);
    }

    public static echoBlue(text: string): void {
        console.log(this.getColorBlue(text));
    }

    public static echoGreen(text: string): void {
        console.info(this.getColorGreen(text));
    }

    public static echoOrange(text: string): void {
        console.log(this.getColorOrange(text));
    }

    public static echoRed(text: string): void {
        console.error(this.getColorRed(text));
    }

    public static echoWhite(text: string): void {
        console.log(this.getColorWhite(text));
    }

    public static echoYellow(text: string): void {
        console.warn(this.getColorYellow(text));
    }

    public static getColorBlue(text: string): string {
        return `\x1b[94m${text}\x1b[0m`;
    }

    public static getColorGreen(text: string): string {
        return `\x1b[92m${text}\x1b[0m`;
    }

    public static getColorOrange(text: string): string {
        return `\x1b[38;5;214m${text}\x1b[0m`;
    }

    public static getColorRed(text: string): string {
        return `\x1b[91m${text}\x1b[0m`;
    }

    public static getColorWhite(text: string): string {
        return `\x1b[97m${text}\x1b[0m`;
    }

    public static getColorYellow(text: string): string {
        return `\x1b[93m${text}\x1b[0m`;
    }

    public static getYellow(text: string): string {
        return this.getColorYellow(text);
    }

    public static ts(anyVar: unknown): void {
        const now: string = (new Date()).toISOString().replace("T", " ").substring(0, 19);
        console.log(`[${now}]`, anyVar);
    }
}