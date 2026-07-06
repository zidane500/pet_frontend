import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Shield,
  Heart,
  Share2,
  Award,
  PawPrint,
  CheckCircle,
  Clock,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { useBreeder } from "../../hooks/useBreeders";

// ── Types ──────────────────────────────────────────────────────

type Tab = "Animaux disponibles" | "À propos" | "Avis";

// ── Sous-composants ────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-[var(--pc-surface)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--pc-primary)] border-t-transparent animate-spin" />
        <p className="text-[var(--pc-text-secondary)] text-sm">Chargement...</p>
      </div>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--pc-surface)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-[var(--pc-text-primary)] text-lg font-semibold">
          Éleveur introuvable
        </p>
        <p className="text-[var(--pc-text-secondary)] text-sm">
          Cet éleveur n'existe pas ou n'est plus disponible.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[var(--pc-primary)] text-white text-sm"
        >
          Retour
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[var(--pc-surface-2)]">
      <Icon size={18} className="text-[var(--pc-primary)]" />
      <span className="text-[var(--pc-text-primary)] font-bold text-lg leading-none">
        {value}
      </span>
      <span className="text-[var(--pc-text-secondary)] text-xs text-center">
        {label}
      </span>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────

interface BreederProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  breederId?: string;
}

export function BreederProfilePage({
  onBack,
  onNavigate,
  breederId,
}: BreederProfilePageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("Animaux disponibles");
  const [saved, setSaved] = useState(false);

  const id = breederId ? Number(breederId) : 0;
  const { data: breeder, isLoading, isError } = useBreeder(id);

  // ── États de chargement ──────────────────────────────────────
  if (!breederId || isLoading) return <LoadingState />;
  if (isError || !breeder) return <ErrorState onBack={onBack} />;

  const coverUrl =
    breeder.cover_image_url ??
    breeder.cover_image ??
    "https://images.unsplash.com/photo-1558929996-da64ba858215?w=800&h=300&fit=crop";
  const logoUrl =
    breeder.logo_url ??
    breeder.logo ??
    "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=200&h=200&fit=crop";

  const TABS: Tab[] = ["Animaux disponibles", "À propos", "Avis"];

  return (
    <div className="min-h-screen bg-[var(--pc-surface)]">
      {/* ── Cover ── */}
      <div className="relative h-52 sm:h-64">
        <img
          src={coverUrl}
          alt={breeder.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

        {/* Boutons header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setSaved((s) => !s)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart
                size={18}
                className={saved ? "text-red-400 fill-red-400" : "text-white"}
              />
            </button>
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Share2 size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="absolute -bottom-10 left-4">
          <div className="w-20 h-20 rounded-2xl border-4 border-[var(--pc-surface)] overflow-hidden shadow-lg">
            <img
              src={logoUrl}
              alt={breeder.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="px-4 pt-14 pb-24 max-w-2xl mx-auto space-y-5">
        {/* Infos principales */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[var(--pc-text-primary)] text-xl font-bold">
              {breeder.name}
            </h1>
            {breeder.verified && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                <CheckCircle size={11} /> Vérifié
              </span>
            )}
            {breeder.is_certified && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium">
                <BadgeCheck size={11} /> Certifié
              </span>
            )}
          </div>
          {breeder.tagline && (
            <p className="text-[var(--pc-text-secondary)] text-sm italic">
              "{breeder.tagline}"
            </p>
          )}
          {breeder.speciality && (
            <p className="text-[var(--pc-primary)] text-sm font-medium">
              🐾 {breeder.speciality}
            </p>
          )}
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[var(--pc-text-primary)] text-sm font-semibold">
              {breeder.rating.toFixed(1)}
            </span>
            <span className="text-[var(--pc-text-secondary)] text-xs">
              ({breeder.reviews_count} avis)
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={Award}
            value={`${breeder.years_experience} ans`}
            label="Expérience"
          />
          <StatCard
            icon={PawPrint}
            value={breeder.animals_sold_total}
            label="Animaux vendus"
          />
          <StatCard
            icon={Shield}
            value={breeder.is_certified ? "Oui" : "Non"}
            label="Certifié"
          />
        </div>

        {/* Coordonnées */}
        <div className="p-4 rounded-2xl bg-[var(--pc-surface-2)] space-y-3">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-[var(--pc-primary)] shrink-0" />
            <span className="text-[var(--pc-text-secondary)] text-sm">
              {breeder.address}, {breeder.city}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Phone size={16} className="text-[var(--pc-primary)] shrink-0" />
            <a
              href={`tel:${breeder.phone}`}
              className="text-[var(--pc-text-secondary)] text-sm hover:text-[var(--pc-primary)]"
            >
              {breeder.phone}
            </a>
          </div>

          {breeder.email && (
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[var(--pc-primary)] shrink-0" />
              <a
                href={`mailto:${breeder.email}`}
                className="text-[var(--pc-text-secondary)] text-sm hover:text-[var(--pc-primary)]"
              >
                {breeder.email}
              </a>
            </div>
          )}

          {breeder.website && (
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-[var(--pc-primary)] shrink-0" />
              <a
                href={`https://${breeder.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pc-primary)] text-sm hover:underline"
              >
                {breeder.website}
              </a>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--pc-surface-2)]">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? "bg-[var(--pc-primary)] text-white shadow"
                  : "text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contenu onglets */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Animaux disponibles" && (
              <div className="space-y-3">
                <p className="text-[var(--pc-text-secondary)] text-sm">
                  Consultez les annonces de cet éleveur
                </p>
                <button
                  onClick={() =>
                    onNavigate("search", {
                      type: "vente",
                      breeder: String(breeder.id),
                    })
                  }
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--pc-surface-2)] hover:bg-[var(--pc-border)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PawPrint size={20} className="text-[var(--pc-primary)]" />
                    <div className="text-left">
                      <p className="text-[var(--pc-text-primary)] text-sm font-medium">
                        Voir les animaux disponibles
                      </p>
                      <p className="text-[var(--pc-text-secondary)] text-xs">
                        {breeder.speciality ?? "Toutes races"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[var(--pc-text-secondary)]"
                  />
                </button>
              </div>
            )}

            {activeTab === "À propos" && (
              <div className="space-y-4">
                {breeder.description ? (
                  <p className="text-[var(--pc-text-secondary)] text-sm leading-relaxed">
                    {breeder.description}
                  </p>
                ) : (
                  <p className="text-[var(--pc-text-secondary)] text-sm italic">
                    Aucune description disponible.
                  </p>
                )}
                <div className="flex items-center gap-2 text-[var(--pc-text-secondary)] text-xs">
                  <Clock size={13} />
                  <span>
                    Membre depuis{" "}
                    {new Date(breeder.created_at).toLocaleDateString("fr-TN", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "Avis" && (
              <div className="text-center py-8 space-y-2">
                <Star size={32} className="text-yellow-400 mx-auto" />
                <p className="text-[var(--pc-text-primary)] font-semibold">
                  {breeder.rating.toFixed(1)} / 5
                </p>
                <p className="text-[var(--pc-text-secondary)] text-sm">
                  {breeder.reviews_count} avis clients
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA Contact */}
        <button
          onClick={() =>
            onNavigate("messages", { userId: String(breeder.user_id) })
          }
          className="w-full py-4 rounded-2xl bg-[var(--pc-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Contacter l'éleveur
        </button>
      </div>
    </div>
  );
}
