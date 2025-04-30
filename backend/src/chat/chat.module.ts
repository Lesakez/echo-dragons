// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message } from '../models/message.entity';
import { RedisModule } from '../shared/redis/redis.modules';
import { AuthModule } from '../modules/auth/auth.module';
import { User } from '../models/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    ConfigModule,
    // Import the AuthModule instead of re-creating JwtModule
    AuthModule,
    RedisModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}