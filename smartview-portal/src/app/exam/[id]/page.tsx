"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  examsApi,
  Exam,
  Language,
  RunCodeResult,
  TestResult,
} from "@/lib/api";
import {
  Play,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Terminal,
  ListChecks,
  Loader2,
} from "lucide-react";

// Dynamic import Monaco Editor
const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false }
);

const languageLabels: Record<Language, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  go: "Go",
};

const difficultyColors: Record<string, string> = {
  L1: "text-green-400",
  L2: "text-blue-400",
  L3: "text-orange-400",
  L4: "text-red-400",
};

function ExamContent() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Code editor state
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>("javascript");
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerWarning, setTimerWarning] = useState(false);
  
  // Output panel state
  const [activeTab, setActiveTab] = useState<"tests" | "console">("tests");
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [running, setRunning] = useState(false);
  
  // Auto-save ref
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>("");

  // Fetch exam data
  const fetchExam = useCallback(async () => {
    try {
      const response = await examsApi.getExam(examId);
      const examData = response.data.data;
      setExam(examData);
      
      // Initialize code with starter code for first question
      if (examData.questions.length > 0) {
        const firstQuestion = examData.questions[0].question;
        const defaultLang = firstQuestion.languageSupport[0] || "javascript";
        setLanguage(defaultLang);
        const starter = firstQuestion.starterCode.find(s => s.language === defaultLang);
        setCode(starter?.code || "");
      }
      
      // Calculate remaining time
      if (examData.startedAt) {
        const startTime = new Date(examData.startedAt).getTime();
        const durationMs = examData.duration * 60 * 1000;
        const endTime = startTime + durationMs;
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
      }
    } catch {
      setError("加载考试失败，请刷新页面重试");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  // Timer countdown
  useEffect(() => {
    if (exam?.status !== "IN_PROGRESS" || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 300) {
          setTimerWarning(true);
        }
        if (newTime <= 0) {
          // Auto submit when time is up
          examsApi.submitExam(examId).then(() => {
            router.push(`/exam/${examId}/complete`);
          });
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exam?.status, timeRemaining, examId, router]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (exam?.status !== "IN_PROGRESS") return;

    autoSaveIntervalRef.current = setInterval(() => {
      if (code !== lastSavedCodeRef.current && exam) {
        const currentQuestion = exam.questions[currentQuestionIndex];
        examsApi.saveSubmission(examId, currentQuestion.questionId, {
          language,
          code,
        }).then(() => {
          lastSavedCodeRef.current = code;
        }).catch(console.error);
      }
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [exam, examId, code, language, currentQuestionIndex]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartExam = async () => {
    try {
      const response = await examsApi.startExam(examId);
      const examData = response.data.data;
      setExam(examData);
      
      // Initialize timer
      if (examData.startedAt) {
        const startTime = new Date(examData.startedAt).getTime();
        const durationMs = examData.duration * 60 * 1000;
        const endTime = startTime + durationMs;
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
      }
    } catch {
      alert("开始考试失败，请重试");
    }
  };

  const handleQuestionChange = (index: number) => {
    if (!exam || index === currentQuestionIndex) return;
    
    // Save current code before switching
    const currentQuestion = exam.questions[currentQuestionIndex];
    examsApi.saveSubmission(examId, currentQuestion.questionId, {
      language,
      code,
    }).catch(console.error);
    
    // Switch to new question
    setCurrentQuestionIndex(index);
    const newQuestion = exam.questions[index].question;
    const defaultLang = newQuestion.languageSupport[0] || "javascript";
    setLanguage(defaultLang);
    const starter = newQuestion.starterCode.find(s => s.language === defaultLang);
    setCode(starter?.code || "");
    setRunResult(null);
  };

  const handleRunCode = async () => {
    if (!exam) return;
    
    setRunning(true);
    setActiveTab("tests");
    
    try {
      const currentQuestion = exam.questions[currentQuestionIndex];
      const response = await examsApi.runCode(examId, currentQuestion.questionId, {
        language,
        code,
      });
      setRunResult(response.data.data);
    } catch {
      alert("运行代码失败，请重试");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;
    
    if (!confirm("确定要提交考试吗？提交后将无法修改答案。")) {
      return;
    }
    
    try {
      // Save final submission
      const currentQuestion = exam.questions[currentQuestionIndex];
      await examsApi.saveSubmission(examId, currentQuestion.questionId, {
        language,
        code,
      });
      
      // Submit exam
      await examsApi.submitExam(examId);
      router.push(`/exam/${examId}/complete`);
    } catch {
      alert("提交考试失败，请重试");
    }
  };

  // Not started screen
  if (!loading && exam?.status === "NOT_STARTED") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{exam.title}</h1>
          <p className="text-gray-400 mb-6">{exam.description}</p>
          
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-medium mb-3">考试说明</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                考试时长：{exam.duration} 分钟
              </li>
              <li className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-blue-400" />
                题目数量：{exam.questions.length} 道
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                支持多种编程语言
              </li>
            </ul>
          </div>
          
          <button
            onClick={handleStartExam}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            开始考试
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white">{error || "加载失败"}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex]?.question;
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">暂无题目</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold truncate max-w-[300px]">
            {exam.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-lg font-bold ${
              timerWarning
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "bg-gray-700 text-white"
            }`}
          >
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
          
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            提交考试
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question */}
        <div className="w-[30%] min-w-[300px] bg-[#1e1e2e] border-r border-gray-700 flex flex-col">
          {/* Question Tabs */}
          {exam.questions.length > 1 && (
            <div className="flex border-b border-gray-700 overflow-x-auto">
              {exam.questions.map((q, index) => (
                <button
                  key={q.questionId}
                  onClick={() => handleQuestionChange(index)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    index === currentQuestionIndex
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  题目 {index + 1}
                </button>
              ))}
            </div>
          )}
          
          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-white">
                {currentQuestion.title}
              </h2>
              <span
                className={`text-sm font-medium ${
                  difficultyColors[currentQuestion.difficulty]
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentQuestion.timeLimit} 分钟
              </span>
              <span className="px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                {currentQuestion.type}
              </span>
            </div>
            
            <div
              className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: currentQuestion.description.replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        </div>

        {/* Middle Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Language Selector */}
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4">
            <label className="text-sm text-gray-400 mr-3">语言:</label>
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as Language;
                setLanguage(newLang);
                const starter = currentQuestion.starterCode.find(
                  (s) => s.language === newLang
                );
                setCode(starter?.code || "");
              }}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {currentQuestion.languageSupport.map((lang) => (
                <option key={lang} value={lang}>
                  {languageLabels[lang]}
                </option>
              ))}
            </select>
          </div>
          
          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="w-[25%] min-w-[250px] bg-[#1e1e2e] border-l border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("tests")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === "tests"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <ListChecks className="w-4 h-4" />
              测试结果
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === "console"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Terminal className="w-4 h-4" />
              控制台
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "tests" ? (
              <div className="space-y-4">
                {runResult ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">通过率</span>
                      <span
                        className={`font-bold ${
                          runResult.passedCount === runResult.totalCount
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {runResult.passedCount}/{runResult.totalCount}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {runResult.testResults.map((result: TestResult, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            result.passed ? "bg-green-500/10" : "bg-red-500/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                result.passed ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              测试用例 {index + 1}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="text-gray-500">
                              输入: <span className="text-gray-300 font-mono">{result.input}</span>
                            </div>
                            <div className="text-gray-500">
                              期望: <span className="text-gray-300 font-mono">{result.expectedOutput}</span>
                            </div>
                            {!result.passed && (
                              <div className="text-gray-500">
                                实际: <span className="text-red-300 font-mono">{result.actualOutput}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">点击运行代码查看测试结果</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {runResult ? (
                  <>
                    <div className="text-sm text-gray-400">
                      执行时间: {runResult.executionTime}ms
                    </div>
                    
                    {runResult.stdout && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">标准输出</div>
                        <pre className="bg-gray-800 p-3 rounded text-sm text-gray-300 font-mono whitespace-pre-wrap">
                          {runResult.stdout}
                        </pre>
                      </div>
                    )}
                    
                    {runResult.stderr && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">标准错误</div>
                        <pre className="bg-gray-800 p-3 rounded text-sm text-red-400 font-mono whitespace-pre-wrap">
                          {runResult.stderr}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">点击运行代码查看控制台输出</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Run Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleRunCode}
              disabled={running}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  运行代码
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamPage() {
  return (
    <ProtectedRoute>
      <ExamContent />
    </ProtectedRoute>
  );
}
