// backend/src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}

// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Проверяем, существует ли пользователь с таким email
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
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Создаем нового пользователя
    const user = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash: hashedPassword,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.usersRepository.save(user);

    // Генерируем JWT токены
    const { access_token, refresh_token } = await this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      access_token,
      refresh_token
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

    // Генерируем JWT токены
    const { access_token, refresh_token } = await this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      access_token,
      refresh_token
    };
  }

  async refreshToken(token: string) {
    try {
      // Верифицируем refresh token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Находим пользователя
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Недействительный токен');
      }

      // Генерируем новые токены
      const { access_token, refresh_token } = await this.generateTokens(user);
      
      return {
        access_token,
        refresh_token
      };
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

  private async generateTokens(user: User) {
    const payload = { username: user.username, sub: user.id };
    
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
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

// backend/src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Имя пользователя должно содержать не менее 3 символов' })
  @MaxLength(20, { message: 'Имя пользователя должно содержать не более 20 символов' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Имя пользователя может содержать только буквы, цифры, символы _ и -' })
  username: string;

  @IsEmail({}, { message: 'Пожалуйста, введите корректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру',
  })
  password: string;
}

// backend/src/modules/auth/dto/login.dto.ts
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  emailOrUsername: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
  password: string;
}

// backend/src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Проверяем, отмечен ли маршрут как общедоступный
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Пожалуйста, войдите в систему');
    }
    return user;
  }
}

// backend/src/modules/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      // payload.sub содержит ID пользователя
      const user = await this.authService.validateUser(payload.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}

// backend/src/modules/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// backend/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../../models/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}