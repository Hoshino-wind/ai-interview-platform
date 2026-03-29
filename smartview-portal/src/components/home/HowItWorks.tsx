import { Briefcase, Monitor, Cpu, CheckCircle } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Briefcase,
    title: "发布岗位",
    description: "HR 发布技术岗位需求",
  },
  {
    number: 2,
    icon: Monitor,
    title: "在线编码考试",
    description: "候选人在真实编码环境中完成挑战",
  },
  {
    number: 3,
    icon: Cpu,
    title: "AI 自动评分",
    description: "AI 引擎多维度分析代码质量与能力",
  },
  {
    number: 4,
    icon: CheckCircle,
    title: "综合决策",
    description: "面试官结合 AI 报告做出科学决策",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            如何运作？
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            简单四步，开启智能化技术面试之旅
          </p>
        </div>

        {/* Steps container */}
        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600" />

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={index} className="relative flex flex-col items-center text-center">
                  {/* Step number circle with icon */}
                  <div className="relative z-10 mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg border-2 border-blue-100">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    {/* Number badge */}
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
                      {step.number}
                    </div>
                  </div>

                  {/* Step content */}
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 max-w-xs">
                    {step.description}
                  </p>

                  {/* Mobile arrow - hidden on desktop */}
                  {!isLast && (
                    <div className="lg:hidden mt-6 mb-2">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-0.5 bg-blue-300" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
