import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { VetCard } from "../VetCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useVets } from "../../../hooks/useVets";

const GOVERNORATES = [
  "Tous",
  "Tunis",
  "Sfax",
  "Sousse",
  "Monastir",
  "Bizerte",
  "Nabeul",
  "Ariana",
];

function VetCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-[var(--pc-border)]/60 animate-pulse">
      <div className="flex gap-3.5 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--pc-surface-alt)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded bg-[var(--pc-surface-alt)] w-3/4" />
          <div className="h-3 rounded bg-[var(--pc-surface-alt)] w-1/2" />
        </div>
      </div>
      <div className="h-3 rounded bg-[var(--pc-surface-alt)] w-2/3 mb-3" />
      <div className="h-3 rounded bg-[var(--pc-surface-alt)] w-1/2 mb-4" />
      <div className="h-10 rounded-xl bg-[var(--pc-surface-alt)]" />
    </div>
  );
}

export function VetDirectory({
  onNavigate,
}: {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
} = {}) {
  const { t } = useTranslation();
  const [activeGov, setActiveGov] = useState("Tous");

  const { data, isLoading, isFetching } = useVets({
    city: activeGov === "Tous" ? undefined : activeGov,
    page: 1,
    per_page: 4,
  });

  const vets = data?.data ?? [];

  return (
    <section className="py-16 bg-white dark:bg-[var(--pc-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block bg-[var(--pc-primary-light)] dark:bg-[var(--pc-primary-light)] text-[var(--pc-primary)] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-3"
            >
              {t("vets.badge")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 800,
              }}
              className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
            >
              {t("vets.title")}
            </motion.h2>
            <p
              className="text-[var(--pc-text-secondary)] mt-1"
              style={{ fontSize: "14px" }}
            >
              {t("vets.subtitle")}
            </p>
          </div>
          <button
            onClick={() => setActiveGov("Tous")}
            className="flex items-center gap-1.5 text-[var(--pc-primary)] font-semibold flex-shrink-0"
            style={{ fontSize: "14px" }}
          >
            {t("vets.seeAll")} <ArrowRight size={16} />
          </button>
        </div>

        <div
          className="flex gap-2.5 overflow-x-auto pb-3 mb-8"
          style={{ scrollbarWidth: "none" }}
        >
          {GOVERNORATES.map((gov) => (
            <button
              key={gov}
              onClick={() => setActiveGov(gov)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border font-semibold transition-all duration-200 touch-manipulation ${
                activeGov === gov
                  ? "bg-[var(--pc-primary)] border-[var(--pc-primary)] text-white"
                  : "border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)]"
              }`}
              style={{ fontSize: "13px" }}
            >
              {gov === "Tous" ? t("vets.filterAll") : gov}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading || isFetching ? (
            Array.from({ length: 4 }).map((_, i) => <VetCardSkeleton key={i} />)
          ) : vets.length > 0 ? (
            vets.map((vet, i) => (
              <VetCard
                key={vet.id}
                vet={vet}
                index={i}
                onClick={() =>
                  onNavigate?.("vet-profile", { id: String(vet.id) })
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-[var(--pc-text-secondary)]">
              Aucun vétérinaire trouvé pour ce gouvernorat.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
