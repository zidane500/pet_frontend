import { useListings } from "../../../hooks/useListings";
import { motion } from "motion/react";
import { ArrowRight, Flame } from "lucide-react";
import { ListingCard, type Listing } from "../ListingCard";
import { useTranslation } from "react-i18next";

export function RecentListings({
  onNavigate,
}: {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
} = {}) {
  const { t } = useTranslation();
  const { data, isLoading } = useListings({ page: 1 });
  const listings = data?.data ?? [];
  return (
    <section className="py-16 bg-[var(--pc-surface-alt)] dark:bg-[#060C12] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-[var(--pc-primary)] to-emerald-400" />
              <span
                className="text-[var(--pc-primary)] font-bold uppercase tracking-widest"
                style={{ fontSize: "11px" }}
              >
                {t("listings.badge")}
              </span>
            </div>
            <h2
              className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 800,
              }}
            >
              {t("listings.title")}
            </h2>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-1.5 text-[var(--pc-primary)] font-bold transition-all"
            style={{ fontSize: "14px" }}
          >
            {t("listings.seeAll")} <ArrowRight size={16} />
          </motion.button>
        </div>

        {/* Hot badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-5"
        >
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-full">
            <Flame size={13} className="text-red-500" />
            <span
              className="text-red-600 dark:text-red-400 font-bold"
              style={{ fontSize: "12px" }}
            >
              6 nouvelles dans la dernière heure
            </span>
          </div>
        </motion.div>

        {/* Horizontal scroll */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          {isLoading ? (
            // Skeletons pendant le chargement
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[260px] sm:min-w-[280px] rounded-2xl bg-[var(--pc-surface)] border border-[var(--pc-border)] p-3 animate-pulse"
              >
                <div className="aspect-[4/3] rounded-xl bg-[var(--pc-border)] mb-3" />
                <div className="h-4 bg-[var(--pc-border)] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[var(--pc-border)] rounded w-1/2" />
              </div>
            ))
          ) : listings.length > 0 ? (
            listings.map((listing: Listing, i: number) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))
          ) : (
            <p className="text-[var(--pc-text-secondary)] text-sm py-8">
              Aucune annonce pour le moment
            </p>
          )}
        </div>

        {!isLoading && listings.length > 0 && (
          <p
            className="text-center text-[var(--pc-text-secondary)] mt-4 sm:hidden"
            style={{ fontSize: "11px" }}
          >
            ← Glissez pour voir plus →
          </p>
        )}
      </div>
    </section>
  );
}
