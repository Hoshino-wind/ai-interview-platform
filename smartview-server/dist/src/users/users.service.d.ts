import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
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
    findAll(requesterRole: UserRole): Promise<{
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
    findByIdAdmin(id: string, requesterRole: UserRole): Promise<{
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
