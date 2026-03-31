"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { User, Briefcase, Calendar, Award, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { resumesApi, Resume } from "@/lib/api";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function CandidateDashboardContent() {
  const { user, logout } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    const loadResume = async () => {
      try { const r = await resumesApi.getMyResume(); setResume(r.data.data); } catch { /* ignore */ }
    };
    loadResume();
  }, []);

  const stats = [
    { label: "我的简历", value: resume?.parsedData ? "已上传" : "未上传", icon: FileText, color: "text-syntax-number", bg: "bg-syntax-number/10", href: "/candidate/resume" },
    { label: "我的申请", value: "0", icon: Briefcase, color: "text-syntax-function", bg: "bg-syntax-function/10" },
    { label: "待面试", value: "0", icon: Calendar, color: "text-syntax-string", bg: "bg-syntax-string/10" },
    { label: "已完成", value: "0", icon: Award, color: "text-syntax-keyword", bg: "bg-syntax-keyword/10" },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-xl border border-border p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-mono mb-2">候选人工作台</h1>
              <p className="text-muted-foreground">
                <span className="font-mono text-primary">{">"}</span> 欢迎回来，{user?.name || "候选人"}！
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-mono">{user?.role || "CANDIDATE"}</span>
              <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="退出登录">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const Card = s.href ? Link : "div";
            return (
              <Card key={s.label} href={s.href || ""} className="block">
                <div className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all card-glow">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-bold font-mono text-foreground">{s.value}</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* User Info */}
        <div className="bg-card rounded-xl border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground font-mono mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> 个人信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "姓名", value: user?.name },
              { label: "邮箱", value: user?.email, mono: true },
              { label: "角色", value: user?.role },
              { label: "电话", value: user?.phone },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{f.label}</label>
                <p className={`text-foreground ${f.mono ? "font-mono" : ""}`}>{f.value || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateDashboardPage() {
  return <ProtectedRoute requiredRoles={['CANDIDATE']}><CandidateDashboardContent /></ProtectedRoute>;
}
