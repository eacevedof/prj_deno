import { RedisClientType } from "npm:redis@^5.6.0";

import { CliTs as clits } from "App/Modules/Shared/Infrastructure/Components/Cli/CliTs.ts";
import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";
import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

import { GenericRowType } from "App/Modules/Shared/Infrastructure/Types/GenericRowType.ts";
import { RedisClientMux } from "App/Modules/Shared/Infrastructure/Components/DB/RedisClientMux.ts";
import { RedisClientSingle } from "App/Modules/Shared/Infrastructure/Components/DB/RedisClientSingle.ts";

export abstract class AbstractRedisRepository {

    protected static SIXTY_SECONDS: number = 60;

    protected environment: string = getEnv(EnvKeyEnum.APP_ENV) || EnvironmentEnum.DEVELOPMENT.valueOf();

    private redisDomainsClientSingle: RedisClientType = RedisClientSingle.getInstance().getDomainsClient();
    private redisStreamsClientSingle: RedisClientType = RedisClientSingle.getInstance().getStreamsClient();

    protected redisDomainsClientMux: RedisClientMux = RedisClientMux.getInstance();

    protected async getRedisStreamsClientSingle(): Promise<RedisClientType> {
        await this.openStreamsSingleConnection();
        return (this as any).redisStreamsClientSingle;
    }

    private async openStreamsSingleConnection(): Promise<void> {
        if (this.redisStreamsClientSingle.isOpen) return;
        await this.redisStreamsClientSingle.connect();
    }

    private async openDomainsSingleConnection(): Promise<void> {
        if (this.redisDomainsClientSingle.isOpen) return;
        await this.redisDomainsClientSingle.connect();
    }

    private async closeDomainsSingleConnection(): Promise<void> {
        if (this.redisDomainsClientSingle.isOpen) {
            await this.redisDomainsClientSingle.close();
        }
    }

    protected async closeStreamsConnection(): Promise<void> {
        if (this.redisStreamsClientSingle.isOpen) {
            await this.redisStreamsClientSingle.close();
        }
    }

    protected async getHasSetPool(redisKey: string): Promise<GenericRowType | null> {
        const redisDomainsClientMux: RedisClientType = await this.redisDomainsClientMux.getRedisDomainsClient();
        clits.echo(`getHasSetPool 1 ${redisKey}`);
        const obj = await redisDomainsClientMux.hGetAll(redisKey);
        clits.echo(`getHasSetPool 2 ${redisKey}`);
        if (obj && Object.keys(obj).length === 0) return null;
        return obj;
    }

    protected async getBulkHashSetsPool(redisKeys: string[]): Promise<GenericRowType[]> {
        const results: any[] = await this.redisDomainsClientMux.domainsExecAsPipeline((client) => {
            return Promise.all(
                redisKeys.map(redisKey => client.hGetAll(redisKey))
            );
        });

        return results.filter(obj => obj && Object.keys(obj).length > 0) as GenericRowType[];
    }

    /**
     * save multiple hash sets using redis pipeline
     * connection must be opened before calling this method
     */
    protected async saveBulkHashSets(
        redisHashSets: Array<{
            redisKey: string;
            redisRow: GenericRowType;
            redisTtlMins: number
        }>
    ): Promise<void> {
        await this.openDomainsSingleConnection();
        const redisPipeTransac = this.redisDomainsClientSingle.multi();
        redisHashSets.forEach(
            (hashSet: {
                redisKey: string;
                redisRow: GenericRowType;
                redisTtlMins: number
            }) => {
                redisPipeTransac.hSet(
                    hashSet.redisKey,
                    hashSet.redisRow
                );
                redisPipeTransac.expire(
                    hashSet.redisKey,
                    hashSet.redisTtlMins * AbstractRedisRepository.SIXTY_SECONDS
                );
        });
        await redisPipeTransac.exec();
        await this.closeDomainsSingleConnection();
    }

}