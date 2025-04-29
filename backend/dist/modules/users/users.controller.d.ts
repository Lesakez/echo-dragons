import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../../models/user.entity").User[]>;
    findOne(id: string): Promise<import("../../models/user.entity").User>;
}
