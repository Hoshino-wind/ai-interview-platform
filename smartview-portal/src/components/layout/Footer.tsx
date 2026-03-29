import Link from "next/link";
import { Brain, Mail, MapPin } from "lucide-react";
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
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top Section - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo & Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">{SITE_NAME}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {SITE_DESCRIPTION}，为企业提供高效、智能的面试解决方案。
            </p>
          </div>

          {/* Column 2: Products */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              产品
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              公司
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              联系方式
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:contact@smartview.ai"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  contact@smartview.ai
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  北京市海淀区中关村科技园
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 {SITE_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                服务条款
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                隐私政策
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
