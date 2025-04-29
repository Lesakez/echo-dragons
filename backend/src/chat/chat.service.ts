// src/chat/chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../shared/redis/redis.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly messageHistoryLimit = 100; // Ограничение истории сообщений

  constructor(private readonly redisService: RedisService) {}

  /**
   * Сохраняет сообщение комнаты в Redis
   */
  async saveRoomMessage(room: string, message: any): Promise<void> {
    try {
      const key = `chat:room:${room}:messages`;
      
      // Сохраняем сообщение в Redis списке
      await this.redisService.setHash(key, Date.now().toString(), JSON.stringify(message));
      
      // Ограничиваем количество сообщений в истории
      // В реальном проекте здесь лучше использовать LTRIM, но для простоты оставим так
    } catch (error) {
      this.logger.error(`Ошибка при сохранении сообщения комнаты: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает историю сообщений комнаты из Redis
   */
  async getRoomMessages(room: string, limit = this.messageHistoryLimit): Promise<any[]> {
    try {
      const key = `chat:room:${room}:messages`;
      
      // Получаем все сообщения комнаты (в реальном проекте лучше использовать LRANGE)
      const messages = await this.redisService.getHash(key, '*');
      
      if (!messages) {
        return [];
      }
      
      return Object.values(messages)
        .map(msg => JSON.parse(msg))
        .slice(-limit); // Ограничиваем количество сообщений
    } catch (error) {
      this.logger.error(`Ошибка при получении сообщений комнаты: ${error.message}`);
      return [];
    }
  }

  /**
   * Сохраняет личное сообщение в Redis
   */
  async savePrivateMessage(message: any): Promise<void> {
    try {
      const { from, to } = message;
      
      // Создаем ключи для обоих участников
      const senderKey = `chat:private:${from}:${to}`;
      const receiverKey = `chat:private:${to}:${from}`;
      
      const messageString = JSON.stringify(message);
      
      // Сохраняем сообщение для отправителя и получателя
      await this.redisService.setHash(senderKey, Date.now().toString(), messageString);
      await this.redisService.setHash(receiverKey, Date.now().toString(), messageString);
    } catch (error) {
      this.logger.error(`Ошибка при сохранении личного сообщения: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает историю личных сообщений из Redis
   */
  async getPrivateMessages(userId1: number, userId2: number, limit = this.messageHistoryLimit): Promise<any[]> {
    try {
      const key = `chat:private:${userId1}:${userId2}`;
      
      // Получаем все личные сообщения
      const messages = await this.redisService.getHash(key, '*');
      
      if (!messages) {
        return [];
      }
      
      return Object.values(messages)
        .map(msg => JSON.parse(msg))
        .slice(-limit); // Ограничиваем количество сообщений
    } catch (error) {
      this.logger.error(`Ошибка при получении личных сообщений: ${error.message}`);
      return [];
    }
  }
}