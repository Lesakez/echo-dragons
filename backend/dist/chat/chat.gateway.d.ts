import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    server: Server;
    constructor(chatService: ChatService, jwtService: JwtService, configService: ConfigService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, room: string): {
        status: string;
        message: string;
    };
    handleLeaveRoom(client: Socket, room: string): {
        status: string;
        message: string;
    };
    handleRoomMessage(client: Socket, data: {
        room: string;
        text: string;
    }): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
    handlePrivateMessage(client: Socket, data: {
        to: number;
        text: string;
    }): Promise<{
        status: string;
    }>;
}
