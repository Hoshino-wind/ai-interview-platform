"use client";

import { motion } from "framer-motion";
import {
  Brain, Code2, Terminal, Users, Sparkles, Search, FileText, Zap, MessageSquare,
  BarChart3, CheckCircle2, Cpu, GitBranch, Lightbulb, Layers, Shield, Video, Database, Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const scoringDimensions = [
  { title: "编码能力", weight: 25, icon: Code2, description: "代码正确性、质量、边界处理、复杂度分析", color: "text-syntax-function" },
  { title: "工程化思维", weight: 20, icon: Layers, description: "项目结构、模块化、可维护性、测试编写", color: "text-syntax-keyword" },
  { title: "问题解决能力", weight: 15, icon: Lightbulb, description: "解题思路、调试能力、多方案对比", color: "text-syntax-number" },
];

const codingFeatures = [
  { icon: Terminal, text: "Monaco Editor（VS Code 同款）" },
  { icon: Code2, text: "支持 6 种语言（JS/TS/Python/Go/Java/C++/Rust）" },
  { icon: Shield, text: "Docker 沙箱安全执行" },
  { icon: Video, text: "编码过程完整录制" },
];

const interviewerDimensions = [
  { label: "技术深度", weight: 15, icon: Brain },
  { label: "沟通表达", weight: 10, icon: MessageSquare },
  { label: "综合素质", weight: 10, icon: BarChart3 },
  { label: "文化匹配", weight: 5, icon: Users },
];

const matchingFeatures = [
  { icon: FileText, title: "简历 AI 解析", description: "智能提取简历关键信息，结构化候选人画像" },
  { icon: Target, title: "双向推荐", description: "岗位-候选人精准匹配，双向智能推荐" },
  { icon: BarChart3, title: "匹配度评分", description: "多维度匹配度量化评分，辅助决策" },
  { icon: Zap, title: "多渠道推送", description: "邮件、短信、站内信多渠道触达" },
];

const openExamFeatures = [
  { icon: Search, title: "信息筛选能力", description: "在海量信息中快速定位关键知识点" },
  { icon: GitBranch, title: "问题拆解能力", description: "将复杂问题分解为可执行的子任务" },
  { icon: CheckCircle2, title: "最终交付质量", description: "关注结果导向，评估实际产出" },
];

const SectionTag = ({ children }: { children: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary text-muted-foreground text-sm font-mono mb-6"
  >
    {children}
  </motion.div>
);

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <SectionTag>{"// features"}</SectionTag>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              产品<span className="text-primary">特性</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground">
              全方位 AI 驱动的技术面试解决方案
            </motion.p>
          </div>
        </div>
      </section>

      {/* AI Scoring */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionTag>{"// ai-scoring"}</SectionTag>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              AI 评分引擎
            </motion.h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">三维度全面评估候选人技术能力</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {scoringDimensions.map((dim, i) => (
              <motion.div key={dim.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group card-glow rounded-xl p-8">
                <div className={`w-14 h-14 rounded-lg bg-secondary flex items-center justify-center mb-6 ${dim.color}`}>
                  <dim.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-mono mb-3">{dim.title}</h3>
                <p className="text-muted-foreground mb-6">{dim.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">权重占比</span>
                    <span className="font-mono font-semibold text-foreground">{dim.weight}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${dim.weight * 2}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coding Environment */}
      <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionTag>{"// coding-env"}</SectionTag>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">在线编码考试环境</h2>
              <p className="text-lg text-muted-foreground mb-8">专业的云端 IDE 体验，让候选人发挥真实水平</p>
              <div className="space-y-3">
                {codingFeatures.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
                    <div className="w-10 h-10 rounded-lg bg-syntax-keyword/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-syntax-keyword" />
                    </div>
                    <span className="text-foreground font-medium text-sm">{f.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
              <div className="relative card-glow rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-syntax-number/60" />
                    <div className="w-3 h-3 rounded-full bg-syntax-string/60" />
                  </div>
                  <span className="flex-1 text-center text-xs text-muted-foreground font-mono">solution.ts</span>
                </div>
                <div className="p-4 bg-card font-mono text-sm leading-relaxed">
                  <div><span className="text-syntax-keyword">function</span> <span className="text-syntax-function">twoSum</span><span className="text-muted-foreground">(nums: number[], target: number): number[] {"{"}</span></div>
                  <div className="pl-4"><span className="text-syntax-keyword">const</span> <span className="text-foreground">map</span> = <span className="text-syntax-keyword">new</span> <span className="text-syntax-function">Map</span><span className="text-muted-foreground">&lt;number, number&gt;();</span></div>
                  <div className="pl-4"><span className="text-syntax-keyword">for</span> <span className="text-muted-foreground">(let i = 0; i &lt; nums.length; i++) {"{"}</span></div>
                  <div className="pl-8"><span className="text-syntax-keyword">const</span> <span className="text-foreground">complement</span> = target - nums[i];</div>
                  <div className="pl-8"><span className="text-syntax-keyword">if</span> (map.has(complement)) {"{"}</div>
                  <div className="pl-12"><span className="text-syntax-keyword">return</span> [map.get(complement)!, i];</div>
                  <div className="pl-8">{"}"}</div>
                  <div className="pl-8">map.set(nums[i], i);</div>
                  <div className="pl-4">{"}"}</div>
                  <div className="pl-4"><span className="text-syntax-keyword">return</span> [];</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interviewer Assistant */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="card-glow rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-syntax-number/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-syntax-number" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-mono">结构化评分卡</h3>
                </div>
                <div className="space-y-3">
                  {interviewerDimensions.map((dim) => (
                    <div key={dim.label} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <dim.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground text-sm">{dim.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((s) => (
                            <div key={s} className={`w-3 h-3 rounded-sm ${s <= 4 ? "bg-syntax-number" : "bg-muted"}`} />
                          ))}
                        </div>
                        <span className="text-sm font-mono font-medium text-foreground w-10 text-right">{dim.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-syntax-number" />
                    <span>AI 推荐追问：请详细说明一下这个算法的空间复杂度优化思路</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="order-1 lg:order-2">
              <SectionTag>{"// interviewer-tools"}</SectionTag>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">面试官智能辅助</h2>
              <p className="text-lg text-muted-foreground mb-8">AI 赋能面试官，提升评估效率和准确性</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Sparkles, text: "AI 推荐追问" },
                  { icon: Users, text: "多面试官协同" },
                  { icon: FileText, text: "结构化评分卡" },
                ].map((f, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-lg text-center border border-border">
                    <f.icon className="w-8 h-8 text-syntax-number mx-auto mb-3" />
                    <span className="text-sm font-medium text-foreground">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Matching */}
      <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionTag>{"// matching"}</SectionTag>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">AI 智能匹配</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">让合适的候选人遇见合适的岗位</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {matchingFeatures.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card-glow rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-mono mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Exam */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionTag>{"// open-exam"}</SectionTag>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">开放式考试，考察真实能力</h2>
              <p className="text-lg text-muted-foreground mb-8">允许使用搜索引擎、文档、AI 工具，模拟真实工作场景</p>
              <div className="space-y-3">
                {openExamFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-4 p-4 bg-secondary rounded-lg border border-border">
                    <div className="w-10 h-10 rounded-lg bg-syntax-string/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-syntax-string" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{f.title}</h4>
                      <p className="text-muted-foreground text-sm">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="w-4 h-4 text-syntax-function" />
                  <span>编码过程录制 + 面试追问双重验证机制</span>
                </div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
              <div className="card-glow rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground font-mono">真实工作场景模拟</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-syntax-string/10 rounded-full text-syntax-string text-xs font-mono">
                    <CheckCircle2 className="w-3 h-3" /> 允许使用
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Search, label: "搜索引擎" },
                    { icon: FileText, label: "技术文档" },
                    { icon: Cpu, label: "AI 辅助工具" },
                    { icon: Database, label: "Stack Overflow" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground text-sm">{item.label}</span>
                      <CheckCircle2 className="w-4 h-4 text-syntax-string ml-auto" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground font-mono">
                  重点考察信息筛选、问题拆解和最终交付质量
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            准备好提升您的<span className="text-primary">技术招聘效率</span>了吗？
          </h2>
          <p className="text-xl text-muted-foreground mb-8">立即体验 SmartView 的全方位 AI 面试解决方案</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="glow" size="lg" asChild><Link href="/register">免费开始使用</Link></Button>
            <Button variant="outline" size="lg" asChild><Link href="/pricing">查看定价方案</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
