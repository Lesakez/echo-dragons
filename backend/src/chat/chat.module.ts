// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from '../modules/auth/auth.module';
import { RedisModule } from '../shared/redis/redis.modules';

@Module({
  imports: [AuthModule, RedisModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}