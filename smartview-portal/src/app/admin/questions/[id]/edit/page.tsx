"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  questionsApi,
  QuestionType,
  DifficultyLevel,
  Language,
  TestCase,
  StarterCode,
  Question,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

// Dynamic import Monaco Editor to avoid SSR issues
const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false }
);

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "ALGORITHM", label: "算法" },
  { value: "SYSTEM_DESIGN", label: "系统设计" },
  { value: "REFACTORING", label: "重构" },
  { value: "DEBUGGING", label: "调试" },
  { value: "PROJECT", label: "项目" },
];

const difficultyLevels: { value: DifficultyLevel; label: string }[] = [
  { value: "L1", label: "L1" },
  { value: "L2", label: "L2" },
  { value: "L3", label: "L3" },
  { value: "L4", label: "L4" },
];

const languages: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
];

const defaultStarterCode: Record<Language, string> = {
  javascript: `function solution(input) {\n  // Write your code here\n  \n}`,
  typescript: `function solution(input: string): string {\n  // Write your code here\n  \n}`,
  python: `def solution(input):\n    # Write your code here\n    pass`,
  java: `public class Solution {\n    public static String solution(String input) {\n        // Write your code here\n        return "";\n    }\n}`,
  cpp: `#include <string>\n\nstd::string solution(std::string input) {\n    // Write your code here\n    return "";\n}`,
  go: `package main\n\nfunc solution(input string) string {\n    // Write your code here\n    return ""\n}`,
};

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>("javascript");
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<QuestionType>("ALGORITHM");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("L1");
  const [timeLimit, setTimeLimit] = useState(30);
  const [tags, setTags] = useState("");
  const [languageSupport, setLanguageSupport] = useState<Language[]>(["javascript"]);
  const [starterCode, setStarterCode] = useState<StarterCode[]>([
    { language: "javascript", code: defaultStarterCode.javascript },
  ]);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expectedOutput: "", isHidden: false },
  ]);

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await questionsApi.getQuestionById(questionId);
      const question: Question = response.data.data;
      
      setTitle(question.title);
      setDescription(question.description);
      setType(question.type);
      setDifficulty(question.difficulty);
      setTimeLimit(question.timeLimit);
      setTags(question.tags.join(", "));
      setLanguageSupport(question.languageSupport);
      setStarterCode(question.starterCode.length > 0 ? question.starterCode : 
        question.languageSupport.map(lang => ({
          language: lang,
          code: defaultStarterCode[lang]
        }))
      );
      setTestCases(question.testCases.length > 0 ? question.testCases : 
        [{ input: "", expectedOutput: "", isHidden: false }]
      );
      setActiveLanguage(question.languageSupport[0] || "javascript");
    } catch (error) {
      console.error("Failed to fetch question:", error);
      alert("加载题目失败");
      router.push("/admin/questions");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSupportChange = (lang: Language, checked: boolean) => {
    if (checked) {
      setLanguageSupport([...languageSupport, lang]);
      if (!starterCode.find((s) => s.language === lang)) {
        setStarterCode([
          ...starterCode,
          { language: lang, code: defaultStarterCode[lang] },
        ]);
      }
    } else {
      if (languageSupport.length > 1) {
        setLanguageSupport(languageSupport.filter((l) => l !== lang));
        setStarterCode(starterCode.filter((s) => s.language !== lang));
        if (activeLanguage === lang) {
          const remaining = languageSupport.filter((l) => l !== lang);
          if (remaining.length > 0) {
            setActiveLanguage(remaining[0]);
          }
        }
      }
    }
  };

  const updateStarterCode = (lang: Language, code: string) => {
    setStarterCode(
      starterCode.map((s) => (s.language === lang ? { ...s, code } : s))
    );
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("请输入标题");
      return;
    }
    if (!description.trim()) {
      alert("请输入描述");
      return;
    }
    if (languageSupport.length === 0) {
      alert("请至少选择一种语言");
      return;
    }

    setSaving(true);
    try {
      await questionsApi.updateQuestion(questionId, {
        title: title.trim(),
        description: description.trim(),
        type,
        difficulty,
        timeLimit,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        languageSupport,
        starterCode: starterCode.filter((s) => languageSupport.includes(s.language)),
        testCases: testCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim()),
      });
      router.push("/admin/questions");
    } catch (error) {
      console.error("Failed to update question:", error);
      alert("更新失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const getStarterCodeForLanguage = (lang: Language): string => {
    const found = starterCode.find((s) => s.language === lang);
    return found?.code || defaultStarterCode[lang];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">编辑题目</h1>
          <p className="text-gray-500 mt-1">修改题目信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入题目标题"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入题目描述，支持 Markdown 格式"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {questionTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                难度 <span className="text-red-500">*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficultyLevels.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                时间限制（分钟）
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标签（逗号分隔）
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="例如：数组, 排序, 动态规划"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Language Support */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">语言支持</h2>
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <label key={lang.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={languageSupport.includes(lang.value)}
                  onChange={(e) => handleLanguageSupportChange(lang.value, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{lang.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Starter Code Editor */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">初始代码</h2>
          
          {/* Language Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {languageSupport.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLanguage(lang)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLanguage === lang
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {languages.find((l) => l.value === lang)?.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="h-[300px] border border-gray-200 rounded-lg overflow-hidden">
            <Editor
              height="100%"
              language={activeLanguage}
              value={getStarterCodeForLanguage(activeLanguage)}
              onChange={(value) => updateStarterCode(activeLanguage, value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Test Cases */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">测试用例</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addTestCase}>
              <Plus className="w-4 h-4 mr-1" />
              添加测试用例
            </Button>
          </div>

          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    测试用例 {index + 1}
                  </span>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      输入
                    </label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) => updateTestCase(index, "input", e.target.value)}
                      placeholder="测试输入"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      期望输出
                    </label>
                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                      placeholder="期望输出"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testCase.isHidden}
                    onChange={(e) => updateTestCase(index, "isHidden", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">隐藏测试用例（考生不可见）</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={saving}
          >
            取消
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              "保存修改"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
