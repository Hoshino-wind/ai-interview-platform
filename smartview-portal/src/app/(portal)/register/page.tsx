"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Eye, EyeOff, User, UserCheck, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type Role = "candidate" | "interviewer" | "hr";

const roles = [
  { id: "candidate" as Role, icon: <User className="w-6 h-6" />, title: "候选人", description: "我要找工作" },
  { id: "interviewer" as Role, icon: <UserCheck className="w-6 h-6" />, title: "面试官", description: "我要面试候选人" },
  { id: "hr" as Role, icon: <Building className="w-6 h-6" />, title: "HR", description: "我要管理招聘" },
];

const roleMapping: Record<Role, string> = { candidate: "CANDIDATE", interviewer: "INTERVIEWER", hr: "HR" };

function getPasswordStrength(password: string) {
  if (password.length < 6) return { strength: "weak" as const, label: "弱" };
  if (password.length <= 8) return { strength: "medium" as const, label: "中" };
  return { strength: "strong" as const, label: "强" };
}

const strengthConfig = {
  weak: { color: "bg-destructive", text: "text-destructive", width: "33%" },
  medium: { color: "bg-syntax-number", text: "text-syntax-number", width: "66%" },
  strong: { color: "bg-primary", text: "text-primary", width: "100%" },
};

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { register, loading, error, clearError } = useAuth();

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError(null);
    if (password !== confirmPassword) { setPasswordError("两次输入的密码不一致"); return; }
    if (password.length < 6) { setPasswordError("密码至少需要6个字符"); return; }
    try {
      await register({ email, password, name, role: roleMapping[selectedRole] });
    } catch { /* handled by AuthContext */ }
  };

  const inputClass = "w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all disabled:opacity-50 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute bottom-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-syntax-keyword/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg bg-card rounded-xl border border-border p-8"
      >
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Terminal className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground">智面 SmartView</span>
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2">创建您的账户</h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          <span className="font-mono text-primary">{">"}</span> Create your account
        </p>

        {(error || passwordError) && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error || passwordError}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">选择您的角色</label>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                disabled={loading}
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border transition-all disabled:opacity-50",
                  selectedRole === role.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground text-muted-foreground"
                )}
              >
                <div className="mb-2">{role.icon}</div>
                <span className="text-sm font-medium">{role.title}</span>
                <span className="text-xs mt-1 opacity-80">{role.description}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">姓名</label>
            <input type="text" id="name" placeholder="请输入姓名" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">邮箱</label>
            <input type="email" id="email" placeholder="请输入邮箱" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={cn(inputClass, "font-mono")} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">密码</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={cn(inputClass, "pr-12 font-mono")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-300 rounded-full", strengthConfig[passwordStrength.strength].color)} style={{ width: strengthConfig[passwordStrength.strength].width }} />
                </div>
                <span className={cn("text-xs font-mono font-medium", strengthConfig[passwordStrength.strength].text)}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">确认密码</label>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder="请再次输入密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className={cn(inputClass, "pr-12 font-mono")} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} disabled={loading} className="w-4 h-4 mt-0.5 rounded border-border bg-secondary text-primary focus:ring-primary/50" />
            <span className="text-sm text-muted-foreground">
              我已阅读并同意<Link href="#" className="text-primary hover:text-primary/80">《服务条款》</Link>和<Link href="#" className="text-primary hover:text-primary/80">《隐私政策》</Link>
            </span>
          </label>

          <Button type="submit" variant="glow" size="lg" className="w-full" disabled={!agreedToTerms || loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />注册中...</> : "注册"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="divider-gradient" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-4 bg-card text-muted-foreground text-sm font-mono">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" size="lg" className="w-full gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub 注册
          </Button>
          <Button variant="outline" size="lg" className="w-full gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google 注册
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          已有账户？{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            立即登录
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
