"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Code, Settings, Users, Sparkles, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 混合评分",
    description: "AI 60% + 面试官 40% 混合评分机制，客观与主观完美结合，消除单一维度偏见",
    accent: "text-syntax-keyword",
    accentBg: "bg-syntax-keyword/10",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    icon: Code,
    title: "在线编码环境",
    description: "Monaco Editor 集成，支持多语言，Docker 沙箱安全执行",
    accent: "text-syntax-string",
    accentBg: "bg-syntax-string/10",
    span: "lg:col-span-1",
  },
  {
    icon: Shield,
    title: "安全沙箱",
    description: "隔离执行环境，防作弊监控，保障考试公平性",
    accent: "text-syntax-function",
    accentBg: "bg-syntax-function/10",
    span: "lg:col-span-1",
  },
  {
    icon: Settings,
    title: "工程化思维评估",
    description: "不只看算法，更评估项目结构、模块化、测试编写等工程能力",
    accent: "text-syntax-number",
    accentBg: "bg-syntax-number/10",
    span: "lg:col-span-1",
  },
  {
    icon: Users,
    title: "智能匹配推荐",
    description: "AI 简历解析 + 岗位智能匹配，让人才与机会精准对接",
    accent: "text-primary",
    accentBg: "bg-primary/10",
    span: "lg:col-span-1",
  },
  {
    icon: Sparkles,
    title: "一键出题",
    description: "AI 根据简历和岗位自动生成个性化面试题，覆盖多维度考察点",
    accent: "text-syntax-keyword",
    accentBg: "bg-syntax-keyword/10",
    span: "lg:col-span-2",
  },
];

export default function FeaturesOverview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary text-muted-foreground text-sm font-mono mb-6"
          >
            {"// features"}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            为什么选择<span className="text-primary">智面</span>？
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            融合前沿 AI 技术与专业面试经验，打造下一代技术面试解决方案
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative rounded-xl border border-border bg-card p-6 lg:p-8 transition-all duration-300 hover:border-primary/30 ${feature.span}`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                  style={{ background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glow), transparent 40%)" }}
                />

                {/* Icon */}
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.accentBg} ${feature.accent} transition-shadow group-hover:shadow-glow`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-foreground font-mono">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
