import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { StoreCard } from "../StoreCard";
import { useTranslation } from "react-i18next";
import { usePetStores } from "../../../hooks/usePetStores";

function StoreCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[var(--pc-border)]/60 animate-pulse">
      <div className="h-36 bg-[var(--pc-surface)]" />
      <div className="p-4 space-y-3">
        <div className="h-3 rounded bg-[var(--pc-surface)] w-3/4" />
        <div className="h-3 rounded bg-[var(--pc-surface)] w-1/2" />
        <div className="h-9 rounded-xl bg-[var(--pc-surface)]" />
      </div>
    </div>
  );
}

export function PetStores({
  onNavigate,
}: {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
} = {}) {
  const { t } = useTranslation();
  const { data, isLoading, isFetching } = usePetStores({
    page: 1,
    per_page: 4,
  });
  const stores = data?.data ?? [];

  return (
    <section className="py-16 bg-[var(--pc-surface-alt)] dark:bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-3"
            >
              {t("stores.badge")}
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
              {t("stores.title")}
            </motion.h2>
            <p
              className="text-[var(--pc-text-secondary)] mt-1"
              style={{ fontSize: "14px" }}
            >
              {t("stores.subtitle")}
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-[var(--pc-primary)] font-semibold flex-shrink-0"
            style={{ fontSize: "14px" }}
          >
            {t("stores.seeAll")} <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading || isFetching ? (
            Array.from({ length: 4 }).map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))
          ) : stores.length > 0 ? (
            stores.map((store, i) => (
              <StoreCard
                key={store.id}
                store={store}
                index={i}
                onClick={() =>
                  onNavigate?.("shop-profile", { id: String(store.id) })
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-[var(--pc-text-secondary)]">
              Aucune animalerie trouvée pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
