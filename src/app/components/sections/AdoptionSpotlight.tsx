import { motion } from "motion/react";
import { Heart, ArrowRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useListings } from "../../../hooks/useListings";

const COLORS = [
  "from-amber-400/20 to-orange-400/10",
  "from-emerald-400/20 to-teal-400/10",
  "from-blue-400/20 to-indigo-400/10",
];

function formatAge(months: number | null | undefined): string {
  if (months == null) return "";
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12);
  return `${y} an${y > 1 ? "s" : ""}`;
}

function timeWaiting(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days} jours`;
  const months = Math.floor(days / 30);
  return `${months} mois`;
}

export function AdoptionSpotlight({
  onNavigate,
}: {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
} = {}) {
  const { t } = useTranslation();

  // Charge les annonces d'adoption depuis l'API
  const { data, isLoading } = useListings({
    type: "adoption",
    page: 1,
    per_page: 3,
  });
  const pets = data?.data?.slice(0, 3) ?? [];

  return (
    <section className="py-20 relative overflow-hidden noise-overlay">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--pc-primary-light)] dark:bg-[#0A1A12]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--pc-primary)]/10 dark:bg-[var(--pc-primary)]/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--pc-accent)]/8 dark:bg-[var(--pc-accent)]/15 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[var(--pc-primary)] text-white px-5 py-2 rounded-full mb-5 shadow-lg shadow-[var(--pc-primary)]/30"
          >
            <Heart size={14} fill="white" />
            <span
              className="font-bold uppercase tracking-wider"
              style={{ fontSize: "12px" }}
            >
              {t("adoption.badge")}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(26px, 4vw, 44px)",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
            className="text-[var(--pc-text-primary)]"
          >
            {t("adoption.title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--pc-text-secondary)] mt-3 max-w-lg mx-auto"
            style={{ fontSize: "16px" }}
          >
            {t("adoption.subtitle")}
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl animate-pulse"
                style={{ height: 380, background: "var(--pc-surface)" }}
              />
            ))
          ) : pets.length > 0 ? (
            pets.map((pet, i) => {
              const image =
                pet.photos?.[0] ??
                `https://picsum.photos/seed/${pet.id}/600/450`;
              const age = formatAge(pet.age_months);
              const waiting = pet.created_at ? timeWaiting(pet.created_at) : "";
              const petName = pet.title?.split(" ")?.[0] ?? "Animal";
              const color = COLORS[i % COLORS.length];

              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.13,
                    type: "spring",
                    stiffness: 180,
                  }}
                  whileHover={{ y: -10 }}
                  className={`group glass-card rounded-3xl overflow-hidden cursor-pointer relative bg-gradient-to-br ${color}`}
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}
                  onClick={() =>
                    onNavigate?.("pet-detail", { id: String(pet.id) })
                  }
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-60">
                    <motion.img
                      src={image}
                      alt={pet.title ?? ""}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://picsum.photos/seed/${pet.id}/600/450`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[var(--pc-primary)]/80 opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Heart size={32} fill="white" />
                        <span
                          className="font-black"
                          style={{
                            fontFamily: "Sora, sans-serif",
                            fontSize: "18px",
                          }}
                        >
                          {t("adoption.adopt")}
                        </span>
                      </div>
                    </div>

                    {/* Waiting badge */}
                    {waiting && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full border border-white/30">
                        <Clock size={11} className="text-amber-400" />
                        <span
                          className="text-white font-semibold"
                          style={{ fontSize: "11px" }}
                        >
                          {t("adoption.waiting")} {waiting}
                        </span>
                      </div>
                    )}

                    {/* Name */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3
                        className="text-white font-black"
                        style={{
                          fontFamily: "Sora, sans-serif",
                          fontSize: "22px",
                        }}
                      >
                        {petName}
                      </h3>
                      <p className="text-white/80" style={{ fontSize: "13px" }}>
                        {[pet.breed ?? pet.species, age, pet.city]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <p
                      className="text-[var(--pc-text-secondary)] leading-relaxed mb-4 line-clamp-2"
                      style={{ fontSize: "13px" }}
                    >
                      {pet.description ??
                        `${petName} cherche une famille aimante.`}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 gradient-btn text-white font-bold py-3 rounded-xl shadow-lg shadow-[var(--pc-primary)]/25 touch-manipulation"
                      style={{ fontSize: "14px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.("pet-detail", { id: String(pet.id) });
                      }}
                    >
                      <Heart size={15} />
                      Je veux l'adopter →
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            // État vide — aucune annonce d'adoption
            <div className="col-span-3 text-center py-12">
              <p className="text-5xl mb-4">🐾</p>
              <p className="font-semibold text-[var(--pc-text-secondary)]">
                Aucune annonce d'adoption pour le moment
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate?.("search", { type: "adoption" })}
            className="inline-flex items-center gap-2 border-2 border-[var(--pc-primary)] text-[var(--pc-primary)] font-bold px-8 py-4 rounded-2xl hover:bg-[var(--pc-primary)] hover:text-white transition-all duration-300 touch-manipulation shadow-lg shadow-[var(--pc-primary)]/15"
            style={{ fontSize: "15px" }}
          >
            {t("adoption.seeAll")} <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
