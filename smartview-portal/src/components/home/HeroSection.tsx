import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 lg:py-32">
      {/* Abstract geometric background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-blue-300 blur-3xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            新时代 AI 驱动面试平台
          </h1>
          
          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            AI 智能评分 + 面试官专业判断，让技术面试更科学、更高效、更公平
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                免费试用
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                预约演示
              </Button>
            </Link>
          </div>
        </div>

        {/* Product mockup */}
        <div className="mt-16 lg:mt-20">
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect behind mockup */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-30" />
            
            {/* Mockup container */}
            <div className="relative rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
              {/* Mockup header - window controls */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-400">智面 SmartView - 在线编码面试</span>
                </div>
              </div>
              
              {/* Mockup content - code editor style */}
              <div className="p-6 bg-slate-900 min-h-[300px]">
                <div className="flex gap-6">
                  {/* Sidebar */}
                  <div className="hidden sm:block w-48 space-y-3">
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-700 rounded w-5/6" />
                    <div className="mt-6 h-20 bg-slate-800 rounded border border-slate-700" />
                  </div>
                  
                  {/* Code area */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <span className="text-blue-400">function</span>
                      <span className="text-yellow-400">twoSum</span>
                      <span>(nums, target)</span>
                      <span>{"{"}</span>
                    </div>
                    <div className="pl-4 text-slate-300 text-sm">
                      <span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> Map();
                    </div>
                    <div className="pl-4 text-slate-300 text-sm">
                      <span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = 0; i &lt; nums.length; i++) {"{"}
                    </div>
                    <div className="pl-8 text-slate-300 text-sm">
                      <span className="text-purple-400">const</span> complement = target - nums[i];
                    </div>
                    <div className="pl-8 text-slate-300 text-sm">
                      <span className="text-purple-400">if</span> (map.has(complement)) {"{"}
                    </div>
                    <div className="pl-12 text-slate-300 text-sm">
                      <span className="text-purple-400">return</span> [map.get(complement), i];
                    </div>
                    <div className="pl-8 text-slate-300 text-sm">{"}"}</div>
                    <div className="pl-8 text-slate-300 text-sm">
                      map.set(nums[i], i);
                    </div>
                    <div className="pl-4 text-slate-300 text-sm">{"}"}</div>
                    <div className="text-slate-300 text-sm">{"}"}</div>
                  </div>
                </div>
                
                {/* AI Score indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-200">AI 评分中: 92/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
