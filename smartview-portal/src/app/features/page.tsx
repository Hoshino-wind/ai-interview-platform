import {
  Brain,
  Code2,
  Terminal,
  Users,
  Sparkles,
  Search,
  FileText,
  Zap,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Cpu,
  GitBranch,
  Lightbulb,
  Layers,
  Shield,
  Video,
  Database,
  Target,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// AI Scoring Dimensions
const scoringDimensions = [
  {
    title: "编码能力",
    weight: 25,
    icon: Code2,
    description: "代码正确性、质量、边界处理、复杂度分析",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "工程化思维",
    weight: 20,
    icon: Layers,
    description: "项目结构、模块化、可维护性、测试编写",
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "问题解决能力",
    weight: 15,
    icon: Lightbulb,
    description: "解题思路、调试能力、多方案对比",
    color: "from-amber-500 to-amber-600",
  },
];

// Coding Environment Features
const codingFeatures = [
  { icon: Terminal, text: "Monaco Editor（VS Code 同款）" },
  { icon: Code2, text: "支持 6 种语言（JS/TS/Python/Go/Java/C++/Rust）" },
  { icon: Shield, text: "Docker 沙箱安全执行" },
  { icon: Video, text: "编码过程完整录制" },
];

// Interviewer Scoring Dimensions
const interviewerDimensions = [
  { label: "技术深度", weight: 15, icon: Brain },
  { label: "沟通表达", weight: 10, icon: MessageSquare },
  { label: "综合素质", weight: 10, icon: BarChart3 },
  { label: "文化匹配", weight: 5, icon: Users },
];

const interviewerFeatures = [
  { icon: Sparkles, text: "AI 推荐追问问题" },
  { icon: Users, text: "多面试官协同评审" },
  { icon: FileText, text: "结构化评分卡" },
];

// Smart Matching Features
const matchingFeatures = [
  {
    icon: FileText,
    title: "简历 AI 解析",
    description: "智能提取简历关键信息，结构化候选人画像",
  },
  {
    icon: Target,
    title: "双向推荐",
    description: "岗位-候选人精准匹配，双向智能推荐",
  },
  {
    icon: BarChart3,
    title: "匹配度评分",
    description: "多维度匹配度量化评分，辅助决策",
  },
  {
    icon: Zap,
    title: "多渠道推送",
    description: "邮件、短信、站内信多渠道触达",
  },
];

// Open Exam Features
const openExamFeatures = [
  {
    icon: Search,
    title: "信息筛选能力",
    description: "在海量信息中快速定位关键知识点",
  },
  {
    icon: GitBranch,
    title: "问题拆解能力",
    description: "将复杂问题分解为可执行的子任务",
  },
  {
    icon: CheckCircle2,
    title: "最终交付质量",
    description: "关注结果导向，评估实际产出",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              产品特性
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              全方位 AI 驱动的技术面试解决方案
            </p>
          </div>
        </div>
      </section>

      {/* AI Scoring Engine Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              <span>AI 核心能力</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI 评分引擎
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              三维度全面评估候选人技术能力
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {scoringDimensions.map((dimension) => (
              <div
                key={dimension.title}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${dimension.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <dimension.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {dimension.title}
                </h3>
                <p className="text-gray-600 mb-6">{dimension.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">权重占比</span>
                    <span className="font-semibold text-gray-900">
                      {dimension.weight}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${dimension.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${dimension.weight * 2}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Online Coding Environment Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-medium mb-4">
                <Terminal className="w-4 h-4" />
                <span>开发环境</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                在线编码考试环境
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                专业的云端 IDE 体验，让候选人发挥真实水平
              </p>
              <div className="space-y-4">
                {codingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Editor Mockup */}
            <div className="relative">
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                {/* Editor Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-400">
                      solution.ts - SmartView Editor
                    </span>
                  </div>
                </div>
                {/* Editor Content */}
                <div className="p-4 font-mono text-sm">
                  <div className="flex">
                    <div className="text-gray-600 select-none pr-4 text-right">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    <div className="text-gray-300">
                      <div>
                        <span className="text-purple-400">function</span>{" "}
                        <span className="text-blue-400">twoSum</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-orange-400">nums</span>
                        <span className="text-gray-400">: </span>
                        <span className="text-teal-400">number</span>
                        <span className="text-gray-400">[], </span>
                        <span className="text-orange-400">target</span>
                        <span className="text-gray-400">: </span>
                        <span className="text-teal-400">number</span>
                        <span className="text-gray-400">)</span>
                        <span className="text-gray-400">: </span>
                        <span className="text-teal-400">number</span>
                        <span className="text-gray-400">[] {"{"}</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-purple-400">const</span>{" "}
                        <span className="text-white">map</span>{" "}
                        <span className="text-gray-400">=</span>{" "}
                        <span className="text-purple-400">new</span>{" "}
                        <span className="text-yellow-400">Map</span>
                        <span className="text-gray-400">{"<"}</span>
                        <span className="text-teal-400">number</span>
                        <span className="text-gray-400">, </span>
                        <span className="text-teal-400">number</span>
                        <span className="text-gray-400">{">"}();</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-purple-400">for</span>{" "}
                        <span className="text-gray-400">(</span>
                        <span className="text-purple-400">let</span>{" "}
                        <span className="text-white">i</span>{" "}
                        <span className="text-gray-400">=</span>{" "}
                        <span className="text-green-400">0</span>
                        <span className="text-gray-400">; i {"<"} </span>
                        <span className="text-white">nums</span>
                        <span className="text-gray-400">.</span>
                        <span className="text-white">length</span>
                        <span className="text-gray-400">; i++) {"{"}</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-purple-400">const</span>{" "}
                        <span className="text-white">complement</span>{" "}
                        <span className="text-gray-400">=</span>{" "}
                        <span className="text-white">target</span>{" "}
                        <span className="text-gray-400">-</span>{" "}
                        <span className="text-white">nums</span>
                        <span className="text-gray-400">[i];</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-purple-400">if</span>{" "}
                        <span className="text-gray-400">(</span>
                        <span className="text-white">map</span>
                        <span className="text-gray-400">.</span>
                        <span className="text-blue-400">has</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-white">complement</span>
                        <span className="text-gray-400">)) {"{"}</span>
                      </div>
                      <div className="pl-12">
                        <span className="text-purple-400">return</span>{" "}
                        <span className="text-gray-400">[</span>
                        <span className="text-white">map</span>
                        <span className="text-gray-400">.</span>
                        <span className="text-blue-400">get</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-white">complement</span>
                        <span className="text-gray-400">), i];</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-gray-400">{"}"}</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-gray-400">{"}"}</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-purple-400">return</span>{" "}
                        <span className="text-gray-400">[];</span>
                      </div>
                      <div>
                        <span className="text-gray-400">{"}"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Interviewer Assistant Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Scoring Card */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    结构化评分卡
                  </h3>
                </div>
                <div className="space-y-4">
                  {interviewerDimensions.map((dim) => (
                    <div
                      key={dim.label}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <dim.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{dim.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`w-4 h-4 rounded-sm ${
                                star <= 4
                                  ? "bg-amber-400"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-10 text-right">
                          {dim.weight}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI 推荐追问：请详细说明一下这个算法的空间复杂度优化思路</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full text-amber-600 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                <span>面试官工具</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                面试官智能辅助
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                AI 赋能面试官，提升评估效率和准确性
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {interviewerFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 bg-amber-50 rounded-xl text-center"
                  >
                    <feature.icon className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                    <span className="text-sm font-medium text-gray-800">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Matching Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-blue-600 text-sm font-medium mb-4 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>智能匹配</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI 智能匹配
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              让合适的候选人遇见合适的岗位
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {matchingFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Exam Philosophy Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-600 text-sm font-medium mb-4">
                <Rocket className="w-4 h-4" />
                <span>创新理念</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                开放式考试，考察真实能力
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                允许使用搜索引擎、文档、AI 工具，模拟真实工作场景
              </p>
              <div className="space-y-4">
                {openExamFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 p-4 bg-green-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Video className="w-4 h-4 text-blue-500" />
                  <span>编码过程录制 + 面试追问双重验证机制</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    真实工作场景模拟
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-green-700 text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>允许使用</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Search, label: "搜索引擎" },
                    { icon: FileText, label: "技术文档" },
                    { icon: Cpu, label: "AI 辅助工具" },
                    { icon: Database, label: "Stack Overflow" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <item.icon className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{item.label}</span>
                      <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center text-sm text-gray-500">
                    重点考察信息筛选、问题拆解和最终交付质量
                  </div>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-200 rounded-full blur-3xl opacity-40" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            准备好提升您的技术招聘效率了吗？
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            立即体验 SmartView 的全方位 AI 面试解决方案
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/register">免费开始使用</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">查看定价方案</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
