"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  interviewsApi,
  applicationsApi,
  Interview,
  InterviewerScore,
  FinalScore,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  User,
  RefreshCw,
  Save,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DECISION_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle }
> = {
  RECOMMEND: {
    label: "强烈推荐录用",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  MAYBE: {
    label: "建议进入下一轮",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: HelpCircle,
  },
  REJECT: {
    label: "不推荐",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

// Progress Bar Component
function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function InterviewResultContent() {
  const params = useParams();
  useAuth();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [allScores, setAllScores] = useState<InterviewerScore[]>([]);
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [updatingDecision, setUpdatingDecision] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<
    "RECOMMEND" | "MAYBE" | "REJECT" | ""
  >("");

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

      // Fetch all scores for this interview
      const scoresRes = await interviewsApi.getScores(interviewId);
      setAllScores(scoresRes.data.data);

      // Fetch application to get final score
      if (interviewData.applicationId) {
        const appRes = await applicationsApi.getById(interviewData.applicationId);
        const appData = appRes.data.data;
        if (appData.finalScore) {
          setFinalScore(appData.finalScore);
          setSelectedDecision(appData.finalScore.decision);
        }
      }
    } catch (err) {
      setError("获取评分数据失败，请稍后重试");
      console.error("Failed to fetch result data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!interview?.applicationId) return;

    try {
      setFinalizing(true);
      const res = await applicationsApi.finalize(interview.applicationId);
      setFinalScore(res.data.data);
      setSelectedDecision(res.data.data.decision);
    } catch (err) {
      alert("生成综合评分失败，请稍后重试");
      console.error("Failed to finalize:", err);
    } finally {
      setFinalizing(false);
    }
  };

  const handleUpdateDecision = async () => {
    if (!interview?.applicationId || !selectedDecision) return;

    try {
      setUpdatingDecision(true);
      const res = await applicationsApi.updateDecision(interview.applicationId, {
        decision: selectedDecision,
      });
      setFinalScore(res.data.data);
      alert("决策更新成功！");
    } catch (err) {
      alert("更新决策失败，请稍后重试");
      console.error("Failed to update decision:", err);
    } finally {
      setUpdatingDecision(false);
    }
  };

  const calculateDeviation = () => {
    if (!finalScore || allScores.length === 0) return 0;
    const avgInterviewerScore =
      allScores.reduce((sum, s) => sum + s.totalScore, 0) / allScores.length;
    const normalizedInterviewer = (avgInterviewerScore / 40) * 100;
    const normalizedAI = (finalScore.aiScore / 60) * 100;
    return Math.abs(normalizedAI - normalizedInterviewer);
  };

  const getScoreColorClass = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
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
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
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

  const deviation = calculateDeviation();
  const hasDeviationWarning = deviation > 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/interviewer/review/${interviewId}`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回评审页
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">综合评分结果</h1>
        <p className="text-gray-600 mt-1">
          候选人：{interview.application?.candidate?.name || "未知"} |
          岗位：{interview.application?.job?.title || "未知"}
        </p>
      </div>

      {/* Final Score Card */}
      {finalScore ? (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-2">综合得分</p>
            <p
              className={cn(
                "text-6xl font-bold",
                finalScore.finalScore >= 75
                  ? "text-green-600"
                  : finalScore.finalScore >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              )}
            >
              {finalScore.finalScore}
            </p>
            <p className="text-gray-400 mt-1">/100</p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">AI 评分</span>
                <span className="font-medium text-gray-900">
                  {finalScore.aiScore}/60
                </span>
              </div>
              <ProgressBar
                value={finalScore.aiScore}
                max={60}
                color={getScoreColorClass(finalScore.aiScore, 60)}
              />
              <p className="text-xs text-gray-500">占比 60%</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">面试官评分</span>
                <span className="font-medium text-gray-900">
                  {finalScore.interviewerScore}/40
                </span>
              </div>
              <ProgressBar
                value={finalScore.interviewerScore}
                max={40}
                color={getScoreColorClass(finalScore.interviewerScore, 40)}
              />
              <p className="text-xs text-gray-500">占比 40%</p>
            </div>
          </div>

          {/* Decision */}
          <div className="flex items-center justify-center">
            {(() => {
              const config = DECISION_CONFIG[finalScore.decision];
              const Icon = config?.icon || HelpCircle;
              return (
                <div
                  className={cn(
                    "px-6 py-3 rounded-xl flex items-center gap-3",
                    config?.bgColor || "bg-gray-100"
                  )}
                >
                  <Icon className={cn("w-8 h-8", config?.color || "text-gray-700")} />
                  <span
                    className={cn(
                      "text-xl font-bold",
                      config?.color || "text-gray-700"
                    )}
                  >
                    {config?.label || finalScore.decision}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Deviation Warning */}
          {hasDeviationWarning && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">评分偏差警告</p>
                <p className="text-sm text-yellow-700 mt-1">
                  AI 评分与面试官评分存在较大偏差（偏差值：{deviation.toFixed(1)}%），
                  建议复核评审结果。
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">综合评分尚未生成</p>
          <Button onClick={handleFinalize} disabled={finalizing}>
            {finalizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                生成中...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                生成综合评分
              </>
            )}
          </Button>
        </div>
      )}

      {/* All Interviewer Scores */}
      {allScores.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            所有面试官评分详情
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    面试官
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    技术深度
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    沟通表达
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    综合素质
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    文化匹配
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    总分
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    评语
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allScores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {score.interviewer?.name || "未知"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {score.interviewer?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        {score.techDepth}
                        <span className="text-yellow-400">★</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        {score.communication}
                        <span className="text-yellow-400">★</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        {score.overallQuality}
                        <span className="text-yellow-400">★</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        {score.cultureFit}
                        <span className="text-yellow-400">★</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-600">
                        {score.totalScore}
                      </span>
                      <span className="text-gray-400 text-sm">/40</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {score.comments || "-"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Decision Section */}
      {finalScore && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">更新决策</h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedDecision}
              onChange={(e) =>
                setSelectedDecision(e.target.value as "RECOMMEND" | "MAYBE" | "REJECT")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">选择决策...</option>
              <option value="RECOMMEND">强烈推荐录用</option>
              <option value="MAYBE">建议进入下一轮</option>
              <option value="REJECT">不推荐</option>
            </select>
            <Button
              onClick={handleUpdateDecision}
              disabled={!selectedDecision || updatingDecision}
              variant="outline"
            >
              {updatingDecision ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  更新中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  确认更新
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewResultPage() {
  return (
    <ProtectedRoute requiredRoles={['INTERVIEWER', 'HR', 'ADMIN']}>
      <InterviewResultContent />
    </ProtectedRoute>
  );
}
