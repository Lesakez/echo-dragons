// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Проверяем, существует ли пользователь с таким email или username
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Пользователь с таким email уже существует');
      } else {
        throw new ConflictException('Пользователь с таким именем уже существует');
      }
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Создаем нового пользователя
    const user = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash,
      isActive: true,
      lastLogin: new Date(),
    });

    await this.usersRepository.save(user);

    // Генерируем токены
    const tokens = this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  async login(loginDto: LoginDto) {
    // Находим пользователя по email или имени пользователя
    const user = await this.usersRepository.findOne({
      where: [
        { email: loginDto.emailOrUsername },
        { username: loginDto.emailOrUsername }
      ]
    });
    
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Обновляем дату последнего входа
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    // Генерируем токены
    const tokens = this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  async refreshToken(token: string) {
    try {
      // Верифицируем refresh token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Находим пользователя
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Недействительный токен');
      }

      // Генерируем новые токены
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  async validateUser(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return this.sanitizeUser(user);
  }

  private generateTokens(user: User) {
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

  private sanitizeUser(user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}