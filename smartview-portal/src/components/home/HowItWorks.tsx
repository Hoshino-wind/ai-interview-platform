"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Monitor, Cpu, CheckCircle } from "lucide-react";

const steps = [
  { number: 1, icon: Briefcase, title: "发布岗位", description: "HR 发布技术岗位需求，系统智能匹配候选人", color: "text-syntax-function" },
  { number: 2, icon: Monitor, title: "在线编码考试", description: "候选人在真实编码环境中完成挑战", color: "text-syntax-string" },
  { number: 3, icon: Cpu, title: "AI 自动评分", description: "AI 引擎多维度分析代码质量与能力", color: "text-primary" },
  { number: 4, icon: CheckCircle, title: "综合决策", description: "面试官结合 AI 报告做出科学决策", color: "text-syntax-keyword" },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 lg:py-28 bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground text-sm font-mono mb-6"
          >
            {"// workflow"}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            如何运作？
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            简单四步，开启智能化技术面试之旅
          </motion.p>
        </div>

        <div ref={ref} className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full origin-left"
              style={{ background: "linear-gradient(90deg, transparent, var(--primary), transparent)" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-border shadow-sm">
                      <Icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-foreground font-mono">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    {step.description}
                  </p>

                  {index < steps.length - 1 && (
                    <div className="lg:hidden mt-6 mb-2 flex items-center justify-center">
                      <div className="h-8 w-px bg-border" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
