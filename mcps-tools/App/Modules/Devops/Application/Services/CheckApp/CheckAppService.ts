//https://www.npmjs.com/package/redis/v/5.6.0
import { createClient } from "npm:redis@^5.6.0";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";

import { Filer } from "App/Modules/Shared/Infrastructure/Components/Filer.ts";
import {
    EnvironmentReaderRawRepository
} from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvironmentReaderRawRepository.ts";
import { SystemOsReaderRepository } from "App/Modules/Devops/Infrastructure/Repositories/SystemOsReaderRepository.ts";

import {
    ElasticWriterApiRepository
} from "App/Modules/Elastic/Infrastructure/Repositories/ElasticWriterApiRepository.ts";
import { CliColor as cli} from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";
import { EnvKeyEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

/**
 * make deno-check-app
 *
 * Es un servicio sandbox para probar comportamiento de DENO y librerías de terceros.
 */
export class CheckAppService {

    private readonly logger: Logger;
    private readonly filer: Filer;

    private readonly environmentReaderRawRepository: EnvironmentReaderRawRepository;
    private readonly elasticWriterApiRepository: ElasticWriterApiRepository
    private readonly systemOsReaderRepository: SystemOsReaderRepository;

    private constructor() {
        this.logger = Logger.getInstance();
        this.filer = Filer.getInstance();

        this.environmentReaderRawRepository = EnvironmentReaderRawRepository.getInstance();
        this.systemOsReaderRepository = SystemOsReaderRepository.getInstance();
        this.elasticWriterApiRepository = ElasticWriterApiRepository.getInstance();

    }

    public static getInstance(): CheckAppService {
        return new CheckAppService();
    }

    public async invoke(): Promise<void> {

        console.log(" Deno.cwd();", Deno.cwd());

        //await this.saveInRedis();


        const r2 = await this.systemOsReaderRepository.getRunningDenoCommands()
        console.log(
            cli.getColorGreen("getRunningDenoCommands:\n"), r2
        );

        this.logger.logDebug("esto es log debug")
        //this.elasticWriterApiRepository.logDebug("hola");

        /*
        await Systemer.getInstance().runCommand(
        "deno run --allow-all --env-file=.env ./App/Console/console.ts app:deploy"
        );
        */

        /*
        await Systemer.getInstance().runCommandNohup(
          "deno run --allow-all --env-file=.env ./App/Console/console.ts app:deploy"
        );
        */

    }

    private async saveInRedis(): Promise<void> {
        const redisClient = createClient({
            //url: this.environmentReaderRawRepository.getRedisUrl()
            url: getEnv(EnvKeyEnum.APP_REDIS_URL) ?? ""
        });

        redisClient.on("error", (err: unknown) => {
            this.logger.logError(err);
            cli.echoRed(`Redis connection error: ${err}`);
        });

        await redisClient.connect();
        this.logger.logDebug("Connected to Redis successfully.");
        cli.echoBlue("Connected to Redis successfully.");

        await redisClient.set("testKey", "testValue10", {
            EX: 10, // Set expiration time to 60 seconds
        });


        const value = await redisClient.get("testKey");
        cli.echoBlue(`Value for 'testKey': ${value}`);

        await redisClient.quit();
    }

}