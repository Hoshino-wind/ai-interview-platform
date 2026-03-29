"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  interviewsApi,
  applicationsApi,
  scoringApi,
  Interview,
  InterviewerScore,
  AIScoreReport,
  SubmissionWithCode,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Send,
  Check,
  SkipForward,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Star Rating Component
function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          className={cn(
            "text-2xl transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
            star <= value ? "text-yellow-400" : "text-gray-300"
          )}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

// Radar Chart Component (CSS-based)
function RadarChart({
  data,
}: {
  data: { codingAbility: number; engineeringMindset: number; problemSolving: number };
}) {
  const maxScore = 20;
  const dimensions = [
    { key: "codingAbility", label: "编码能力", score: data.codingAbility },
    { key: "engineeringMindset", label: "工程化思维", score: data.engineeringMindset },
    { key: "problemSolving", label: "问题解决", score: data.problemSolving },
  ];

  return (
    <div className="space-y-4">
      {dimensions.map((dim) => (
        <div key={dim.key} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{dim.label}</span>
            <span className="font-medium text-gray-900">
              {dim.score}/{maxScore}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                dim.score >= 15
                  ? "bg-green-500"
                  : dim.score >= 10
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${(dim.score / maxScore) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Code Viewer with Annotations
function CodeViewer({
  code,
  annotations,
  language,
}: {
  code: string;
  annotations: { line: number; type: "highlight" | "issue"; message: string }[];
  language: string;
}) {
  const lines = code.split("\n");
  const annotationMap = new Map(
    annotations.map((a) => [a.line, a])
  );

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400">{language.toUpperCase()}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const annotation = annotationMap.get(lineNumber);

              return (
                <tr key={lineNumber} className="hover:bg-gray-800/50">
                  <td className="px-4 py-1 text-right text-gray-500 select-none w-12 border-r border-gray-700">
                    {lineNumber}
                  </td>
                  <td className="px-4 py-1 relative">
                    <pre className="text-gray-300 font-mono whitespace-pre">
                      {line || " "}
                    </pre>
                    {annotation && (
                      <div
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-medium",
                          annotation.type === "highlight"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        )}
                      >
                        {annotation.type === "highlight" ? (
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                        )}
                        {annotation.message}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InterviewReviewContent() {
  const params = useParams();
  const { user } = useAuth();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [report, setReport] = useState<AIScoreReport | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithCode[]>([]);
  const [existingScore, setExistingScore] = useState<InterviewerScore | null>(null);
  const [activeSubmissionIndex, setActiveSubmissionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [techDepth, setTechDepth] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [overallQuality, setOverallQuality] = useState(0);
  const [cultureFit, setCultureFit] = useState(0);
  const [comments, setComments] = useState("");

  // Question tracking
  const [askedQuestions, setAskedQuestions] = useState<Set<number>>(new Set());
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch interview details
      const interviewRes = await interviewsApi.getById(interviewId);
      const interviewData = interviewRes.data.data;
      setInterview(interviewData);

      // Fetch existing scores
      const scoresRes = await interviewsApi.getScores(interviewId);
      const myScore = scoresRes.data.data.find((s) => s.interviewerId === user?.id);
      if (myScore) {
        setExistingScore(myScore);
        setTechDepth(myScore.techDepth);
        setCommunication(myScore.communication);
        setOverallQuality(myScore.overallQuality);
        setCultureFit(myScore.cultureFit);
        setComments(myScore.comments || "");
      }

      // Fetch AI report and submissions if application exists
      if (interviewData.applicationId) {
        try {
          const reportRes = await applicationsApi.getReport(interviewData.applicationId);
          setReport(reportRes.data.data);
        } catch {
          // Report might not be ready yet
        }

        // Fetch submissions via scoring API
        try {
          const examId = interviewData.applicationId; // Assuming examId is related
          const scoringRes = await scoringApi.getByExam(examId);
          setSubmissions(scoringRes.data.data.submissions);
        } catch {
          // No submissions available
        }
      }
    } catch (err) {
      setError("获取面试数据失败，请稍后重试");
      console.error("Failed to fetch interview data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = () => {
    return techDepth + communication + overallQuality + cultureFit;
  };

  const handleSubmit = async () => {
    if (techDepth === 0 || communication === 0 || overallQuality === 0 || cultureFit === 0) {
      alert("请为所有维度评分");
      return;
    }

    try {
      setSubmitting(true);
      await interviewsApi.submitScore(interviewId, {
        techDepth,
        communication,
        overallQuality,
        cultureFit,
        comments,
      });
      setSubmitSuccess(true);
      // Refresh to get the saved score
      const scoresRes = await interviewsApi.getScores(interviewId);
      const myScore = scoresRes.data.data.find((s) => s.interviewerId === user?.id);
      if (myScore) {
        setExistingScore(myScore);
      }
    } catch (err) {
      alert("提交评分失败，请稍后重试");
      console.error("Failed to submit score:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAsked = (index: number) => {
    setAskedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setSkippedQuestions((s) => {
          const newSkipped = new Set(s);
          newSkipped.delete(index);
          return newSkipped;
        });
      }
      return newSet;
    });
  };

  const toggleSkipped = (index: number) => {
    setSkippedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setAskedQuestions((s) => {
          const newAsked = new Set(s);
          newAsked.delete(index);
          return newAsked;
        });
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 45) return "text-green-600";
    if (score >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error || "面试不存在"}</p>
        <Link href="/interviewer/dashboard">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回仪表盘
          </Button>
        </Link>
      </div>
    );
  }

  const isReadOnly = existingScore !== null;
  const activeSubmission = submissions[activeSubmissionIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/interviewer/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回仪表盘
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">面试评审</h1>
        </div>
        {isReadOnly && (
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">已完成评分</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - AI Report */}
        <div className="lg:col-span-7 space-y-6">
          {/* Candidate Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">候选人信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">姓名</p>
                  <p className="font-medium text-gray-900">
                    {interview.application?.candidate?.name || "未知"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">邮箱</p>
                  <p className="font-medium text-gray-900">
                    {interview.application?.candidate?.email || "未知"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">应聘岗位</p>
                  <p className="font-medium text-gray-900">
                    {interview.application?.job?.title || "未知"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Score Card */}
          {report && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI 评分报告</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">AI 总分</p>
                  <p
                    className={cn(
                      "text-4xl font-bold",
                      getScoreColor(report.totalScore)
                    )}
                  >
                    {report.totalScore}
                  </p>
                  <p className="text-sm text-gray-400">/60</p>
                </div>
                <div className="flex-1">
                  <RadarChart data={report.breakdown} />
                </div>
              </div>
            </div>
          )}

          {/* Code Viewer */}
          {submissions.length > 0 && activeSubmission && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">代码提交</h2>
                {submissions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveSubmissionIndex((i) => Math.max(0, i - 1))
                      }
                      disabled={activeSubmissionIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      {activeSubmissionIndex + 1} / {submissions.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveSubmissionIndex((i) =>
                          Math.min(submissions.length - 1, i + 1)
                        )
                      }
                      disabled={activeSubmissionIndex === submissions.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <CodeViewer
                code={activeSubmission.code}
                annotations={report?.codeAnnotations || []}
                language={activeSubmission.language}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Scoring */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {isReadOnly ? "您的评分" : "结构化评分"}
            </h2>

            <div className="space-y-6">
              {/* Tech Depth */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    技术深度
                  </label>
                  <span className="text-sm text-gray-500">1-5 星</span>
                </div>
                <StarRating
                  value={techDepth}
                  onChange={setTechDepth}
                  readOnly={isReadOnly}
                />
              </div>

              {/* Communication */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    沟通表达
                  </label>
                  <span className="text-sm text-gray-500">1-5 星</span>
                </div>
                <StarRating
                  value={communication}
                  onChange={setCommunication}
                  readOnly={isReadOnly}
                />
              </div>

              {/* Overall Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    综合素质
                  </label>
                  <span className="text-sm text-gray-500">1-5 星</span>
                </div>
                <StarRating
                  value={overallQuality}
                  onChange={setOverallQuality}
                  readOnly={isReadOnly}
                />
              </div>

              {/* Culture Fit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    文化匹配
                  </label>
                  <span className="text-sm text-gray-500">1-5 星</span>
                </div>
                <StarRating
                  value={cultureFit}
                  onChange={setCultureFit}
                  readOnly={isReadOnly}
                />
              </div>

              {/* Total Score */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">换算总分</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateTotalScore()}
                    <span className="text-sm text-gray-400 font-normal">/40</span>
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">文字评语</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={isReadOnly}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                  placeholder="请输入您对候选人的评价..."
                />
              </div>

              {/* Submit Button */}
              {!isReadOnly && (
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      提交评分
                    </>
                  )}
                </Button>
              )}

              {submitSuccess && !isReadOnly && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>评分提交成功！</span>
                </div>
              )}

              {isReadOnly && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <p>您已于 {new Date(existingScore?.id || "").toLocaleString("zh-CN")} 完成评分</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Suggested Questions */}
      {report && report.suggestedQuestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            AI 推荐追问问题
          </h2>
          <div className="space-y-3">
            {report.suggestedQuestions.map((question, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{question}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleAsked(index)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                      askedQuestions.has(index)
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    )}
                  >
                    <Check className="w-3 h-3" />
                    {askedQuestions.has(index) ? "已问" : "标记已问"}
                  </button>
                  <button
                    onClick={() => toggleSkipped(index)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                      skippedQuestions.has(index)
                        ? "bg-gray-400 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    )}
                  >
                    <SkipForward className="w-3 h-3" />
                    {skippedQuestions.has(index) ? "已跳过" : "跳过"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Result Button */}
      {isReadOnly && interview.applicationId && (
        <div className="flex justify-center">
          <Link href={`/interviewer/review/${interviewId}/result`}>
            <Button size="lg">
              查看综合评分结果
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function InterviewReviewPage() {
  return (
    <ProtectedRoute requiredRoles={['INTERVIEWER', 'HR', 'ADMIN']}>
      <InterviewReviewContent />
    </ProtectedRoute>
  );
}
