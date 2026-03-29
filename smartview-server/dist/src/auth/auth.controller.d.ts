import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<import("./auth.service").AuthResponse>;
    login(loginDto: LoginDto): Promise<import("./auth.service").AuthResponse>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<import("./auth.service").AuthResponse>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        name: string;
        avatar: string | null;
        companyId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
}
