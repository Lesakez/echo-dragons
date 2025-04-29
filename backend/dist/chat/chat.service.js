"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../shared/redis/redis.service");
let ChatService = ChatService_1 = class ChatService {
    redisService;
    logger = new common_1.Logger(ChatService_1.name);
    messageHistoryLimit = 100;
    constructor(redisService) {
        this.redisService = redisService;
    }
    async saveRoomMessage(room, message) {
        try {
            const key = `chat:room:${room}:messages`;
            await this.redisService.setHash(key, Date.now().toString(), JSON.stringify(message));
        }
        catch (error) {
            this.logger.error(`Ошибка при сохранении сообщения комнаты: ${error.message}`);
            throw error;
        }
    }
    async getRoomMessages(room, limit = this.messageHistoryLimit) {
        try {
            const key = `chat:room:${room}:messages`;
            const messages = await this.redisService.getHash(key, '*');
            if (!messages) {
                return [];
            }
            return Object.values(messages)
                .map(msg => JSON.parse(msg))
                .slice(-limit);
        }
        catch (error) {
            this.logger.error(`Ошибка при получении сообщений комнаты: ${error.message}`);
            return [];
        }
    }
    async savePrivateMessage(message) {
        try {
            const { from, to } = message;
            const senderKey = `chat:private:${from}:${to}`;
            const receiverKey = `chat:private:${to}:${from}`;
            const messageString = JSON.stringify(message);
            await this.redisService.setHash(senderKey, Date.now().toString(), messageString);
            await this.redisService.setHash(receiverKey, Date.now().toString(), messageString);
        }
        catch (error) {
            this.logger.error(`Ошибка при сохранении личного сообщения: ${error.message}`);
            throw error;
        }
    }
    async getPrivateMessages(userId1, userId2, limit = this.messageHistoryLimit) {
        try {
            const key = `chat:private:${userId1}:${userId2}`;
            const messages = await this.redisService.getHash(key, '*');
            if (!messages) {
                return [];
            }
            return Object.values(messages)
                .map(msg => JSON.parse(msg))
                .slice(-limit);
        }
        catch (error) {
            this.logger.error(`Ошибка при получении личных сообщений: ${error.message}`);
            return [];
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ChatService);
//# sourceMappingURL=chat.service.js.map