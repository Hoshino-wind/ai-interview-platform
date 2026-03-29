import { ApplicationStatus } from '@prisma/client';
export declare class QueryApplicationDto {
    status?: ApplicationStatus;
    page?: number;
    limit?: number;
}
