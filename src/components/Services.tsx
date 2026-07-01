const SERVICES = [
  { title: "تطبيقات ويب وجوال", desc: "تطبيقات كاملة بـ React و Next.js وتطبيقات جوال بهندسة حديثة وكود نظيف." },
  { title: "ذكاء اصطناعي", desc: "ميزات LLM، وكلاء ذكاء اصطناعي، وأتمتة ذكية لمنتجاتك." },
  { title: "متاجر إلكترونية", desc: "متاجر كاملة مع بوابات دفع، مخزون، وربط شحن." },
  { title: "لوحات بيانات", desc: "تصور بيانات حية، محطات تداول، ومنصات تحليلات." },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full">خدماتنا</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e22] mt-4">ماذا نقدم</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-[#d4e2d8]">
              <h3 className="font-bold text-[#1a2e22]">{s.title}</h3>
              <p className="text-sm text-[#5a7a63] mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
