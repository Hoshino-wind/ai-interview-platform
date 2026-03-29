const stats = [
  {
    value: "75%+",
    label: "评分准确率",
  },
  {
    value: "30%+",
    label: "招聘效率提升",
  },
  {
    value: "4.0/5.0",
    label: "候选人满意度",
  },
  {
    value: "500+",
    label: "支持并发考试",
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="mt-2 text-base sm:text-lg text-blue-100">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
