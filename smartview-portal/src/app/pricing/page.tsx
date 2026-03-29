import { Check, HelpCircle, Sparkles, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// Pricing Plans
const pricingPlans = [
  {
    name: "基础版",
    price: "¥0",
    period: "/月",
    description: "个人或小团队试用",
    icon: User,
    popular: false,
    features: [
      "5 次考试/月",
      "基础 AI 评分报告",
      "1 个面试官账号",
      "3 道题库题目",
      "邮件通知",
    ],
    cta: "免费开始",
    ctaVariant: "outline" as const,
  },
  {
    name: "专业版",
    price: "¥999",
    period: "/月",
    description: "成长型技术团队",
    icon: Sparkles,
    popular: true,
    features: [
      "无限考试次数",
      "完整 AI 评分报告",
      "5 个面试官账号",
      "完整题库访问",
      "数据看板",
      "编码行为分析",
      "优先技术支持",
    ],
    cta: "立即购买",
    ctaVariant: "primary" as const,
  },
  {
    name: "企业版",
    price: "联系销售",
    period: "",
    description: "大型企业",
    icon: Building2,
    popular: false,
    features: [
      "所有专业版功能",
      "私有化部署",
      "自定义评分权重",
      "无限用户",
      "API 集成",
      "专属客户经理",
      "SLA 保障",
    ],
    cta: "联系销售",
    ctaVariant: "outline" as const,
  },
];

// FAQ Items
const faqItems = [
  {
    question: "可以随时升级或降级吗？",
    answer:
      "是的，您可以随时根据团队需求升级或降级您的方案。升级后立即生效，降级将在当前计费周期结束后生效。",
  },
  {
    question: "是否支持私有化部署？",
    answer:
      "企业版支持私有化部署，可以将系统部署在您自己的服务器或私有云环境中，确保数据完全自主可控。",
  },
  {
    question: "数据安全如何保障？",
    answer:
      "我们采用银行级加密技术，所有数据传输使用 TLS 1.3 加密，存储数据采用 AES-256 加密。同时通过 ISO 27001 和 SOC 2 认证，确保您的数据安全。",
  },
  {
    question: "免费版有什么限制？",
    answer:
      "免费版每月可使用 5 次考试，包含基础 AI 评分功能和 1 个面试官账号。适合个人开发者或小团队试用体验。",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              选择适合您的方案
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              灵活定价，按需选择
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "bg-white border-2 border-blue-500 shadow-lg scale-105 z-10"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-md">
                      <Sparkles className="w-4 h-4" />
                      <span>推荐</span>
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      plan.popular
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <plan.icon
                      className={`w-7 h-7 ${
                        plan.popular ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500">{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.popular ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            plan.popular ? "text-blue-600" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.ctaVariant}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href={plan.name === "企业版" ? "/contact" : "/register"}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 text-sm font-medium mb-4 shadow-sm">
              <HelpCircle className="w-4 h-4" />
              <span>常见问题</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              您可能想了解的
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            还有疑问？
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            我们的团队随时为您解答，帮助您找到最适合的方案
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">联系我们</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/features">了解产品特性</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
