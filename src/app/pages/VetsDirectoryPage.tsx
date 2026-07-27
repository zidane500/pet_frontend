import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { useVets } from "../../hooks/useVets";
import { VetCard } from "../components/VetCard";

interface VetsDirectoryPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

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

const PER_PAGE = 12;

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

export function VetsDirectoryPage({
  onBack,
  onNavigate,
}: VetsDirectoryPageProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeGov, setActiveGov] = useState("Tous");
  const [page, setPage] = useState(1);

  // ← Debounce 400ms, même logique que useSearch, pour ne pas spammer l'API
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useVets({
    search: debouncedSearch || undefined,
    city: activeGov === "Tous" ? undefined : activeGov,
    page,
    per_page: PER_PAGE,
  });

  const vets = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Retour
        </button>

        <h1
          className="font-black text-2xl text-[var(--pc-text-primary)] mb-1"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          Vétérinaires
        </h1>
        <p className="text-[var(--pc-text-secondary)] text-sm mb-5">
          {total > 0
            ? `${total} cabinet${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`
            : "Trouvez un vétérinaire près de chez vous"}
        </p>

        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une clinique, un médecin..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-sm text-[var(--pc-text-primary)] focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
          />
        </div>

        <div
          className="flex gap-2.5 overflow-x-auto pb-3 mb-6"
          style={{ scrollbarWidth: "none" }}
        >
          {GOVERNORATES.map((gov) => (
            <button
              key={gov}
              onClick={() => {
                setActiveGov(gov);
                setPage(1);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full border font-semibold transition-all duration-200 ${
                activeGov === gov
                  ? "bg-[var(--pc-primary)] border-[var(--pc-primary)] text-white"
                  : "border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)]"
              }`}
              style={{ fontSize: "13px" }}
            >
              {gov}
            </button>
          ))}
        </div>

        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <VetCardSkeleton key={i} />
            ))}
          </div>
        ) : vets.length === 0 ? (
          <div className="text-center py-16">
            <Stethoscope
              size={40}
              className="mx-auto mb-3 text-[var(--pc-text-secondary)]"
            />
            <p className="text-[var(--pc-text-secondary)] text-sm">
              Aucun vétérinaire trouvé.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {vets.map((vet, i) => (
                <VetCard
                  key={vet.id}
                  vet={vet}
                  index={i}
                  onClick={() =>
                    onNavigate("vet-profile", { id: String(vet.id) })
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-xl border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface)] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-[var(--pc-text-secondary)]">
                  Page {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface)] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
