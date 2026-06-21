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
  Clock,
  Users,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePetStore } from "../../hooks/usePetStores";
import { useToggleFavorite } from "../../hooks/useFavorites";
import { useAuth } from "../../hooks/useAuth";
import type { PetStore } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ["Services", "Horaires", "Avis", "À propos"] as const;
type Tab = (typeof TABS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isProbablyOpen(store: PetStore): boolean {
  if (store.is_active === false) return false;
  const hoursText = Object.values(store.opening_hours ?? {}).join(" ");
  const now = new Date();
  const hour = now.getHours();
  // Simple heuristic: open if it's business hours and no "fermé" flag
  if (/fermé|closed/i.test(hoursText)) return false;
  return hour >= 9 && hour < 19;
}

function buildHoursRows(
  store: PetStore,
): { day: string; time: string; open: boolean }[] {
  const hours = store.opening_hours;
  if (!hours || Object.keys(hours).length === 0) {
    return [
      { day: "Lun - Ven", time: "09:00 - 19:00", open: true },
      { day: "Samedi", time: "09:00 - 20:00", open: true },
      { day: "Dimanche", time: "10:00 - 15:00", open: true },
    ];
  }
  return Object.entries(hours).map(([day, time]) => ({
    day,
    time: String(time),
    open: !/fermé|closed/i.test(String(time)),
  }));
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
        <p className="text-sm">Chargement de l'animalerie...</p>
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
          Animalerie introuvable
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

// ─── Main component ───────────────────────────────────────────────────────────

interface PetShopProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  shopId?: string;
}

export function PetShopProfilePage({
  onBack,
  onNavigate,
  shopId,
}: PetShopProfilePageProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("Services");
  const [savedLocally, setSavedLocally] = useState(false);

  // ── API ──
  const id = shopId ? Number(shopId) : 0;
  const { data: store, isLoading, isError } = usePetStore(id);
  const { mutate: toggleFavorite, isPending: favPending } = useToggleFavorite();

  if (!shopId || isLoading) return <LoadingState />;
  if (isError || !store) return <ErrorState onBack={onBack} />;

  // ── Derived data ──
  const name = store.store_name;
  const description =
    store.description ?? "Tout pour votre animal de compagnie";
  const address = store.address ?? "";
  const phone = store.phone ?? "";
  const email = store.email ?? "";
  const rating = Number(store.rating ?? 0);
  const reviewsCount = store.reviews_count ?? 0;
  const isOpen = isProbablyOpen(store);
  const logo =
    store.logo ??
    store.photos?.[0] ??
    `https://picsum.photos/seed/shop-logo-${store.id}/200/200`;
  const cover =
    store.photos?.[1] ??
    `https://picsum.photos/seed/shop-cover-${store.id}/800/300`;
  const categories = store.services ?? [];
  const hoursRows = buildHoursRows(store);

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      onNavigate("login");
      return;
    }
    setSavedLocally((prev) => !prev);
    toggleFavorite({ type: "pet_store", id: store.id });
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
          alt="Shop cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/shop-fallback-${store.id}/800/300`;
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
              className={
                savedLocally ? "fill-red-500 text-red-500" : "text-gray-600"
              }
            />
          </button>
        </div>

        <div className="absolute -bottom-12 left-6">
          <img
            src={logo}
            alt={name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://picsum.photos/seed/shop-fb-${store.id}/100/100`;
            }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-[var(--pc-text-primary)]">
            {name}
          </h1>
          {store.is_verified && (
            <BadgeCheck size={20} className="text-[var(--pc-primary)] mt-0.5" />
          )}
          <span
            className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold text-white ${isOpen ? "bg-green-500" : "bg-red-500"}`}
          >
            {isOpen ? "Ouvert" : "Fermé"}
          </span>
        </div>
        <p className="text-sm text-[var(--pc-text-secondary)] mt-1">
          {description}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
          <span className="text-xs text-[var(--pc-text-secondary)]">
            ({reviewsCount} avis)
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          {address && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <MapPin size={14} className="text-[var(--pc-primary)] shrink-0" />
              {address}
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <Phone size={14} className="text-[var(--pc-primary)] shrink-0" />
              {phone}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <Globe size={14} className="text-[var(--pc-primary)] shrink-0" />
              {email}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: (
                <Star size={18} className="fill-amber-400 text-amber-400" />
              ),
              value: `${rating.toFixed(1)}★`,
              label: "Note",
            },
            {
              icon: <Users size={18} />,
              value: reviewsCount.toString(),
              label: "Avis",
            },
            {
              icon: <Clock size={18} />,
              value: store.city ?? "—",
              label: "Ville",
            },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-3 text-center rounded-2xl">
              <div className="flex justify-center mb-1 text-[var(--pc-primary)]">
                {stat.icon}
              </div>
              <div className="font-bold text-sm text-[var(--pc-text-primary)]">
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
          {phone && (
            <a
              href={`tel:${phone}`}
              className="py-2.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 col-span-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--pc-primary), #15634a)",
              }}
            >
              <Phone size={15} /> Appeler
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2 col-span-2"
            >
              <Mail size={15} /> Envoyer un email
            </a>
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
          {activeTab === "Services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {categories.length > 0 ? (
                <div className="glass-card p-4 rounded-2xl">
                  <h3 className="font-semibold text-sm text-[var(--pc-text-primary)] mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-[var(--pc-primary)]" />{" "}
                    Services & Produits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ background: "var(--pc-primary)" }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--pc-text-secondary)] text-sm">
                  Aucun service renseigné
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Horaires" && (
            <motion.div
              key="hours"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {hoursRows.map((h, i) => (
                <div
                  key={i}
                  className={`glass-card p-4 rounded-2xl flex items-center justify-between ${!h.open ? "opacity-50" : ""}`}
                >
                  <span className="font-medium text-sm text-[var(--pc-text-primary)]">
                    {h.day}
                  </span>
                  <span
                    className={`text-sm font-semibold ${h.open ? "text-[var(--pc-primary)]" : "text-red-500"}`}
                  >
                    {h.time}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "Avis" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[var(--pc-text-primary)]">
                    {rating.toFixed(1)}
                  </div>
                  <StarRow rating={rating} />
                  <div className="text-xs text-[var(--pc-text-secondary)] mt-1">
                    {reviewsCount} avis
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct =
                      star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 3;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3">{star}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: "var(--pc-accent)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {reviewsCount === 0 && (
                <div className="text-center py-8 text-[var(--pc-text-secondary)] text-sm">
                  Aucun avis pour le moment
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "À propos" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {description && (
                <div className="glass-card p-4 rounded-2xl">
                  <p className="text-sm text-[var(--pc-text-secondary)] leading-relaxed">
                    {description}
                  </p>
                </div>
              )}
              <div className="glass-card p-4 rounded-2xl space-y-3">
                <h3 className="font-semibold text-sm text-[var(--pc-text-primary)] mb-1">
                  Contact
                </h3>
                {[
                  phone && { icon: <Phone size={14} />, value: phone },
                  email && { icon: <Mail size={14} />, value: email },
                  address && { icon: <MapPin size={14} />, value: address },
                ]
                  .filter(Boolean)
                  .map((item: any, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]"
                    >
                      <span className="text-[var(--pc-primary)]">
                        {item.icon}
                      </span>
                      {item.value}
                    </div>
                  ))}
              </div>
              <div className="rounded-2xl overflow-hidden bg-[var(--pc-surface-alt)] h-40 flex items-center justify-center border border-[var(--pc-border)]">
                <div className="text-center text-[var(--pc-text-secondary)]">
                  <MapPin
                    size={32}
                    className="mx-auto mb-2 text-[var(--pc-primary)]"
                  />
                  <div className="text-sm font-medium">Voir sur la carte</div>
                  {address && <div className="text-xs">{address}</div>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
