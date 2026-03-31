"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { interviewsApi, Interview } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "已安排", color: "bg-syntax-function/10 text-syntax-function" },
  IN_PROGRESS: { label: "进行中", color: "bg-syntax-number/10 text-syntax-number" },
  COMPLETED: { label: "已完成", color: "bg-syntax-string/10 text-syntax-string" },
  CANCELLED: { label: "已取消", color: "bg-muted text-muted-foreground" },
};

const TYPE_MAP: Record<string, { label: string; icon: typeof Video }> = {
  VIDEO: { label: "视频面试", icon: Video },
  ONSITE: { label: "现场面试", icon: MapPin },
};

function InterviewerDashboardContent() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await interviewsApi.list({ page, limit });
      setInterviews(response.data.data.items);
      setTotal(response.data.data.total);
    } catch (err) {
      setError("获取面试列表失败，请稍后重试");
      console.error("Failed to fetch interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-mono text-foreground mb-2">面试官工作台</h1>
        <p className="text-muted-foreground">
          欢迎回来，{user?.name || "面试官"}！以下是您的待处理面试列表。
        </p>
      </div>

      {/* Interviews Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold font-mono text-foreground">待处理面试</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-muted-foreground">加载中...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchInterviews}>
              重试
            </Button>
          </div>
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">暂无待处理的面试</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
                      候选人姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
                      应聘岗位
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
                      面试类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
                      安排时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {interviews.map((interview) => {
                    const status = STATUS_MAP[interview.status] || {
                      label: interview.status,
                      color: "bg-muted text-muted-foreground",
                    };
                    const type = TYPE_MAP[interview.type] || {
                      label: interview.type,
                      icon: Video,
                    };
                    const TypeIcon = type.icon;

                    return (
                      <tr key={interview.id} className="hover:bg-secondary/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {interview.application?.candidate?.name || "未知候选人"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {interview.application?.candidate?.email || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {interview.application?.job?.title || "未知岗位"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            {type.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {formatDate(interview.scheduledAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              status.color
                            )}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={`/interviewer/review/${interview.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              查看报告 & 评分
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  共 {total} 条记录，第 {page} / {totalPages} 页
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InterviewerDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['INTERVIEWER']}>
      <InterviewerDashboardContent />
    </ProtectedRoute>
  );
}
