import { motion } from "motion/react";
import Reveal from "./Reveal";

const SERVICES = [
  {
    title: "تطبيقات ويب وجوال",
    desc: "تطبيقات كاملة بـ React و Next.js وتطبيقات جوال بهندسة حديثة وكود نظيف.",
  },
  {
    title: "ذكاء اصطناعي",
    desc: "ميزات LLM، وكلاء ذكاء اصطناعي، وأتمتة ذكية لمنتجاتك.",
  },
  {
    title: "متاجر إلكترونية",
    desc: "متاجر كاملة مع بوابات دفع، مخزون، وربط شحن.",
  },
  {
    title: "لوحات بيانات",
    desc: "تصور بيانات حية، محطات تداول، ومنصات تحليلات.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-4 md:px-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full">
            خدماتنا
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mt-4">
            ماذا نقدم
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 12px 30px color-mix(in srgb, var(--c-primary) 18%, transparent)" }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="h-full bg-surface/70 backdrop-blur-xl rounded-xl p-6 shadow-md border border-border"
              >
                <h3 className="font-bold text-ink">{s.title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
