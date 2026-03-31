"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { examsApi, Exam } from "@/lib/api";
import {
  CheckCircle,
  Home,
  Loader2,
  Sparkles,
  Clock,
} from "lucide-react";

export default function ExamCompletePage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await examsApi.getExam(examId);
      setExam(response.data.data);
    } catch (error) {
      console.error("Failed to fetch exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Success Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-syntax-string/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-syntax-string" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -left-1">
            <Sparkles className="w-5 h-5 text-primary animate-pulse delay-150" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold font-mono text-foreground mb-2">
          考试已提交
        </h1>
        <p className="text-muted-foreground mb-6">
          您的答案已成功提交，感谢您的参与！
        </p>

        {/* Exam Info Card */}
        <div className="bg-secondary rounded-xl p-5 mb-6 text-left">
          <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            考试信息
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">考试名称</span>
              <span className="text-foreground font-medium truncate max-w-[150px]">
                {exam?.title || "--"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">提交时间</span>
              <span className="text-foreground font-medium font-mono">
                {formatDate(exam?.submittedAt)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">题目数量</span>
              <span className="text-foreground font-medium font-mono">
                {exam?.questions?.length || 0} 道
              </span>
            </div>
          </div>
        </div>

        {/* AI Grading Notice */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">AI 评分中</span>
          </div>
          <p className="text-sm text-muted-foreground">
            我们的 AI 系统正在对您的答案进行评分，请耐心等待结果
          </p>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          返回首页
        </button>
      </div>
    </div>
  );
}
