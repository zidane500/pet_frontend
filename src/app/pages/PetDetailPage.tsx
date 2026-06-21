import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Eye,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Tag,
  BadgeCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useListing } from "../../hooks/useListings";
import { useListings } from "../../hooks/useListings";
import { useToggleFavorite } from "../../hooks/useFavorites";
import { useAuth } from "../../hooks/useAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PetDetailPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  listingId?: string;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  vente: {
    label: "Vente",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    icon: "🔵",
  },
  adoption: {
    label: "Adoption",
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
    icon: "💚",
  },
  perdu: {
    label: "Animal perdu",
    color: "#F97316",
    bg: "rgba(249,115,22,0.12)",
    icon: "🔍",
  },
  trouve: {
    label: "Animal trouvé",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
    icon: "🏠",
  },
  accouplement: {
    label: "Accouplement",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    icon: "🤝",
  },
  conseils: {
    label: "Conseils",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.12)",
    icon: "💡",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAge(months: number | null | undefined): string {
  if (!months) return "—";
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12);
  return `${y} an${y > 1 ? "s" : ""}`;
}

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

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(
  price: number | string | null | undefined,
  isFree: boolean,
): string {
  if (isFree) return "Gratuit";

  const numericPrice = toNumber(price);

  if (numericPrice === null || numericPrice <= 0) {
    return "À négocier";
  }

  return `${numericPrice.toLocaleString("fr-TN")} DT`;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4 animate-pulse">
      <div
        className="w-full rounded-3xl bg-[var(--pc-surface-alt)]"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="h-8 bg-[var(--pc-surface-alt)] rounded-2xl w-3/4" />
      <div className="h-6 bg-[var(--pc-surface-alt)] rounded-2xl w-1/4" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-[var(--pc-surface-alt)] rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PetDetailPage({
  onBack,
  onNavigate,
  listingId,
}: PetDetailPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { user, isLoggedIn } = useAuth();

  const id = listingId ? Number(listingId) : 0;
  const { data: listing, isLoading, isError } = useListing(id);
  const { data: similarData } = useListings({
    species: listing?.species ?? undefined,
    page: 1,
  });
  const toggleFavorite = useToggleFavorite();

  const [currentImg, setCurrentImg] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleFavorite = () => {
    setFavorited((f) => !f);
    if (listing)
      toggleFavorite.mutate({ type: "listing", id: listing.id as number });
  };

  // ── Chargement ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--pc-surface)" }}>
        <div
          className="sticky top-0 z-30 glass-card border-b"
          style={{ borderColor: "var(--pc-border)" }}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            >
              <ArrowLeft
                size={20}
                style={{ color: "var(--pc-text-secondary)" }}
              />
            </button>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // ── Erreur ──────────────────────────────────────────────────────────────────
  if (isError || !listing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "var(--pc-surface)" }}
      >
        <span className="text-5xl">😕</span>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Annonce introuvable
        </h2>
        <p
          className="text-sm text-center"
          style={{ color: "var(--pc-text-secondary)" }}
        >
          Cette annonce n'existe plus ou a été supprimée.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl font-semibold text-sm text-white"
          style={{ background: "var(--pc-primary)" }}
        >
          Retour aux annonces
        </button>
      </div>
    );
  }

  // ── Données dérivées ────────────────────────────────────────────────────────
  const photos =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : ["https://picsum.photos/seed/" + listing.id + "/800/600"];
  const typeConfig = TYPE_CONFIG[listing.type] ?? TYPE_CONFIG.vente;
  const description = listing.description ?? "";
  const descShort = description.slice(0, 180);
  const isLongDesc = description.length > 180;
  const seller = listing.user;
  const sellerId = seller?.id ?? listing.user_id;
  const isOwnListing = Boolean(
    user?.id && sellerId && Number(user.id) === Number(sellerId),
  );

  const openSellerConversation = () => {
    if (!sellerId || isOwnListing) return;

    if (!isLoggedIn) {
      onNavigate("login");
      return;
    }

    const params: Record<string, string> = {
      userId: String(sellerId),
      listingId: String(listing.id),
    };

    if (seller?.name) params.partnerName = seller.name;
    if (seller?.avatar) params.partnerAvatar = seller.avatar;

    onNavigate("messages", params);
  };

  const similarItems = (similarData?.data ?? [])
    .filter((s) => s.id !== listing.id)
    .slice(0, 4);

  const prevImg = () =>
    setCurrentImg((i) => (i === 0 ? photos.length - 1 : i - 1));
  const nextImg = () =>
    setCurrentImg((i) => (i === photos.length - 1 ? 0 : i + 1));
  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? nextImg() : prevImg();
    setTouchStart(null);
  };

  // ── Sub-components ──────────────────────────────────────────────────────────

  const Gallery = () => (
    <div className="relative select-none">
      <div
        className="relative w-full overflow-hidden rounded-b-3xl lg:rounded-3xl"
        style={{ aspectRatio: "16/9" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImg}
            src={photos[currentImg]}
            alt={listing.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://picsum.photos/seed/${listing.id}/800/600`;
            }}
          />
        </AnimatePresence>

        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          {currentImg + 1}/{photos.length}
        </div>

        <button
          className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() =>
            navigator.share?.({
              title: listing.title ?? "",
              url: window.location.href,
            })
          }
        >
          <Share2 size={16} className="text-white" />
        </button>

        <button
          onClick={handleFavorite}
          className="absolute top-3 right-12 w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <Heart
            size={16}
            className={favorited ? "fill-red-500 text-red-500" : "text-white"}
          />
        </button>

        {photos.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)" }}
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)" }}
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 mt-2 px-1">
          {photos.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImg(i)}
              className="w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0"
              style={{
                borderColor:
                  currentImg === i ? "var(--pc-primary)" : "transparent",
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const InfoSection = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: typeConfig.bg, color: typeConfig.color }}
        >
          {typeConfig.icon} {typeConfig.label}
        </span>
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: "var(--pc-text-secondary)" }}
        >
          <Eye size={12} />
          <span>{(listing.views_count ?? 0).toLocaleString()} vues</span>
        </div>
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: "var(--pc-text-secondary)" }}
        >
          <Calendar size={12} />
          <span>{formatDate(listing.created_at ?? "")}</span>
        </div>
      </div>

      <h1
        className="text-2xl font-bold leading-tight"
        style={{
          color: "var(--pc-text-primary)",
          fontFamily: "'Sora','Inter',system-ui,sans-serif",
        }}
      >
        {listing.title}
      </h1>

      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-extrabold"
          style={{ color: "var(--pc-primary)" }}
        >
          {formatPrice(listing.price, listing.is_free ?? false)}
        </span>
      </div>

      <div
        className="flex items-center gap-1.5"
        style={{ color: "var(--pc-text-secondary)" }}
      >
        <MapPin size={15} />
        <span className="text-sm">
          {[listing.city, listing.region].filter(Boolean).join(", ")}
        </span>
      </div>
    </div>
  );

  const CharacteristicGrid = () => {
    const traits = [
      { label: "Espèce", value: listing.species ?? "—" },
      { label: "Race", value: listing.breed ?? "—" },
      { label: "Âge", value: formatAge(listing.age_months) },
      { label: "Vacciné", value: listing.is_vaccinated ? "✅ Oui" : "❌ Non" },
      {
        label: "Stérilisé",
        value: listing.is_sterilized ? "✅ Oui" : "❌ Non",
      },
      { label: "Ville", value: listing.city ?? "—" },
    ];
    return (
      <div className="grid grid-cols-2 gap-2">
        {traits.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl p-3"
            style={{ background: "var(--pc-surface-alt)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--pc-text-secondary)" }}
            >
              {t.label}
            </p>
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: "var(--pc-text-primary)" }}
            >
              {t.value}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const DescriptionSection = () => (
    <div>
      <h3
        className="text-base font-bold mb-2"
        style={{ color: "var(--pc-text-primary)" }}
      >
        Description
      </h3>
      {description ? (
        <>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--pc-text-secondary)" }}
          >
            {isLongDesc && !showMore ? descShort + "…" : description}
          </p>
          {isLongDesc && (
            <button
              onClick={() => setShowMore((s) => !s)}
              className="mt-2 text-sm font-semibold"
              style={{ color: "var(--pc-primary)" }}
            >
              {showMore ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </>
      ) : (
        <p
          className="text-sm italic"
          style={{ color: "var(--pc-text-secondary)" }}
        >
          Aucune description fournie.
        </p>
      )}
    </div>
  );

  const SellerCard = () => (
    <div className="glass-card rounded-3xl p-5 space-y-4">
      {seller ? (
        <>
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              {seller.avatar ? (
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: "var(--pc-primary)" }}
                >
                  {seller.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {seller.is_verified && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--pc-primary)" }}
                >
                  <BadgeCheck size={11} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--pc-text-primary)" }}
                >
                  {seller.name}
                </p>
                {seller.is_verified && (
                  <BadgeCheck
                    size={14}
                    style={{ color: "var(--pc-primary)" }}
                  />
                )}
              </div>
              <span
                className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                style={{
                  background: "var(--pc-surface-alt)",
                  color: "var(--pc-text-secondary)",
                }}
              >
                {seller.role ?? "particulier"}
              </span>
              {seller.city && (
                <p
                  className="text-xs mt-1 flex items-center gap-1"
                  style={{ color: "var(--pc-text-secondary)" }}
                >
                  <MapPin size={11} /> {seller.city}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                className="w-full py-3 rounded-2xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: "var(--pc-border)",
                  color: "var(--pc-text-primary)",
                  background: "transparent",
                }}
              >
                <Phone size={16} />
                {listing.contact_phone}
              </a>
            )}
            <button
              className="w-full py-3 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
              }}
              onClick={openSellerConversation}
              disabled={isOwnListing}
            >
              <MessageCircle size={16} />
              {isOwnListing ? "Votre annonce" : "Envoyer un message"}
            </button>
            <button
              className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                background: "rgba(244,167,50,0.15)",
                color: "var(--pc-accent)",
              }}
            >
              <Tag size={16} />
              Faire une offre
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-4">
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: "var(--pc-primary)" }}
          />
        </div>
      )}

      <div className="text-center">
        <button
          className="text-xs flex items-center gap-1 mx-auto"
          style={{ color: "var(--pc-text-secondary)" }}
        >
          <AlertCircle size={12} />
          Signaler cette annonce
        </button>
      </div>
    </div>
  );

  const SimilarListings = () =>
    similarItems.length > 0 ? (
      <div>
        <h3
          className="text-base font-bold mb-3"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Annonces similaires
        </h3>
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {similarItems.map((item) => {
            const tc = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.vente;
            const img =
              item.photos?.[0] ??
              `https://picsum.photos/seed/${item.id}/300/200`;
            return (
              <button
                key={item.id}
                className="flex-shrink-0 w-44 glass-card rounded-2xl overflow-hidden text-left"
                onClick={() =>
                  onNavigate("pet-detail", { id: String(item.id) })
                }
              >
                <img
                  src={img}
                  alt={item.title ?? ""}
                  className="w-full h-28 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://picsum.photos/seed/${item.id}/300/200`;
                  }}
                />
                <div className="p-3">
                  <p
                    className="text-sm font-semibold leading-tight line-clamp-2"
                    style={{ color: "var(--pc-text-primary)" }}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--pc-primary)" }}
                    >
                      {formatPrice(item.price, item.is_free ?? false)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--pc-text-secondary)" }}
                    >
                      {item.city}
                    </span>
                  </div>
                  <span
                    className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: tc.bg, color: tc.color }}
                  >
                    {tc.icon} {tc.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen"
      style={{
        background: "var(--pc-surface)",
        color: "var(--pc-text-primary)",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 glass-card border-b"
        style={{ borderColor: "var(--pc-border)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft
              size={20}
              style={{ color: "var(--pc-text-secondary)" }}
            />
            <span
              className="text-sm font-medium hidden sm:inline"
              style={{ color: "var(--pc-text-secondary)" }}
            >
              Retour
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Heart
                size={20}
                className={favorited ? "fill-red-500 text-red-500" : ""}
                style={!favorited ? { color: "var(--pc-text-secondary)" } : {}}
              />
            </button>
            <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <Share2 size={20} style={{ color: "var(--pc-text-secondary)" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="lg:flex lg:gap-8 lg:items-start">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            <Gallery />

            {/* Mobile info */}
            <div className="lg:hidden space-y-5">
              <InfoSection />
              <div className="flex gap-3">
                {listing.contact_phone && (
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="flex-1 py-3 rounded-2xl font-semibold text-sm border flex items-center justify-center gap-2"
                    style={{
                      borderColor: "var(--pc-border)",
                      color: "var(--pc-text-primary)",
                      background: "transparent",
                    }}
                  >
                    <Phone size={16} />
                    Appeler
                  </a>
                )}
                <button
                  className="flex-[2] py-3 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
                  }}
                  onClick={openSellerConversation}
                  disabled={isOwnListing}
                >
                  <MessageCircle size={16} />
                  {isOwnListing ? "Votre annonce" : "Contacter"}
                </button>
              </div>
            </div>

            <DescriptionSection />

            <div>
              <h3
                className="text-base font-bold mb-3"
                style={{ color: "var(--pc-text-primary)" }}
              >
                Caractéristiques
              </h3>
              <CharacteristicGrid />
            </div>

            <div className="lg:hidden">
              <h3
                className="text-base font-bold mb-3"
                style={{ color: "var(--pc-text-primary)" }}
              >
                Vendeur
              </h3>
              <SellerCard />
            </div>

            <SimilarListings />
          </div>

          {/* Right column desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="glass-card rounded-3xl p-5 space-y-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: typeConfig.bg, color: typeConfig.color }}
                >
                  {typeConfig.icon} {typeConfig.label}
                </span>
                <h2
                  className="font-bold text-xl leading-tight"
                  style={{
                    color: "var(--pc-text-primary)",
                    fontFamily: "'Sora','Inter',system-ui,sans-serif",
                  }}
                >
                  {listing.title}
                </h2>
                <div
                  className="text-3xl font-extrabold"
                  style={{ color: "var(--pc-primary)" }}
                >
                  {formatPrice(listing.price, listing.is_free ?? false)}
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--pc-text-secondary)" }}
                >
                  <MapPin size={14} />
                  {[listing.city, listing.region].filter(Boolean).join(", ")}
                </div>
                <div
                  className="flex items-center gap-3 text-xs"
                  style={{ color: "var(--pc-text-secondary)" }}
                >
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {(listing.views_count ?? 0).toLocaleString()} vues
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(listing.created_at ?? "")}
                  </span>
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    className="w-full py-3 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
                    }}
                    onClick={openSellerConversation}
                    disabled={isOwnListing}
                  >
                    <MessageCircle size={16} />
                    {isOwnListing ? "Votre annonce" : "Envoyer un message"}
                  </button>
                  <button
                    className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(244,167,50,0.15)",
                      color: "var(--pc-accent)",
                    }}
                  >
                    <Tag size={16} />
                    Faire une offre
                  </button>
                </div>
              </div>

              <SellerCard />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-card border-t px-4 py-3 flex items-center gap-3"
        style={{ borderColor: "var(--pc-border)" }}
      >
        <div className="flex-1">
          <p className="text-xs" style={{ color: "var(--pc-text-secondary)" }}>
            Prix
          </p>
          <p
            className="text-xl font-extrabold"
            style={{ color: "var(--pc-primary)" }}
          >
            {formatPrice(listing.price, listing.is_free ?? false)}
          </p>
        </div>
        <button
          className="flex-shrink-0 px-6 py-3 rounded-2xl font-semibold text-sm text-white flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
          }}
          onClick={openSellerConversation}
          disabled={isOwnListing}
        >
          <MessageCircle size={16} />
          {isOwnListing ? "Votre annonce" : "Contacter"}
        </button>
      </div>

      <div className="lg:hidden h-20" />
    </div>
  );
}
