import CommandOutput = Deno.CommandOutput;
import { FtperCredentialsType } from "App/Modules/Shared/Infrastructure/Components/Ftper/FtperCredentialsType.ts";

export class Ftper {

    private readonly isFtps: boolean = true;
    private readonly host: string = "";
    private readonly port: number = 21;
    private readonly user: string = "";
    private readonly pass: string = "";

    constructor(
        credentials: FtperCredentialsType
    ) {
        this.isFtps = credentials.isFtps ?? true;
        this.host = credentials.host;
        this.port = credentials.port;
        this.user = credentials.user;
        this.pass = credentials.pass;
    }

    public static getInstance(credentials: FtperCredentialsType): Ftper {
        return new Ftper(credentials);
    }

    public async uploadFile(
        localFilePath: string,
        remoteFilePath: string
    ): Promise<void> {

        this.failIfNoCredentials();

        let ftpCommand: string = `        
        ftp -inv ${this.host} ${this.port} <<EOF
        user ${this.user} ${this.pass}
        delete ${remoteFilePath}
        put ${localFilePath} ${remoteFilePath}
        site chmod 644 ${remoteFilePath}
        bye
        EOF
        `

        const privateKeyPath: string = `${Deno.cwd()}/.ssh/sftp-key`;
        if (this.isFtps)
            ftpCommand = `
            sftp -oPort=${this.port} -i ${privateKeyPath} ${this.user}@${this.host} <<EOF
            rm ${remoteFilePath}
            put ${localFilePath} ${remoteFilePath}
            chmod 644 ${remoteFilePath}
            bye
            EOF
            `

        console.log("uploadFile command:", ftpCommand);
        const commandOutput: CommandOutput = await new Deno.Command(
            "sh", {args: ["-c", ftpCommand]}
        ).output();

        if (!commandOutput.success) {
            console.error("error:", (new TextDecoder()).decode(commandOutput.stderr));
            throw new Error(`Ftper: failed uploading: ${localFilePath} into ${remoteFilePath}`);
        }
    }

    private failIfNoCredentials(): void {
        if (!this.host || !this.user || !this.pass) {
            throw new Error("Ftper: credentials are not set");
        }
    }

}