// src/modules/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../models/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      // payload.sub contains the user ID
      const userId = payload.sub;
      
      // Fetch the user directly from the database
      const user = await this.userRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'username', 'email', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'] 
      });
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }
      
      // Return sanitized user object (without password hash)
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }
}