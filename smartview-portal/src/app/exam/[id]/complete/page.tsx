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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Success Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -left-1">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse delay-150" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          考试已提交
        </h1>
        <p className="text-gray-400 mb-6">
          您的答案已成功提交，感谢您的参与！
        </p>

        {/* Exam Info Card */}
        <div className="bg-gray-700/50 rounded-xl p-5 mb-6 text-left">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            考试信息
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">考试名称</span>
              <span className="text-white font-medium truncate max-w-[150px]">
                {exam?.title || "--"}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">提交时间</span>
              <span className="text-white font-medium">
                {formatDate(exam?.submittedAt)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">题目数量</span>
              <span className="text-white font-medium">
                {exam?.questions?.length || 0} 道
              </span>
            </div>
          </div>
        </div>

        {/* AI Grading Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">AI 评分中</span>
          </div>
          <p className="text-sm text-gray-400">
            我们的 AI 系统正在对您的答案进行评分，请耐心等待结果
          </p>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          返回首页
        </button>
      </div>
    </div>
  );
}
