import { ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Reveal from "./Reveal";

const PROJECTS = [
  {
    title: "Wodoh Alroya",
    desc: "موقع شركة وضوح الرؤية للدعاية والإعلان — منصة متكاملة لاستعراض الخدمات والأعمال منذ 2009.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    link: "https://wodoh-alroya.vercel.app/",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&auto=format&fit=crop",
  },
  {
    title: "Rehab Store",
    desc: "متجر أزياء نسائية كامل مع Next.js — واجهة عربية وإنجليزية، دفع، وسلة مشتريات.",
    tags: ["Next.js", "TypeScript", "Google Apps Script"],
    repo: "https://github.com/xxxova2/rehab-shop-zcode",
    link: "https://rehab-store-1a87c.web.app",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
  },
  {
    title: "Nemow Logistics",
    desc: "منصة لوجستية متكاملة لتتبع الشحنات وإدارة الأسطول وتحسين المسارات.",
    tags: ["Next.js", "Python", "FastAPI"],
    repo: "https://github.com/xxxova2/nemow-logistics",
    link: "https://www.nemow.net/ar",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop",
  },
  {
    title: "SPY IV 3D Surface",
    desc: "محطة تصور ثلاثي الأبعاد لتقلبات الخيارات المالية — رسوم بيانية حية و Greeks.",
    tags: ["React", "Plotly.js", "WebGL", "Express"],
    repo: "https://github.com/xxxova2/SPY-IV-3D-Surface",
    image:
      "https://raw.githubusercontent.com/xxxova2/SPY-IV-3D-Surface/main/public/screenshot.png",
  },
  {
    title: "Vega Logistics",
    desc: "منصة لوجستية بـ TypeScript و Next.js مع Prisma ORM — تتبع شحنات وإدارة أسطول.",
    tags: ["TypeScript", "Next.js", "Prisma"],
    repo: "https://github.com/xxxova2/vega",
    link: "https://vega-jade.vercel.app",
    image: "/vega.png",
  },
  {
    title: "Options IV Dashboard",
    desc: "لوحة تحكم حية لتقلبات الخيارات المالية مع حساب Greeks وتصور سطحي.",
    tags: ["Python", "Dash", "Plotly"],
    repo: "https://github.com/xxxova2/options-iv-dashboard",
    image: "/options-dashboard.png",
  },
  {
    title: "Volaterm",
    desc: "أداة تحليل تقلبات طرفية لمسح سريع للأسواق المالية وحساب المخاطر.",
    tags: ["TypeScript", "Terminal", "CLI"],
    repo: "https://github.com/xxxova2/volaterm",
    image: "/volaterm.png",
  },
];

function ProjectImage({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="aspect-video bg-primary/10 flex items-center justify-center">
        <span className="text-3xl font-bold text-primary">{title[0]}</span>
      </div>
    );
  }
  return (
    <div className="aspect-video bg-surface overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function TiltProject({
  p,
  i,
}: {
  p: (typeof PROJECTS)[number];
  i: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Reveal delay={(i % 3) * 0.08}>
      <div style={{ perspective: 1000 }}>
        <motion.a
          href={p.link || p.repo}
          target="_blank"
          rel="noopener noreferrer"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.03 }}
          className="block bg-surface rounded-xl shadow-md hover:shadow-2xl transition-shadow flex flex-col border border-border will-change-transform"
        >
          <div
            className="rounded-t-xl overflow-hidden"
            style={{ transform: "translateZ(50px)" }}
          >
            <ProjectImage src={p.image} alt={p.title} title={p.title} />
          </div>
          <div
            className="p-5 flex-1 flex flex-col justify-between"
            style={{ transform: "translateZ(25px)" }}
          >
            <div>
              <h3 className="font-bold text-ink">{p.title}</h3>
              <p className="text-sm text-muted mt-1.5 leading-relaxed">
                {p.desc}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t, j) => (
                  <span
                    key={j}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <ExternalLink className="w-3 h-3" /> عرض المشروع
              </div>
            </div>
          </div>
        </motion.a>
      </div>
    </Reveal>
  );
}

export default function Portfolio() {
  return (
    <section id="work" className="py-24 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full">
            أعمالنا
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mt-4">
            مشاريع طورناها
          </h2>
          <p className="text-muted max-w-lg mx-auto mt-2">
            من وكلاء ذكاء اصطناعي إلى متاجر إلكترونية — كل مشروع جاهز للإنتاج وبأحدث
            التقنيات.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((p, i) => (
            <TiltProject key={i} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
