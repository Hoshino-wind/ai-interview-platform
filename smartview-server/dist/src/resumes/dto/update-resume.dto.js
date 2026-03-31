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
exports.UpdateResumeDto = exports.ParsedDataDto = exports.ProjectItem = exports.EducationItem = exports.ExperienceItem = exports.UploadResumeDto = void 0;
const class_validator_1 = require("class-validator");
class UploadResumeDto {
}
exports.UploadResumeDto = UploadResumeDto;
class ExperienceItem {
    company;
    role;
    years;
    techStack;
    description;
}
exports.ExperienceItem = ExperienceItem;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItem.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItem.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ExperienceItem.prototype, "years", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExperienceItem.prototype, "techStack", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItem.prototype, "description", void 0);
class EducationItem {
    school;
    degree;
    major;
    year;
}
exports.EducationItem = EducationItem;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItem.prototype, "school", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItem.prototype, "degree", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItem.prototype, "major", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EducationItem.prototype, "year", void 0);
class ProjectItem {
    name;
    description;
    techStack;
}
exports.ProjectItem = ProjectItem;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProjectItem.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProjectItem.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProjectItem.prototype, "techStack", void 0);
class ParsedDataDto {
    skills;
    experience;
    education;
    projects;
    yearsOfExperience;
    seniorityLevel;
}
exports.ParsedDataDto = ParsedDataDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ParsedDataDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ParsedDataDto.prototype, "experience", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ParsedDataDto.prototype, "education", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ParsedDataDto.prototype, "projects", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ParsedDataDto.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParsedDataDto.prototype, "seniorityLevel", void 0);
class UpdateResumeDto {
    parsedData;
}
exports.UpdateResumeDto = UpdateResumeDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ParsedDataDto)
], UpdateResumeDto.prototype, "parsedData", void 0);
//# sourceMappingURL=update-resume.dto.js.map