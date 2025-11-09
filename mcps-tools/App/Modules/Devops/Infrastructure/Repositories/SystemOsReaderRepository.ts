import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";
import { Systemer } from "App/Modules/Shared/Infrastructure/Components/Systemer.ts";

type PsAuxType = {
    user: string;
    pid: string;
    cpu_percent: string;
    mem_percent: string;
    mem_virtual: string;
    mem_resident: string;
    terminal: string;
    slept: string;
    start_time: string;
    time_cpu: string;
    command: string;
};

export class SystemOsReaderRepository {

    private readonly systemer: Systemer;

    public constructor() {
        this.systemer = Systemer.getInstance();
    }

    public static getInstance(): SystemOsReaderRepository {
        return new SystemOsReaderRepository();
    }

    public async getRunningDenoCommands(): Promise<PsAuxType[]> {

        const command: string = `ps aux | grep deno | grep lz`;

        const cliLine: string = await this.runCommandOrDie(command);
        const cliLines: string[] = cliLine.trim().split(/\n/);

        const fields: string[] = [
            "user", "pid", "cpu_percent", "mem_percent",
            "mem_virtual", "mem_resident",
            "terminal", "slept", "start_time",
            "time_cpu", "command"
        ];

        return cliLines.map((cliLine: string) => {
            const allColumns: string[] = this.getExplodedCommandLine(cliLine);

            if (allColumns.length < fields.length) return null;

            return Object.fromEntries(
                fields.map(
                    (colName: string, colPosition: number) => [
                        colName,
                        allColumns[colPosition]
                    ]
                )
            ) as PsAuxType;
        })
        .filter(
            (psAuxObj: PsAuxType | null): psAuxObj is PsAuxType => !!psAuxObj
        )
        .filter((psAuxInfo: PsAuxType) => !psAuxInfo.command.includes(command))

    } // getRunningDenoCommands

    private getExplodedCommandLine(commandLine: string): string[] {
        const columns: string[] = commandLine.trim().split(/\s+/);
        if (columns.length < 11) return []

        const fixedColumns: string[] = columns.slice(0, 10);
        const command: string = columns.slice(10).join(" ");
        return [
            ...fixedColumns,
            command
        ];
    }

    private async runCommandOrDie(command: string): Promise<string> {
        const { status, stderr, stdout } = await this.systemer.runCommand(command);
        if (status) {
            cli.echoRed(`Error running command:\n\t${command}\n\n\terror: ${stderr}\n`);
            Deno.exit(1);
        }
        return stdout.toString();
    }

    public async isRunningDeploy(): Promise<boolean> {
        const running: PsAuxType[] = await this.getRunningDenoCommands();
        return running.some(
            (psAuxInfo: PsAuxType) => psAuxInfo.command.includes("app:deploy")
        );
    }

}

