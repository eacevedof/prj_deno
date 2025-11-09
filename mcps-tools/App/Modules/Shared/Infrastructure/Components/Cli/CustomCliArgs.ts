export class CustomCliArgs {

    private static instance: CustomCliArgs;
    private readonly args: string[];

    private constructor() {
        this.args = Deno.args;
    }

    public static getInstance(): CustomCliArgs {
        if (CustomCliArgs.instance) return CustomCliArgs.instance;
        CustomCliArgs.instance = new CustomCliArgs();
        return CustomCliArgs.instance;
    }

    public getArgs(): string[] {
        return this.args;
    }

    public getArg(index: number): string {
        return this.args[index] ?? "";
    }

}