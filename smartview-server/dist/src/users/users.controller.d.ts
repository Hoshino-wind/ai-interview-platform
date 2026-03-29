import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { type CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<{
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
    findAll(user: CurrentUserData): Promise<{
        id: string;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        name: string;
        avatar: string | null;
        companyId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, user: CurrentUserData): Promise<{
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
}
