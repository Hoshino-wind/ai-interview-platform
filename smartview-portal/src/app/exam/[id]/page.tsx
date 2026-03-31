"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { examsApi, Exam, Language, RunCodeResult, TestResult, CodingEvent } from "@/lib/api";
import { ActivityTracker } from "@/lib/activity-tracker";
import { Play, Send, Clock, AlertCircle, CheckCircle, XCircle, Terminal, ListChecks, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), { ssr: false });

const languageLabels: Record<Language, string> = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", java: "Java", cpp: "C++", go: "Go" };
const difficultyColors: Record<string, string> = { L1: "text-syntax-string", L2: "text-syntax-function", L3: "text-syntax-number", L4: "text-destructive" };

function ExamContent() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerWarning, setTimerWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<"tests" | "console">("tests");
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [running, setRunning] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>("");
  const trackerRef = useRef<ActivityTracker | null>(null);
  const accumulatedEventsRef = useRef<CodingEvent[]>([]);
  const editorRef = useRef<unknown>(null);

  const fetchExam = useCallback(async () => {
    try {
      const response = await examsApi.getExam(examId);
      const examData = response.data.data;
      setExam(examData);
      if (examData.questions.length > 0) {
        const firstQ = examData.questions[0].question;
        const defaultLang = firstQ.languageSupport[0] || "javascript";
        setLanguage(defaultLang);
        const starter = firstQ.starterCode.find(s => s.language === defaultLang);
        setCode(starter?.code || "");
      }
      if (examData.startedAt) {
        const remaining = Math.max(0, Math.floor((new Date(examData.startedAt).getTime() + examData.duration * 60000 - Date.now()) / 1000));
        setTimeRemaining(remaining);
      }
    } catch { setError("加载考试失败，请刷新页面重试"); }
    finally { setLoading(false); }
  }, [examId]);

  useEffect(() => { fetchExam(); }, [fetchExam]);
  useEffect(() => {
    if (exam?.status === "IN_PROGRESS" && !trackerRef.current) {
      trackerRef.current = new ActivityTracker((events) => { accumulatedEventsRef.current = [...accumulatedEventsRef.current, ...events]; });
      trackerRef.current.start();
    }
  }, [exam?.status]);
  useEffect(() => { return () => { trackerRef.current?.stop(); }; }, []);

  useEffect(() => {
    if (exam?.status !== "IN_PROGRESS" || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const t = prev - 1;
        if (t <= 300) setTimerWarning(true);
        if (t <= 0) { examsApi.submitExam(examId).then(() => router.push(`/exam/${examId}/complete`)); return 0; }
        return t;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exam?.status, timeRemaining, examId, router]);

  useEffect(() => {
    if (exam?.status !== "IN_PROGRESS") return;
    autoSaveIntervalRef.current = setInterval(() => {
      if (code !== lastSavedCodeRef.current && exam) {
        examsApi.saveSubmission(examId, exam.questions[currentQuestionIndex].questionId, { language, code }).then(() => { lastSavedCodeRef.current = code; }).catch(console.error);
      }
    }, 30000);
    return () => { if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current); };
  }, [exam, examId, code, language, currentQuestionIndex]);

  const formatTime = (s: number) => `${Math.floor(s/3600).toString().padStart(2,"0")}:${Math.floor((s%3600)/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const handleStartExam = async () => {
    try {
      const response = await examsApi.startExam(examId);
      const d = response.data.data;
      setExam(d);
      if (d.startedAt) setTimeRemaining(Math.max(0, Math.floor((new Date(d.startedAt).getTime() + d.duration * 60000 - Date.now()) / 1000)));
      trackerRef.current = new ActivityTracker((events) => { accumulatedEventsRef.current = [...accumulatedEventsRef.current, ...events]; });
      trackerRef.current.start();
    } catch { alert("开始考试失败，请重试"); }
  };

  const handleQuestionChange = (index: number) => {
    if (!exam || index === currentQuestionIndex) return;
    examsApi.saveSubmission(examId, exam.questions[currentQuestionIndex].questionId, { language, code }).catch(console.error);
    setCurrentQuestionIndex(index);
    const newQ = exam.questions[index].question;
    const lang = newQ.languageSupport[0] || "javascript";
    setLanguage(lang);
    setCode(newQ.starterCode.find(s => s.language === lang)?.code || "");
    setRunResult(null);
  };

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
    const node = (editor as { getDomNode: () => HTMLElement | null }).getDomNode?.();
    if (node) node.addEventListener('paste', (e: Event) => {
      const text = (e as ClipboardEvent).clipboardData?.getData('text') || '';
      if (text.length > 0) trackerRef.current?.trackPaste(text);
    });
  };

  const handleRunCode = async () => {
    if (!exam) return;
    setRunning(true); setActiveTab("tests");
    try {
      const res = await examsApi.runCode(examId, exam.questions[currentQuestionIndex].questionId, { language, code });
      const result = res.data.data;
      setRunResult(result);
      trackerRef.current?.trackRunCode(result.passedCount === result.totalCount, result.passedCount, result.totalCount);
      trackerRef.current?.trackSnapshot(code);
    } catch { alert("运行代码失败"); }
    finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    if (!exam || !confirm("确定要提交考试吗？提交后将无法修改答案。")) return;
    try {
      trackerRef.current?.stop();
      await examsApi.saveSubmission(examId, exam.questions[currentQuestionIndex].questionId, { language, code, codingEvents: accumulatedEventsRef.current });
      await examsApi.submitExam(examId);
      router.push(`/exam/${examId}/complete`);
    } catch { alert("提交考试失败"); }
  };

  // Not started screen
  if (!loading && exam?.status === "NOT_STARTED") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-foreground mb-2">{exam.title}</h1>
          <p className="text-muted-foreground mb-6">{exam.description}</p>
          <div className="bg-secondary rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
            <h3 className="text-foreground font-medium font-mono mb-3">考试说明</h3>
            <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" />考试时长：{exam.duration} 分钟</div>
            <div className="flex items-center gap-2 text-muted-foreground"><ListChecks className="w-4 h-4 text-primary" />题目数量：{exam.questions.length} 道</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Terminal className="w-4 h-4 text-primary" />支持多种编程语言</div>
          </div>
          <div className="bg-syntax-string/5 border border-syntax-string/20 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-syntax-string font-medium font-mono mb-2">开放考试模式</h3>
            <ul className="space-y-1 text-xs text-syntax-string/80">
              <li>&#8226; 您可以自由使用任何外部工具（搜索引擎、AI 助手、文档等）</li>
              <li>&#8226; 我们会记录您的编码过程，但不限制工具使用</li>
              <li>&#8226; 评分侧重于问题解决能力和最终交付质量</li>
            </ul>
          </div>
          <Button variant="glow" size="lg" className="w-full" onClick={handleStartExam}>开始考试</Button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error || !exam) return <div className="min-h-screen bg-background flex items-center justify-center"><AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" /><p className="text-foreground">{error || "加载失败"}</p></div>;

  const currentQuestion = exam.questions[currentQuestionIndex]?.question;
  if (!currentQuestion) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-foreground">暂无题目</p></div>;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Toolbar */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-foreground font-semibold font-mono truncate max-w-[300px]">{exam.title}</h1>
          <div className="bg-syntax-string/5 border border-syntax-string/20 rounded px-3 py-1 text-syntax-string text-xs font-mono hidden md:block">
            本考试鼓励使用任何工具
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-lg font-bold ${timerWarning ? "bg-destructive/10 text-destructive animate-pulse" : "bg-secondary text-foreground"}`}>
            <Clock className="w-5 h-5" />{formatTime(timeRemaining)}
          </div>
          <Button variant="glow" size="default" onClick={handleSubmit} className="gap-2">
            <Send className="w-4 h-4" />提交考试
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Question */}
        <div className="w-[30%] min-w-[300px] bg-card border-r border-border flex flex-col">
          {exam.questions.length > 1 && (
            <div className="flex border-b border-border overflow-x-auto">
              {exam.questions.map((q, i) => (
                <button key={q.questionId} onClick={() => handleQuestionChange(i)}
                  className={`px-4 py-3 text-sm font-mono font-medium whitespace-nowrap border-b-2 transition-colors ${i === currentQuestionIndex ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  题目 {i + 1}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-foreground font-mono">{currentQuestion.title}</h2>
              <span className={`text-sm font-mono font-medium ${difficultyColors[currentQuestion.difficulty]}`}>{currentQuestion.difficulty}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{currentQuestion.timeLimit} 分钟</span>
              <span className="px-2 py-0.5 bg-secondary rounded text-foreground font-mono">{currentQuestion.type}</span>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: currentQuestion.description.replace(/\n/g, "<br/>") }} />
          </div>
        </div>

        {/* Middle - Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          <div className="h-10 bg-card border-b border-border flex items-center px-4">
            <label className="text-sm text-muted-foreground mr-3 font-mono">lang:</label>
            <select value={language} onChange={(e) => { const l = e.target.value as Language; setLanguage(l); setCode(currentQuestion.starterCode.find(s=>s.language===l)?.code||""); }}
              className="bg-secondary text-foreground text-sm px-3 py-1 rounded border border-border focus:outline-none focus:border-primary font-mono">
              {currentQuestion.languageSupport.map(l => <option key={l} value={l}>{languageLabels[l]}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <Editor height="100%" language={language} value={code} onChange={(v) => { setCode(v||""); trackerRef.current?.trackKeystroke(); }} onMount={handleEditorDidMount}
              theme="vs-dark" options={{ minimap:{enabled:false}, fontSize:14, automaticLayout:true, scrollBeyondLastLine:false, wordWrap:"on", fontFamily:"var(--font-mono), JetBrains Mono, monospace" }} />
          </div>
        </div>

        {/* Right - Output */}
        <div className="w-[25%] min-w-[250px] bg-card border-l border-border flex flex-col">
          <div className="flex border-b border-border">
            {(["tests","console"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-mono font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab===tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab==="tests" ? <><ListChecks className="w-4 h-4" />测试结果</> : <><Terminal className="w-4 h-4" />控制台</>}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "tests" ? (
              runResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">通过率</span>
                    <span className={`font-mono font-bold ${runResult.passedCount===runResult.totalCount ? "text-syntax-string" : "text-syntax-number"}`}>
                      {runResult.passedCount}/{runResult.totalCount}
                    </span>
                  </div>
                  {runResult.testResults.map((r: TestResult, i: number) => (
                    <div key={i} className={`p-3 rounded-lg ${r.passed ? "bg-syntax-string/5 border border-syntax-string/10" : "bg-destructive/5 border border-destructive/10"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {r.passed ? <CheckCircle className="w-4 h-4 text-syntax-string" /> : <XCircle className="w-4 h-4 text-destructive" />}
                        <span className={`text-sm font-mono font-medium ${r.passed ? "text-syntax-string" : "text-destructive"}`}>测试用例 {i+1}</span>
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="text-muted-foreground">输入: <span className="text-foreground">{r.input}</span></div>
                        <div className="text-muted-foreground">期望: <span className="text-foreground">{r.expectedOutput}</span></div>
                        {!r.passed && <div className="text-muted-foreground">实际: <span className="text-destructive">{r.actualOutput}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8"><ListChecks className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">点击运行代码查看测试结果</p></div>
              )
            ) : (
              runResult ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground font-mono">执行时间: {runResult.executionTime}ms</div>
                  {runResult.stdout && <div><div className="text-xs text-muted-foreground mb-1">标准输出</div><pre className="bg-secondary p-3 rounded text-sm text-foreground font-mono whitespace-pre-wrap">{runResult.stdout}</pre></div>}
                  {runResult.stderr && <div><div className="text-xs text-muted-foreground mb-1">标准错误</div><pre className="bg-secondary p-3 rounded text-sm text-destructive font-mono whitespace-pre-wrap">{runResult.stderr}</pre></div>}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8"><Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">点击运行代码查看控制台输出</p></div>
              )
            )}
          </div>
          <div className="p-4 border-t border-border">
            <Button variant={running ? "secondary" : "glow"} size="default" className="w-full gap-2" onClick={handleRunCode} disabled={running}>
              {running ? <><Loader2 className="w-4 h-4 animate-spin" />运行中...</> : <><Play className="w-4 h-4" />运行代码</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamPage() {
  return <ProtectedRoute><ExamContent /></ProtectedRoute>;
}
