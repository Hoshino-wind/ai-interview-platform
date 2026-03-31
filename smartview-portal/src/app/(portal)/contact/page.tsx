"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("感谢您的留言！我们会尽快与您联系。");
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <main className="min-h-screen">
      {/* // Hero Section */}
      <section className="relative bg-grid opacity-30 py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-mono text-foreground mb-6">
            联系我们
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            有任何问题？我们很乐意为您解答
          </p>
        </div>
      </section>

      {/* // Contact Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
            {/* // Left Column - Contact Form */}
            <div className="bg-card rounded-2xl p-8 lg:p-10 border border-border shadow-sm">
              <h2 className="text-2xl font-bold font-mono text-foreground mb-6">
                发送消息
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-muted-foreground mb-2"
                  >
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors bg-card text-foreground"
                    placeholder="请输入您的姓名"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-muted-foreground mb-2"
                  >
                    邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors bg-card text-foreground"
                    placeholder="请输入您的邮箱"
                  />
                </div>

                {/* Company Input */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-muted-foreground mb-2"
                  >
                    公司名称 <span className="text-muted-foreground/50">(可选)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors bg-card text-foreground"
                    placeholder="请输入您的公司名称"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-muted-foreground mb-2"
                  >
                    消息 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none bg-card text-foreground"
                    placeholder="请输入您想咨询的内容"
                  />
                </div>

                {/* Submit Button */}
                <Button variant="glow" type="submit" size="lg" className="w-full">
                  提交
                </Button>
              </form>
            </div>

            {/* // Right Column - Contact Info */}
            <div className="lg:pl-8">
              <h2 className="text-2xl font-bold font-mono text-foreground mb-8">
                联系信息
              </h2>
              <div className="space-y-8">
                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-mono text-foreground mb-1">
                      邮箱
                    </h3>
                    <p className="text-muted-foreground">contact@smartview.ai</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-mono text-foreground mb-1">
                      电话
                    </h3>
                    <p className="text-muted-foreground">400-888-8888</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-mono text-foreground mb-1">
                      地址
                    </h3>
                    <p className="text-muted-foreground">北京市海淀区中关村大街 1 号</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-mono text-foreground mb-1">
                      工作时间
                    </h3>
                    <p className="text-muted-foreground">周一至周五 9:00-18:00</p>
                  </div>
                </div>
              </div>

              {/* // Map Placeholder */}
              <div className="mt-12">
                <div className="bg-secondary rounded-2xl h-64 flex items-center justify-center border border-border">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">地图位置占位</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
