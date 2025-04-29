import { RedisService } from '../shared/redis/redis.service';
export declare class ChatService {
    private readonly redisService;
    private readonly logger;
    private readonly messageHistoryLimit;
    constructor(redisService: RedisService);
    saveRoomMessage(room: string, message: any): Promise<void>;
    getRoomMessages(room: string, limit?: number): Promise<any[]>;
    savePrivateMessage(message: any): Promise<void>;
    getPrivateMessages(userId1: number, userId2: number, limit?: number): Promise<any[]>;
}
