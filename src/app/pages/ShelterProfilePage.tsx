import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Phone,
  Mail,
  Star,
  BadgeCheck,
  Globe,
  Users,
  Home,
  CheckCircle,
  HeartHandshake,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { useListings } from "../../hooks/useListings";
import { useToggleFavorite } from "../../hooks/useFavorites";
import { useAuth } from "../../hooks/useAuth";
import type { Listing } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  "Animaux disponibles",
  "Adoptions réussies",
  "Dons",
  "Bénévoles",
] as const;
type Tab = (typeof TABS)[number];

// ─── Donation tiers (statiques — pas de backend paiement pour l'instant) ──────

const DONATION_TIERS = [
  {
    amount: "10 DT",
    label: "Repas",
    desc: "Nourrit un animal pendant 3 jours",
    emoji: "🍖",
  },
  {
    amount: "25 DT",
    label: "Soins",
    desc: "Couvre les frais vétérinaires de base",
    emoji: "💊",
  },
  {
    amount: "50 DT",
    label: "Famille",
    desc: "Soutient un animal pendant un mois",
    emoji: "🏠",
  },
  {
    amount: "Autre",
    label: "Libre",
    desc: "Montant de votre choix",
    emoji: "💛",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAge(months?: number | null): string {
  if (!months) return "Âge inconnu";
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12);
  return `${y} an${y > 1 ? "s" : ""}`;
}

function userInitials(name?: string | null): string {
  const parts = (name ?? "Refuge")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "R";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[var(--pc-surface)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[var(--pc-text-secondary)]">
        <Loader2 size={32} className="animate-spin text-[var(--pc-primary)]" />
        <p className="text-sm">Chargement du refuge...</p>
      </div>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--pc-surface)] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="font-bold text-[var(--pc-text-primary)] mb-2">
          Refuge introuvable
        </h2>
        <p className="text-sm text-[var(--pc-text-secondary)] mb-4">
          Ce profil n'existe pas ou a été supprimé.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: "var(--pc-primary)" }}
        >
          Retour
        </button>
      </div>
    </div>
  );
}

// ─── Animal Card ──────────────────────────────────────────────────────────────

function AnimalCard({
  listing,
  onNavigate,
}: {
  listing: Listing;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const image =
    listing.photos?.[0] ??
    `https://picsum.photos/seed/shelter-animal-${listing.id}/400/300`;
  const age = formatAge(listing.age_months);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="relative">
        <img
          src={image}
          alt={listing.title}
          className="w-full h-36 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/sa-fb-${listing.id}/400/300`;
          }}
        />
        {listing.is_vaccinated && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
            <CheckCircle size={10} /> Vacciné
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="font-bold text-sm text-[var(--pc-text-primary)]">
          {listing.title}
        </div>
        <div className="text-xs text-[var(--pc-text-secondary)] mb-1">
          {listing.breed ?? listing.species ?? "—"}
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--pc-text-secondary)]">{age}</span>
          {listing.species && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ background: "var(--pc-primary)" }}
            >
              {listing.species}
            </span>
          )}
        </div>
        <button
          onClick={() => onNavigate("pet-detail", { id: String(listing.id) })}
          className="w-full py-1.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1"
          style={{
            background: "linear-gradient(135deg, var(--pc-primary), #15634a)",
          }}
        >
          <Heart size={12} /> Adopter
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ShelterProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  shelterId?: string;
}

export function ShelterProfilePage({
  onBack,
  onNavigate,
  shelterId,
}: ShelterProfilePageProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("Animaux disponibles");
  const [saved, setSaved] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);

  // ── API ──
  const id = shelterId ? Number(shelterId) : 0;
  const { data: shelter, isLoading, isError } = useProfile(id);
  const { mutate: toggleFavorite, isPending: favPending } = useToggleFavorite();

  // Annonces d'adoption publiées par ce refuge
  const { data: listingsData, isLoading: listingsLoading } = useListings(
    id ? { type: "adoption", per_page: 24 } : undefined,
  );
  const availableAnimals = (listingsData?.data ?? []).filter(
    (l) => l.user_id === id && l.is_active,
  );

  // ── Guards ──
  if (!shelterId || isLoading) return <LoadingState />;
  if (isError || !shelter) return <ErrorState onBack={onBack} />;

  // ── Derived data ──
  const name = shelter.name;
  const bio = shelter.bio ?? "Association de protection animale";
  const phone = shelter.phone ?? "";
  const city = [shelter.city, shelter.region].filter(Boolean).join(", ");
  const avatar =
    shelter.avatar ??
    `https://picsum.photos/seed/shelter-logo-${shelter.id}/200/200`;
  const cover = `https://picsum.photos/seed/shelter-cover-${shelter.id}/800/300`;
  const initials = userInitials(name);
  const memberSince = new Date(shelter.created_at).toLocaleDateString("fr-TN", {
    month: "long",
    year: "numeric",
  });

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      onNavigate("login");
      return;
    }
    setSaved((prev) => !prev);
    // On toggle un "favori utilisateur" — pas d'endpoint dédié shelter,
    // on utilise le profil user comme référence
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--pc-surface)] pb-24"
    >
      {/* Hero Cover */}
      <div className="relative h-48 sm:h-64">
        <img
          src={cover}
          alt="Shelter cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/sc-fb-${shelter.id}/800/300`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md">
            <Share2 size={18} />
          </button>
          <button
            onClick={handleToggleFavorite}
            disabled={favPending}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
          >
            <Heart
              size={18}
              className={saved ? "fill-red-500 text-red-500" : "text-gray-600"}
            />
          </button>
        </div>

        <div className="absolute -bottom-12 left-6">
          {shelter.avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://picsum.photos/seed/sl-fb-${shelter.id}/100/100`;
              }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-lg flex items-center justify-center text-white text-2xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--pc-primary), #15634a)",
              }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-[var(--pc-text-primary)]">
            {name}
          </h1>
          {shelter.is_verified && (
            <BadgeCheck size={20} className="text-[var(--pc-primary)] mt-0.5" />
          )}
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs rounded-full font-medium">
            Refuge / Association
          </span>
        </div>

        {bio && (
          <p className="text-sm text-[var(--pc-text-secondary)] mt-1 italic">
            "{bio}"
          </p>
        )}

        <div className="mt-3 space-y-1.5">
          {city && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <MapPin size={14} className="text-[var(--pc-primary)] shrink-0" />
              {city}
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <Phone size={14} className="text-[var(--pc-primary)] shrink-0" />
              {phone}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <Globe size={14} className="text-[var(--pc-primary)] shrink-0" />
            Membre depuis {memberSince}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: availableAnimals.length.toString(), label: "Disponibles" },
            { value: shelter.is_verified ? "✓" : "—", label: "Vérifié" },
            {
              value:
                shelter.plan === "premium" || shelter.plan === "pro"
                  ? "⭐"
                  : "—",
              label: "Plan",
            },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-3 text-center rounded-2xl">
              <div className="font-bold text-base text-[var(--pc-text-primary)]">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--pc-text-secondary)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab("Animaux disponibles")}
            className="py-2.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--pc-primary), #15634a)",
            }}
          >
            <Home size={15} /> Adopter
          </button>
          <button
            onClick={() => setActiveTab("Dons")}
            className="py-2.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--pc-accent), #d4871a)",
            }}
          >
            <HeartHandshake size={15} /> Faire un don
          </button>
          <button
            onClick={() => setActiveTab("Bénévoles")}
            className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2"
          >
            <Users size={15} /> Devenir bénévole
          </button>
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2"
            >
              <Mail size={15} /> Contacter
            </a>
          ) : (
            <button
              onClick={() =>
                onNavigate("messages", {
                  userId: String(shelter.id),
                  partnerName: shelter.name,
                })
              }
              className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2"
            >
              <Mail size={15} /> Contacter
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? "text-white"
                  : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]"
              }`}
              style={
                activeTab === tab ? { background: "var(--pc-primary)" } : {}
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ── Animaux disponibles — données réelles ── */}
          {activeTab === "Animaux disponibles" && (
            <motion.div
              key="animals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {listingsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl h-52 animate-pulse"
                    />
                  ))}
                </div>
              ) : availableAnimals.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-3">🐾</p>
                  <p className="text-sm text-[var(--pc-text-secondary)] font-medium">
                    Aucun animal disponible pour le moment
                  </p>
                  <p className="text-xs text-[var(--pc-text-secondary)] mt-1">
                    Revenez bientôt !
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableAnimals.map((listing) => (
                    <AnimalCard
                      key={listing.id}
                      listing={listing}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Adoptions réussies — statique (pas de backend dédié) ── */}
          {activeTab === "Adoptions réussies" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <p className="text-4xl mb-3">❤️</p>
              <p className="font-semibold text-[var(--pc-text-primary)] mb-1">
                Histoires de réussite
              </p>
              <p className="text-sm text-[var(--pc-text-secondary)]">
                Ce refuge a aidé de nombreux animaux à trouver un foyer aimant.
                Les détails des adoptions seront bientôt disponibles.
              </p>
            </motion.div>
          )}

          {/* ── Dons — statique (pas de backend paiement) ── */}
          {activeTab === "Dons" && (
            <motion.div
              key="donations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {DONATION_TIERS.map((tier) => (
                  <button
                    key={tier.amount}
                    onClick={() => setSelectedDonation(tier.amount)}
                    className={`glass-card p-4 rounded-2xl text-left transition-all ${
                      selectedDonation === tier.amount
                        ? "ring-2 ring-[var(--pc-accent)]"
                        : ""
                    }`}
                  >
                    <div className="text-2xl mb-2">{tier.emoji}</div>
                    <div className="font-bold text-[var(--pc-text-primary)]">
                      {tier.amount}
                    </div>
                    <div className="text-xs font-semibold text-[var(--pc-accent)]">
                      {tier.label}
                    </div>
                    <div className="text-xs text-[var(--pc-text-secondary)] mt-1">
                      {tier.desc}
                    </div>
                  </button>
                ))}
              </div>
              {selectedDonation && (
                <button
                  className="w-full py-3 rounded-2xl font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pc-accent), #d4871a)",
                  }}
                >
                  Faire un don de{" "}
                  {selectedDonation === "Autre"
                    ? "montant libre"
                    : selectedDonation}
                </button>
              )}
              <div className="glass-card p-4 rounded-2xl text-center text-sm text-[var(--pc-text-secondary)]">
                <p className="font-medium text-[var(--pc-text-primary)] mb-1">
                  Contactez directement le refuge
                </p>
                {phone && <p>{phone}</p>}
                <p className="mt-1 text-xs">
                  Les paiements en ligne seront disponibles prochainement.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Bénévoles — statique ── */}
          {activeTab === "Bénévoles" && (
            <motion.div
              key="volunteers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-4xl mb-3">🤝</p>
                <p className="font-semibold text-[var(--pc-text-primary)] mb-2">
                  Rejoignez l'équipe
                </p>
                <p className="text-sm text-[var(--pc-text-secondary)] mb-4">
                  Ce refuge a besoin de bénévoles pour aider les animaux.
                  Contactez-les directement pour vous engager.
                </p>
                <button
                  onClick={() =>
                    onNavigate("messages", {
                      userId: String(shelter.id),
                      partnerName: shelter.name,
                    })
                  }
                  className="w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pc-primary), #15634a)",
                  }}
                >
                  <Users size={16} /> Contacter le refuge
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
