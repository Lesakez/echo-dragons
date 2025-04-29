// src/shared/redis/redis.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, { EX: ttl });
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async setHash(key: string, field: string, value: string): Promise<void> {
    await this.redisClient.hSet(key, field, value);
  }

  async getHash(key: string, field: string): Promise<string | null> {
    return this.redisClient.hGet(key, field);
  }

  async delHash(key: string, field: string): Promise<void> {
    await this.redisClient.hDel(key, field);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.redisClient.publish(channel, message);
  }
}