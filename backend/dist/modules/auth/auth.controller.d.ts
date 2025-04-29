import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: Request): import("../../models/user.entity").User | undefined;
    refreshToken(body: {
        refreshToken: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
