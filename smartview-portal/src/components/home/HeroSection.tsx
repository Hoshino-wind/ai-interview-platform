"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play } from "lucide-react";

const codeLines = [
  { indent: 0, tokens: [{ text: "function ", color: "text-syntax-keyword" }, { text: "evaluateCandidate", color: "text-syntax-function" }, { text: "(submission) {", color: "text-foreground" }] },
  { indent: 1, tokens: [{ text: "const ", color: "text-syntax-keyword" }, { text: "metrics", color: "text-foreground" }, { text: " = ", color: "text-foreground" }, { text: "analyzeCode", color: "text-syntax-function" }, { text: "(submission);", color: "text-foreground" }] },
  { indent: 1, tokens: [{ text: "const ", color: "text-syntax-keyword" }, { text: "score", color: "text-foreground" }, { text: " = {", color: "text-foreground" }] },
  { indent: 2, tokens: [{ text: "correctness", color: "text-syntax-string" }, { text: ": metrics.tests,", color: "text-foreground" }] },
  { indent: 2, tokens: [{ text: "engineering", color: "text-syntax-string" }, { text: ": metrics.structure,", color: "text-foreground" }] },
  { indent: 2, tokens: [{ text: "performance", color: "text-syntax-string" }, { text: ": metrics.bigO,", color: "text-foreground" }] },
  { indent: 1, tokens: [{ text: "};", color: "text-foreground" }] },
  { indent: 1, tokens: [{ text: "return ", color: "text-syntax-keyword" }, { text: "generateReport", color: "text-syntax-function" }, { text: "(score);", color: "text-foreground" }] },
  { indent: 0, tokens: [{ text: "}", color: "text-foreground" }] },
];

function TypingCode() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => (prev < codeLines.length ? prev + 1 : prev));
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-sm leading-relaxed">
      {codeLines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={i < visibleLines ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex"
          style={{ paddingLeft: `${line.indent * 1.5}rem` }}
        >
          {i < visibleLines &&
            line.tokens.map((token, j) => (
              <span key={j} className={token.color}>{token.text}</span>
            ))}
        </motion.div>
      ))}
      {visibleLines < codeLines.length && (
        <span className="inline-block w-2 h-5 bg-primary animate-typing-cursor ml-1" />
      )}
    </div>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const handleMouse = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      section.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    section.addEventListener("mousemove", handleMouse);
    return () => section.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-background spotlight"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-syntax-keyword/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-mono mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
              AI-Powered Interview Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              <span className="font-mono text-primary">{">"}</span> 新时代
              <br />
              <span className="text-primary">AI 驱动</span>
              <br />
              面试平台
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              AI 智能评分 + 面试官专业判断，让技术面试更科学、更高效、更公平。
              从代码质量到工程思维，全方位评估候选人能力。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button variant="glow" size="lg" asChild>
                <Link href="/register" className="gap-2">
                  免费开始 <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/features" className="gap-2">
                  <Play className="w-4 h-4" /> 了解更多
                </Link>
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex gap-8"
            >
              {[
                { value: "75%+", label: "评分准确率" },
                { value: "500+", label: "并发支持" },
                { value: "4.0", label: "满意度" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold font-mono text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Code Editor Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Glow behind editor */}
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />

            <div className="relative card-glow rounded-xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-syntax-number/60" />
                  <div className="w-3 h-3 rounded-full bg-syntax-string/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">evaluate.ts</span>
                </div>
              </div>

              {/* Code content */}
              <div className="p-6 bg-card min-h-[320px]">
                <TypingCode />
              </div>

              {/* AI Score indicator */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
                <span className="text-xs text-primary font-mono">AI 评分: 92/100</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
