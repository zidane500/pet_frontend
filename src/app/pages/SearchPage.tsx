import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Eye,
  Shield,
  ChevronDown,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearch } from "../../hooks/useSearch";
import type { ActiveFilters } from "../../hooks/useSearch";
import type { Listing } from "../../types";

// ── Types ──────────────────────────────────────────────────────────────────

interface SearchPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialQuery?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const RECENT_SEARCHES = [
  "Berger Allemand",
  "Chat persan",
  "Lapin nain",
  "Perroquet",
];
const GOVERNORATS = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Ariana",
  "Bizerte",
  "Nabeul",
  "Monastir",
  "Gafsa",
];
const TYPES = ["vente", "adoption", "perdu", "trouve"];
const SPECIES_LIST = ["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"];

const DEFAULT_FILTERS: ActiveFilters = {
  species: [],
  type: [],
  minPrice: "",
  maxPrice: "",
  city: "",
  vaccinated: false,
  adoptable: false,
};

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> =
  {
    vente: {
      label: "Vente",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-300",
    },
    adoption: {
      label: "Adoption",
      bg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
    },
    perdu: {
      label: "Perdu",
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-300",
    },
    trouve: {
      label: "Trouvé",
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-700 dark:text-amber-300",
    },
    accouplement: {
      label: "Accouplement",
      bg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-300",
    },
    conseils: {
      label: "Conseils",
      bg: "bg-teal-100 dark:bg-teal-900/40",
      text: "text-teal-700 dark:text-teal-300",
    },
  };

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(listing: Listing): string {
  if (listing.is_free) return "💚 Gratuit";
  if (listing.price)
    return `${Number(listing.price).toLocaleString("fr-TN")} DT`;
  if (listing.type === "adoption") return "💚 Gratuit";
  return "—";
}

function formatAge(months: number | null | undefined): string | null {
  if (!months) return null;
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12);
  return `${y} an${y > 1 ? "s" : ""}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

// ── Filter Panel ────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onApply,
  onClear,
  onClose,
}: {
  filters: ActiveFilters;
  onApply: (f: ActiveFilters) => void;
  onClear: () => void;
  onClose?: () => void;
}) {
  const [local, setLocal] = useState<ActiveFilters>(filters);

  const toggleArr = (key: "species" | "type", val: string) => {
    setLocal((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter((v) => v !== val)
        : [...prev[key], val],
    }));
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center justify-between">
        <h3
          className="font-bold text-[var(--pc-text-primary)]"
          style={{ fontSize: "16px" }}
        >
          Filtres
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] transition-colors"
          >
            <X size={18} className="text-[var(--pc-text-secondary)]" />
          </button>
        )}
      </div>

      {/* Type */}
      <div>
        <p
          className="font-semibold text-[var(--pc-text-primary)] mb-2.5"
          style={{ fontSize: "13px" }}
        >
          Type d'annonce
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => {
            const active = local.type.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleArr("type", t)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${active ? "border-[var(--pc-primary)] bg-[var(--pc-primary)]/10 text-[var(--pc-primary)]" : "border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)]"}`}
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                {active ? <CheckSquare size={14} /> : <Square size={14} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Espèce */}
      <div>
        <p
          className="font-semibold text-[var(--pc-text-primary)] mb-2.5"
          style={{ fontSize: "13px" }}
        >
          Espèce
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SPECIES_LIST.map((sp) => {
            const active = local.species.includes(sp);
            return (
              <button
                key={sp}
                onClick={() => toggleArr("species", sp)}
                className={`px-2 py-1.5 rounded-lg border text-center transition-all ${active ? "border-[var(--pc-primary)] bg-[var(--pc-primary)]/10 text-[var(--pc-primary)]" : "border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)]"}`}
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                {sp}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prix */}
      <div>
        <p
          className="font-semibold text-[var(--pc-text-primary)] mb-2.5"
          style={{ fontSize: "13px" }}
        >
          Prix (DT)
        </p>
        <div className="flex flex-col items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={local.minPrice}
            onChange={(e) =>
              setLocal((p) => ({ ...p, minPrice: e.target.value }))
            }
            className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2 text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none focus:border-[var(--pc-primary)]"
            style={{ fontSize: "13px" }}
          />
          <span
            className="text-[var(--pc-text-secondary)]"
            style={{ fontSize: "12px" }}
          >
            —
          </span>
          <input
            type="number"
            placeholder="Max"
            value={local.maxPrice}
            onChange={(e) =>
              setLocal((p) => ({ ...p, maxPrice: e.target.value }))
            }
            className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2 text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none focus:border-[var(--pc-primary)]"
            style={{ fontSize: "13px" }}
          />
        </div>
      </div>

      {/* Gouvernorat */}
      <div>
        <p
          className="font-semibold text-[var(--pc-text-primary)] mb-2.5"
          style={{ fontSize: "13px" }}
        >
          Gouvernorat
        </p>
        <div className="relative">
          <select
            value={local.city}
            onChange={(e) => setLocal((p) => ({ ...p, city: e.target.value }))}
            className="w-full appearance-none bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2.5 pr-8 text-[var(--pc-text-primary)] focus:outline-none focus:border-[var(--pc-primary)]"
            style={{ fontSize: "13px" }}
          >
            <option value="">Tous les gouvernorats</option>
            {GOVERNORATS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] pointer-events-none"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        {[
          { key: "vaccinated" as const, label: "Vacciné uniquement" },
          { key: "adoptable" as const, label: "Adoptable uniquement" },
        ].map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center justify-between cursor-pointer"
          >
            <span
              className="font-semibold text-[var(--pc-text-primary)]"
              style={{ fontSize: "13px" }}
            >
              {label}
            </span>
            <button
              onClick={() => setLocal((p) => ({ ...p, [key]: !p[key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${local[key] ? "bg-[var(--pc-primary)]" : "bg-[var(--pc-border)]"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${local[key] ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => {
            setLocal(DEFAULT_FILTERS);
            onClear();
          }}
          className="flex-1 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:text-[var(--pc-primary)] hover:border-[var(--pc-primary)] transition-colors"
          style={{ fontSize: "13px" }}
        >
          Effacer
        </button>
        <button
          onClick={() => {
            onApply(local);
            onClose?.();
          }}
          className="flex-1 py-2.5 rounded-xl bg-[var(--pc-primary)] text-white font-bold"
          style={{ fontSize: "13px" }}
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}

// ── Result Card ────────────────────────────────────────────────────────────

function ResultCard({
  listing,
  onClick,
}: {
  listing: Listing;
  onClick: () => void;
}) {
  const badge = TYPE_BADGE[listing.type] ?? TYPE_BADGE.vente;
  const image =
    listing.photos?.[0] ?? `https://picsum.photos/seed/${listing.id}/400/225`;
  const age = formatAge(listing.age_months);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(29,125,95,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={image}
          alt={listing.title ?? ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${listing.id}/400/225`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <span
          className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          {badge.label}
        </span>

        {listing.user?.is_verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--pc-primary)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            <Shield size={8} /> Vérifié
          </div>
        )}

        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white px-2 py-0.5 rounded-full"
          style={{ fontSize: "10px" }}
        >
          <Eye size={9} /> {(listing.views_count ?? 0).toLocaleString()}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p
          className="font-bold text-[var(--pc-text-primary)] truncate mb-0.5"
          style={{ fontFamily: "Sora, sans-serif", fontSize: "13px" }}
        >
          {listing.title}
        </p>
        <p
          className="text-[var(--pc-text-secondary)] truncate mb-2"
          style={{ fontSize: "11px" }}
        >
          {listing.breed ?? listing.species ?? "—"}
        </p>

        <div className="flex flex-wrap gap-1 mb-2">
          {age && (
            <span
              className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md"
              style={{ fontSize: "10px" }}
            >
              {age}
            </span>
          )}
          {listing.is_vaccinated && (
            <span
              className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md"
              style={{ fontSize: "10px" }}
            >
              💉 Vacciné
            </span>
          )}
          {listing.created_at && (
            <span
              className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md"
              style={{ fontSize: "10px" }}
            >
              🕐 {timeAgo(listing.created_at)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--pc-border)]/50">
          <div
            className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
            style={{ fontSize: "10px" }}
          >
            <MapPin size={9} /> {listing.city ?? "—"}
          </div>
          <span
            className="font-black text-[var(--pc-primary)]"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "13px" }}
          >
            {formatPrice(listing)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function SearchPage({
  onBack,
  onNavigate,
  initialQuery = "",
}: SearchPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const {
    query,
    setQuery,
    activeFilters,
    setFilters: setActiveFilters,
    sortBy,
    setSortBy,
    results,
    total,
    isLoading,
    isFetching,
    clearFilters,
  } = useSearch(initialQuery);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasActiveFilters =
    activeFilters.type.length > 0 ||
    activeFilters.species.length > 0 ||
    !!activeFilters.city ||
    activeFilters.vaccinated ||
    activeFilters.adoptable;

  return (
    <div
      className={`min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12] flex ${isRtl ? "flex-row-reverse" : ""}`}
    >
      {/* ── Desktop Filter Sidebar ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-[var(--pc-surface)] dark:bg-[#0D1117] border-r border-[var(--pc-border)]">
        <FilterPanel
          filters={activeFilters}
          onApply={setActiveFilters}
          onClear={clearFilters}
        />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky Search Header */}
        <header className="sticky top-0 z-30 bg-[var(--pc-surface)]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-b border-[var(--pc-border)] px-4 py-3">
          <div
            className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
            >
              <ArrowLeft
                size={18}
                className={`text-[var(--pc-text-primary)] ${isRtl ? "rotate-180" : ""}`}
              />
            </motion.button>

            <div
              className={`flex-1 flex items-center gap-2 bg-[var(--pc-surface-alt)] dark:bg-[#161B22] rounded-xl px-3 py-2.5 border border-[var(--pc-border)] focus-within:border-[var(--pc-primary)] transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {isFetching ? (
                <Loader2
                  size={16}
                  className="text-[var(--pc-primary)] flex-shrink-0 animate-spin"
                />
              ) : (
                <Search
                  size={16}
                  className="text-[var(--pc-text-secondary)] flex-shrink-0"
                />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher un animal, une race..."
                className="flex-1 bg-transparent text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none"
                style={{ fontSize: "14px" }}
                dir={isRtl ? "rtl" : "ltr"}
              />
              {query && (
                <button onClick={() => setQuery("")} className="flex-shrink-0">
                  <X size={14} className="text-[var(--pc-text-secondary)]" />
                </button>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilterDrawer(true)}
              className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors relative"
            >
              <SlidersHorizontal
                size={17}
                className="text-[var(--pc-text-secondary)]"
              />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--pc-primary)] rounded-full" />
              )}
            </motion.button>
          </div>

          {/* Recent searches */}
          <AnimatePresence>
            {!query && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`flex gap-2 mt-3 overflow-x-auto pb-1 ${isRtl ? "flex-row-reverse" : ""}`}
                  style={{ scrollbarWidth: "none" }}
                >
                  {RECENT_SEARCHES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--pc-surface-alt)] rounded-full border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-primary)] hover:border-[var(--pc-primary)] transition-colors whitespace-nowrap"
                      style={{ fontSize: "12px" }}
                    >
                      <span>🕐</span>
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort + count */}
          <div
            className={`flex items-center justify-between mt-3 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <p
              className="text-[var(--pc-text-secondary)]"
              style={{ fontSize: "12px" }}
            >
              <span className="font-bold text-[var(--pc-text-primary)]">
                {total}
              </span>{" "}
              résultats
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-lg pl-3 pr-7 py-1.5 text-[var(--pc-text-secondary)] focus:outline-none focus:border-[var(--pc-primary)]"
                style={{ fontSize: "12px" }}
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="priceAsc">Prix croissant</option>
                <option value="priceDesc">Prix décroissant</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] pointer-events-none"
              />
            </div>
          </div>
        </header>

        {/* Results Grid */}
        <main className="flex-1 p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl animate-pulse"
                  style={{ background: "var(--pc-surface)" }}
                />
              ))}
            </div>
          ) : results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="text-6xl mb-4">🔍</div>
              <p
                className="font-bold text-[var(--pc-text-primary)] mb-1"
                style={{ fontSize: "18px" }}
              >
                Aucun résultat
              </p>
              <p
                className="text-[var(--pc-text-secondary)]"
                style={{ fontSize: "14px" }}
              >
                Essayez d'autres mots-clés ou modifiez vos filtres
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[var(--pc-primary)] text-white rounded-xl font-semibold"
                style={{ fontSize: "13px" }}
              >
                Effacer les filtres
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {results.map((listing) => (
                <ResultCard
                  key={listing.id}
                  listing={listing as any}
                  onClick={() =>
                    onNavigate("pet-detail", { id: String(listing.id) })
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {showFilterDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--pc-surface)] dark:bg-[#0D1117] rounded-t-3xl overflow-y-auto"
              style={{ maxHeight: "85vh" }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-[var(--pc-border)] rounded-full" />
              </div>
              <FilterPanel
                filters={activeFilters}
                onApply={(f) => {
                  setActiveFilters(f);
                  setShowFilterDrawer(false);
                }}
                onClear={clearFilters}
                onClose={() => setShowFilterDrawer(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
