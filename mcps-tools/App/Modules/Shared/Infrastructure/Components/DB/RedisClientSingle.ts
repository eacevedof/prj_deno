import { createClient, RedisClientType } from "npm:redis@^5.6.0";

import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

//https://www.npmjs.com/package/redis/v/5.6.0
//https://github.com/redis/node-redis?tab=readme-ov-file
export class RedisClientSingle {

    private static instance: RedisClientSingle;

    private redisClientDomains: RedisClientType | null = null;
    private redisClientStreams: RedisClientType | null = null;

    public static getInstance(): RedisClientSingle {
        if (RedisClientSingle.instance)
            return RedisClientSingle.instance;

        RedisClientSingle.instance = new RedisClientSingle();
        return RedisClientSingle.instance;
    }

    public getDomainsClient(): RedisClientType {
        if (this.redisClientDomains) return this.redisClientDomains;

        const redisUrl: string = getEnv(EnvKeyEnum.APP_REDIS_URL) ?? "";
        const redisDomainsDb: string = getEnv(EnvKeyEnum.APP_REDIS_DB_DOMAINS) ?? "0";
        //console.log("- RedisClientSingle.getDomainsClient\n redisUrl:", redisUrl, "\ndb:", redisDomainsDb);
        this.redisClientDomains = createClient({
            url: redisUrl,
            database: parseInt(redisDomainsDb, 10)
        });
        return this.redisClientDomains;
    }

    public getStreamsClient(): RedisClientType {
        if (this.redisClientStreams) return this.redisClientStreams;

        const redisUrl: string = getEnv(EnvKeyEnum.APP_REDIS_URL) ?? "";
        const redisStreamsDb: string = getEnv(EnvKeyEnum.APP_REDIS_DB_STREAMS) ?? "1";
        //console.log("- RedisClientSingle.getStreamsClient\n redisUrl:", redisUrl, "\ndb:", redisStreamsDb);
        this.redisClientStreams = createClient({
            url: redisUrl,
            database: parseInt(redisStreamsDb, 10)
        });
        return this.redisClientStreams;
    }

}