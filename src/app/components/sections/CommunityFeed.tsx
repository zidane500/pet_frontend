import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { CommunityPostCard } from "../CommunityPostCard";
import { useTranslation } from "react-i18next";
import { useListings } from "../../../hooks/useListings";

export function CommunityFeed({
  onOpenFeed,
  onNavigate,
}: {
  onOpenFeed?: () => void;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}) {
  const { t } = useTranslation();
  // ← Aperçu : les 6 dernières annonces publiées, tous types confondus.
  const { data, isLoading } = useListings({ sort: "newest", per_page: 6 });
  const posts = data?.data ?? [];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--pc-surface-alt)] dark:bg-[#060C12]" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-700/40 px-5 py-2 rounded-full mb-5"
          >
            <span
              className="font-bold uppercase tracking-wider"
              style={{ fontSize: "12px" }}
            >
              {t("community.badge")}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 800,
            }}
            className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
          >
            {t("community.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--pc-text-secondary)] mt-3"
            style={{ fontSize: "15px" }}
          >
            {t("community.subtitle")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-[var(--pc-surface)] animate-pulse"
                  style={{ aspectRatio: "1/1.3" }}
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-[var(--pc-text-secondary)] py-8">
              Aucune publication pour le moment.
            </p>
          ) : (
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 320: 2, 640: 3, 1024: 3 }}
            >
              <Masonry gutter="12px">
                {posts.map((listing, i) => (
                  <CommunityPostCard
                    key={listing.id}
                    listing={listing}
                    index={i}
                    onClick={() =>
                      onNavigate?.("pet-detail", { id: String(listing.id) })
                    }
                  />
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenFeed}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-purple-600/35 transition-all duration-300 touch-manipulation"
            style={{ fontSize: "15px" }}
          >
            {t("community.seeAll")} <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
