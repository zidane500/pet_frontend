import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Search,
  Bell,
  Home,
  Bookmark,
  MessageCircle,
  User,
  SlidersHorizontal,
  X,
  PlusCircle,
  BadgeCheck,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PostCard } from "../components/feed/PostCard";
import { SkeletonPost } from "../components/feed/SkeletonPost";
import { LangSelector } from "../components/LangSelector";
import { ThemeToggle } from "../components/ThemeToggle";
import { useListings, useListing } from "../../hooks/useListings";
import { useFollowSuggestions, useToggleFollow } from "../../hooks/useFollows";
import { useUnreadCount } from "../../hooks/useNotifications";
import { useAuthStore } from "../../store/authStore";
import type { Listing } from "../../types";

// ← Uniquement les 6 vrais types de Listing (le mock en avait 3 de plus
// qui n'existent pas dans le vrai modèle : urgence/association/vet).
const FILTER_KEYS: (Listing["type"] | "all")[] = [
  "all",
  "adoption",
  "vente",
  "perdu",
  "trouve",
  "accouplement",
  "conseils",
];

const FILTER_DOTS: Record<string, string> = {
  all: "✨",
  adoption: "🟢",
  vente: "🔵",
  perdu: "🟠",
  trouve: "🟣",
  accouplement: "🟡",
  conseils: "💡",
};

interface FeedPageProps {
  onBack: () => void;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
  // ← Permet d'ouvrir le feed directement sur un post précis (ex: lien
  // "Voir la fiche" depuis la file de signalements admin).
  highlightId?: number;
}

export function FeedPage({ onBack, onNavigate, highlightId }: FeedPageProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const unreadNotifications = useUnreadCount();

  const [activeFilter, setActiveFilter] = useState<Listing["type"] | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Listing[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("feed");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasScrolledToHighlight = useRef(false);

  // ← Charge le post ciblé séparément de la pagination normale (il peut
  // être en page 3, 4... peu importe, on veut le voir tout de suite).
  const { data: highlightedListing } = useListing(highlightId ?? 0);

  // ← Petit debounce pour ne pas relancer une requête à chaque frappe
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ← Nouveau filtre/recherche = on repart de la page 1
  useEffect(() => {
    setPage(1);
    setAllPosts([]);
    setAllLoaded(false);
  }, [activeFilter, debouncedSearch]);

  const { data, isLoading, isFetching, refetch } = useListings({
    type: activeFilter === "all" ? undefined : activeFilter,
    search: debouncedSearch || undefined,
    page,
    per_page: 5,
  });

  // ← Accumule les pages au lieu de les remplacer (pagination infinie)
  useEffect(() => {
    if (!data) return;
    setAllPosts((prev) => {
      if (page === 1) return data.data;
      const existingIds = new Set(prev.map((p) => p.id));
      return [...prev, ...data.data.filter((p) => !existingIds.has(p.id))];
    });
    if (data.current_page >= data.last_page) setAllLoaded(true);
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (isFetching || allLoaded) return;
    setPage((p) => p + 1);
  }, [isFetching, allLoaded]);

  // ← Insère le post ciblé en tête de liste s'il n'y est pas déjà (il peut
  // très bien être hors de la première page de pagination).
  useEffect(() => {
    if (!highlightedListing) return;
    setAllPosts((prev) => {
      if (prev.some((p) => p.id === highlightedListing.id)) return prev;
      return [highlightedListing, ...prev];
    });
  }, [highlightedListing]);

  // ← Une fois le post rendu dans le DOM, on scroll jusqu'à lui (une seule
  // fois, pour ne pas re-scroller à chaque re-render de la liste).
  useEffect(() => {
    if (!highlightId || hasScrolledToHighlight.current) return;
    const el = document.getElementById(`post-${highlightId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      hasScrolledToHighlight.current = true;
    }
  }, [allPosts, highlightId]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  const handleRefresh = () => {
    setPage(1);
    setAllPosts([]);
    setAllLoaded(false);
    refetch();
  };

  const SIDEBAR_ITEMS: {
    key: string;
    icon: React.ElementType;
    label: string;
    action: () => void;
    badge?: number;
  }[] = [
    { key: "home", icon: Home, label: t("feed.home"), action: onBack },
    {
      key: "feed",
      icon: TrendingUp,
      label: t("feed.title"),
      action: () => setActiveSidebar("feed"),
    },
    {
      key: "messages",
      icon: MessageCircle,
      label: t("feed.messages"),
      action: () => onNavigate?.("messages"),
    },
    {
      key: "search",
      icon: Search,
      label: t("feed.explore"),
      action: () => onNavigate?.("search"),
    },
    {
      key: "notifications",
      icon: Bell,
      label: t("feed.notifications"),
      badge: unreadNotifications,
      action: () => onNavigate?.("notifications"),
    },
    {
      key: "saved",
      icon: Bookmark,
      label: t("feed.saved"),
      action: () => onNavigate?.("favorites"),
    },
    {
      key: "profile",
      icon: User,
      label: t("mobileNav.profile"),
      action: () => onNavigate?.("profile"),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12] flex overflow-x-hidden w-full">
      {/* ── Desktop Left Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 xl:w-72 bg-[var(--pc-surface)] dark:bg-[#0D1117] border-r border-[var(--pc-border)] dark:border-[var(--pc-border)] z-40 px-4 py-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          onClick={onBack}
          className="flex items-center gap-2.5 mb-8 cursor-pointer px-2"
        >
          <span className="text-2xl">🐾</span>
          <span
            className="font-black bg-gradient-to-r from-[var(--pc-primary)] to-emerald-500 bg-clip-text text-transparent"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "20px" }}
          >
            Animali<span className="text-[var(--pc-accent)]">.tn</span>
          </span>
        </motion.div>

        <nav className="flex-1 space-y-1">
          {SIDEBAR_ITEMS.map(({ key, icon: Icon, label, action, badge }) => (
            <motion.button
              key={key}
              whileHover={{ x: isRtl ? -4 : 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={action}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                activeSidebar === key && key !== "home"
                  ? "bg-[var(--pc-primary-light)] dark:bg-[var(--pc-primary-light)]/20 text-[var(--pc-primary)]"
                  : "text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] dark:hover:bg-[#1C2128] hover:text-[var(--pc-text-primary)]"
              } ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={activeSidebar === key ? 2.5 : 1.8}
                />
                {badge && badge > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    {badge}
                  </span>
                ) : null}
              </div>
              <span className="font-semibold" style={{ fontSize: "15px" }}>
                {label}
              </span>
            </motion.button>
          ))}
        </nav>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate?.("create-listing")}
          className="gradient-btn w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl mt-4 shadow-lg shadow-[var(--pc-primary)]/25"
          style={{ fontSize: "14px" }}
        >
          <PlusCircle size={18} />
          {t("nav.publishAd")}
        </motion.button>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--pc-border)]">
          <ThemeToggle />
          <LangSelector direction="up" />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main
        className={`flex-1 min-w-0 overflow-x-hidden ${isRtl ? "lg:mr-64 xl:lg:mr-72" : "lg:ml-64 xl:lg:ml-72"} flex flex-col`}
      >
        {/* Mobile Top Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[var(--pc-surface)]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-b border-[var(--pc-border)] px-4 py-3">
          <div
            className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors flex-shrink-0"
            >
              <ArrowLeft
                size={18}
                className={`text-[var(--pc-text-primary)] ${isRtl ? "rotate-180" : ""}`}
              />
            </motion.button>

            {showSearch ? (
              <div
                className={`flex-1 flex items-center gap-2 bg-[var(--pc-surface-alt)] rounded-xl px-3 py-2 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <Search
                  size={16}
                  className="text-[var(--pc-text-secondary)] flex-shrink-0"
                />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("feed.search")}
                  className="flex-1 bg-transparent text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none"
                  style={{ fontSize: "14px" }}
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                >
                  <X size={16} className="text-[var(--pc-text-secondary)]" />
                </button>
              </div>
            ) : (
              <>
                <span
                  className="flex-1 font-black text-[var(--pc-text-primary)]"
                  style={{ fontFamily: "Sora, sans-serif", fontSize: "17px" }}
                >
                  {t("feed.title")}
                </span>
                <div
                  className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSearch(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors"
                  >
                    <Search
                      size={18}
                      className="text-[var(--pc-text-secondary)]"
                    />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors"
                    onClick={() => onNavigate?.("profile")}
                  >
                    <Bell
                      size={18}
                      className="text-[var(--pc-text-secondary)]"
                    />
                    {unreadNotifications > 0 && (
                      <span
                        className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
                        style={{ fontSize: "8px" }}
                      >
                        {unreadNotifications}
                      </span>
                    )}
                  </motion.button>
                  <LangSelector direction="down" />
                </div>
              </>
            )}
          </div>
        </header>

        <div
          className={`flex gap-6 max-w-6xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 min-w-0 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {/* Center: Feed */}
          <div className="flex-1 min-w-0 w-full lg:max-w-xl lg:mx-0">
            {/* Desktop search bar */}
            <div className="hidden lg:flex items-center gap-3 mb-5">
              <div
                className={`flex-1 flex items-center gap-2 bg-[var(--pc-surface)] dark:bg-[#161B22] rounded-xl px-4 py-3 border border-[var(--pc-border)] ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <Search
                  size={16}
                  className="text-[var(--pc-text-secondary)] flex-shrink-0"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("feed.search")}
                  className="flex-1 bg-transparent text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none"
                  style={{ fontSize: "14px" }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] hover:border-[var(--pc-primary)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-primary)] transition-all"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <RefreshCw
                  size={16}
                  className={isFetching && page === 1 ? "animate-spin" : ""}
                />
                {t("feed.filters")}
              </motion.button>
            </div>

            {/* Filter chips */}
            <div
              className="flex gap-2 overflow-x-auto pb-2 mb-4"
              style={{
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {FILTER_KEYS.map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveFilter(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full font-semibold transition-all duration-200 whitespace-nowrap border ${
                    activeFilter === key
                      ? "bg-[var(--pc-primary)] border-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/25"
                      : "bg-[var(--pc-surface)] dark:bg-[#161B22] border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)]"
                  }`}
                  style={{ fontSize: "13px" }}
                >
                  <span>{FILTER_DOTS[key]}</span>
                  <span>
                    {key === "all"
                      ? t("feed.all")
                      : t(`feed.filterTypes.${key}`)}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Refresh pill (mobile) */}
            <div className="flex justify-center mb-4 lg:hidden">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-[var(--pc-primary)] text-white px-4 py-2 rounded-full shadow-lg shadow-[var(--pc-primary)]/30"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <RefreshCw
                  size={14}
                  className={isFetching && page === 1 ? "animate-spin" : ""}
                />
                Actualiser
              </motion.button>
            </div>

            {/* Posts */}
            {!isLoading && allPosts.length === 0 ? (
              <div className="text-center py-16 text-[var(--pc-text-secondary)]">
                <div className="text-5xl mb-4">🐾</div>
                <p style={{ fontSize: "16px", fontWeight: 600 }}>
                  Aucune publication trouvée
                </p>
              </div>
            ) : (
              allPosts.map((listing) => (
                <div key={listing.id} id={`post-${listing.id}`}>
                  <PostCard listing={listing} onNavigate={onNavigate} />
                </div>
              ))
            )}

            {/* Skeleton loaders */}
            {(isLoading || (isFetching && page > 1)) && (
              <>
                <SkeletonPost />
                <SkeletonPost />
              </>
            )}

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="h-4" />

            {/* All loaded */}
            {allLoaded && allPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-[var(--pc-text-secondary)]"
              >
                <div className="text-4xl mb-3">🐾</div>
                <p style={{ fontSize: "15px", fontWeight: 600 }}>
                  {t("feed.noMore")}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right panel (desktop only) */}
          <aside className="hidden xl:flex flex-col gap-5 w-72 flex-shrink-0">
            <FollowSuggestionsCard
              isRtl={isRtl}
              t={t}
              onNavigate={onNavigate}
            />

            {/* Autres publications récentes */}
            {allPosts.length > 3 && (
              <div className="bg-[var(--pc-surface)] dark:bg-[#161B22] rounded-2xl p-4 border border-[var(--pc-border)]">
                <h3
                  className="font-bold text-[var(--pc-text-primary)] mb-3"
                  style={{ fontSize: "14px" }}
                >
                  {t("feed.recommended")}
                </h3>
                <div className="space-y-2">
                  {allPosts.slice(3, 6).map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        onNavigate?.("pet-detail", { id: String(p.id) })
                      }
                      className={`flex gap-2 items-center w-full text-left ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <img
                        src={
                          p.photos?.[0] ??
                          `https://picsum.photos/seed/rec-${p.id}/100/100`
                        }
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-[var(--pc-text-primary)] truncate"
                          style={{ fontSize: "12px" }}
                        >
                          {p.user?.name}
                        </p>
                        <p
                          className="text-[var(--pc-text-secondary)] truncate"
                          style={{ fontSize: "11px" }}
                        >
                          {(p.description ?? p.title).slice(0, 50)}...
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p
              className="text-[var(--pc-text-secondary)] px-1"
              style={{ fontSize: "11px" }}
            >
              © 2026 Animali.tn · {t("footer.links.privacy")} ·{" "}
              {t("footer.links.tos")}
            </p>
          </aside>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-4 left-3 right-3 z-50">
        <div
          className={`flex items-center justify-around px-2 py-2.5 rounded-[28px] shadow-2xl ${isRtl ? "flex-row-reverse" : ""}`}
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          }}
        >
          {[
            { key: "home", icon: Home, action: onBack },
            { key: "feed", icon: TrendingUp, action: () => {} },
            {
              key: "publish",
              icon: PlusCircle,
              action: () => onNavigate?.("create-listing"),
              isPrimary: true,
            },
            {
              key: "messages",
              icon: MessageCircle,
              action: () => onNavigate?.("messages"),
            },
            {
              key: "profile",
              icon: User,
              action: () => onNavigate?.("profile"),
            },
          ].map(({ key, icon: Icon, action, isPrimary }) => {
            const isActive = key === "feed";
            if (isPrimary) {
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  onClick={action}
                  className="flex flex-col items-center -mt-7"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-btn flex items-center justify-center shadow-xl">
                    <Icon size={22} className="text-white" />
                  </div>
                </motion.button>
              );
            }
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.85 }}
                onClick={action}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl ${isActive ? "text-[var(--pc-primary)]" : "text-[var(--pc-text-secondary)]"}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              </motion.button>
            );
          })}
        </div>
      </nav>
      <div className="lg:hidden h-24" />
    </div>
  );
}

// ── Suggestions d'abonnement (encart séparé pour rester lisible) ──────────────
function FollowSuggestionsCard({
  isRtl,
  t,
  onNavigate,
}: {
  isRtl: boolean;
  t: (key: string) => string;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { data: suggestions } = useFollowSuggestions();
  const toggleFollow = useToggleFollow();
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());

  if (!isLoggedIn || !suggestions || suggestions.length === 0) return null;

  const handleFollow = (userId: number) => {
    setFollowedIds((prev) => new Set(prev).add(userId));
    toggleFollow.mutate(userId, {
      onError: () => {
        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      },
    });
  };

  const visible = suggestions.filter((s) => !followedIds.has(s.id));
  if (visible.length === 0) return null;

  return (
    <div className="bg-[var(--pc-surface)] dark:bg-[#161B22] rounded-2xl p-4 border border-[var(--pc-border)]">
      <h3
        className="font-bold text-[var(--pc-text-primary)] mb-4"
        style={{ fontSize: "14px" }}
      >
        {t("feed.suggestions")}
      </h3>
      <div className="space-y-3">
        {visible.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <button
              onClick={() => onNavigate?.("profile", { userId: String(s.id) })}
              className={`flex items-center gap-3 text-left ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <div className="relative">
                <img
                  src={
                    s.avatar ?? `https://picsum.photos/seed/sugg-${s.id}/80/80`
                  }
                  alt={s.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[var(--pc-primary)] rounded-full flex items-center justify-center">
                  <BadgeCheck size={9} className="text-white" />
                </div>
              </div>
              <div>
                <p
                  className="font-semibold text-[var(--pc-text-primary)]"
                  style={{ fontSize: "13px" }}
                >
                  {s.name}
                </p>
                <p
                  className="text-[var(--pc-text-secondary)]"
                  style={{ fontSize: "11px" }}
                >
                  {s.followers_count.toLocaleString()} abonnés
                </p>
              </div>
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFollow(s.id)}
              className="text-[var(--pc-primary)] border border-[var(--pc-primary)] px-3 py-1.5 rounded-lg font-semibold hover:bg-[var(--pc-primary-light)] transition-colors"
              style={{ fontSize: "12px" }}
            >
              {t("feed.follow")}
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}
