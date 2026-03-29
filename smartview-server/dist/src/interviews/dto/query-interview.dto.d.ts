import { InterviewStatus } from '@prisma/client';
export declare class QueryInterviewDto {
    status?: InterviewStatus;
    page?: number;
    limit?: number;
}
