import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Calendar,
  MessageCircle,
  Share2,
  Star,
  Eye,
  Shield,
  Heart,
  Clock,
  MoreHorizontal,
  Flag,
  X,
  Instagram,
  Facebook,
  Link,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfile } from "../../hooks/useProfile";
import { useListings } from "../../hooks/useListings";
import { useAuthStore } from "../../store/authStore";
import type { Listing } from "../../types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  userId?: string;
}

type Tab = "annonces" | "avis" | "apropos";

// ── Constants ──────────────────────────────────────────────────────────────────

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

const REPORT_REASONS = [
  "Faux profil",
  "Comportement abusif",
  "Spam",
  "Arnaque",
  "Autre",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(listing: Listing): string {
  if (listing.is_free || listing.type === "adoption") return "Gratuit";
  if (listing.price != null && listing.price !== "")
    return `${Number(listing.price).toLocaleString("fr-TN")} DT`;
  return "—";
}

function formatAge(months?: number | null): string | null {
  if (!months) return null;
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12);
  return `${y} an${y > 1 ? "s" : ""}`;
}

function memberSince(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-TN", {
    month: "long",
    year: "numeric",
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-[var(--pc-border)]"
          }
        />
      ))}
    </div>
  );
}

function ListingMiniCard({
  listing,
  onClick,
}: {
  listing: Listing;
  onClick: () => void;
}) {
  const badge = TYPE_BADGE[listing.type] ?? TYPE_BADGE.vente;
  const image =
    listing.photos?.[0] ??
    `https://picsum.photos/seed/listing-${listing.id}/400/300`;
  const age = formatAge(listing.age_months);
  const price = formatPrice(listing);

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(29,125,95,0.12)" }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/lb-${listing.id}/400/300`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span
          className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}
        >
          {badge.label}
        </span>
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white px-1.5 py-0.5 rounded-full"
          style={{ fontSize: "9px" }}
        >
          <Eye size={8} /> {(listing.views_count ?? 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3">
        <p
          className="font-bold text-[var(--pc-text-primary)] truncate"
          style={{ fontFamily: "Sora, sans-serif", fontSize: "12px" }}
        >
          {listing.title}
        </p>
        <div className="flex items-center justify-between mt-1">
          {listing.city && (
            <div
              className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
              style={{ fontSize: "10px" }}
            >
              <MapPin size={8} /> {listing.city}
            </div>
          )}
          <span
            className="font-black text-[var(--pc-primary)]"
            style={{ fontSize: "12px" }}
          >
            {price}
          </span>
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {age && (
            <span
              className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md"
              style={{ fontSize: "9px" }}
            >
              {age}
            </span>
          )}
          {listing.species && (
            <span
              className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md"
              style={{ fontSize: "9px" }}
            >
              {listing.species}
            </span>
          )}
          {listing.is_vaccinated && (
            <span
              className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md"
              style={{ fontSize: "9px" }}
            >
              💉
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReportModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    setTimeout(onClose, 1500);
  };
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full sm:max-w-sm glass-card rounded-t-3xl sm:rounded-3xl p-6 mx-4"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        {submitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">
              ✅
            </div>
            <p className="font-bold text-[var(--pc-text-primary)]">
              Signalement envoyé
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-[var(--pc-text-primary)]"
                style={{ fontSize: "16px" }}
              >
                Signaler ce profil
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected === reason ? "border-[var(--pc-primary)] bg-[var(--pc-primary)]" : "border-[var(--pc-border)]"}`}
                  >
                    {selected === reason && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="report"
                    value={reason}
                    checked={selected === reason}
                    onChange={() => setSelected(reason)}
                    className="sr-only"
                  />
                  <span
                    className="text-[var(--pc-text-primary)] font-medium"
                    style={{ fontSize: "13px" }}
                  >
                    {reason}
                  </span>
                </label>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!selected}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, var(--pc-primary), #2aad85)",
                fontSize: "14px",
              }}
            >
              Envoyer le signalement
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[var(--pc-text-secondary)]">
        <Loader2 size={32} className="animate-spin text-[var(--pc-primary)]" />
        <p className="text-sm">Chargement du profil...</p>
      </div>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="font-bold text-[var(--pc-text-primary)] mb-2">
          Profil introuvable
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

// ── Main Component ─────────────────────────────────────────────────────────────

export function ProfilePage({ onBack, onNavigate, userId }: ProfilePageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { user: currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>("annonces");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followAnim, setFollowAnim] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // ── API ──
  const profileId = userId ? Number(userId) : (currentUser?.id ?? 0);
  const {
    data: profileUser,
    isLoading: userLoading,
    isError,
  } = useProfile(profileId);

  // Charger les annonces de cet utilisateur
  const { data: listingsData, isLoading: listingsLoading } = useListings(
    profileId ? { per_page: 12 } : undefined,
  );
  // Filtrer côté client les annonces qui appartiennent à cet utilisateur
  const userListings = (listingsData?.data ?? []).filter(
    (l) => l.user_id === profileId,
  );

  if (!profileId || userLoading) return <LoadingState />;
  if (isError || !profileUser) return <ErrorState onBack={onBack} />;

  // ── Derived ──
  const isOwnProfile = !userId || profileUser.id === currentUser?.id;
  const avatar =
    profileUser.avatar ??
    `https://picsum.photos/seed/user-${profileUser.id}/200/200`;
  const cover = `https://picsum.photos/seed/cover-${profileUser.id}/800/300`;
  const since = memberSince(profileUser.created_at);
  const location =
    [profileUser.city, profileUser.region].filter(Boolean).join(", ") || null;

  const handleFollowToggle = () => {
    setIsFollowing((prev) => !prev);
    setFollowAnim(true);
    setTimeout(() => setFollowAnim(false), 600);
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(`https://animali.tn/profile/${profileUser.id}`)
      .catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleMessage = () => {
    onNavigate("messages", {
      userId: String(profileUser.id),
      partnerName: profileUser.name,
    });
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "annonces", label: `Annonces (${userListings.length})` },
    { key: "avis", label: "Avis" },
    { key: "apropos", label: "À propos" },
  ];

  return (
    <div
      className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            onClose={() => {
              setShowReportModal(false);
              setShowMoreMenu(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card rounded-full px-5 py-2.5 shadow-xl border border-[var(--pc-border)] flex items-center gap-2"
          >
            <Link size={14} className="text-[var(--pc-primary)]" />
            <span className="text-sm font-semibold text-[var(--pc-text-primary)]">
              Lien copié !
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
        >
          <ArrowLeft size={20} className={isRtl ? "rotate-180" : ""} />
        </motion.button>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
          >
            <Share2 size={18} />
          </motion.button>
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMoreMenu((v) => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
            >
              <MoreHorizontal size={18} />
            </motion.button>
            <AnimatePresence>
              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-40 w-48 glass-card rounded-2xl border border-[var(--pc-border)] shadow-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Flag size={14} /> Signaler ce profil
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-40 sm:h-56 overflow-hidden">
        <img
          src={cover}
          alt="cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://picsum.photos/seed/cover-default/800/300";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* Profile section */}
      <div className="relative px-4 -mt-16">
        <div className="flex items-end gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={avatar}
              alt={profileUser.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--pc-surface)] dark:ring-[#0D1117] shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://picsum.photos/seed/avatar-fb/200/200";
              }}
            />
            {profileUser.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--pc-primary)] rounded-full flex items-center justify-center shadow-lg">
                <BadgeCheck size={16} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1" />
          {/* Desktop actions */}
          <div
            className={`hidden sm:flex items-center gap-2 pb-1 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            {isOwnProfile ? (
              <button
                onClick={() => onNavigate("settings")}
                className="px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all"
                style={{ fontSize: "13px" }}
              >
                Modifier le profil
              </button>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  animate={followAnim ? { scale: [1, 1.12, 1] } : {}}
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 rounded-xl font-bold transition-all ${isFollowing ? "border border-[var(--pc-border)] text-[var(--pc-text-secondary)]" : "bg-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/25"}`}
                  style={{ fontSize: "13px" }}
                >
                  {isFollowing ? "Abonné ✓" : "Suivre"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all"
                  style={{ fontSize: "13px" }}
                >
                  <MessageCircle size={15} /> Message
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="mb-4">
          <div
            className={`flex items-center gap-2 flex-wrap mb-1 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <h1
              className="font-black text-[var(--pc-text-primary)]"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "20px" }}
            >
              {profileUser.name}
            </h1>
            {profileUser.is_verified && (
              <BadgeCheck size={20} className="text-[var(--pc-primary)]" />
            )}
            <span
              className="bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] px-2.5 py-0.5 rounded-full font-semibold capitalize"
              style={{ fontSize: "11px" }}
            >
              {profileUser.role}
            </span>
          </div>
          {profileUser.bio && (
            <p
              className="text-[var(--pc-text-secondary)] mb-3 leading-relaxed"
              style={{ fontSize: "13px" }}
            >
              {profileUser.bio}
            </p>
          )}
          <div
            className={`flex flex-wrap items-center gap-3 text-[var(--pc-text-secondary)] ${isRtl ? "flex-row-reverse" : ""}`}
            style={{ fontSize: "12px" }}
          >
            {location && (
              <span
                className={`flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <MapPin size={12} /> {location}
              </span>
            )}
            <span
              className={`flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <Calendar size={12} /> Membre depuis {since}
            </span>
          </div>
        </div>

        {/* Trust indicators */}
        <div
          className={`flex flex-wrap gap-2 mb-4 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {profileUser.is_verified && (
            <div
              className={`flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-1.5 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <Shield
                size={12}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <span
                className="text-emerald-700 dark:text-emerald-400 font-semibold"
                style={{ fontSize: "11px" }}
              >
                Compte vérifié
              </span>
            </div>
          )}
          <div
            className={`flex items-center gap-1.5 bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-1.5 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <Eye size={12} className="text-[var(--pc-text-secondary)]" />
            <span
              className="text-[var(--pc-text-secondary)] font-semibold"
              style={{ fontSize: "11px" }}
            >
              {userListings.length} annonce
              {userListings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Mobile actions */}
        <div
          className={`sm:hidden flex items-center gap-2 mb-5 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {isOwnProfile ? (
            <button
              onClick={() => onNavigate("settings")}
              className="flex-1 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all"
              style={{ fontSize: "13px" }}
            >
              Modifier le profil
            </button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={followAnim ? { scale: [1, 1.12, 1] } : {}}
                onClick={handleFollowToggle}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isFollowing ? "border border-[var(--pc-border)] text-[var(--pc-text-secondary)]" : "bg-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/25"}`}
                style={{ fontSize: "13px" }}
              >
                {isFollowing ? "Abonné ✓" : "Suivre"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleMessage}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all"
                style={{ fontSize: "13px" }}
              >
                <MessageCircle size={15} /> Message
              </motion.button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div
          className={`flex items-center border-b border-[var(--pc-border)] mb-5 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === key ? "text-[var(--pc-primary)]" : "text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"}`}
              style={{ fontSize: "13px" }}
            >
              {label}
              {activeTab === key && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--pc-primary)] rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "annonces" && (
            <motion.div
              key="annonces"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="pb-8"
            >
              {listingsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={28}
                    className="animate-spin text-[var(--pc-primary)]"
                  />
                </div>
              ) : userListings.length === 0 ? (
                <div className="text-center py-16 text-[var(--pc-text-secondary)]">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-medium">Aucune annonce publiée</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {userListings.map((listing) => (
                    <ListingMiniCard
                      key={listing.id}
                      listing={listing}
                      onClick={() =>
                        onNavigate("pet-detail", { id: String(listing.id) })
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "avis" && (
            <motion.div
              key="avis"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center py-20 gap-4 text-center pb-8"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--pc-surface-alt)] flex items-center justify-center text-4xl">
                ⭐
              </div>
              <p className="text-[var(--pc-text-secondary)] text-sm font-medium">
                Les avis arrivent bientôt
              </p>
            </motion.div>
          )}

          {activeTab === "apropos" && (
            <motion.div
              key="apropos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 pb-8"
            >
              {profileUser.bio && (
                <div
                  className="glass-card rounded-2xl p-4"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <p
                    className="font-bold text-[var(--pc-text-primary)] mb-2"
                    style={{ fontSize: "13px" }}
                  >
                    Bio
                  </p>
                  <p
                    className="text-[var(--pc-text-secondary)] leading-relaxed"
                    style={{ fontSize: "13px" }}
                  >
                    {profileUser.bio}
                  </p>
                </div>
              )}
              <div
                className="glass-card rounded-2xl p-4 flex flex-col gap-3"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--pc-primary)]" />
                  <span
                    className="text-[var(--pc-text-secondary)]"
                    style={{ fontSize: "12px" }}
                  >
                    Membre depuis {since}
                  </span>
                </div>
                {profileUser.is_verified && (
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-emerald-500" />
                    <span
                      className="text-emerald-600 dark:text-emerald-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Compte vérifié
                    </span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--pc-primary)]" />
                    <span
                      className="text-[var(--pc-text-secondary)]"
                      style={{ fontSize: "12px" }}
                    >
                      {location}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <span
                    className="text-[var(--pc-text-secondary)]"
                    style={{ fontSize: "12px" }}
                  >
                    Rôle :{" "}
                    <span className="capitalize font-medium">
                      {profileUser.role}
                    </span>
                  </span>
                </div>
              </div>
              <div
                className="glass-card rounded-2xl p-4"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <p
                  className="font-bold text-[var(--pc-text-primary)] mb-3"
                  style={{ fontSize: "13px" }}
                >
                  Réseaux sociaux
                </p>
                <div className="flex gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-pink-400 hover:text-pink-500 transition-all"
                    style={{ fontSize: "12px" }}
                  >
                    <Instagram size={14} /> Instagram
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-blue-500 hover:text-blue-600 transition-all"
                    style={{ fontSize: "12px" }}
                  >
                    <Facebook size={14} /> Facebook
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
