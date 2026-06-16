import { motion, useScroll, useTransform } from "motion/react";
import { SearchBar } from "../SearchBar";
import { CategoryChip } from "../CategoryChip";
import { useState } from "react";
import { PetBadge } from "../PetBadge";
import { MapPin, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const CATEGORY_ICONS = ["🐕", "🐈", "🐇", "🦜", "🐠", "🦎", "🐹", "🐾"];
const CATEGORY_KEYS = [
  "dogs",
  "cats",
  "rabbits",
  "birds",
  "fish",
  "reptiles",
  "rodents",
  "other",
] as const;

const FLOATING_CARDS = [
  {
    type: "adoption" as const,
    name: "Bella",
    breed: "Golden Retriever",
    city: "Tunis",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=280&h=200&fit=crop",
    style: { top: "8%", left: "5%", rotate: "-3deg", delay: 0 },
  },
  {
    type: "perdu" as const,
    name: "Mimi",
    breed: "Chat siamois",
    city: "Sfax",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=280&h=200&fit=crop",
    style: { top: "38%", right: "0%", rotate: "4deg", delay: 1.5 },
  },
  {
    type: "vente" as const,
    name: "Rocky",
    breed: "Berger allemand",
    city: "Sousse",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=280&h=200&fit=crop",
    price: "350 DT",
    style: { bottom: "10%", left: "12%", rotate: "2deg", delay: 0.8 },
  },
];

// Paw print positions (random but fixed)
const PAWS = [
  { x: 8, y: 12, size: 32, delay: 0, dur: 6 },
  { x: 88, y: 18, size: 20, delay: 1, dur: 7 },
  { x: 15, y: 72, size: 44, delay: 2, dur: 5.5 },
  { x: 76, y: 62, size: 28, delay: 0.5, dur: 8 },
  { x: 50, y: 8, size: 18, delay: 1.8, dur: 6.5 },
  { x: 92, y: 85, size: 36, delay: 0.3, dur: 7.5 },
  { x: 30, y: 90, size: 24, delay: 2.5, dur: 5 },
];

export function HeroSection({
  onNavigate,
}: {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
} = {}) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("");
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ["0%", "30%"]);
  const contentY = useTransform(scrollY, [0, 700], ["0%", "15%"]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section
      className="relative min-h-screen flex flex-col pt-16 noise-overlay"
      style={{ overflow: "hidden" }}
    >
      {/* Aurora animated background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {/* Light mode */}
        <div className="absolute inset-0 dark:hidden">
          <div
            className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%]"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 30% 30%, rgba(232,245,240,1) 0%, rgba(255,255,255,0) 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(255,248,231,0.8) 0%, rgba(255,255,255,0) 60%), #FAFFFE",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 70% 20%, rgba(29,125,95,0.12) 0%, transparent 65%), radial-gradient(ellipse 40% 35% at 20% 80%, rgba(244,167,50,0.08) 0%, transparent 60%)",
              animation: "aurora-shift 14s ease-in-out infinite",
            }}
          />
        </div>
        {/* Dark mode */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{ background: "#060C12" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 25% 35%, rgba(29,125,95,0.22) 0%, transparent 65%)",
              animation: "aurora-shift 12s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 80% 70%, rgba(244,167,50,0.10) 0%, transparent 60%)",
              animation: "aurora-shift-2 16s ease-in-out infinite",
            }}
          />
          {/* Star grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
      </motion.div>

      {/* Floating paw prints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PAWS.map((p, i) => (
          <motion.div
            key={i}
            className="absolute select-none"
            style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 8, 0],
              opacity: [0.18, 0.35, 0.18],
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
          >
            🐾
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative flex-1 w-full flex flex-col lg:flex-row"
      >
        {/* Mobile scroll wrapper — allows reaching SearchBar above bottom nav */}
        <div
          className="flex-1 overflow-y-auto lg:overflow-visible lg:flex lg:flex-row lg:items-center lg:max-w-7xl lg:mx-auto lg:px-6 lg:gap-16 lg:py-0 max-h-[calc(100dvh-64px)] sm:max-h-[calc(100dvh-64px)] lg:max-h-none"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 w-full flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16 py-6 lg:py-0 pb-28 lg:pb-0">
            {/* Left: Content */}
            <div className="w-full lg:flex-1 lg:max-w-2xl z-10 min-w-0">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="inline-flex items-center gap-2 glass-card border border-[var(--pc-primary)]/30 dark:border-[var(--pc-primary)]/40 px-3 py-1.5 rounded-full mb-5 shadow-sm max-w-full overflow-hidden"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--pc-primary)] blink-dot flex-shrink-0" />
                <TrendingUp
                  size={13}
                  className="text-[var(--pc-primary)] flex-shrink-0"
                />
                <span
                  className="text-[var(--pc-primary)] font-bold truncate"
                  style={{ fontSize: "11px" }}
                >
                  {t("hero.badge")}
                </span>
              </motion.div>

              {/* Headline */}
              <h1
                className="mb-5"
                style={{ fontFamily: "Sora, sans-serif", lineHeight: 1.15 }}
              >
                {(
                  [
                    { textKey: "hero.line1", gradient: false },
                    { textKey: "hero.line2", gradient: true },
                    { textKey: "hero.line3", gradient: false },
                  ] as const
                ).map((line, li) => (
                  <div key={li} className="overflow-hidden">
                    <motion.span
                      className={`block ${line.gradient ? "text-gradient" : "text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"}`}
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{
                        delay: 0.5 + li * 0.15,
                        type: "spring",
                        stiffness: 200,
                        damping: 22,
                      }}
                      style={{
                        fontSize: "clamp(28px, 7vw, 58px)",
                        fontWeight: 800,
                      }}
                    >
                      {t(line.textKey)}
                    </motion.span>
                  </div>
                ))}
              </h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-[var(--pc-text-secondary)] dark:text-[var(--pc-text-secondary)] mb-6 leading-relaxed"
                style={{ fontSize: "clamp(14px, 3.5vw, 18px)" }}
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* Search bar */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, type: "spring", stiffness: 180 }}
                className="mb-6"
              >
                <SearchBar />
              </motion.div>

              {/* Category chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div
                  className="flex gap-2.5 overflow-x-auto pb-3"
                  style={{
                    scrollbarWidth: "none",
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {CATEGORY_KEYS.map((key, i) => (
                    <CategoryChip
                      key={key}
                      icon={CATEGORY_ICONS[i]}
                      label={t(`hero.categories.${key}`)}
                      active={activeCategory === key}
                      onClick={() =>
                        setActiveCategory(activeCategory === key ? "" : key)
                      }
                    />
                  ))}
                </div>
              </motion.div>

              {/* Trust pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="flex flex-wrap items-center gap-2 mt-5"
              >
                {[
                  { icon: "🔒", textKey: "hero.trust1" },
                  { icon: "✓", textKey: "hero.trust2" },
                  { icon: "📍", textKey: "hero.trust3" },
                ].map(({ icon, textKey }) => (
                  <div
                    key={textKey}
                    className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full border border-[var(--pc-border)] dark:border-[var(--pc-border)]"
                    style={{
                      fontSize: "11px",
                      color: "var(--pc-text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    <span>{icon}</span>
                    <span>{t(textKey as any)}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Floating cards */}
            <div className="hidden md:block flex-shrink-0 w-[380px] xl:w-[440px] relative h-[460px]">
              {FLOATING_CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  className="absolute w-52 glass-card rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    ...card.style,
                    rotate: card.style.rotate,
                    boxShadow:
                      "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
                  }}
                  animate={{ y: [0, -16, 0] }}
                  transition={{
                    duration: 4 + i * 0.8,
                    delay: card.style.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                    type: "tween",
                  }}
                  whileHover={{
                    scale: 1.06,
                    rotate: 0,
                    zIndex: 10,
                    boxShadow:
                      "0 30px 80px rgba(29,125,95,0.25), 0 8px 24px rgba(0,0,0,0.18)",
                  }}
                >
                  <div className="relative">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <PetBadge type={card.type} />
                    </div>
                  </div>
                  <div className="p-3">
                    <p
                      className="font-black text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
                      style={{
                        fontFamily: "Sora, sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      {card.name}
                    </p>
                    <p
                      className="text-[var(--pc-text-secondary)]"
                      style={{ fontSize: "11px" }}
                    >
                      {card.breed}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <div
                        className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
                        style={{ fontSize: "10px" }}
                      >
                        <MapPin size={9} />
                        <span>{card.city}</span>
                      </div>
                      <span
                        className="font-black text-[var(--pc-primary)]"
                        style={{ fontSize: "11px" }}
                      >
                        {card.price}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Decorative glow blob behind cards */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full bg-[var(--pc-primary)] opacity-10 dark:opacity-20 blur-3xl" />
              </div>
            </div>
          </div>
          {/* end max-w-7xl wrapper */}
        </div>
        {/* end mobile scroll wrapper */}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="relative flex justify-center pb-10 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            type: "tween",
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="w-5 h-8 rounded-full border-2 border-[var(--pc-primary)]/40 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-[var(--pc-primary)]/60 rounded-full" />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom wave divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <svg
          viewBox="0 0 1440 64"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z"
            className="fill-[var(--pc-primary)]"
          />
        </svg>
      </div>
    </section>
  );
}
