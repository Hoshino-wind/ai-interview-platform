import { InterviewType } from '@prisma/client';
export declare class CreateInterviewDto {
    applicationId: string;
    interviewerIds: string[];
    type?: InterviewType;
    scheduledAt: string;
}
