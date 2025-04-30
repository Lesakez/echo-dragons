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
    origin: '*', // In production, specify exact domain
    credentials: true,
  },
  namespace: '/',
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
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from auth object or Authorization header
      const token = client.handshake.auth.token || 
                   client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.error('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      // Store user info in socket data
      client.data.userId = payload.sub;
      client.data.username = payload.username;

      // Join user's personal room for private messages
      client.join(`user_${payload.sub}`);

      this.logger.log(`Client connected: ${client.id}, user: ${payload.username}`);
      
      // Notify client of successful connection
      client.emit('connection_established', {
        status: 'success',
        message: 'Successfully connected to chat server',
      });
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      // Send error message before disconnecting
      client.emit('auth_error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Handle room leaving if necessary
    if (client.data && client.data.currentRooms) {
      for (const room of client.data.currentRooms) {
        this.server.to(room).emit('roomMessage', {
          room,
          user: 'system',
          text: `${client.data.username || 'A user'} has disconnected`,
          timestamp: new Date(),
        });
      }
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    if (!client.data || !client.data.userId) {
      return { status: 'error', message: 'Authentication required' };
    }
    
    client.join(room);
    
    // Track rooms the user has joined
    if (!client.data.currentRooms) {
      client.data.currentRooms = [];
    }
    if (!client.data.currentRooms.includes(room)) {
      client.data.currentRooms.push(room);
    }
    
    this.logger.log(`User ${client.data.username} joined room ${room}`);
    
    // Notify room about new user
    this.server.to(room).emit('roomMessage', {
      room,
      user: 'system',
      text: `${client.data.username} joined the room`,
      timestamp: new Date(),
    });
    
    return { status: 'ok', message: `Joined room ${room}` };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    if (!client.data || !client.data.userId) {
      return { status: 'error', message: 'Authentication required' };
    }
    
    client.leave(room);
    
    // Update tracked rooms
    if (client.data.currentRooms) {
      client.data.currentRooms = client.data.currentRooms.filter(r => r !== room);
    }
    
    this.logger.log(`User ${client.data.username} left room ${room}`);
    
    // Notify room about user leaving
    this.server.to(room).emit('roomMessage', {
      room,
      user: 'system',
      text: `${client.data.username} left the room`,
      timestamp: new Date(),
    });
    
    return { status: 'ok', message: `Left room ${room}` };
  }

  @SubscribeMessage('roomMessage')
  async handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; text: string },
  ) {
    if (!client.data || !client.data.userId) {
      return { status: 'error', message: 'Authentication required' };
    }
    
    const { room, text } = data;
    
    // Check if user is in the room
    if (!client.rooms.has(room)) {
      return { status: 'error', message: 'You are not in this room' };
    }
    
    const message = {
      room,
      user: client.data.username,
      userId: client.data.userId,
      text,
      timestamp: new Date(),
    };
    
    // Save message to database/cache
    await this.chatService.saveRoomMessage(room, message);
    
    // Broadcast message to room
    this.server.to(room).emit('roomMessage', message);
    
    return { status: 'ok' };
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to: number; text: string },
  ) {
    if (!client.data || !client.data.userId) {
      return { status: 'error', message: 'Authentication required' };
    }
    
    const { to, text } = data;
    
    const message = {
      from: client.data.userId,
      fromUsername: client.data.username,
      to,
      text,
      timestamp: new Date(),
    };
    
    // Save private message
    await this.chatService.savePrivateMessage(message);
    
    // Send to recipient
    this.server.to(`user_${to}`).emit('privateMessage', message);
    
    // Send a copy to sender if needed
    if (!client.rooms.has(`user_${to}`)) {
      client.emit('privateMessage', message);
    }
    
    return { status: 'ok' };
  }

  // Handle battle-related events
  @SubscribeMessage('battle:join')
  handleBattleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { battleId: number; characterId: number },
  ) {
    if (!client.data || !client.data.userId) {
      return { status: 'error', message: 'Authentication required' };
    }
    
    const { battleId, characterId } = data;
    const battleRoom = `battle_${battleId}`;
    
    client.join(battleRoom);
    client.data.currentBattle = battleId;
    client.data.currentCharacter = characterId;
    
    this.logger.log(`User ${client.data.username} joined battle ${battleId}`);
    
    // Notify battle room
    this.server.to(battleRoom).emit('battle:playerJoined', {
      battleId,
      userId: client.data.userId,
      username: client.data.username,
      characterId,
    });
    
    return { status: 'ok', message: `Joined battle ${battleId}` };
  }

  @SubscribeMessage('battle:leave')
  handleBattleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { battleId: number; characterId: number },
  ) {
    if (!client.data || !client.data.userId) {
      return { status: 'error', message: 'Authentication required' };
    }
    
    const { battleId } = data;
    const battleRoom = `battle_${battleId}`;
    
    client.leave(battleRoom);
    client.data.currentBattle = null;
    client.data.currentCharacter = null;
    
    this.logger.log(`User ${client.data.username} left battle ${battleId}`);
    
    // Notify battle room
    this.server.to(battleRoom).emit('battle:playerLeft', {
      battleId,
      userId: client.data.userId,
      username: client.data.username,
    });
    
    return { status: 'ok', message: `Left battle ${battleId}` };
  }
}