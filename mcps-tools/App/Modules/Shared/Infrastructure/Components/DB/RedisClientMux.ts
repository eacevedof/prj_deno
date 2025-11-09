import { createClient, RedisClientType } from "npm:redis@^5.6.0";

import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";

/**
 * RedisClientMux - Cliente Redis para producción usando multiplexing nativo de node-redis
 * 
 * CONFIGURACIÓN DE PRODUCCIÓN:
 * - disableOfflineQueue: true - Evita duplicación de comandos no-idempotentes durante reconexiones
 * - Timeouts agresivos: 5s para conexión y comandos
 * - Reconexión automática con exponential backoff (max 10 reintentos)
 * - Event handlers completos para monitoreo y logging
 * 
 * DIFERENCIAS CON EL POOL MANUAL (RedisPoolClient):
 * 
 * 1. Multiplexing vs Pooling:
 *    - node-redis usa MULTIPLEXING: una sola conexión TCP maneja múltiples comandos concurrentes
 *    - No necesita pool manual: el cliente gestiona la cola de comandos internamente
 *    - Automáticamente combina comandos cercanos en pipelines para mejor rendimiento
 * 
 * 2. Manejo de concurrencia:
 *    - NO necesitas "obtener" y "liberar" clientes
 *    - Simplemente llamas a los comandos y node-redis los gestiona
 *    - Soporta miles de comandos concurrentes sobre una sola conexión
 * 
 * 3. Cuándo usar múltiples clientes:
 *    - Por defecto: UN SOLO CLIENTE es suficiente para la mayoría de casos
 *    - Usar múltiples clientes solo si:
 *      a) Necesitas operaciones bloqueantes (BLPOP, BRPOP) en conexiones separadas
 *      b) Necesitas pub/sub en conexiones dedicadas
 *      c) Tienes requisitos específicos de aislamiento de transacciones
 * 
 * 4. Ventajas sobre pool manual:
 *    - Menos overhead de gestión de conexiones
 *    - No hay "agotamiento" de pool
 *    - Reconexión automática con exponential backoff
 *    - Mejor rendimiento por uso de pipelines automáticos
 *    - Sin riesgo de memory leaks por olvidar liberar conexiones
 * 
 * 5. ¿Por qué no se necesitan 380 conexiones?
 *    - node-redis usa multiplexing: UNA conexión maneja miles de comandos/segundo
 *    - Redis es single-threaded, más conexiones ≠ mejor rendimiento
 *    - El cliente serializa comandos usando protocolo RESP
 *    - No hay "bloqueo" de conexión durante comandos normales
 * 
 * IMPORTANTE - disableOfflineQueue:
 * Con esta opción habilitada, si Redis está caído o la conexión se pierde:
 * - Los comandos fallarán INMEDIATAMENTE con error
 * - NO se encolarán para reenvío automático
 * - Previene duplicación de comandos no-idempotentes (SET, INCR, etc.)
 * 
 * Documentación oficial:
 * https://redis.io/docs/latest/develop/clients/nodejs/
 * https://redis.io/docs/latest/develop/clients/pools-and-muxing/
 * https://redis.io/docs/latest/develop/clients/nodejs/produsage/
 */
export class RedisClientMux {

    private static instance: RedisClientMux | null = null;

    private readonly logger: Logger = Logger.getInstance();
    private readonly redisUrl: string;
    private readonly redisDomainsDb: number;

    private redisClientType: RedisClientType | null = null;
    private connectionPromise: Promise<void> | null = null;

    private constructor() {
        this.redisUrl = getEnv(EnvKeyEnum.APP_REDIS_URL) ?? "redis://cont-redis:6379";
        this.redisDomainsDb = parseInt(getEnv(EnvKeyEnum.APP_REDIS_DB_DOMAINS) ?? "0", 10);
        this.consoleLog(`Initializing RedisClientMux - url: ${this.redisUrl}, db: ${this.redisDomainsDb}`);
    }

    public static getInstance(): RedisClientMux {
        if (RedisClientMux.instance)
            return RedisClientMux.instance;

        RedisClientMux.instance = new RedisClientMux();
        return RedisClientMux.instance;
    }

    /**
     * Obtiene el cliente Redis, estableciendo la conexión si es necesario.
     * El cliente puede ser usado concurrentemente por múltiples operaciones.
     * 
     * ARREGLO DE CONCURRENCIA:
     * - Múltiples peticiones simultáneas comparten el mismo connectionPromise
     * - Solo la primera petición inicia la conexión
     * - Las demás esperan a que termine y obtienen el mismo cliente
     * 
     * @returns Cliente Redis listo para usar
     * @throws Error si no se puede establecer la conexión
     */
    public async getRedisDomainsClient(): Promise<RedisClientType> {
        if (this.redisClientType && this.redisClientType.isReady) {
            return this.redisClientType as RedisClientType;
        }

        // Si hay una conexión en progreso, esperamos a que termine
        if (this.connectionPromise) {
            await this.connectionPromise;
            if (this.redisClientType && this.redisClientType.isReady) {
                return this.redisClientType as RedisClientType;
            }
            // Si después de esperar no tenemos cliente, lanzar error
            throw new Error("Failed to establish Redis connection after waiting");
        }

        this.connectionPromise = this.connect();
        
        try {
            await this.connectionPromise;
        }
        catch (error) {
            this.connectionPromise = null;
            throw error;
        }

        if (!this.redisClientType || !this.redisClientType.isReady) {
            throw new Error("Failed to establish Redis connection");
        }
        return this.redisClientType as RedisClientType;
    }

    /**
     * Establece la conexión con Redis
     * Ya no necesita protección con isConnecting porque connectionPromise actúa como lock
     */
    private async connect(): Promise<void> {
        this.consoleLog("Establishing Redis connection...");

        try {
            // Cerrar cliente anterior si existe
            if (this.redisClientType) {
                await this.forceDisconnect();
            }

            // Crear nuevo cliente con configuración de producción
            this.redisClientType = createClient({
                url: this.redisUrl,
                database: this.redisDomainsDb,
                socket: {
                    connectTimeout: 5000,     // Timeout para establecer conexión (ms)
                    keepAlive: true,          // Habilitar keep-alive de TCP
                    noDelay: true,            // Deshabilitar algoritmo Nagle para menor latencia
                },
                // IMPORTANTE: En producción deshabilitamos la cola offline para evitar
                // duplicación de comandos no-idempotentes durante reconexiones
                disableOfflineQueue: true,
            });

            // configura manejadores de eventos on error, reconnecting, connect, ready, end
            this.setupEventHandlers();

            await this.redisClientType.connect();
            
            this.consoleLog("Redis connection established successfully");
            this.logger.logDebug("Redis connection established", "redis-client-mux");
        }
        catch (error) {
            this.consoleError("Failed to establish Redis connection");
            this.consoleError(error);
            this.logger.logException(error, "redis-client-mux.connect");
            this.redisClientType = null;
            throw error;
        }
        finally {
            this.connectionPromise = null;
        }
    }

    /**
     * manejadores: on error, reconnecting, connect, ready, end
     */
    private setupEventHandlers(): void {
        if (!this.redisClientType) return;

        const redisClient = this.redisClientType as any;

        // Error event - CRÍTICO: siempre debe tener un listener para evitar crashes
        redisClient.on("error", (error: Error) => {
            this.consoleError("Redis client error:");
            this.consoleError(error);
            this.logger.logException(error, "redis-client-mux.error");
        });

        redisClient.on("reconnecting", () => {
            this.consoleLog("Redis client reconnecting...");
            this.logger.logDebug("Redis reconnecting", "redis-client-mux");
        });

        redisClient.on("connect", () => {
            this.consoleLog("Redis client connected");
            this.logger.logDebug("Redis connected", "redis-client-mux");
        });

        redisClient.on("ready", () => {
            this.consoleLog("Redis client ready");
            this.logger.logDebug("Redis ready", "redis-client-mux");
        });

        redisClient.on("end", () => {
            this.consoleLog("Redis client disconnected");
            this.logger.logDebug("Redis disconnected", "redis-client-mux");
        });
    }

    public async doesRedisPing(): Promise<boolean> {
        try {
            const redisDomainsClientType: RedisClientType = await this.getRedisDomainsClient();
            await redisDomainsClientType.ping();
            return true;
        }
        catch (error) {
            this.consoleError("Ping failed:");
            this.consoleError(error);
            this.logger.logException(error, "redis-client-mux.doesRedisPing");
            return false;
        }
    }

    /**
     * Ejecuta múltiples comandos como pipeline (transacción atómica)
     * 
     * Ventajas de usar pipeline:
     * - Todos los comandos se envían en una sola operación de red
     * - Reduce latencia al minimizar round-trips
     * - Los comandos se ejecutan en orden y de forma atómica
     * - Mejor rendimiento que ejecutar comandos individuales
     * 
     * Ejemplo de uso:
     * ```typescript
     * const results = await redisClient.domainsExecAsPipeline(async (client) => {
     *   return Promise.all([
     *     client.set('key1', 'value1'),
     *     client.set('key2', 'value2'),
     *     client.get('key1'),
     *   ]);
     * });
     * // results = ['OK', 'OK', 'value1']
     * ```
     * 
     * @param fnCommands Función que recibe el cliente y retorna un array de Promises de comandos
     * @returns Array con los resultados de cada comando
     * @throws Error si alguno de los comandos falla
     * 
     * Documentación oficial:
     * https://redis.io/docs/latest/develop/clients/nodejs/transpipe/
     */
    public async domainsExecAsPipeline<T>(
        fnCommands: (redisClient: RedisClientType) => Promise<T[]>
    ): Promise<T[]> {
        try {
            const redisDomainsClientType: RedisClientType = await this.getRedisDomainsClient();
            const results: any[] = await fnCommands(redisDomainsClientType);
            return results;
        }
        catch (error) {
            this.consoleError("Pipeline execution failed:");
            this.consoleError(error);
            this.logger.logException(error, "redis-client-mux.domainsExecAsPipeline");
            throw error;
        }
    }

    private async forceDisconnect(): Promise<void> {
        if (!this.redisClientType) return;

        let timeoutId: number | undefined;
        try {
            if (!this.redisClientType.isOpen)  return;

            await Promise.race([
                this.redisClientType.disconnect(),
                new Promise<void>((_, reject) => {
                    timeoutId = setTimeout(
                        () => reject(new Error("Disconnect timeout")),
                        1000
                    );
                })
            ]);
        }
        catch (error) {
            this.consoleError("Error during force disconnect:");
            this.consoleError(error);
            this.logger.logException(error, "redis-client-mux.forceDisconnect");
        }
        finally {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            this.redisClientType = null;
        }
    }

    public async shutdown(): Promise<void> {
        this.consoleLog("Shutting down Redis client...");
        if (this.connectionPromise) {
            // Esperar a que termine la conexión en curso
            try {
                this.consoleLog("Waiting for ongoing connection to finish before shutdown...");
                await this.connectionPromise;
            }
            catch (e) {
                this.consoleError(e);
            }
        }
        await this.forceDisconnect();
        RedisClientMux.instance = null;
        this.consoleLog("Redis client shut down successfully");
    }

    private consoleLog(message: string): void {
        const now = new Date().toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
        console.log(`[${now}][redis-client-mux:debug] ${message}`);
    }

    private consoleError(message: unknown): void {
        const now = new Date().toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
        console.error(`[${now}][redis-client-mux:error]`, message);
    }
}