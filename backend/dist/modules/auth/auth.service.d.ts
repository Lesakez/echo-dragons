import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private configService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
            characters: import("../../models/character.entity").Character[];
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
            characters: import("../../models/character.entity").Character[];
        };
    }>;
    refreshToken(token: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    validateUser(userId: number): Promise<{
        id: number;
        username: string;
        email: string;
        isActive: boolean;
        lastLogin: Date;
        createdAt: Date;
        updatedAt: Date;
        characters: import("../../models/character.entity").Character[];
    }>;
    private generateTokens;
    private sanitizeUser;
}
