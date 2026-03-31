"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  applicationsApi,
  examsApi,
  ApplicationWithExam,
  AIGeneratedQuestion,
} from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { id: 1, label: "选择候选人" },
  { id: 2, label: "确认信息" },
  { id: 3, label: "预览题目" },
  { id: 4, label: "创建考试" },
];

const difficultyConfig = {
  EASY: {
    label: "简单",
    className: "text-syntax-string bg-syntax-string/10 border border-syntax-string/20",
  },
  MEDIUM: {
    label: "中等",
    className: "text-syntax-number bg-syntax-number/10 border border-syntax-number/20",
  },
  HARD: {
    label: "困难",
    className: "text-destructive bg-destructive/10 border border-destructive/20",
  },
};

export default function GenerateExamPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [applications, setApplications] = useState<ApplicationWithExam[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithExam | null>(
    null
  );
  const [generatedQuestions, setGeneratedQuestions] = useState<
    AIGeneratedQuestion[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Fetch applications without exams
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await applicationsApi.getAll({
          limit: 100,
          status: "PENDING",
        });
        // Filter out applications that already have exams
        const appsWithoutExams = response.data.data.items.filter(
          (app) => !app.exam
        );
        setApplications(appsWithoutExams);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleSelectApplication = (app: ApplicationWithExam) => {
    setSelectedApp(app);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedApp) return;
    setGenerating(true);
    try {
      const response = await examsApi.generatePreview(selectedApp.id);
      setGeneratedQuestions(response.data.data.questions);
      handleNext();
    } catch (error) {
      console.error("Failed to generate preview:", error);
      alert("生成题目预览失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedApp) return;
    setGenerating(true);
    try {
      const response = await examsApi.generatePreview(selectedApp.id);
      setGeneratedQuestions(response.data.data.questions);
    } catch (error) {
      console.error("Failed to regenerate:", error);
      alert("重新生成题目失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateExam = async () => {
    if (!selectedApp) return;
    setCreating(true);
    try {
      await examsApi.generateExam(selectedApp.id);
      router.push("/admin/questions");
    } catch (error) {
      console.error("Failed to create exam:", error);
      alert("创建考试失败，请重试");
      setCreating(false);
    }
  };

  const toggleQuestionExpand = (id: string) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium font-mono transition-colors ${
                  isActive || isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-sm font-mono ${
                  isActive
                    ? "text-foreground font-medium"
                    : isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-px mx-4 ${
                  step.id < currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Step 1: Select Candidate
  const renderStep1 = () => (
    <div>
      <h2 className="text-lg font-semibold font-mono text-foreground mb-6">选择候选人</h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">加载中...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">暂无待生成考试的候选人</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border">
          {applications.map((app, index) => (
            <div
              key={app.id}
              onClick={() => handleSelectApplication(app)}
              className={`flex items-center px-4 py-4 cursor-pointer transition-colors ${
                selectedApp?.id === app.id
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-secondary/50 border-l-2 border-l-transparent"
              } ${index !== applications.length - 1 ? "border-b border-border" : ""}`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-muted-foreground font-medium">
                  {app.candidate?.name?.[0] || "?"}
                </span>
              </div>

              {/* Info */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-foreground">
                    {app.candidate?.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {app.candidate?.email}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {app.job?.title}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {app.resume?.parsedData?.skills && (
                <div className="flex flex-wrap gap-1 justify-end max-w-[240px]">
                  {app.resume.parsedData.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="bg-secondary/50 text-muted-foreground text-xs px-2 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {app.resume.parsedData.skills.length > 4 && (
                    <span className="text-muted-foreground/60 text-xs px-1">
                      +{app.resume.parsedData.skills.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 2: Confirm Info
  const renderStep2 = () => {
    if (!selectedApp) return null;
    const parsedData = selectedApp.resume?.parsedData;

    return (
      <div>
        <h2 className="text-lg font-semibold font-mono text-foreground mb-6">确认候选人信息</h2>

        <div className="bg-card rounded-lg border border-border p-6">
          {/* Candidate Basic Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
              <span className="text-muted-foreground font-medium text-lg">
                {selectedApp.candidate?.name?.[0] || "?"}
              </span>
            </div>
            <div>
              <h3 className="text-foreground font-medium text-lg">
                {selectedApp.candidate?.name}
              </h3>
              <p className="text-muted-foreground text-sm">{selectedApp.candidate?.email}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{selectedApp.job?.title}</p>
            </div>
          </div>

          {/* Skills */}
          {parsedData?.skills && parsedData.skills.length > 0 && (
            <div className="pt-6">
              <h4 className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider mb-3">
                技术栈
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-secondary/50 text-muted-foreground text-xs px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {parsedData?.experience && parsedData.experience.length > 0 && (
            <div className="pt-6">
              <h4 className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider mb-3">
                工作经验 ({parsedData.yearsOfExperience} 年)
              </h4>
              <div className="space-y-3">
                {parsedData.experience.slice(0, 2).map((exp, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{exp.role}</span>
                      <span className="text-muted-foreground/60">·</span>
                      <span className="text-muted-foreground">{exp.company}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {parsedData?.projects && parsedData.projects.length > 0 && (
            <div className="pt-6">
              <h4 className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider mb-3">
                项目经验
              </h4>
              <div className="space-y-3">
                {parsedData.projects.slice(0, 2).map((proj, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="text-foreground font-medium">{proj.name}</div>
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {proj.description}
                    </p>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.techStack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="bg-secondary/50 text-muted-foreground text-xs px-2 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!parsedData && (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">该候选人尚未上传简历或简历解析失败</p>
              <p className="text-muted-foreground/60 text-xs mt-1">AI 将基于岗位通用要求生成题目</p>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleGeneratePreview}
            disabled={generating}
            className="inline-flex items-center bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium font-mono hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI 生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                AI 生成题目
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Preview Questions
  const renderStep3 = () => (
    <div>
      <h2 className="text-lg font-semibold font-mono text-foreground mb-6">预览 AI 生成题目</h2>

      {generating ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-foreground font-medium">AI 正在生成题目...</p>
          <p className="text-muted-foreground text-sm mt-1">
            根据候选人简历和岗位要求分析中
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {generatedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="px-4 py-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => toggleQuestionExpand(question.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-muted-foreground text-sm font-medium font-mono">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-foreground font-medium">
                          {question.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              difficultyConfig[question.difficulty].className
                            }`}
                          >
                            {difficultyConfig[question.difficulty].label}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            预计 {question.estimatedTime} 分钟
                          </span>
                        </div>
                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {question.relatedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-secondary/50 text-muted-foreground text-xs px-2 py-0.5 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                        expandedQuestion === question.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedQuestion === question.id && (
                  <div className="px-4 pb-4 border-t border-border pt-4 mt-0 ml-8">
                    <div>
                      <h4 className="text-xs font-medium font-mono text-muted-foreground uppercase mb-2">
                        题目描述
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {question.description}
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-xs font-medium font-mono text-muted-foreground uppercase mb-1">
                        评分标准
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {question.scoringCriteria}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="inline-flex items-center border border-border text-muted-foreground bg-card rounded-lg px-4 py-2 text-sm font-medium hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center bg-primary text-primary-foreground rounded-lg px-6 py-2 text-sm font-medium font-mono hover:bg-primary/90 transition-colors"
            >
              确认并继续
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Step 4: Confirm Create
  const renderStep4 = () => (
    <div>
      <h2 className="text-lg font-semibold font-mono text-foreground mb-6">确认创建考试</h2>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="space-y-0">
          <div className="flex justify-between items-center py-4 border-b border-border">
            <span className="text-muted-foreground text-sm">候选人</span>
            <span className="text-foreground text-sm font-medium">
              {selectedApp?.candidate?.name}
            </span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-border">
            <span className="text-muted-foreground text-sm">应聘岗位</span>
            <span className="text-foreground text-sm font-medium">
              {selectedApp?.job?.title}
            </span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-border">
            <span className="text-muted-foreground text-sm">题目数量</span>
            <span className="text-foreground text-sm font-medium">
              {generatedQuestions.length} 道
            </span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-border">
            <span className="text-muted-foreground text-sm">预计总时长</span>
            <span className="text-foreground text-sm font-medium">
              {generatedQuestions.reduce((acc, q) => acc + q.estimatedTime, 0)} 分钟
            </span>
          </div>
          <div className="flex justify-between items-center py-4">
            <span className="text-muted-foreground text-sm">难度分布</span>
            <div className="flex gap-2">
              {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => {
                const count = generatedQuestions.filter(
                  (q) => q.difficulty === diff
                ).length;
                if (count === 0) return null;
                return (
                  <span
                    key={diff}
                    className={`text-xs px-2 py-0.5 rounded ${difficultyConfig[diff].className}`}
                  >
                    {difficultyConfig[diff].label}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground underline text-sm transition-colors"
        >
          返回修改
        </button>
        <button
          onClick={handleCreateExam}
          disabled={creating}
          className="inline-flex items-center bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium font-mono hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              创建中...
            </>
          ) : (
            "确认并创建考试"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/questions")}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回考试管理
          </button>
          <h1 className="text-2xl font-semibold font-mono text-foreground">AI 智能出题</h1>
          <p className="text-muted-foreground text-sm mt-1">
            基于候选人简历和岗位要求，AI 自动生成个性化考试题目
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Content */}
        <div className="bg-card rounded-xl border border-border p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation for Step 1 only */}
        {currentStep === 1 && (
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={handleNext}
              disabled={!selectedApp}
              className="inline-flex items-center bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-medium font-mono hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
