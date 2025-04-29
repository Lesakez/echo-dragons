import { RedisClientType } from 'redis';
export declare class RedisService {
    private readonly redisClient;
    constructor(redisClient: RedisClientType);
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    setHash(key: string, field: string, value: string): Promise<void>;
    getHash(key: string, field: string): Promise<string | null | undefined>;
    delHash(key: string, field: string): Promise<void>;
    publish(channel: string, message: string): Promise<void>;
}
