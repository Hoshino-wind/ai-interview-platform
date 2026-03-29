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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuestionsService = class QuestionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createQuestionDto) {
        return this.prisma.question.create({
            data: createQuestionDto,
        });
    }
    async findAll(queryDto) {
        const page = parseInt(queryDto.page || '1', 10);
        const limit = parseInt(queryDto.limit || '10', 10);
        const skip = (page - 1) * limit;
        const where = {};
        if (queryDto.type) {
            where.type = queryDto.type;
        }
        if (queryDto.difficulty) {
            where.difficulty = queryDto.difficulty;
        }
        if (queryDto.tags) {
            const tagsArray = queryDto.tags.split(',').map((tag) => tag.trim());
            where.tags = {
                hasSome: tagsArray,
            };
        }
        if (queryDto.language) {
            where.languageSupport = {
                has: queryDto.language,
            };
        }
        if (queryDto.search) {
            where.title = {
                contains: queryDto.search,
                mode: 'insensitive',
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.question.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.question.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async findOne(id) {
        const question = await this.prisma.question.findUnique({
            where: { id },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID "${id}" not found`);
        }
        return question;
    }
    async update(id, updateQuestionDto) {
        await this.findOne(id);
        return this.prisma.question.update({
            where: { id },
            data: updateQuestionDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.question.delete({
            where: { id },
        });
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map