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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    jwtService;
    configService;
    logger = new common_1.Logger(ChatGateway_1.name);
    server;
    constructor(chatService, jwtService, configService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    afterInit(server) {
        this.logger.log('WebSocket server initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                this.logger.error('No token provided, disconnecting client');
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
            client.data.userId = payload.sub;
            client.data.username = payload.username;
            client.join(`user_${payload.sub}`);
            this.logger.log(`Client connected: ${client.id}, user: ${payload.username}`);
            client.emit('connection_established', {
                status: 'success',
                message: 'Successfully connected to chat server',
            });
        }
        catch (error) {
            this.logger.error(`Authentication error: ${error.message}`);
            client.emit('auth_error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
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
    handleJoinRoom(client, room) {
        if (!client.data || !client.data.userId) {
            return { status: 'error', message: 'Authentication required' };
        }
        client.join(room);
        if (!client.data.currentRooms) {
            client.data.currentRooms = [];
        }
        if (!client.data.currentRooms.includes(room)) {
            client.data.currentRooms.push(room);
        }
        this.logger.log(`User ${client.data.username} joined room ${room}`);
        this.server.to(room).emit('roomMessage', {
            room,
            user: 'system',
            text: `${client.data.username} joined the room`,
            timestamp: new Date(),
        });
        return { status: 'ok', message: `Joined room ${room}` };
    }
    handleLeaveRoom(client, room) {
        if (!client.data || !client.data.userId) {
            return { status: 'error', message: 'Authentication required' };
        }
        client.leave(room);
        if (client.data.currentRooms) {
            client.data.currentRooms = client.data.currentRooms.filter(r => r !== room);
        }
        this.logger.log(`User ${client.data.username} left room ${room}`);
        this.server.to(room).emit('roomMessage', {
            room,
            user: 'system',
            text: `${client.data.username} left the room`,
            timestamp: new Date(),
        });
        return { status: 'ok', message: `Left room ${room}` };
    }
    async handleRoomMessage(client, data) {
        if (!client.data || !client.data.userId) {
            return { status: 'error', message: 'Authentication required' };
        }
        const { room, text } = data;
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
        await this.chatService.saveRoomMessage(room, message);
        this.server.to(room).emit('roomMessage', message);
        return { status: 'ok' };
    }
    async handlePrivateMessage(client, data) {
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
        await this.chatService.savePrivateMessage(message);
        this.server.to(`user_${to}`).emit('privateMessage', message);
        if (!client.rooms.has(`user_${to}`)) {
            client.emit('privateMessage', message);
        }
        return { status: 'ok' };
    }
    handleBattleJoin(client, data) {
        if (!client.data || !client.data.userId) {
            return { status: 'error', message: 'Authentication required' };
        }
        const { battleId, characterId } = data;
        const battleRoom = `battle_${battleId}`;
        client.join(battleRoom);
        client.data.currentBattle = battleId;
        client.data.currentCharacter = characterId;
        this.logger.log(`User ${client.data.username} joined battle ${battleId}`);
        this.server.to(battleRoom).emit('battle:playerJoined', {
            battleId,
            userId: client.data.userId,
            username: client.data.username,
            characterId,
        });
        return { status: 'ok', message: `Joined battle ${battleId}` };
    }
    handleBattleLeave(client, data) {
        if (!client.data || !client.data.userId) {
            return { status: 'error', message: 'Authentication required' };
        }
        const { battleId } = data;
        const battleRoom = `battle_${battleId}`;
        client.leave(battleRoom);
        client.data.currentBattle = null;
        client.data.currentCharacter = null;
        this.logger.log(`User ${client.data.username} left battle ${battleId}`);
        this.server.to(battleRoom).emit('battle:playerLeft', {
            battleId,
            userId: client.data.userId,
            username: client.data.username,
        });
        return { status: 'ok', message: `Left battle ${battleId}` };
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('roomMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleRoomMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('privateMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handlePrivateMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('battle:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleBattleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('battle:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleBattleLeave", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        config_1.ConfigService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map