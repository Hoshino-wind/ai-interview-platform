import { Brain, Code, Settings, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 混合评分",
    description: "AI 60% + 面试官 40% 混合评分机制，客观与主观完美结合",
  },
  {
    icon: Code,
    title: "在线编码环境",
    description: "Monaco Editor 集成，支持多语言，Docker 沙箱安全执行",
  },
  {
    icon: Settings,
    title: "工程化思维评估",
    description: "不只看算法，更评估项目结构、模块化、测试编写等工程能力",
  },
  {
    icon: Users,
    title: "智能匹配推荐",
    description: "AI 简历解析 + 岗位智能匹配，让人才与机会精准对接",
  },
];

export default function FeaturesOverview() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            为什么选择智面？
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            融合前沿 AI 技术与专业面试经验，打造下一代技术面试解决方案
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Icon container */}
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
