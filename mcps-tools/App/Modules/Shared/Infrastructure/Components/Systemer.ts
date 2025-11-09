import CommandOutput = Deno.CommandOutput;

export class Systemer {

    public static getInstance(): Systemer {
        return new Systemer();
    }

    public async runCommand(command: string): Promise<Record<string, string|number>> {
        return await this.runDenoCommand(command)
    }

    private async runDenoCommand(command: string): Promise<Record<string, string|number>> {
        const commandOutput: CommandOutput = await new Deno.Command(
            "sh", { args: ["-c", command] }
        ).output()

        const textDecoder: TextDecoder = new TextDecoder();
        return {
            stdout: textDecoder.decode(commandOutput.stdout).trim(),
            stderr: textDecoder.decode(commandOutput.stderr).trim(),
            status: commandOutput.code
        };
    }

    public async runCommandNohup(command: string): Promise<void> {
        const cmdAsync: string = `nohup ${command} > /dev/null 2>&1 &`;
        const result = await this.runDenoCommand(cmdAsync)
        console.log("runCommandNohup executed:", cmdAsync, "output:", result);
    }

}
