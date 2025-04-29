// src/chat/chat.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    ConnectedSocket,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  import { ChatService } from './chat.service';
  import { Logger } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // В продакшене следует указать точный домен
    },
  })
  export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ChatGateway.name);
  
    @WebSocketServer() server: Server;
  
    constructor(
      private readonly chatService: ChatService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    afterInit(server: Server) {
      this.logger.log('Инициализация WebSocket сервера');
    }
  
    async handleConnection(client: Socket) {
      try {
        const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
          client.disconnect();
          return;
        }
  
        // Верифицируем токен
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
        });
  
        // Сохраняем информацию о пользователе в данных сокета
        client.data.userId = payload.sub;
        client.data.username = payload.username;
  
        // Добавляем пользователя в комнату с его ID для личных сообщений
        client.join(`user_${payload.sub}`);
  
        this.logger.log(`Клиент подключен: ${client.id}, пользователь: ${payload.username}`);
      } catch (error) {
        this.logger.error(`Ошибка аутентификации: ${error.message}`);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Клиент отключен: ${client.id}`);
    }
  
    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
      client.join(room);
      this.logger.log(`Пользователь ${client.data.username} присоединился к комнате ${room}`);
      
      // Отправляем сообщение в комнату о новом участнике
      this.server.to(room).emit('roomMessage', {
        room,
        user: 'system',
        text: `${client.data.username} присоединился к комнате`,
        timestamp: new Date(),
      });
      
      return { status: 'ok', message: `Присоединен к комнате ${room}` };
    }
  
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
      client.leave(room);
      this.logger.log(`Пользователь ${client.data.username} покинул комнату ${room}`);
      
      // Отправляем сообщение в комнату об ушедшем участнике
      this.server.to(room).emit('roomMessage', {
        room,
        user: 'system',
        text: `${client.data.username} покинул комнату`,
        timestamp: new Date(),
      });
      
      return { status: 'ok', message: `Вы покинули комнату ${room}` };
    }
  
    @SubscribeMessage('roomMessage')
    async handleRoomMessage(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { room: string; text: string },
    ) {
      const { room, text } = data;
      
      // Проверяем, находится ли пользователь в комнате
      if (!client.rooms.has(room)) {
        return { status: 'error', message: 'Вы не находитесь в этой комнате' };
      }
      
      const message = {
        room,
        user: client.data.username,
        userId: client.data.userId,
        text,
        timestamp: new Date(),
      };
      
      // Сохраняем сообщение в истории
      await this.chatService.saveRoomMessage(room, message);
      
      // Отправляем сообщение всем в комнате
      this.server.to(room).emit('roomMessage', message);
      
      return { status: 'ok' };
    }
  
    @SubscribeMessage('privateMessage')
    async handlePrivateMessage(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { to: number; text: string },
    ) {
      const { to, text } = data;
      
      const message = {
        from: client.data.userId,
        fromUsername: client.data.username,
        to,
        text,
        timestamp: new Date(),
      };
      
      // Сохраняем личное сообщение
      await this.chatService.savePrivateMessage(message);
      
      // Отправляем сообщение получателю
      this.server.to(`user_${to}`).emit('privateMessage', message);
      
      // Отправляем копию отправителю (если это не то же самое соединение)
      if (!client.rooms.has(`user_${to}`)) {
        client.emit('privateMessage', message);
      }
      
      return { status: 'ok' };
    }
  }