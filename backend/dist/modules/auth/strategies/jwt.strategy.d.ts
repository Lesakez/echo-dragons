import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../../models/user.entity';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepository;
    private configService;
    constructor(userRepository: Repository<User>, configService: ConfigService);
    validate(payload: any): Promise<User>;
}
export {};
