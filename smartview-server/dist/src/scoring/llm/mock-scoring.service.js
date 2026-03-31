"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockScoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockScoringService = void 0;
const common_1 = require("@nestjs/common");
let MockScoringService = MockScoringService_1 = class MockScoringService {
    logger = new common_1.Logger(MockScoringService_1.name);
    calculateCorrectness(testResults) {
        if (!testResults || testResults.length === 0) {
            return { score: 0, maxScore: 10 };
        }
        const passedTests = testResults.filter((t) => t.passed).length;
        const passRate = passedTests / testResults.length;
        return { score: Math.round(passRate * 10 * 10) / 10, maxScore: 10 };
    }
    evaluateCodeQuality(code) {
        const lines = code.split('\n').length;
        const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|\w+\s*:\s*function/g) ||
            []).length;
        const comments = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
        let score = 3 + Math.min(2, functions * 0.3 + comments * 0.1);
        score = Math.min(5, Math.max(3, score));
        const highlights = [];
        const issues = [];
        if (functions > 0) {
            highlights.push(`代码包含 ${functions} 个函数/方法，结构清晰`);
        }
        if (comments > 0) {
            highlights.push(`包含 ${comments} 处注释，有助于理解代码逻辑`);
        }
        if (lines > 50) {
            issues.push('代码较长，建议进一步模块化以提高可读性');
        }
        if (comments === 0) {
            issues.push('缺少注释，建议添加关键逻辑说明');
        }
        return {
            score: Math.round(score * 10) / 10,
            highlights,
            issues,
            analysis: `代码共 ${lines} 行，结构${functions > 0 ? '良好' : '简单'}，${comments > 0 ? '有注释说明' : '缺少注释'}。`,
        };
    }
    evaluateEdgeCaseHandling(code, testResults) {
        const { score: correctnessScore } = this.calculateCorrectness(testResults);
        const score = Math.min(5, correctnessScore * 0.5 * 0.8);
        const hasTryCatch = code.includes('try') && code.includes('catch');
        const hasValidation = code.includes('if') &&
            (code.includes('null') ||
                code.includes('undefined') ||
                code.includes('length'));
        const highlights = [];
        const issues = [];
        if (hasTryCatch) {
            highlights.push('使用了 try-catch 进行异常处理');
        }
        if (hasValidation) {
            highlights.push('包含输入验证逻辑');
        }
        if (!hasTryCatch) {
            issues.push('建议添加异常处理机制以提高代码健壮性');
        }
        if (!hasValidation) {
            issues.push('建议添加参数校验，防止无效输入');
        }
        return {
            score: Math.round(score * 10) / 10,
            highlights,
            issues,
            analysis: `边界处理能力${score > 3 ? '良好' : score > 2 ? '一般' : '需要改进'}，${hasTryCatch ? '有异常处理' : '缺少异常处理'}，${hasValidation ? '有输入验证' : '缺少输入验证'}。`,
        };
    }
    evaluateComplexity(code) {
        const loops = (code.match(/for\s*\(|while\s*\(|forEach|map\s*\(|filter\s*\(/g) || []).length;
        const recursion = code.includes(code.match(/function\s+(\w+)/)?.[1] || '');
        let score = 3 + Math.random() * 1.5;
        if (loops > 2)
            score += 0.3;
        if (recursion)
            score += 0.2;
        score = Math.min(5, score);
        let timeComplexity = 'O(1)';
        let spaceComplexity = 'O(1)';
        if (loops === 1) {
            timeComplexity = 'O(n)';
        }
        else if (loops === 2) {
            timeComplexity = 'O(n²)';
        }
        else if (loops > 2) {
            timeComplexity = 'O(n^k)';
        }
        if (code.includes('Array') || code.includes('[]')) {
            spaceComplexity = 'O(n)';
        }
        return {
            score: Math.round(score * 10) / 10,
            timeComplexity,
            spaceComplexity,
            analysis: `代码包含 ${loops} 个循环结构，时间复杂度为 ${timeComplexity}，空间复杂度为 ${spaceComplexity}。`,
        };
    }
    evaluateEngineering(code) {
        const lines = code.split('\n').length;
        const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|\w+\s*:\s*function/g) ||
            []).length;
        const hasTests = code.includes('test') ||
            code.includes('describe') ||
            code.includes('it(');
        const hasModules = code.includes('import') ||
            code.includes('export') ||
            code.includes('require');
        const hasTypes = code.includes(': ') &&
            (code.includes('string') ||
                code.includes('number') ||
                code.includes('boolean'));
        let score = 12 + Math.random() * 6;
        if (functions > 3)
            score += 1;
        if (hasTests)
            score += 2;
        if (hasModules)
            score += 1;
        if (hasTypes)
            score += 1;
        score = Math.min(20, score);
        const projectStructure = Math.min(5, 3 + (hasModules ? 1 : 0) + (functions > 3 ? 1 : 0));
        const modularity = Math.min(5, 3 + (functions > 0 ? 1 : 0) + (functions > 3 ? 1 : 0));
        const maintainability = Math.min(5, 3 + (hasTypes ? 1 : 0) + (lines < 50 ? 1 : 0));
        const testing = hasTests ? 4 + Math.random() : Math.random() * 2;
        return {
            score: Math.round(score * 10) / 10,
            projectStructure: Math.round(projectStructure * 10) / 10,
            modularity: Math.round(modularity * 10) / 10,
            maintainability: Math.round(maintainability * 10) / 10,
            testing: Math.round(testing * 10) / 10,
            analysis: `工程化水平${score > 15 ? '良好' : score > 10 ? '一般' : '需要改进'}，${hasModules ? '模块化设计良好' : '建议改进模块化'}，${hasTests ? '包含测试代码' : '建议添加测试'}。`,
        };
    }
    evaluateProblemSolving(code, testResults) {
        const { score: correctnessScore } = this.calculateCorrectness(testResults);
        const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || [])
            .length;
        let score = correctnessScore * 1.5 * 0.85;
        if (functions > 1)
            score += 1;
        score = Math.min(15, score);
        const problemDecomposition = Math.min(5, 3 + (functions > 1 ? 1 : 0) + (functions > 3 ? 1 : 0));
        const debugging = correctnessScore > 7 ? 4 + Math.random() : 2 + Math.random() * 2;
        const multiApproach = functions > 2 ? 3 + Math.random() * 2 : 2 + Math.random();
        return {
            score: Math.round(score * 10) / 10,
            problemDecomposition: Math.round(problemDecomposition * 10) / 10,
            debugging: Math.round(debugging * 10) / 10,
            multiApproach: Math.round(multiApproach * 10) / 10,
            analysis: `问题解决能力${score > 10 ? '优秀' : score > 7 ? '良好' : '需要提升'}，${functions > 1 ? '能够将问题分解为多个函数' : '建议进一步分解问题'}。`,
        };
    }
    generateReport(code, scores) {
        const lines = code.split('\n');
        const annotations = [];
        const suggestedQuestions = [];
        lines.forEach((line, index) => {
            if (line.includes('function') || line.match(/const\s+\w+\s*=\s*\(/)) {
                annotations.push({
                    line: index + 1,
                    type: 'highlight',
                    comment: '函数定义清晰',
                });
            }
            if (line.includes('// TODO') || line.includes('// FIXME')) {
                annotations.push({
                    line: index + 1,
                    type: 'issue',
                    comment: '有待办事项需要处理',
                });
            }
        });
        const limitedAnnotations = annotations.slice(0, 5);
        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) /
            Object.values(scores).length;
        if (scores.engineering < 12) {
            suggestedQuestions.push('请谈谈你对代码模块化设计的理解，以及如何改进这段代码的结构？');
        }
        if (scores.edgeCaseHandling < 3) {
            suggestedQuestions.push('你在处理边界情况时是如何考虑的？能否举例说明？');
        }
        if (scores.complexity < 3) {
            suggestedQuestions.push('请分析一下这段代码的时间复杂度和空间复杂度，是否有优化空间？');
        }
        if (scores.problemSolving < 10) {
            suggestedQuestions.push('在解决这个问题时，你是否考虑过其他方案？为什么选择当前方案？');
        }
        if (avgScore > 12) {
            suggestedQuestions.push('你的代码整体质量不错，请分享一下你的编码习惯和最佳实践？');
        }
        const defaultQuestions = [
            '请介绍一下这段代码的核心逻辑和实现思路。',
            '如果需求变更，你会如何修改这段代码以适应新的要求？',
            '在编写这段代码时，你遇到的最大挑战是什么？如何解决的？',
        ];
        while (suggestedQuestions.length < 3) {
            suggestedQuestions.push(defaultQuestions[suggestedQuestions.length]);
        }
        return {
            suggestedQuestions: suggestedQuestions.slice(0, 5),
            codeAnnotations: limitedAnnotations,
        };
    }
    evaluateCodeQualityNew(code) {
        const lines = code.split('\n').length;
        const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|\w+\s*:\s*function/g) ||
            []).length;
        const comments = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
        const hasTypes = code.includes(': ') &&
            (code.includes('string') ||
                code.includes('number') ||
                code.includes('boolean') ||
                code.includes('interface') ||
                code.includes('type '));
        let readability = 3;
        if (comments > 0)
            readability += 0.5;
        if (lines < 50)
            readability += 0.5;
        if (functions > 0 && functions <= 5)
            readability += 0.5;
        if (hasTypes)
            readability += 0.5;
        readability = Math.min(5, readability);
        let naming = 3;
        const camelCase = (code.match(/const\s+[a-z][a-zA-Z0-9]*\s*=|let\s+[a-z][a-zA-Z0-9]*\s*=|var\s+[a-z][a-zA-Z0-9]*\s*=/g) || []).length;
        const pascalCase = (code.match(/class\s+[A-Z][a-zA-Z0-9]*/g) || []).length;
        if (camelCase > 0)
            naming += 1;
        if (pascalCase > 0)
            naming += 1;
        naming = Math.min(5, naming);
        let structure = 3;
        if (functions > 1)
            structure += 0.5;
        if (functions > 3)
            structure += 0.5;
        if (code.includes('import') || code.includes('export'))
            structure += 0.5;
        if (lines < 100)
            structure += 0.5;
        structure = Math.min(5, structure);
        const totalScore = readability + naming + structure;
        const highlights = [];
        const issues = [];
        if (functions > 0) {
            highlights.push(`代码包含 ${functions} 个函数/方法，结构清晰`);
        }
        if (comments > 0) {
            highlights.push(`包含 ${comments} 处注释，有助于理解代码逻辑`);
        }
        if (hasTypes) {
            highlights.push('使用了类型定义，增强了代码可维护性');
        }
        if (lines > 80) {
            issues.push('代码较长，建议进一步模块化以提高可读性');
        }
        if (comments === 0) {
            issues.push('缺少注释，建议添加关键逻辑说明');
        }
        if (functions === 0) {
            issues.push('代码缺乏函数封装，建议将逻辑模块化');
        }
        return {
            score: Math.round(totalScore * 10) / 10,
            maxScore: 15,
            readability: Math.round(readability * 10) / 10,
            naming: Math.round(naming * 10) / 10,
            structure: Math.round(structure * 10) / 10,
            highlights,
            issues,
            analysis: `代码共 ${lines} 行，可读性${readability > 3.5 ? '良好' : '一般'}，命名规范${naming > 3.5 ? '良好' : '需改进'}，结构${structure > 3.5 ? '良好' : '简单'}。`,
        };
    }
    evaluateProblemSolvingNew(code, eventAnalysis) {
        const { runCodeCount, codeChangeCount, thinkingPauses, debugTimeRatio, totalDuration } = eventAnalysis;
        let thinkingClarity = 4;
        if (thinkingPauses > 2)
            thinkingClarity += 1;
        if (totalDuration > 300)
            thinkingClarity += 0.5;
        if (codeChangeCount > 5 && codeChangeCount < 50)
            thinkingClarity += 1;
        thinkingClarity = Math.min(7, thinkingClarity);
        let debugStrategy = 3;
        if (runCodeCount > 2 && runCodeCount < 15)
            debugStrategy += 2;
        if (debugTimeRatio > 10 && debugTimeRatio < 40)
            debugStrategy += 1;
        if (runCodeCount > 0 && codeChangeCount / runCodeCount > 1)
            debugStrategy += 1;
        debugStrategy = Math.min(7, debugStrategy);
        let iterativeImprovement = 3;
        if (codeChangeCount > 10)
            iterativeImprovement += 1;
        if (runCodeCount > 3)
            iterativeImprovement += 1;
        if (thinkingPauses > 1)
            iterativeImprovement += 1;
        iterativeImprovement = Math.min(6, iterativeImprovement);
        const totalScore = thinkingClarity + debugStrategy + iterativeImprovement;
        return {
            score: Math.round(totalScore * 10) / 10,
            maxScore: 20,
            thinkingClarity: Math.round(thinkingClarity * 10) / 10,
            debugStrategy: Math.round(debugStrategy * 10) / 10,
            iterativeImprovement: Math.round(iterativeImprovement * 10) / 10,
            analysis: `问题解决能力${totalScore > 14 ? '优秀' : totalScore > 10 ? '良好' : '需要提升'}，思路条理性${thinkingClarity > 4 ? '良好' : '一般'}，调试策略${debugStrategy > 4 ? '有效' : '需改进'}，迭代改进${iterativeImprovement > 3 ? '明显' : '不明显'}。`,
        };
    }
    evaluateEngineeringNew(code) {
        const hasTryCatch = code.includes('try') && code.includes('catch');
        const hasValidation = code.includes('if') &&
            (code.includes('null') ||
                code.includes('undefined') ||
                code.includes('length') ||
                code.includes('typeof'));
        const hasErrorHandling = hasTryCatch || hasValidation;
        let errorHandling = 2;
        if (hasTryCatch)
            errorHandling += 2;
        if (hasValidation)
            errorHandling += 1;
        errorHandling = Math.min(5, errorHandling);
        let performance = 3;
        const hasOptimization = code.includes('memo') ||
            code.includes('useMemo') ||
            code.includes('useCallback') ||
            code.includes('cache') ||
            code.includes('optimize');
        const hasEfficientLoop = !code.includes('for.*for') && !code.includes('while.*while');
        if (hasOptimization)
            performance += 1;
        if (hasEfficientLoop)
            performance += 1;
        performance = Math.min(5, performance);
        let modularity = 2;
        const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
        const hasModules = code.includes('import') || code.includes('export') || code.includes('require');
        if (functions > 1)
            modularity += 1;
        if (functions > 3)
            modularity += 1;
        if (hasModules)
            modularity += 1;
        modularity = Math.min(5, modularity);
        const totalScore = errorHandling + performance + modularity;
        return {
            score: Math.round(totalScore * 10) / 10,
            maxScore: 15,
            errorHandling: Math.round(errorHandling * 10) / 10,
            performance: Math.round(performance * 10) / 10,
            modularity: Math.round(modularity * 10) / 10,
            analysis: `工程化思维${totalScore > 10 ? '良好' : totalScore > 7 ? '一般' : '需要改进'}，${hasErrorHandling ? '有错误处理' : '缺少错误处理'}，${performance > 3 ? '考虑了性能' : '性能优化空间较大'}，${modularity > 3 ? '模块化良好' : '建议改进模块化'}。`,
        };
    }
    evaluateTechMatch(code, jobRequirements) {
        const lowerCode = code.toLowerCase();
        const lowerReqs = jobRequirements.requirements.toLowerCase();
        const tags = jobRequirements.tags.map((t) => t.toLowerCase());
        const techKeywords = [
            'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'c#',
            'react', 'vue', 'angular', 'nodejs', 'express', 'nextjs', 'nestjs',
            'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp',
            'git', 'cicd', 'jenkins', 'gitlab',
            'graphql', 'rest', 'grpc', 'websocket',
            'tailwind', 'css', 'html', 'sass',
            'redux', 'mobx', 'zustand',
            'jest', 'cypress', 'playwright',
            'webpack', 'vite', 'babel',
        ];
        const matchedSkills = [];
        const missingSkills = [];
        techKeywords.forEach((tech) => {
            if (lowerCode.includes(tech)) {
                matchedSkills.push(tech);
            }
            else if (lowerReqs.includes(tech) || tags.some((t) => t.includes(tech))) {
                missingSkills.push(tech);
            }
        });
        const totalRelevant = matchedSkills.length + missingSkills.length;
        let score = 5;
        if (totalRelevant > 0) {
            score = 5 + (matchedSkills.length / totalRelevant) * 5;
        }
        score = Math.min(10, Math.max(0, score));
        return {
            score: Math.round(score * 10) / 10,
            maxScore: 10,
            matchedSkills: matchedSkills.slice(0, 10),
            missingSkills: missingSkills.slice(0, 5),
            analysis: `技术匹配度${score > 7 ? '良好' : score > 5 ? '一般' : '需要提升'}，匹配技术栈 ${matchedSkills.length} 项${matchedSkills.length > 0 ? '：' + matchedSkills.slice(0, 5).join('、') : ''}。`,
        };
    }
    generateReportNew(code, scores) {
        const lines = code.split('\n');
        const annotations = [];
        const suggestedQuestions = [];
        lines.forEach((line, index) => {
            if (line.includes('function') || line.match(/const\s+\w+\s*=\s*\(/)) {
                annotations.push({
                    line: index + 1,
                    type: 'highlight',
                    comment: '函数定义清晰',
                });
            }
            if (line.includes('// TODO') || line.includes('// FIXME')) {
                annotations.push({
                    line: index + 1,
                    type: 'issue',
                    comment: '有待办事项需要处理',
                });
            }
            if (line.includes('try') && line.includes('catch')) {
                annotations.push({
                    line: index + 1,
                    type: 'highlight',
                    comment: '良好的异常处理',
                });
            }
        });
        const limitedAnnotations = annotations.slice(0, 5);
        if (scores.deliveryQuality < 15) {
            suggestedQuestions.push('测试用例有部分未通过，请分析一下可能的原因以及你的调试思路？');
        }
        if (scores.codeQuality < 10) {
            suggestedQuestions.push('代码质量方面还有提升空间，请谈谈你对代码可读性和命名规范的理解？');
        }
        if (scores.problemSolving < 12) {
            suggestedQuestions.push('在解决这个问题的过程中，你是如何规划解题步骤的？有没有遇到卡住的地方？');
        }
        if (scores.toolUsage > 10) {
            suggestedQuestions.push('你在编码过程中使用了外部资源，能分享一下你是如何高效利用这些资源的吗？');
        }
        if (scores.engineering < 10) {
            suggestedQuestions.push('工程化思维方面，你如何看待错误处理和代码模块化？');
        }
        if (scores.techMatch < 6) {
            suggestedQuestions.push('岗位要求中有一些技术栈，你是否有相关经验或学习计划？');
        }
        const defaultQuestions = [
            '请介绍一下这段代码的核心逻辑和实现思路。',
            '如果需求变更，你会如何修改这段代码以适应新的要求？',
            '在编写这段代码时，你遇到的最大挑战是什么？如何解决的？',
        ];
        while (suggestedQuestions.length < 3) {
            suggestedQuestions.push(defaultQuestions[suggestedQuestions.length]);
        }
        return {
            suggestedQuestions: suggestedQuestions.slice(0, 5),
            codeAnnotations: limitedAnnotations,
        };
    }
};
exports.MockScoringService = MockScoringService;
exports.MockScoringService = MockScoringService = MockScoringService_1 = __decorate([
    (0, common_1.Injectable)()
], MockScoringService);
//# sourceMappingURL=mock-scoring.service.js.map