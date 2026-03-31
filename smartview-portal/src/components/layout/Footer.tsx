import Link from "next/link";
import { Terminal, Mail, MapPin } from "lucide-react";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

const productLinks = [
  { label: "在线考试", href: "#" },
  { label: "AI 评分", href: "#" },
  { label: "智能匹配", href: "#" },
  { label: "题库管理", href: "#" },
];

const companyLinks = [
  { label: "关于我们", href: "/about" },
  { label: "联系我们", href: "/contact" },
  { label: "加入我们", href: "#" },
  { label: "隐私政策", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-mono text-foreground">{SITE_NAME}</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {SITE_DESCRIPTION}，为企业提供高效、智能的面试解决方案。
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-4">
              产品
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-4">
              公司
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-4">
              联系方式
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <a href="mailto:contact@smartview.ai" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  contact@smartview.ai
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">北京市海淀区中关村科技园</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-gradient mt-12 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm font-mono">
            &copy; 2026 {SITE_NAME}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              服务条款
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
