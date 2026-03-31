"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  resumesApi,
  ParsedData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
} from "@/lib/api";
import {
  Upload,
  FileText,
  Loader2,
  Plus,
  X,
  Check,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Code,
  ChevronLeft,
} from "lucide-react";

type Step = "upload" | "parsing" | "review" | "done";

function ResumeUploadContent() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing resume on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await resumesApi.getMyResume();
        if (response.data.data) {
          const resume = response.data.data;
          if (resume.fileUrl) {
            setUploadedFileUrl(resume.fileUrl);
          }
          if (resume.parsedData) {
            setParsedData(resume.parsedData);
            setStep("review");
          }
        }
      } catch {
        // Ignore errors - no resume exists yet
      }
    };
    loadResume();
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      setError("仅支持 PDF 格式的文件");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("文件大小不能超过 10MB");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await resumesApi.upload(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadedFileUrl(response.data.data.fileUrl);
      setTimeout(() => {
        setStep("parsing");
        handleParse();
      }, 500);
    } catch (err) {
      setError("上传失败，请重试");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async () => {
    setError(null);

    try {
      const response = await resumesApi.parse();
      setParsedData(response.data.data);
      setStep("review");
    } catch (err) {
      setError("AI 解析失败，请重试");
      console.error("Parse error:", err);
      setStep("upload");
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;

    setSaving(true);
    setError(null);

    try {
      await resumesApi.updateParsedData({ parsedData });
      setStep("done");
      setTimeout(() => {
        router.push("/candidate/dashboard");
      }, 1500);
    } catch (err) {
      setError("保存失败，请重试");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Skill management
  const addSkill = () => {
    const skill = prompt("请输入新技术栈");
    if (skill && skill.trim() && parsedData) {
      setParsedData({
        ...parsedData,
        skills: [...parsedData.skills, skill.trim()],
      });
    }
  };

  const removeSkill = (index: number) => {
    if (parsedData) {
      setParsedData({
        ...parsedData,
        skills: parsedData.skills.filter((_, i) => i !== index),
      });
    }
  };

  // Experience management
  const updateExperience = (index: number, field: keyof ExperienceItem, value: string | number | string[]) => {
    if (parsedData && parsedData.experience) {
      const newExperience = [...parsedData.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      setParsedData({ ...parsedData, experience: newExperience });
    }
  };

  // Project management
  const updateProject = (index: number, field: keyof ProjectItem, value: string | string[]) => {
    if (parsedData && parsedData.projects) {
      const newProjects = [...parsedData.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      setParsedData({ ...parsedData, projects: newProjects });
    }
  };

  // Education management
  const updateEducation = (index: number, field: keyof EducationItem, value: string | number) => {
    if (parsedData && parsedData.education) {
      const newEducation = [...parsedData.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      setParsedData({ ...parsedData, education: newEducation });
    }
  };

  const seniorityOptions: Array<{ value: ParsedData["seniorityLevel"]; label: string }> = [
    { value: "junior", label: "初级 (0-1年)" },
    { value: "mid", label: "中级 (1-3年)" },
    { value: "mid-senior", label: "中高级 (3-5年)" },
    { value: "senior", label: "高级 (5-8年)" },
    { value: "expert", label: "专家 (8年以上)" },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            返回工作台
          </button>
          <h1 className="text-3xl font-bold font-mono text-foreground">简历管理</h1>
          <p className="text-muted-foreground mt-2">
            上传您的简历，AI 将自动解析并提取关键信息
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {["upload", "parsing", "review", "done"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium font-mono ${
                  ["upload", "parsing", "review", "done"].indexOf(step) >= i
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={`w-16 h-1 ${
                    ["upload", "parsing", "review", "done"].indexOf(step) > i
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="bg-card rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              上传简历
            </h2>

            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                拖拽 PDF 文件到这里，或点击选择文件
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                仅支持 PDF 格式，最大 10MB
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
              >
                选择文件
              </label>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {uploadedFileUrl && !file && (
              <div className="mt-6 p-4 bg-syntax-string/10 rounded-lg flex items-center gap-3">
                <Check className="w-6 h-6 text-syntax-string" />
                <p className="text-syntax-string">已有上传的简历，可重新上传覆盖</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  file && !uploading
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    上传中... {uploadProgress}%
                  </span>
                ) : (
                  "上传简历"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Parsing */}
        {step === "parsing" && (
          <div className="bg-card rounded-2xl shadow-sm p-12 text-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              AI 正在分析您的简历...
            </h2>
            <p className="text-muted-foreground">
              这可能需要几秒钟，请稍候
            </p>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && parsedData && (
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-card rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                技术栈
              </h3>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="hover:text-primary/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={addSkill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-primary/30 text-primary rounded-full text-sm hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>
            </div>

            {/* Seniority Level */}
            <div className="bg-card rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                经验等级
              </h3>
              <div className="flex flex-wrap gap-2">
                {seniorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setParsedData({ ...parsedData, seniorityLevel: option.value })
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      parsedData.seniorityLevel === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                工作年限：<span className="font-mono">{parsedData.yearsOfExperience}</span> 年
              </p>
            </div>

            {/* Experience */}
            {parsedData.experience && parsedData.experience.length > 0 && (
              <div className="bg-card rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-syntax-string" />
                  工作经历
                </h3>
                <div className="space-y-4">
                  {parsedData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="p-4 bg-secondary/50 rounded-lg space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(index, "company", e.target.value)
                          }
                          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="公司名"
                        />
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) =>
                            updateExperience(index, "role", e.target.value)
                          }
                          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="职位"
                        />
                      </div>
                      <input
                        type="number"
                        value={exp.years}
                        onChange={(e) =>
                          updateExperience(index, "years", parseInt(e.target.value) || 0)
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-32"
                        placeholder="年限"
                      />
                      <textarea
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={2}
                        placeholder="工作描述"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {parsedData.projects && parsedData.projects.length > 0 && (
              <div className="bg-card rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-purple-600" />
                  项目经验
                </h3>
                <div className="space-y-4">
                  {parsedData.projects.map((project, index) => (
                    <div
                      key={index}
                      className="p-4 bg-secondary/50 rounded-lg space-y-3"
                    >
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) =>
                          updateProject(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="项目名"
                      />
                      <textarea
                        value={project.description}
                        onChange={(e) =>
                          updateProject(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={2}
                        placeholder="项目描述"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {parsedData.education && parsedData.education.length > 0 && (
              <div className="bg-card rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                  教育背景
                </h3>
                <div className="space-y-4">
                  {parsedData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="p-4 bg-secondary/50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) =>
                          updateEducation(index, "school", e.target.value)
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="学校"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(index, "degree", e.target.value)
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="学位"
                      />
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) =>
                          updateEducation(index, "major", e.target.value)
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="专业"
                      />
                      <input
                        type="number"
                        value={edu.year}
                        onChange={(e) =>
                          updateEducation(index, "year", parseInt(e.target.value) || 0)
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="毕业年份"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push("/candidate/dashboard")}
                className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    确认简历信息
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="bg-card rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-syntax-string/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-syntax-string" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              简历信息已保存
            </h2>
            <p className="text-muted-foreground">
              正在返回工作台...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumePage() {
  return (
    <ProtectedRoute requiredRoles={["CANDIDATE"]}>
      <ResumeUploadContent />
    </ProtectedRoute>
  );
}
