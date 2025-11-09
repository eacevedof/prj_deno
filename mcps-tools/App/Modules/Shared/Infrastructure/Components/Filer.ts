import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

export class Filer {

    public static getInstance(): Filer {
        return new Filer();
    }

    public async doesFileExist(pathFile: string): Promise<boolean> {
        try {
            await Deno.stat(pathFile);
            return true;
        }
        catch (error) {
            console.error(`file does not exist: ${pathFile}`, error);
        }
        return false;
    }

    public async filePutContents(pathFile: string, strData: string): Promise<void> {
        await Deno.writeTextFile(pathFile, strData);
    }

    public async fileGetContent(pathFile: string): Promise<string> {
        if (!await this.doesFileExist(pathFile)) return "";
        return await Deno.readTextFile(pathFile);
    }

    //get files in a directory
    public async getFilesInDirectory(path: string): Promise<string[]> {
        const files: string[] = [];
        for await (const dirEntry of Deno.readDir(path)) {
            if (dirEntry.isFile) {
                files.push(dirEntry.name);
            }
        }
        return files;
    }

    public async downloadFile(httpUrl: string, targetPath: string): Promise<void> {
        console.log(`Downloading file via fetch: ${httpUrl} to ${targetPath}`);
        const fetchResponse: Response = await fetch(httpUrl);
        if (!fetchResponse.ok)
            throw new Error(`error downloading file: ${httpUrl}, error: ${fetchResponse.statusText}`);

        const binaryInts: Uint8Array = new Uint8Array(await fetchResponse.arrayBuffer());
        await Deno.writeFile(targetPath, binaryInts);
    }

    /**
     * Por algún motivo la web phish.co.za tiene bloqueadas las IPS de promox
     * con lo cual se necesita hacer un bypass por otro servidor (54.37.94.46 = mefisto)
     */
    public async downloadFileViaTunnel(httpUrl: string, targetPath: string): Promise<void> {
        console.log(`Downloading file via tunnel: ${httpUrl} to ${targetPath}`);

        const tunnelServer: string|null = getEnv(EnvKeyEnum.APP_TUNNEL_SERVER);
        const tunnelPort:string|null = getEnv(EnvKeyEnum.APP_TUNNEL_PORT);
        const tunnelUser:string|null = getEnv(EnvKeyEnum.APP_TUNNEL_USER);
        const tunnelKeyFile:string|null = getEnv(EnvKeyEnum.APP_TUNNEL_KEY_FILE);

        if (!tunnelServer || !tunnelPort || !tunnelUser || !tunnelKeyFile) {
            throw new Error(
                `tunnel configuration is missing. Required: 
                APP_TUNNEL_SERVER, APP_TUNNEL_PORT, APP_TUNNEL_USER, APP_TUNNEL_KEY_FILE. 
                server=${tunnelServer}, port=${tunnelPort}, user=${tunnelUser}, keyFile=${tunnelKeyFile}`
            );
        }

        const sshCommand:string = `
        ssh ${tunnelUser}@${tunnelServer} -i ${tunnelKeyFile} -o Port=${tunnelPort} -o StrictHostKeyChecking=no "wget -O - ${httpUrl}" > ${targetPath}
        `;

        console.log("downloadFileViaTunnel command:", sshCommand);
        const commandOutput: Deno.CommandOutput = await new Deno.Command(
            "sh", {args: ["-c", sshCommand]}
        ).output();

        if (!commandOutput.success) {
            console.error("error:", (new TextDecoder()).decode(commandOutput.stderr));
            throw new Error(`ssh tunnel download failed: ${httpUrl} to ${targetPath}`);
        }
    }

    public async unlinkFile(pathFile: string): Promise<void> {
        if (!await this.doesFileExist(pathFile)) {
            console.warn(`file does not exist, cannot unlink: ${pathFile}`);
            return;
        }
        try {
            await Deno.remove(pathFile);
        }
        catch (error) {
            console.error(error)
        }
    }

}
