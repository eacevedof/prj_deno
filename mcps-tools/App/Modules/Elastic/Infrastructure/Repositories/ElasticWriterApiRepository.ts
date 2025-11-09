import CommandOutput = Deno.CommandOutput

import { Server } from "App/Modules/Shared/Infrastructure/Components/Server.ts";
import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";
import { Slugger } from "App/Modules/Shared/Infrastructure/Components/Slugger.ts";

import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";

import { EnvVarType } from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvVarType.ts";
import { EnvironmentReaderRawRepository } from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvironmentReaderRawRepository.ts";

import { LogLevelEnum } from "App/Modules/Elastic/Domain/Enums/LogLevelEnum.ts";
import { ElasticMetaType } from "App/Modules/Elastic/Domain/Types/ElasticMetaType.ts";
import { ElasticResponseType } from "App/Modules/Elastic/Domain/Types/ElasticResponseType.ts";
import { ElasticDocType } from "App/Modules/Elastic/Domain/Types/ElasticDocType.ts";

export class ElasticWriterApiRepository {

    private static instance: ElasticWriterApiRepository | null = null;

    private static dateTimer: DateTimer;
    private static envVars: EnvVarType;
    private static pathLogElkFile: string = "";

    private static metaData: ElasticMetaType | null = null;

    private constructor() {}

    public static getInstance(
        metaData: ElasticMetaType | null = null
    ): ElasticWriterApiRepository {

        if (metaData !== null) this.metaData = metaData;
        if (this.instance) return this.instance;

        this.dateTimer = DateTimer.getInstance()
        this.envVars = EnvironmentReaderRawRepository.getInstance().getEnvVars();
        const today: string = this.dateTimer.getToday();

        this.pathLogElkFile = `${this.envVars.log_paths}/elk-${today}.log`;

        this.instance = new ElasticWriterApiRepository();
        return this.instance;
    }

    public async logError(content: string): Promise<ElasticResponseType> {
        const postPayload: ElasticDocType  = await this.getElasticDocument(
            content,
            LogLevelEnum.ERROR
        );
        return await this.getPostRequestAsync(postPayload);
    }

    public async logDebug(content: string): Promise<ElasticResponseType> {
        const postPayload: ElasticDocType  = await this.getElasticDocument(
            content,
            LogLevelEnum.DEBUG
        );
        return await this.getPostRequestAsync(postPayload);
    }

    public async logSql(content: string): Promise<ElasticResponseType> {
        const postPayload: ElasticDocType  = await this.getElasticDocument(
            content,
            LogLevelEnum.SQL
        );
        return await this.getPostRequestAsync(postPayload);
    }

    public async logSecurity(content: string): Promise<ElasticResponseType> {
        const postPayload: ElasticDocType  = await this.getElasticDocument(
            content,
            LogLevelEnum.SECURITY
        );
        return await this.getPostRequestAsync(postPayload);
    }

    public async logWarning(content: string): Promise<ElasticResponseType> {
        const postPayload: ElasticDocType = await this.getElasticDocument(
            content,
            LogLevelEnum.WARNING
        );
        return await this.getPostRequestAsync(postPayload);
    }

    private async getElasticDocument(
        logContent: string,
        logLevel: LogLevelEnum
    ): Promise<ElasticDocType> {

        const elasticDoc: ElasticDocType = {
            domain: ElasticWriterApiRepository.envVars.base_url,
            environment: ElasticWriterApiRepository.envVars.environment,
            level: logLevel,
            date_time: ElasticWriterApiRepository.dateTimer.getNowYmdHis(),
            server_ip: await Server.getInstance().getServerIp(), //la ip de este servidor
            request_ip: ElasticWriterApiRepository.metaData?.request_ip || "",
            request_uri: ElasticWriterApiRepository.metaData?.request_uri || "",
            log_content: this.getCleanedLogContent(logContent),
            "@timestamp": (new Date()).toISOString(),
        };

        //console.log("elastic document", elasticDoc); //@eaf
        return elasticDoc;
    }


    private getCleanedLogContent(logContent: string): string {
        return this.substring10000(logContent);
    }

    private substring10000(str: string): string {
        const maxLen:number = 100000;
        if (str.length <= maxLen) return str;
        return str.slice(0, maxLen) + `... [string truncated to ${maxLen} chars]`;
    }

    private async getPostRequestAsync(
        postPayload: ElasticDocType
    ): Promise<ElasticResponseType> {

        const databaseName: string = this.getDatabaseName();
        const elasticApiUrl: string = `${ElasticWriterApiRepository.envVars.elastic_api_url}/${databaseName}/_doc`;

        const curlCommand: string = await this.getNohupCommandInSingleLine({
            elasticApiUrl,
            postPayload
        });

        await this.logElk(postPayload, "getPostRequestAsync.postPayload");
        //await this.logElk(curlCommand, import.meta.url.replace("file://", ""));

        //en deno prod no tenemos bash. solo sh
        const commandOutput: CommandOutput = await new Deno.Command("sh", {
            args: ["-c", curlCommand],
        }).output()

        const textDecoder: TextDecoder = new TextDecoder();

        const cmdResult: ElasticResponseType = {
            stdout: textDecoder.decode(commandOutput.stdout).trim(),
            stderr: textDecoder.decode(commandOutput.stderr).trim(),
            status: commandOutput.code
        };

        //console.log("ElasticWriterApiRepository.getPostRequestAsync", cmdResult);
        return cmdResult;
    }

    private async getNohupCommandInSingleLine(
        elasticRequest: { elasticApiUrl: string; postPayload: Record<string, unknown> }
    ): Promise<string> {
        const json: string = JSON.stringify(elasticRequest.postPayload);
        const pathTmpFile:string = this.getRandomTmpFilePath();
        await Deno.writeTextFile(pathTmpFile, json);

        const logElk: string = ElasticWriterApiRepository.pathLogElkFile;

        const nohup: string[] = [
            `nohup sh -c 'curl --silent --location --request POST`,
            `--max-time 60`,
            `--url "${elasticRequest.elasticApiUrl}"`,
            `--header "Content-Type: application/json"`,
            `--data-binary @${pathTmpFile}`,
            `&& sleep 10 && rm ${pathTmpFile}' >> ${logElk} 2>&1 &`
        ];
        return nohup.join(" ");
    }

    private getDatabaseName(): string {
        const appEnv: EnvironmentEnum = ElasticWriterApiRepository.envVars.environment as EnvironmentEnum;
        const appName: string = ElasticWriterApiRepository.envVars.app_name;
        const dbName: string = `${appEnv}-${appName}`;
        const dbSlug: string = Slugger.getInstance().getSluggedText(dbName);
        return dbSlug.slice(0, 250);
    }

    private async logElk(mixed: unknown, title:string = ""): Promise<void> {

        const logElkFile: string = ElasticWriterApiRepository.pathLogElkFile;
        const now: string = ElasticWriterApiRepository.dateTimer.getNowYmdHis();
        let content: string = `[${now}]`;
        if (title) content += ` ${title}\n\t`;

        if (typeof mixed !== "string") {
            try {
                content += JSON.stringify(mixed, null, 2);
            }
            catch {
                content += String(mixed);
            }
        }
        else {
            content += mixed;
        }
        content += "\n";

        try {
            //console.log("==== ElasticWriterApiRepository.logElk ====", logElkFile, content);
            await Deno.writeTextFile(logElkFile, content, { append: true });
        }
        catch (e){
            console.error("ElasticWriterApiRepository.logElk", e);
        }
    }

    private getRandomTmpFilePath(): string {
        const today: string = ElasticWriterApiRepository.dateTimer.getToday();
        const random: string = Array.from(crypto.getRandomValues(new Uint8Array(10)))
            .map(b => b.toString(16).padStart(2, "0")).join("");

        return `/tmp/elk-${today}-${random}`;
    }

}