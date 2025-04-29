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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../models/user.entity");
const bcrypt = require("bcrypt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    usersRepository;
    jwtService;
    configService;
    constructor(usersRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: [
                { email: registerDto.email },
                { username: registerDto.username }
            ]
        });
        if (existingUser) {
            if (existingUser.email === registerDto.email) {
                throw new common_1.ConflictException('Пользователь с таким email уже существует');
            }
            else {
                throw new common_1.ConflictException('Пользователь с таким именем уже существует');
            }
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);
        const user = this.usersRepository.create({
            username: registerDto.username,
            email: registerDto.email,
            passwordHash,
            isActive: true,
            lastLogin: new Date(),
        });
        await this.usersRepository.save(user);
        const tokens = this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens
        };
    }
    async login(loginDto) {
        const user = await this.usersRepository.findOne({
            where: [
                { email: loginDto.emailOrUsername },
                { username: loginDto.emailOrUsername }
            ]
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        }
        user.lastLogin = new Date();
        await this.usersRepository.save(user);
        const tokens = this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens
        };
    }
    async refreshToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Недействительный токен');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Недействительный токен');
        }
    }
    async validateUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('Пользователь не найден');
        }
        return this.sanitizeUser(user);
    }
    generateTokens(user) {
        const payload = { username: user.username, sub: user.id };
        const access_token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
        });
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
        });
        return {
            access_token,
            refresh_token
        };
    }
    sanitizeUser(user) {
        const { passwordHash, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map