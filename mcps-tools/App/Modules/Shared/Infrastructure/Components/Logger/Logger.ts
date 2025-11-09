import { format } from "https://deno.land/std@0.224.0/datetime/mod.ts";

import { LogExtensionEnum } from "App/Modules/Shared/Infrastructure/Components/Logger/LogExtensionEnum.ts";
import { LogLevelEnum } from "App/Modules/Shared/Infrastructure/Components/Logger/LogLevelEnum.ts";
import { LoggerMetaType } from "App/Modules/Shared/Infrastructure/Components/Logger/LoggerMetaType.ts";
import { CliColor as cli } from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";

import { ElasticWriterApiRepository } from "App/Modules/Elastic/Infrastructure/Repositories/ElasticWriterApiRepository.ts";

const PATH_LOGS_FOLDER: string = Deno.cwd() + "/storage/logs";

async function filePutContents(
    pathFile: string,
    strData: string,
): Promise<void> {
    try {
        await Deno.writeTextFile(pathFile, strData, { append: true });
    }
    catch (error) {
        console.error(`filePutContents: error writing to file: ${pathFile}`, error);
    }
}

export class Logger {

    private static instance: Logger | null = null;

    private static metaData: LoggerMetaType | null = null;

    public static getInstance(
        metaData: LoggerMetaType | null = null
    ): Logger {
        if (!this.instance) this.instance = new Logger();
        if (metaData !== null) this.metaData = metaData;

        //console.log("Logger metaData:", this.metaData);
        return this.instance;
    }

    public logDebug(mixed: unknown, title: string = ""): void {
        
        if (this.isTestMode()) {
            console.log(cli.getColorGreen(`[logger-test-mode] DEBUG ${title}:`), mixed);
            return;
        }

        const contentArr: string[] = [
            `request_ip: ${Logger.metaData?.request_ip || "" }`
        ];

        if (title) contentArr.push(title);
        contentArr.push(
            typeof mixed === "string" ? mixed : this.getAsJson(mixed)
        );
        let content: string = contentArr.join("\n");
        content = `[DEBUG] ${content}`;

        this.logInFile(content, LogLevelEnum.DEBUG).catch((e) => console.error(e));
        ElasticWriterApiRepository.getInstance({
            request_ip: Logger.metaData?.request_ip || "",
            request_uri: Logger.metaData?.request_uri || "",
        }).logDebug(content).catch((e) => console.error(e));
    }

    public logSql(sql: string, title: string = ""): void {
        
        if (this.isTestMode()) {
            console.log(cli.getColorBlue(`[logger-test-mode] SQL ${title}:`), sql);
            return;
        }

        const contentArr: string[] = [
            `request_ip: ${Logger.metaData?.request_ip || ""}`
        ];
        if (title) contentArr.push(title);
        contentArr.push(sql);
        let content: string = contentArr.join("\n");
        content = `[SQL] ${content}`;

        this.logInFile(content, LogLevelEnum.SQL).catch((e) => console.error(e));
        ElasticWriterApiRepository.getInstance({
            request_ip: Logger.metaData?.request_ip || "",
            request_uri: Logger.metaData?.request_uri || "",
        }).logSql(content).catch((e) => console.error(e));
    }

    public logError(
        mixed: unknown,
        title: string = "",
    ): void {
        
        if (this.isTestMode()) {
            console.log(cli.getColorRed(`[logger-test-mode] ERROR ${title}:`), mixed);
            return;
        }

        const contentArr: string[] = [
            `request_ip: ${Logger.metaData?.request_ip || ""}`
        ];
        if (title) contentArr.push(title);

        contentArr.push(
            typeof mixed === "string" ? mixed : this.getAsJson(mixed)
        );
        let content: string = contentArr.join("\n");
        content = `[ERROR] ${content}`;

        this.logInFile(content, LogLevelEnum.ERROR).catch((e) => console.error(e));
        ElasticWriterApiRepository.getInstance({
            request_ip: Logger.metaData?.request_ip || "",
            request_uri: Logger.metaData?.request_uri || "",
        }).logError(content).catch((e) => console.error(e));
    }

    public logSecurity(mixed: unknown, title: string = ""): void {
        
        if (this.isTestMode()) {
            console.log(cli.getColorYellow(`[logger-test-mode] SECURITY ${title}:`), mixed);
            return;
        }

        const contentArr: string[] = [
            `request_ip: ${Logger.metaData?.request_ip || ""}`
        ];
        if (title) contentArr.push(title);

        contentArr.push(
            typeof mixed === "string" ? mixed : this.getAsJson(mixed)
        );
        let content: string = contentArr.join("\n");
        content = `[SECURITY] ${content}`;

        //no es necesario esperar
        this.logInFile(content, LogLevelEnum.SECURITY).catch((e) => console.error(e));
        ElasticWriterApiRepository.getInstance({
            request_ip: Logger.metaData?.request_ip || "",
            request_uri: Logger.metaData?.request_uri || "",
        }).logSecurity(content).catch((e) => console.error(e));
    }

    public logWarning(mixed: unknown, title: string = ""): void {
        
        if (this.isTestMode()) {
            console.log(cli.getColorOrange(`[logger-test-mode] WARNING ${title}:`), mixed);
            return;
        }

        const contentArr: string[] = [
            `request_ip: ${Logger.metaData?.request_ip || ""}`
        ];
        if (title) contentArr.push(title);

        contentArr.push(
            typeof mixed === "string" ? mixed : this.getAsJson(mixed)
        );
        let content: string = contentArr.join("\n");
        content = `[WARNING] ${content}`;

        this.logInFile(content, LogLevelEnum.WARNING).catch((e) => console.error(e));
        ElasticWriterApiRepository.getInstance({
            request_ip: Logger.metaData?.request_ip || "",
            request_uri: Logger.metaData?.request_uri || "",
        }).logWarning(content).catch((e) => console.error(e));
    }

    public logException(
        throwable: unknown,
        title: string = "ERROR",
    ): void {
        
        if (this.isTestMode()) {
            console.log(cli.getColorRed(`[logger-test-mode] ${title}:`), throwable);
            return;
        }

        const contentArr: string[] = [
            `request_ip: ${Logger.metaData?.request_ip || ""}`
        ];
        if (title) contentArr.push(title);

        if (typeof throwable === "string") {
            contentArr.push(throwable);
        } else {
            contentArr.push(this.getAsJson(throwable));
        }
        let content: string = contentArr.join("\n");
        content = `[ERROR] ${content}`;

        this.logInFile(content, LogLevelEnum.ERROR).catch((e) => console.error(e));
        ElasticWriterApiRepository.getInstance({
            request_ip: Logger.metaData?.request_ip || "",
            request_uri: Logger.metaData?.request_uri || "",
        }).logError(content).catch((e) => console.error(e));
    }

    private isTestMode(): boolean {
        return (globalThis as any).IS_TEST_MODE === true;
    }

    private getToday(): string {
        return format(new Date(), "yyyy-MM-dd");
    }

    private getNow(): string {
        return format(new Date(), "yyyy-MM-dd HH:mm:ss");
    }

    private async logInFile(content: string, fileName: string): Promise<void> {
        const today: string = this.getToday();
        const now: string = this.getNow();
        content = `\n[${now}]\n${content}`;
        const extension: LogExtensionEnum = fileName === LogExtensionEnum.SQL
            ? LogExtensionEnum.SQL
            : LogExtensionEnum.LOG;

        const pathLogFile: string = PATH_LOGS_FOLDER + `/${fileName}-${today}.${extension}`
        await filePutContents(pathLogFile, content);
    }

    private getAsJson(variable: unknown): string {
        if (variable instanceof Error) {
            return JSON.stringify(
                {
                    name: variable.name,
                    message: variable.message,
                    stack: variable.stack,
                },
                null,
                2,
            );
        }
        return JSON.stringify(variable, null, 2);
    }

}
