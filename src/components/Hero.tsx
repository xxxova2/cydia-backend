interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center pt-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <span className="inline-block text-xs font-semibold text-white bg-primary px-4 py-1.5 rounded-full">
          <img src="/cydia.png" alt="Cydia" className="w-5 h-5 rounded" /> CYDIA BACKEND
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#1a2e22]">
          نبني منتجات رقمية عصرية
        </h1>

        <p className="text-lg text-[#5a7a63] max-w-xl mx-auto leading-relaxed">
          تطوير متكامل، ذكاء اصطناعي، وتصميم أنيق. من المتاجر الإلكترونية إلى لوحات التداول — نطلق تطبيقات جاهزة للإنتاج.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => onNavigate("work")}
            className="text-sm font-semibold border-2 border-primary text-primary px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-all"
          >
            شاهد أعمالنا
          </button>
          <button
            onClick={() => onNavigate("contact")}
            className="text-sm font-semibold bg-primary text-white px-8 py-3 rounded-full hover:bg-[#2d6b46] transition-all shadow-lg"
          >
            تواصل معنا
          </button>
        </div>
      </div>
    </section>
  );
}
