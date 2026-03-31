"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { applicationsApi, ApplicationWithExam, examsApi } from "@/lib/api";
import { Search, FileText, Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const getResumeStatus = (app: ApplicationWithExam) => app.resume?.fileUrl ? "已上传" : "未上传";
const getQuestionStatus = (app: ApplicationWithExam) => app.exam ? "已确认" : "未出题";
const getExamStatus = (app: ApplicationWithExam) => {
  if (!app.exam) return "未开始";
  const map: Record<string, string> = { NOT_STARTED: "未开始", IN_PROGRESS: "进行中", SUBMITTED: "已提交", GRADING: "评分中", COMPLETED: "已完成" };
  return map[app.exam.status] || app.exam.status;
};
const getScoringStatus = (app: ApplicationWithExam) => {
  if (!app.exam || app.exam.status === "NOT_STARTED") return "未评分";
  if (app.exam.status === "COMPLETED") return "已评分";
  if (app.scoringStatus === "PENDING") return "评分中";
  return "未评分";
};

const dotColor = (status: string) => {
  if (["已上传","已完成","已评分","已确认"].includes(status)) return "bg-primary";
  if (["进行中","评分中","已提交"].includes(status)) return "bg-syntax-number";
  return "bg-muted-foreground/30";
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className="inline-flex items-center text-sm text-foreground">
    <span className={`w-1.5 h-1.5 rounded-full ${dotColor(status)} inline-block mr-1.5`} />
    {status}
  </span>
);

export default function ExamManagementPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithExam[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsApi.getAll({ page: currentPage, limit: pageSize, status: statusFilter || undefined });
      setApplications(response.data.data.items);
      setTotal(response.data.data.total);
    } catch (error) { console.error("Failed to fetch:", error); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchApplications(); }, [currentPage, statusFilter]);

  const handleSearch = () => { setCurrentPage(1); fetchApplications(); };
  const handleGenerateExam = async (id: string) => {
    if (!confirm("确定要为该候选人生成 AI 考试吗？")) return;
    setGenerating(id);
    try { await examsApi.generateExam(id); fetchApplications(); }
    catch { alert("生成考试失败，请重试"); }
    finally { setGenerating(null); }
  };

  const totalPages = Math.ceil(total / pageSize);
  const filtered = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return app.candidate?.name?.toLowerCase().includes(q) || app.candidate?.email?.toLowerCase().includes(q) || app.job?.title?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground font-mono">考试管理</h1>
        <Button variant="glow" size="default" onClick={() => router.push("/admin/exams/generate")}>新建考试</Button>
      </div>

      <div className="flex items-center justify-between mt-6 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">全部状态</option>
          <option value="NOT_STARTED">未开始</option>
          <option value="IN_PROGRESS">进行中</option>
          <option value="COMPLETED">已完成</option>
        </select>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="搜索候选人或岗位..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["候选人","应聘岗位","简历状态","出题状态","考试状态","评分状态","创建时间","操作"].map((h) => (
                <th key={h} className={`px-4 py-3 text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider ${h==="操作" ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-16">
                <div className="flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm mt-3">暂无考试数据</p>
                  <button onClick={() => router.push("/admin/exams/generate")} className="text-primary underline text-sm mt-2">创建第一个 AI 考试</button>
                </div>
              </td></tr>
            ) : filtered.map((app) => (
              <tr key={app.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-foreground">{app.candidate?.name || "未知"}</div>
                  <div className="text-xs text-muted-foreground font-mono">{app.candidate?.email}</div>
                </td>
                <td className="px-4 py-4 text-sm text-foreground">{app.job?.title || "未知岗位"}</td>
                <td className="px-4 py-4"><StatusBadge status={getResumeStatus(app)} /></td>
                <td className="px-4 py-4"><StatusBadge status={getQuestionStatus(app)} /></td>
                <td className="px-4 py-4"><StatusBadge status={getExamStatus(app)} /></td>
                <td className="px-4 py-4"><StatusBadge status={getScoringStatus(app)} /></td>
                <td className="px-4 py-4 text-sm text-muted-foreground font-mono">{app.exam ? new Date(app.exam.createdAt).toLocaleDateString("zh-CN") : "-"}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {!app.exam ? (
                      <button onClick={() => handleGenerateExam(app.id)} disabled={generating === app.id}
                        className="text-primary font-medium text-sm hover:underline disabled:text-muted-foreground disabled:no-underline font-mono">
                        {generating === app.id ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />生成中...</span> : "生成考试"}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => router.push(`/admin/exams/view/${app.id}`)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="查看题目"><FileText className="w-4 h-4" /></button>
                        <button onClick={() => router.push(`/admin/applications/${app.id}/results`)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="查看结果"><BarChart3 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground font-mono">第 {(currentPage-1)*pageSize+1}-{Math.min(currentPage*pageSize,total)} 条，共 {total} 条</div>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1} className="text-sm text-muted-foreground hover:text-foreground disabled:text-muted-foreground/30">← 上一页</button>
            <div className="flex items-center gap-1">
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setCurrentPage(p)} className={`px-2 py-1 text-sm font-mono ${p===currentPage?"font-bold text-primary":"text-muted-foreground hover:text-foreground"}`}>{p}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="text-sm text-muted-foreground hover:text-foreground disabled:text-muted-foreground/30">下一页 →</button>
          </div>
        </div>
      )}
    </div>
  );
}
