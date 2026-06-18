import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ── Types ──────────────────────────────────────────────────────────────────
interface SearchResult {
  id: string;
  type: "vente" | "adoption" | "perdu" | "trouve";
  title: string;
  breed: string;
  species: string;
  price: number;
  city: string;
  governorate: string;
  image: string;
  age: string;
  sex: string;
  vaccinated: boolean;
  verified: boolean;
  postedAgo: string;
  views: number;
}

interface ActiveFilters {
  species: string[];
  type: string[];
  minPrice: string;
  maxPrice: string;
  city: string;
  vaccinated: boolean;
  adoptable: boolean;
}

interface SearchPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialQuery?: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_RESULTS: SearchResult[] = [
  {
    id: "r1",
    type: "vente",
    title: "Max - Berger Allemand",
    breed: "Berger Allemand",
    species: "Chien",
    price: 850,
    city: "Tunis",
    governorate: "Tunis",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    age: "3 ans",
    sex: "Mâle",
    vaccinated: true,
    verified: true,
    postedAgo: "2h",
    views: 1240,
  },
  {
    id: "r2",
    type: "adoption",
    title: "Luna - Chatte tigrée",
    breed: "Européen",
    species: "Chat",
    price: 0,
    city: "Sfax",
    governorate: "Sfax",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
    age: "1 an",
    sex: "Femelle",
    vaccinated: true,
    verified: false,
    postedAgo: "5h",
    views: 890,
  },
  {
    id: "r3",
    type: "vente",
    title: "Perroquet Ara Bleu",
    breed: "Ara bleu et jaune",
    species: "Oiseau",
    price: 1200,
    city: "Sousse",
    governorate: "Sousse",
    image:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop",
    age: "2 ans",
    sex: "Mâle",
    vaccinated: false,
    verified: true,
    postedAgo: "1j",
    views: 567,
  },
  {
    id: "r4",
    type: "adoption",
    title: "Nala - Labrador Mix",
    breed: "Labrador",
    species: "Chien",
    price: 0,
    city: "Tunis",
    governorate: "Tunis",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    age: "2 ans",
    sex: "Femelle",
    vaccinated: true,
    verified: true,
    postedAgo: "3h",
    views: 2100,
  },
  {
    id: "r5",
    type: "vente",
    title: "Lapin Angora Blanc",
    breed: "Angora",
    species: "Lapin",
    price: 120,
    city: "Bizerte",
    governorate: "Bizerte",
    image:
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop",
    age: "8 mois",
    sex: "Femelle",
    vaccinated: false,
    verified: false,
    postedAgo: "6h",
    views: 345,
  },
  {
    id: "r6",
    type: "perdu",
    title: "Tobi - Spitz nain perdu",
    breed: "Spitz nain",
    species: "Chien",
    price: 0,
    city: "Ariana",
    governorate: "Ariana",
    image:
      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=300&fit=crop",
    age: "4 ans",
    sex: "Mâle",
    vaccinated: true,
    verified: false,
    postedAgo: "8h",
    views: 3200,
  },
];

const RECENT_SEARCHES = [
  "Berger Allemand",
  "Chat persan",
  "Lapin nain",
  "Perroquet",
];
const GOVERNORATS = [
  "",
  "Tunis",
  "Sfax",
  "Sousse",
  "Ariana",
  "Bizerte",
  "Nabeul",
  "Monastir",
  "Gafsa",
];

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
  };

const DEFAULT_FILTERS: ActiveFilters = {
  species: [],
  type: [],
  minPrice: "",
  maxPrice: "",
  city: "",
  vaccinated: false,
  adoptable: false,
};

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

  const TYPES = ["vente", "adoption", "perdu", "trouve"];
  const SPECIES_LIST = ["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"];

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Header */}
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

      {/* Species */}
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
            {GOVERNORATS.filter(Boolean).map((g) => (
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
        <label className="flex items-center justify-between cursor-pointer">
          <span
            className="font-semibold text-[var(--pc-text-primary)]"
            style={{ fontSize: "13px" }}
          >
            Vacciné uniquement
          </span>
          <button
            onClick={() =>
              setLocal((p) => ({ ...p, vaccinated: !p.vaccinated }))
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${local.vaccinated ? "bg-[var(--pc-primary)]" : "bg-[var(--pc-border)]"}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${local.vaccinated ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span
            className="font-semibold text-[var(--pc-text-primary)]"
            style={{ fontSize: "13px" }}
          >
            Adoptable uniquement
          </span>
          <button
            onClick={() => setLocal((p) => ({ ...p, adoptable: !p.adoptable }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${local.adoptable ? "bg-[var(--pc-primary)]" : "bg-[var(--pc-border)]"}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${local.adoptable ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </label>
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
          className="flex-1 py-2.5 rounded-xl bg-[var(--pc-primary)] text-white font-bold shadow-lg shadow-[var(--pc-primary)]/25 hover:opacity-90 transition-opacity"
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
  result,
  onClick,
}: {
  result: SearchResult;
  onClick: () => void;
}) {
  const badge = TYPE_BADGE[result.type];
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
          src={result.image}
          alt={result.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${result.id}/400/225`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Type badge */}
        <span
          className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          {badge.label}
        </span>

        {result.verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--pc-primary)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            <Shield size={8} /> Vérifié
          </div>
        )}

        {/* Views */}
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white px-2 py-0.5 rounded-full"
          style={{ fontSize: "10px" }}
        >
          <Eye size={9} /> {result.views.toLocaleString()}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p
          className="font-bold text-[var(--pc-text-primary)] truncate mb-0.5"
          style={{ fontFamily: "Sora, sans-serif", fontSize: "13px" }}
        >
          {result.title}
        </p>
        <p
          className="text-[var(--pc-text-secondary)] truncate mb-2"
          style={{ fontSize: "11px" }}
        >
          {result.breed}
        </p>

        {/* Pills */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span
            className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md"
            style={{ fontSize: "10px" }}
          >
            {result.age}
          </span>
          <span
            className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md"
            style={{ fontSize: "10px" }}
          >
            {result.sex}
          </span>
          {result.vaccinated && (
            <span
              className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md"
              style={{ fontSize: "10px" }}
            >
              💉 Vacciné
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--pc-border)]/50">
          <div
            className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
            style={{ fontSize: "10px" }}
          >
            <MapPin size={9} /> {result.city}
          </div>
          <span
            className="font-black text-[var(--pc-primary)]"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "13px" }}
          >
            {result.price > 0
              ? `${result.price} DT`
              : result.type === "adoption"
                ? "💚 Gratuit"
                : "Gratuit"}
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

  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] =
    useState<ActiveFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "priceAsc" | "priceDesc"
  >("newest");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getFilteredResults = useCallback(() => {
    let r = [...MOCK_RESULTS];

    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.breed.toLowerCase().includes(q) ||
          item.species.toLowerCase().includes(q),
      );
    }

    if (activeFilters.type.length)
      r = r.filter((item) => activeFilters.type.includes(item.type));
    if (activeFilters.species.length)
      r = r.filter((item) => activeFilters.species.includes(item.species));
    if (activeFilters.city)
      r = r.filter(
        (item) =>
          item.city === activeFilters.city ||
          item.governorate === activeFilters.city,
      );
    if (activeFilters.vaccinated) r = r.filter((item) => item.vaccinated);
    if (activeFilters.adoptable)
      r = r.filter((item) => item.type === "adoption");
    if (activeFilters.minPrice)
      r = r.filter((item) => item.price >= parseInt(activeFilters.minPrice));
    if (activeFilters.maxPrice)
      r = r.filter((item) => item.price <= parseInt(activeFilters.maxPrice));

    if (sortBy === "newest")
      r.sort((a, b) => a.postedAgo.localeCompare(b.postedAgo));
    if (sortBy === "oldest")
      r.sort((a, b) => b.postedAgo.localeCompare(a.postedAgo));
    if (sortBy === "priceAsc") r.sort((a, b) => a.price - b.price);
    if (sortBy === "priceDesc") r.sort((a, b) => b.price - a.price);

    return r;
  }, [query, activeFilters, sortBy]);

  const filteredResults = getFilteredResults();
  const hasActiveFilters =
    activeFilters.type.length > 0 ||
    activeFilters.species.length > 0 ||
    activeFilters.city ||
    activeFilters.vaccinated ||
    activeFilters.adoptable;

  const handleClear = () => setActiveFilters(DEFAULT_FILTERS);

  return (
    <div
      className={`min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12] flex ${isRtl ? "flex-row-reverse" : ""}`}
    >
      {/* ── Desktop Filter Sidebar ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-[var(--pc-surface)] dark:bg-[#0D1117] border-r border-[var(--pc-border)]">
        <FilterPanel
          filters={activeFilters}
          onApply={setActiveFilters}
          onClear={handleClear}
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

            {/* Search Input */}
            <div
              className={`flex-1 flex items-center gap-2 bg-[var(--pc-surface-alt)] dark:bg-[#161B22] rounded-xl px-3 py-2.5 border border-[var(--pc-border)] focus-within:border-[var(--pc-primary)] transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <Search
                size={16}
                className="text-[var(--pc-text-secondary)] flex-shrink-0"
              />
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

            {/* Mobile filter button */}
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

          {/* Recent Searches */}
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
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--pc-surface-alt)] rounded-full border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-primary)] hover:border-[var(--pc-primary)] transition-colors whitespace-nowrap ${isRtl ? "flex-row-reverse" : ""}`}
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

          {/* Sort + count bar */}
          <div
            className={`flex items-center justify-between mt-3 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <p
              className="text-[var(--pc-text-secondary)]"
              style={{ fontSize: "12px" }}
            >
              <span className="font-bold text-[var(--pc-text-primary)]">
                {filteredResults.length}
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
          {filteredResults.length === 0 ? (
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
                onClick={handleClear}
                className="mt-4 px-4 py-2 bg-[var(--pc-primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                style={{ fontSize: "13px" }}
              >
                Effacer les filtres
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredResults.map((r) => (
                <ResultCard
                  key={r.id}
                  result={r}
                  onClick={() => onNavigate("pet-detail", { id: r.id })}
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
                onClear={handleClear}
                onClose={() => setShowFilterDrawer(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
