import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "motion/react";
import ErrorBoundary from "./ErrorBoundary";

const Scene3D = lazy(() => import("./Scene3D"));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

interface HeroProps {
  onNavigate: (section: string) => void;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero({ onNavigate }: HeroProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-20 px-4 md:px-8">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="animate-blob absolute -top-24 -right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="animate-blob-slow absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="animate-blob absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
      </div>

      {/* Real WebGL 3D scene (decorative, never blocks interaction) */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
          <ErrorBoundary
            fallback={
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            }
          >
            <Suspense fallback={null}>
              <Scene3D />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      <motion.div
        className="relative max-w-3xl mx-auto text-center space-y-6"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-primary px-4 py-1.5 rounded-full"
        >
          <img src="/cydia.png" alt="Cydia" className="w-5 h-5 rounded" /> CYDIA
          BACKEND
        </motion.span>

        <motion.h1
          variants={item}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-ink"
        >
          نبني منتجات رقمية عصرية
        </motion.h1>

        <motion.p
          variants={item}
          className="text-lg text-muted max-w-xl mx-auto leading-relaxed"
        >
          تطوير متكامل، ذكاء اصطناعي، وتصميم أنيق. من المتاجر الإلكترونية إلى لوحات
          التداول — نطلق تطبيقات جاهزة للإنتاج.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
        >
          <button
            onClick={() => onNavigate("work")}
            className="text-sm font-semibold border-2 border-primary text-primary px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-all"
          >
            شاهد أعمالنا
          </button>
          <button
            onClick={() => onNavigate("contact")}
            className="text-sm font-semibold bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            تواصل معنا
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
