import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<{
        id: string;
        username: string;
        role: "Admin" | "VA";
        created_at: Date;
        updated_at: Date;
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}
