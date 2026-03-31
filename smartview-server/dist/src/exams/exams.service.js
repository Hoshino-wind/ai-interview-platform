"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sandbox_service_1 = require("../sandbox/sandbox.service");
const scoring_service_1 = require("../scoring/scoring.service");
const question_generator_service_1 = require("./question-generator.service");
const client_1 = require("@prisma/client");
let ExamsService = class ExamsService {
    prisma;
    sandboxService;
    questionGeneratorService;
    scoringService;
    constructor(prisma, sandboxService, questionGeneratorService, scoringService) {
        this.prisma = prisma;
        this.sandboxService = sandboxService;
        this.questionGeneratorService = questionGeneratorService;
        this.scoringService = scoringService;
    }
    async create(createExamDto) {
        const { applicationId, questionIds, timeLimit } = createExamDto;
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID "${applicationId}" not found`);
        }
        const questions = await this.prisma.question.findMany({
            where: { id: { in: questionIds } },
        });
        if (questions.length !== questionIds.length) {
            throw new common_1.BadRequestException('Some question IDs are invalid');
        }
        const [exam] = await this.prisma.$transaction([
            this.prisma.exam.create({
                data: {
                    applicationId,
                    questionIds,
                    timeLimit: timeLimit ?? 7200,
                    status: client_1.ExamStatus.NOT_STARTED,
                },
            }),
            this.prisma.application.update({
                where: { id: applicationId },
                data: { status: client_1.ApplicationStatus.EXAM_SENT },
            }),
        ]);
        return exam;
    }
    async generateExam(applicationId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID "${applicationId}" not found`);
        }
        const generatedQuestions = await this.questionGeneratorService.generateQuestions(applicationId);
        const result = await this.prisma.$transaction(async (tx) => {
            const createdQuestions = [];
            for (const gq of generatedQuestions) {
                const question = await tx.question.create({
                    data: {
                        type: this.questionGeneratorService.determineQuestionType(gq.title, gq.description),
                        difficulty: this.questionGeneratorService.mapDifficulty(gq.difficulty),
                        title: gq.title,
                        description: gq.description,
                        starterCode: gq.starterCode ? { code: gq.starterCode } : client_1.Prisma.JsonNull,
                        testCases: gq.testCases ? { cases: gq.testCases } : {},
                        hiddenTestCases: client_1.Prisma.JsonNull,
                        evaluationRubric: { criteria: gq.evaluationCriteria },
                        timeLimit: gq.estimatedTime * 60,
                        tags: gq.relatedSkills,
                        languageSupport: ['javascript', 'typescript', 'python'],
                    },
                });
                createdQuestions.push(question);
            }
            const totalTimeMinutes = generatedQuestions.reduce((sum, q) => sum + q.estimatedTime, 0);
            const exam = await tx.exam.create({
                data: {
                    applicationId,
                    questionIds: createdQuestions.map((q) => q.id),
                    timeLimit: totalTimeMinutes * 60,
                    status: client_1.ExamStatus.NOT_STARTED,
                },
            });
            await tx.application.update({
                where: { id: applicationId },
                data: { status: client_1.ApplicationStatus.EXAM_SENT },
            });
            return { exam, questions: createdQuestions };
        });
        return result;
    }
    async previewGeneratedQuestions(applicationId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID "${applicationId}" not found`);
        }
        return this.questionGeneratorService.generateQuestions(applicationId);
    }
    async findOne(id, user) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                application: {
                    select: {
                        candidateId: true,
                        status: true,
                    },
                },
                submissions: true,
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Exam with ID "${id}" not found`);
        }
        if (user.role === 'CANDIDATE' &&
            exam.application.candidateId !== user.userId) {
            throw new common_1.ForbiddenException('You do not have access to this exam');
        }
        const questions = await this.prisma.question.findMany({
            where: { id: { in: exam.questionIds } },
            select: {
                id: true,
                type: true,
                difficulty: true,
                title: true,
                description: true,
                starterCode: true,
                testCases: true,
                hiddenTestCases: user.role === 'CANDIDATE' ? false : true,
                evaluationRubric: true,
                timeLimit: true,
                tags: true,
                languageSupport: true,
                aiScoringConfig: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const sanitizedQuestions = questions.map((q) => {
            const { hiddenTestCases, ...rest } = q;
            return rest;
        });
        return {
            exam,
            questions: sanitizedQuestions,
            submissions: exam.submissions,
        };
    }
    async startExam(id, user) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                application: {
                    select: {
                        candidateId: true,
                    },
                },
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Exam with ID "${id}" not found`);
        }
        if (user.role === 'CANDIDATE' &&
            exam.application.candidateId !== user.userId) {
            throw new common_1.ForbiddenException('You do not have access to this exam');
        }
        if (exam.status !== client_1.ExamStatus.NOT_STARTED) {
            throw new common_1.BadRequestException(`Exam cannot be started. Current status: ${exam.status}`);
        }
        return this.prisma.exam.update({
            where: { id },
            data: {
                status: client_1.ExamStatus.IN_PROGRESS,
                startedAt: new Date(),
            },
        });
    }
    async saveSubmission(examId, questionId, user, submitCodeDto) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: {
                application: {
                    select: {
                        candidateId: true,
                    },
                },
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Exam with ID "${examId}" not found`);
        }
        if (user.role === 'CANDIDATE' &&
            exam.application.candidateId !== user.userId) {
            throw new common_1.ForbiddenException('You do not have access to this exam');
        }
        if (exam.status !== client_1.ExamStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Exam is not in progress');
        }
        if (!exam.questionIds.includes(questionId)) {
            throw new common_1.BadRequestException('Question is not part of this exam');
        }
        return this.prisma.examSubmission.upsert({
            where: {
                examId_questionId: {
                    examId,
                    questionId,
                },
            },
            create: {
                examId,
                questionId,
                code: submitCodeDto.code,
                language: submitCodeDto.language,
            },
            update: {
                code: submitCodeDto.code,
                language: submitCodeDto.language,
            },
        });
    }
    async runCode(examId, questionId, user, submitCodeDto) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: {
                application: {
                    select: {
                        candidateId: true,
                    },
                },
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Exam with ID "${examId}" not found`);
        }
        if (user.role === 'CANDIDATE' &&
            exam.application.candidateId !== user.userId) {
            throw new common_1.ForbiddenException('You do not have access to this exam');
        }
        if (exam.status !== client_1.ExamStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Exam is not in progress');
        }
        if (!exam.questionIds.includes(questionId)) {
            throw new common_1.BadRequestException('Question is not part of this exam');
        }
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID "${questionId}" not found`);
        }
        const testCases = question.testCases || [];
        const result = await this.sandboxService.runCode({
            code: submitCodeDto.code,
            language: submitCodeDto.language,
            testCases,
        });
        await this.prisma.examSubmission.upsert({
            where: {
                examId_questionId: {
                    examId,
                    questionId,
                },
            },
            create: {
                examId,
                questionId,
                code: submitCodeDto.code,
                language: submitCodeDto.language,
                testResults: result.testResults,
            },
            update: {
                code: submitCodeDto.code,
                language: submitCodeDto.language,
                testResults: result.testResults,
            },
        });
        return result;
    }
    async submitExam(id, user) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                application: {
                    select: {
                        candidateId: true,
                        id: true,
                    },
                },
                submissions: true,
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Exam with ID "${id}" not found`);
        }
        if (user.role === 'CANDIDATE' &&
            exam.application.candidateId !== user.userId) {
            throw new common_1.ForbiddenException('You do not have access to this exam');
        }
        if (exam.status !== client_1.ExamStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException(`Exam cannot be submitted. Current status: ${exam.status}`);
        }
        if (exam.startedAt) {
            const now = new Date();
            const elapsedSeconds = (now.getTime() - exam.startedAt.getTime()) / 1000;
            if (elapsedSeconds > exam.timeLimit) {
                throw new common_1.BadRequestException('Exam time limit has been exceeded');
            }
        }
        const questions = await this.prisma.question.findMany({
            where: { id: { in: exam.questionIds } },
        });
        for (const submission of exam.submissions) {
            const question = questions.find((q) => q.id === submission.questionId);
            if (question && question.hiddenTestCases) {
                const hiddenTestCases = question.hiddenTestCases;
                if (hiddenTestCases && hiddenTestCases.length > 0) {
                    const result = await this.sandboxService.runCode({
                        code: submission.code,
                        language: submission.language,
                        testCases: hiddenTestCases,
                    });
                    await this.prisma.examSubmission.update({
                        where: { id: submission.id },
                        data: {
                            testResults: result.testResults,
                        },
                    });
                }
            }
        }
        const [updatedExam] = await this.prisma.$transaction([
            this.prisma.exam.update({
                where: { id },
                data: {
                    status: client_1.ExamStatus.SUBMITTED,
                    submittedAt: new Date(),
                },
            }),
            this.prisma.application.update({
                where: { id: exam.application.id },
                data: { status: client_1.ApplicationStatus.EXAM_COMPLETED },
            }),
        ]);
        void this.triggerScoringAsync(id);
        return {
            exam: updatedExam,
            message: 'Exam submitted successfully',
        };
    }
    triggerScoringAsync(examId) {
        setTimeout(() => {
            this.scoringService.scoreExam(examId).catch((error) => {
                console.error(`Failed to score exam ${examId}:`, error.message);
            });
        }, 100);
    }
    async getStatus(id, user) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                application: {
                    select: {
                        candidateId: true,
                    },
                },
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Exam with ID "${id}" not found`);
        }
        if (user.role === 'CANDIDATE' &&
            exam.application.candidateId !== user.userId) {
            throw new common_1.ForbiddenException('You do not have access to this exam');
        }
        let timeRemaining = null;
        if (exam.status === client_1.ExamStatus.IN_PROGRESS && exam.startedAt) {
            const now = new Date();
            const elapsedSeconds = (now.getTime() - exam.startedAt.getTime()) / 1000;
            timeRemaining = Math.max(0, exam.timeLimit - elapsedSeconds);
        }
        return {
            status: exam.status,
            startedAt: exam.startedAt,
            submittedAt: exam.submittedAt,
            timeRemaining,
        };
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => scoring_service_1.ScoringService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sandbox_service_1.SandboxService,
        question_generator_service_1.QuestionGeneratorService,
        scoring_service_1.ScoringService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map