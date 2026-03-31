import { Button } from "@/components/ui/Button";
import {
  Target,
  Rocket,
  CheckCircle,
  Code,
  BarChart3,
  Zap,
  Monitor,
  Shield,
  Brain,
  Server,
  Lock,
  User,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* // Hero Section */}
      <section className="relative bg-grid opacity-30 py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-mono text-foreground mb-6">
            关于智面
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            用 AI 重新定义技术面试
          </p>
        </div>
      </section>

      {/* // Vision & Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Vision */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono text-foreground mb-4">
                  我们的愿景
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  打造 AI 深度参与评分的智能面试平台，将 AI 自动评测与面试官人工评价有机结合，实现面试评价的标准化、智能化和高效化。
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Rocket className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono text-foreground mb-4">
                  我们的使命
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  用 AI 量化技术能力，减少主观偏差，提升面试效率和准确性
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* // Problems We Solve Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-mono text-foreground mb-4">
              我们解决的问题
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              针对技术面试中的核心痛点，提供专业的解决方案
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-2">
                面试评价主观
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">→</span>
                <span className="text-sm font-medium text-primary">
                  AI 客观基线
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                通过 AI 提供标准化的评分基准，减少人为因素带来的偏差
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-2">
                难以评估 coding 能力
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">→</span>
                <span className="text-sm font-medium text-primary">
                  在线编码 + 沙箱测试
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                提供真实的编程环境，支持代码编写、运行和自动化测试
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-2">
                工程化思维难量化
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">→</span>
                <span className="text-sm font-medium text-primary">
                  多维度结构化评审
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                从代码质量、架构设计、问题解决等多维度评估候选人能力
              </p>
            </div>

            {/* Problem 4 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-2">
                面试效率低
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">→</span>
                <span className="text-sm font-medium text-primary">
                  AI 自动筛选
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI 自动进行初筛，让面试官专注于高价值的技术交流
              </p>
            </div>

            {/* Problem 5 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                <Monitor className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-2">
                脱离真实工作场景
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">→</span>
                <span className="text-sm font-medium text-primary">
                  开放式考试环境
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                模拟真实开发环境，允许查阅文档，考察实际工作能力
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* // Core Team Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-mono text-foreground mb-4">
              核心团队
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              一群热爱技术、致力于改变面试体验的产品和技术专家
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-8 text-center border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-24 h-24 bg-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold font-mono text-foreground mb-1">
                  团队成员 {i}
                </h3>
                <p className="text-muted-foreground text-sm">职位占位</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* // Tech Advantages Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-mono text-foreground mb-4">
              技术优势
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              先进的技术架构，保障平台的安全、稳定和高效
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Advantage 1 */}
            <div className="bg-card rounded-2xl p-8 text-center border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-3">
                安全沙箱隔离
              </h3>
              <p className="text-muted-foreground text-sm">
                代码执行环境完全隔离，保障系统安全和数据隐私
              </p>
            </div>

            {/* Advantage 2 */}
            <div className="bg-card rounded-2xl p-8 text-center border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-3">
                多 LLM 支持
              </h3>
              <p className="text-muted-foreground text-sm">
                支持多种大语言模型，灵活选择最适合的 AI 引擎
              </p>
            </div>

            {/* Advantage 3 */}
            <div className="bg-card rounded-2xl p-8 text-center border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Server className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-3">
                微服务架构
              </h3>
              <p className="text-muted-foreground text-sm">
                高可用、可扩展的微服务架构，支持业务快速迭代
              </p>
            </div>

            {/* Advantage 4 */}
            <div className="bg-card rounded-2xl p-8 text-center border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold font-mono text-foreground mb-3">
                数据加密保护
              </h3>
              <p className="text-muted-foreground text-sm">
                全链路数据加密，符合企业级安全合规要求
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* // CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-foreground mb-6">
            准备好提升您的面试体验了吗？
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            立即开始使用智面，让 AI 助力您的技术招聘
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="glow" size="lg">免费试用</Button>
            <Button variant="outline" size="lg">
              联系我们
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
