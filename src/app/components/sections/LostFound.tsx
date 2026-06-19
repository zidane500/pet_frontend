import { motion } from "motion/react";
import { MapPin, Calendar, Bell, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLostFound } from "../../../hooks/useLostFound";
import type { LostFound as LostFoundType } from "../../../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-TN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function PetAlertCard({
  report,
  type,
}: {
  report: LostFoundType;
  type: "lost" | "found";
}) {
  const { t } = useTranslation();
  const isLost = type === "lost";
  const image =
    report.photos?.[0] ?? `https://picsum.photos/seed/${report.id}/200/160`;
  const name = report.animal_name ?? (isLost ? "Animal perdu" : "Trouvé");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex gap-3 bg-[var(--pc-surface)] rounded-2xl p-3.5 border border-[var(--pc-border)]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <img
        src={image}
        alt={name}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            `https://picsum.photos/seed/${report.id}/100/100`;
        }}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLost
                ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                : "bg-green-100 text-green-600 dark:bg-green-900/30"
            }`}
          >
            {isLost ? t("lostFound.lostLabel") : t("lostFound.foundLabel")}
          </span>
        </div>
        <p
          className="font-bold text-[var(--pc-text-primary)] truncate"
          style={{ fontSize: "14px", fontFamily: "Sora, sans-serif" }}
        >
          {name}
        </p>
        <p
          className="text-[var(--pc-text-secondary)] truncate"
          style={{ fontSize: "12px" }}
        >
          {[report.breed, report.species, report.color]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <div
            className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
            style={{ fontSize: "11px" }}
          >
            <MapPin size={10} />
            <span className="truncate">{report.last_seen_location}</span>
          </div>
          <div
            className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
            style={{ fontSize: "11px" }}
          >
            <Calendar size={10} />
            <span>{formatDate(report.date_lost_found)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="flex gap-3 bg-[var(--pc-surface)] rounded-2xl p-3.5 border border-[var(--pc-border)] animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-[var(--pc-surface-alt)] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[var(--pc-surface-alt)] rounded w-1/3" />
        <div className="h-4 bg-[var(--pc-surface-alt)] rounded w-2/3" />
        <div className="h-3 bg-[var(--pc-surface-alt)] rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LostFound() {
  const { t } = useTranslation();

  const { data: lostData, isLoading: lostLoading } = useLostFound({
    type: "lost",
    page: 1,
  });
  const { data: foundData, isLoading: foundLoading } = useLostFound({
    type: "found",
    page: 1,
  });

  const lostItems = lostData?.data?.slice(0, 2) ?? [];
  const foundItems = foundData?.data?.slice(0, 2) ?? [];
  const lostTotal = lostData?.total ?? 0;
  const foundTotal = foundData?.total ?? 0;

  return (
    <section className="py-16 bg-white dark:bg-[var(--pc-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Alert banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-start sm:items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-10"
        >
          <Bell
            size={20}
            className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0"
          />
          <p
            className="text-amber-800 dark:text-amber-200"
            style={{ fontSize: "14px" }}
          >
            <strong>🔔 Activez les alertes de votre zone</strong> — soyez
            notifié si un animal est signalé près de chez vous
          </p>
          <button className="flex-shrink-0 ml-auto bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 touch-manipulation">
            Activer
          </button>
        </motion.div>

        {/* Title */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
            }}
            className="text-[var(--pc-text-primary)]"
          >
            {t("lostFound.title")}
          </motion.h2>
          <p
            className="text-[var(--pc-text-secondary)] mt-2"
            style={{ fontSize: "15px" }}
          >
            {t("lostFound.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Lost ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2.5">
              <AlertTriangle size={18} className="text-red-500" />
              <h3
                className="font-bold text-red-700 dark:text-red-400"
                style={{ fontFamily: "Sora, sans-serif", fontSize: "16px" }}
              >
                {t("lostFound.lost")}
              </h3>
              {lostTotal > 0 && (
                <span className="ml-auto bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {lostTotal} actifs
                </span>
              )}
            </div>

            <div className="space-y-3">
              {lostLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : lostItems.length > 0 ? (
                lostItems.map((r) => (
                  <PetAlertCard key={r.id} report={r} type="lost" />
                ))
              ) : (
                <div
                  className="text-center py-6 text-[var(--pc-text-secondary)]"
                  style={{ fontSize: "13px" }}
                >
                  Aucun animal perdu signalé
                </div>
              )}
            </div>

            <button
              className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-red-400 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 active:scale-95 transition-all touch-manipulation"
              style={{ fontSize: "14px" }}
            >
              {t("lostFound.alert")}
            </button>
          </div>

          {/* ── Map placeholder ── */}
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-[var(--pc-primary-light)] to-[var(--pc-primary)]/10 dark:from-[var(--pc-primary-light)] dark:to-[var(--pc-primary)]/20 rounded-2xl flex flex-col items-center justify-center gap-3 border border-[var(--pc-border)] p-4">
              <div className="text-5xl">🗺️</div>
              <p
                className="font-bold text-[var(--pc-primary)] text-center"
                style={{ fontSize: "14px", fontFamily: "Sora, sans-serif" }}
              >
                Carte interactive
              </p>
              <p
                className="text-[var(--pc-text-secondary)] text-center"
                style={{ fontSize: "12px" }}
              >
                Signalements en temps réel à travers la Tunisie
              </p>
              <div className="flex gap-2 flex-wrap justify-center mt-1">
                {["📍 Tunis", "📍 Sfax", "📍 Sousse"].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] bg-white dark:bg-[var(--pc-surface)] border border-[var(--pc-border)] px-2 py-1 rounded-full text-[var(--pc-text-secondary)]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Found ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-2.5">
              <span className="text-green-500">🐾</span>
              <h3
                className="font-bold text-green-700 dark:text-green-400"
                style={{ fontFamily: "Sora, sans-serif", fontSize: "16px" }}
              >
                {t("lostFound.found")}
              </h3>
              {foundTotal > 0 && (
                <span className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {foundTotal} actifs
                </span>
              )}
            </div>

            <div className="space-y-3">
              {foundLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : foundItems.length > 0 ? (
                foundItems.map((r) => (
                  <PetAlertCard key={r.id} report={r} type="found" />
                ))
              ) : (
                <div
                  className="text-center py-6 text-[var(--pc-text-secondary)]"
                  style={{ fontSize: "13px" }}
                >
                  Aucun animal trouvé signalé
                </div>
              )}
            </div>

            <button
              className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-green-400 text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 active:scale-95 transition-all touch-manipulation"
              style={{ fontSize: "14px" }}
            >
              {t("lostFound.signal")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
