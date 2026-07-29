import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  BadgeCheck,
  X,
  Copy,
  Flag,
  EyeOff,
  Link,
  Check,
  Loader2,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Post, Comment as CommentType } from "../../../types";
import { useAuthStore } from "../../../store/authStore";
import { useToggleLike } from "../../../hooks/useLikes";
import { useToggleFavorite } from "../../../hooks/useFavorites";
import { useComments, useCreateComment } from "../../../hooks/useComments";
import { useCreateReport } from "../../../hooks/useReports";
import { postsApi } from "../../../api/posts";

const REPORT_REASONS = [
  "Contenu inapproprié",
  "Spam",
  "Arnaque",
  "Maltraitance",
  "Autre",
];

// ── Share Modal (identique à avant, juste branchée sur /feed/:postId — il
// n'existe pas de page dédiée à un post seul, on renvoie vers le feed qui
// scroll automatiquement dessus via highlightId) ────────
function ShareModal({
  postId,
  onClose,
  onShared,
}: {
  postId: number;
  onClose: () => void;
  onShared: () => void;
}) {
  const url = `${window.location.origin}/feed/${postId}`;
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    onShared();
    setTimeout(() => setCopied(false), 2000);
  };
  const shareButtons = [
    {
      label: "WhatsApp",
      bg: "bg-green-500",
      emoji: "📱",
      href: `https://wa.me/?text=${encodeURIComponent(url)}`,
    },
    {
      label: "Facebook",
      bg: "bg-blue-600",
      emoji: "📘",
      href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "Twitter",
      bg: "bg-sky-500",
      emoji: "🐦",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    },
    {
      label: "Email",
      bg: "bg-gray-600",
      emoji: "✉️",
      href: `mailto:?body=${encodeURIComponent(url)}`,
    },
  ];
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
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-bold text-[var(--pc-text-primary)]"
            style={{ fontSize: "16px" }}
          >
            Partager cette publication
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] transition-colors"
          >
            <X size={16} className="text-[var(--pc-text-secondary)]" />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[var(--pc-surface-alt)] rounded-xl px-3 py-2.5 border border-[var(--pc-border)] mb-4">
          <Link
            size={14}
            className="text-[var(--pc-text-secondary)] flex-shrink-0"
          />
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-[var(--pc-text-secondary)] text-xs focus:outline-none truncate"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${copied ? "bg-emerald-500 text-white" : "bg-[var(--pc-primary)] text-white"}`}
          >
            {copied ? (
              <>
                <Check size={12} /> Copié
              </>
            ) : (
              <>
                <Copy size={12} /> Copier
              </>
            )}
          </motion.button>
        </div>
        <div className="flex items-center justify-around gap-2">
          {shareButtons.map(({ label, bg, emoji, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onShared}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center text-xl shadow-md hover:scale-110 transition-transform`}
              >
                {emoji}
              </div>
              <span className="text-[10px] font-semibold text-[var(--pc-text-secondary)]">
                {label}
              </span>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Report Modal — signale la publication via POST /reports (type "post"
// désigne ici "un élément du feed", peu importe qu'il s'agisse d'une
// annonce ou d'un post — c'est déjà la valeur utilisée côté backend) ──
function ReportModal({
  postId,
  onClose,
}: {
  postId: number;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const createReport = useCreateReport();

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      await createReport.mutateAsync({
        type: "post",
        id: postId,
        reason: selected,
        details: details.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } catch {
      // ← L'erreur reste affichée sous le bouton (voir plus bas), la modale
      // ne se ferme pas pour laisser l'utilisateur réessayer.
    }
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
            <p className="text-[var(--pc-text-secondary)] text-sm text-center">
              Merci, notre équipe va examiner ce contenu.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-[var(--pc-text-primary)]"
                style={{ fontSize: "16px" }}
              >
                Signaler la publication
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] transition-colors"
              >
                <X size={16} className="text-[var(--pc-text-secondary)]" />
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
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Détails supplémentaires (optionnel)"
              rows={2}
              className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2 text-sm text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40 resize-none mb-4"
            />
            {createReport.isError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-3 py-2">
                <AlertCircle size={14} /> Échec de l'envoi. Réessayez.
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!selected || createReport.isPending}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--pc-primary), #2aad85)",
                fontSize: "14px",
              }}
            >
              {createReport.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Envoyer le signalement"
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ← Basé sur le rôle de l'auteur (toujours pertinent : un post peut venir
// d'un particulier, éleveur, refuge ou vétérinaire — indépendamment du
// fait que ce ne soit plus une annonce marchande).
const USER_TYPE_COLORS: Record<string, string> = {
  particulier: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  eleveur:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  refuge:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  vet: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

function roleToUserType(role?: string): string {
  switch (role) {
    case "breeder":
      return "eleveur";
    case "shelter":
      return "refuge";
    case "vet":
      return "vet";
    default:
      return "particulier";
  }
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diffSec = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diffSec < 60) return "à l'instant";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}j`;
  return new Date(dateStr).toLocaleDateString("fr-TN");
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface PostCardProps {
  post: Post;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export function PostCard({ post, onNavigate }: PostCardProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const currentUser = useAuthStore((s) => s.user);

  const [liked, setLiked] = useState(!!post.is_liked_by_me);
  const [likes, setLikes] = useState(post.likes_count ?? 0);
  const [saved, setSaved] = useState(!!post.is_saved_by_me);
  const [sharesCount, setSharesCount] = useState(post.shares_count ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; author: string } | null>(
    null,
  );
  const [expanded, setExpanded] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [heartAnim, setHeartAnim] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const touchStartX = useRef(0);

  const toggleLike = useToggleLike();
  const toggleFavorite = useToggleFavorite();
  const { data: commentsData, isLoading: commentsLoading } = useComments(
    "post",
    post.id,
    showComments,
  );
  const createComment = useCreateComment("post", post.id);
  const shareMutation = useMutation({
    mutationFn: () => postsApi.share(post.id),
  });

  // ← Contrairement à une annonce, un post peut être 100% textuel : pas de
  // photo de secours forcée, le bloc média ne s'affiche que s'il y a
  // vraiment des photos.
  const media = post.photos ?? [];
  const hasMedia = media.length > 0;
  const hasMore = media.length > 1;
  const caption = post.content ?? "";
  const captionLong = caption.length > 180;
  const userType = roleToUserType(post.user?.role);
  const comments = commentsData?.data ?? [];

  // ← Toute action sociale nécessite un compte ; sinon on renvoie vers /login
  const requireAuth = (action: () => void) => {
    if (!isLoggedIn) {
      onNavigate?.("login");
      return;
    }
    action();
  };

  const handleLike = () =>
    requireAuth(() => {
      const wasLiked = liked;
      setLiked((v) => !v);
      setLikes((v) => (wasLiked ? v - 1 : v + 1));
      if (!wasLiked) {
        setHeartAnim(true);
        setTimeout(() => setHeartAnim(false), 700);
      }

      toggleLike.mutate(
        { type: "post", id: post.id },
        {
          onSuccess: (data) => {
            setLiked(data.liked);
            setLikes(data.likes_count);
          },
          onError: () => {
            setLiked(wasLiked);
            setLikes((v) => (wasLiked ? v + 1 : v - 1));
          },
        },
      );
    });

  const handleSave = () =>
    requireAuth(() => {
      const wasSaved = saved;
      setSaved((v) => !v);
      toggleFavorite.mutate(
        { type: "post", id: post.id },
        { onError: () => setSaved(wasSaved) },
      );
    });

  const handleShared = () => {
    shareMutation.mutate(undefined, {
      onSuccess: (data) => setSharesCount(data.shares_count),
    });
  };

  const nextMedia = () => setMediaIndex((i) => (i + 1) % media.length);
  const prevMedia = () =>
    setMediaIndex((i) => (i - 1 + media.length) % media.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? nextMedia() : prevMedia();
  };

  const handleReply = (commentId: number, author: string) => {
    setReplyTo({ id: commentId, author });
    setCommentText(`@${author} `);
    setShowComments(true);
  };
  const handleClearReply = () => {
    setReplyTo(null);
    setCommentText("");
  };

  const handleSubmitComment = () =>
    requireAuth(() => {
      const body = commentText.trim();
      if (!body) return;
      createComment.mutate(
        { body, parentId: replyTo?.id },
        {
          onSuccess: () => {
            setCommentText("");
            setReplyTo(null);
          },
        },
      );
    });

  const handleCommentLike = (commentId: number) =>
    requireAuth(() => {
      toggleLike.mutate(
        { type: "comment", id: commentId },
        {
          onSuccess: () => {
            // ← Resynchronise la liste des commentaires pour refléter le
            // nouveau compteur/état sans dupliquer la logique d'optimistic
            // update ici (les commentaires changent moins souvent que les
            // likes de posts).
            queryClient.invalidateQueries({
              queryKey: ["comments", "post", post.id],
            });
          },
        },
      );
    });

  return (
    <>
      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            postId={post.id}
            onClose={() => setShowShareModal(false)}
            onShared={handleShared}
          />
        )}
        {showReportModal && (
          <ReportModal
            postId={post.id}
            onClose={() => {
              setShowReportModal(false);
              setShowMoreMenu(false);
            }}
          />
        )}
      </AnimatePresence>
      <motion.article
        id={`post-${post.id}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="glass-card rounded-2xl overflow-hidden border border-[var(--pc-border)]/60 dark:border-[var(--pc-border)]/40 mb-4 w-full"
        style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)", maxWidth: "100%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
          <div
            className={`flex items-center gap-3 cursor-pointer ${isRtl ? "flex-row-reverse" : ""}`}
            onClick={() =>
              onNavigate?.("profile", {
                userId: String(post.user?.id ?? ""),
              })
            }
          >
            <div className="relative flex-shrink-0">
              <img
                src={
                  post.user?.avatar ??
                  `https://picsum.photos/seed/user-${post.user_id}/80/80`
                }
                alt={post.user?.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-[var(--pc-border)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://picsum.photos/seed/${post.id}/80/80`;
                }}
              />
              {post.user?.is_verified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[var(--pc-primary)] rounded-full flex items-center justify-center">
                  <BadgeCheck size={11} className="text-white" />
                </div>
              )}
            </div>
            <div>
              <div
                className={`flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <span
                  className="font-bold text-[var(--pc-text-primary)] hover:text-[var(--pc-primary)] transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  {post.user?.name}
                </span>
              </div>
              <div
                className={`flex items-center gap-2 mt-0.5 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${USER_TYPE_COLORS[userType]}`}
                >
                  {t(`feed.userTypes.${userType}`)}
                </span>
                <span
                  className="text-[var(--pc-text-secondary)]"
                  style={{ fontSize: "11px" }}
                >
                  · {timeAgo(post.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors"
            >
              <MoreHorizontal
                size={18}
                className="text-[var(--pc-text-secondary)]"
              />
            </button>
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
                    className="absolute right-0 top-10 z-40 w-44 glass-card rounded-2xl border border-[var(--pc-border)] shadow-xl overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Flag size={14} /> Signaler
                    </button>
                    <button
                      onClick={() => setShowMoreMenu(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] transition-colors"
                    >
                      <EyeOff size={14} /> Masquer
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard
                          .writeText(
                            `${window.location.origin}/feed/${post.id}`,
                          )
                          .catch(() => {});
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] transition-colors"
                    >
                      <Link size={14} /> Copier le lien
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Caption — juste le texte du post, plus de titre/tags marchands */}
        {caption && (
          <div className="px-3 sm:px-4 mb-2 sm:mb-3">
            <p
              className="text-[var(--pc-text-primary)] leading-relaxed"
              style={{ fontSize: "14px" }}
            >
              {captionLong && !expanded
                ? caption.slice(0, 180) + "..."
                : caption}
            </p>
            {captionLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[var(--pc-primary)] font-semibold mt-1"
                style={{ fontSize: "13px" }}
              >
                {expanded ? t("feed.post.viewLess") : t("feed.post.viewMore")}
              </button>
            )}
          </div>
        )}

        {/* Media — uniquement si le post a des photos */}
        {hasMedia && (
          <div
            className="relative bg-black/5 dark:bg-black/20 overflow-hidden w-full"
            style={{ aspectRatio: "4/3", maxHeight: "420px" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={mediaIndex}
                src={media[mediaIndex]}
                alt="post"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://picsum.photos/seed/${post.id}${mediaIndex}/600/600`;
                }}
              />
            </AnimatePresence>

            <AnimatePresence>
              {heartAnim && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <Heart
                    size={80}
                    className="text-red-500 fill-red-500 drop-shadow-2xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {hasMore && (
              <>
                {!isRtl ? (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={nextMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={prevMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMediaIndex(i)}
                      className={`rounded-full transition-all duration-300 ${i === mediaIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                    />
                  ))}
                </div>
                <div
                  className="absolute top-3 right-3 bg-black/50 text-white rounded-full px-2.5 py-0.5 backdrop-blur-sm"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  {mediaIndex + 1}/{media.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Stats — plus de compteur de vues (n'existe pas sur un Post) */}
        <div
          className={`flex items-center gap-3 px-3 sm:px-4 pt-2 sm:pt-3 pb-1 text-[var(--pc-text-secondary)] ${isRtl ? "flex-row-reverse" : ""}`}
          style={{ fontSize: "12px" }}
        >
          <span className="flex items-center gap-1">
            <Heart
              size={12}
              className={liked ? "text-red-500 fill-red-500" : ""}
            />{" "}
            {fmt(likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} /> {fmt(post.comments_count ?? 0)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 size={12} /> {fmt(sharesCount)}
          </span>
        </div>

        {/* Action bar */}
        <div
          className={`flex items-center justify-around px-1 py-1.5 border-t border-[var(--pc-border)]/40 mt-1 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {[
            {
              icon: liked ? (
                <Heart size={20} className="text-red-500 fill-red-500" />
              ) : (
                <Heart size={20} />
              ),
              label: t("feed.post.like"),
              action: handleLike,
              color: liked ? "text-red-500" : "",
            },
            {
              icon: <MessageCircle size={20} />,
              label: t("feed.post.comment"),
              action: () => setShowComments((v) => !v),
              color: showComments ? "text-[var(--pc-primary)]" : "",
            },
            {
              icon: <Share2 size={20} />,
              label: t("feed.post.share"),
              action: () => setShowShareModal(true),
              color: "",
            },
            {
              icon: saved ? (
                <Bookmark
                  size={20}
                  className="fill-[var(--pc-primary)] text-[var(--pc-primary)]"
                />
              ) : (
                <Bookmark size={20} />
              ),
              label: t("feed.post.save"),
              action: handleSave,
              color: saved ? "text-[var(--pc-primary)]" : "",
            },
          ].map(({ icon, label, action, color }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.88 }}
              onClick={action}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-xl hover:bg-[var(--pc-surface-alt)] transition-all duration-200 text-[var(--pc-text-secondary)] touch-manipulation ${color}`}
              style={{ fontSize: "10px", fontWeight: 600 }}
            >
              {icon}
              <span>{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--pc-border)]/40 pt-3">
                {commentsLoading && (
                  <div className="flex justify-center py-3">
                    <Loader2
                      size={18}
                      className="animate-spin text-[var(--pc-text-secondary)]"
                    />
                  </div>
                )}

                {!commentsLoading && comments.length === 0 && (
                  <p
                    className="text-center text-[var(--pc-text-secondary)] py-2"
                    style={{ fontSize: "13px" }}
                  >
                    Aucun commentaire — soyez le premier à réagir !
                  </p>
                )}

                {comments.map((comment: CommentType) => (
                  <div
                    key={comment.id}
                    className={`flex gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <img
                      src={
                        comment.user?.avatar ??
                        `https://picsum.photos/seed/c${comment.id}/60/60`
                      }
                      alt={comment.user?.name}
                      className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`bg-[var(--pc-surface-alt)] dark:bg-[#1C2128] rounded-2xl px-3 py-2 ${isRtl ? "text-right" : ""}`}
                      >
                        <span
                          className="font-bold text-[var(--pc-text-primary)]"
                          style={{ fontSize: "12px" }}
                        >
                          {comment.user?.name}{" "}
                        </span>
                        <span
                          className="text-[var(--pc-text-primary)]"
                          style={{ fontSize: "13px" }}
                        >
                          {comment.body}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-3 mt-1 px-1 ${isRtl ? "flex-row-reverse" : ""}`}
                        style={{ fontSize: "11px" }}
                      >
                        <span className="text-[var(--pc-text-secondary)]">
                          {timeAgo(comment.created_at)}
                        </span>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`hover:text-[var(--pc-primary)] font-semibold flex items-center gap-1 transition-colors ${comment.is_liked_by_me ? "text-[var(--pc-primary)]" : "text-[var(--pc-text-secondary)]"}`}
                        >
                          <ThumbsUp
                            size={11}
                            className={
                              comment.is_liked_by_me
                                ? "fill-[var(--pc-primary)]"
                                : ""
                            }
                          />{" "}
                          {comment.likes_count}
                        </button>
                        <button
                          onClick={() =>
                            handleReply(comment.id, comment.user?.name ?? "")
                          }
                          className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-primary)] font-semibold transition-colors"
                        >
                          Répondre @{comment.user?.name}
                        </button>
                      </div>
                      {comment.replies?.map((reply) => (
                        <div
                          key={reply.id}
                          className={`flex gap-2 mt-2 ${isRtl ? "flex-row-reverse" : "ml-2"}`}
                        >
                          <img
                            src={
                              reply.user?.avatar ??
                              `https://picsum.photos/seed/r${reply.id}/60/60`
                            }
                            alt={reply.user?.name}
                            className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                          />
                          <div className="flex-1">
                            <div
                              className={`bg-[var(--pc-surface-alt)] dark:bg-[#1C2128] rounded-xl px-3 py-1.5 ${isRtl ? "text-right" : ""}`}
                            >
                              <span
                                className="font-bold text-[var(--pc-text-primary)]"
                                style={{ fontSize: "11px" }}
                              >
                                {reply.user?.name}{" "}
                              </span>
                              <span
                                className="text-[var(--pc-text-primary)]"
                                style={{ fontSize: "12px" }}
                              >
                                {reply.body}
                              </span>
                            </div>
                            <div
                              className={`flex items-center gap-3 mt-1 px-1 ${isRtl ? "flex-row-reverse" : ""}`}
                              style={{ fontSize: "10px" }}
                            >
                              <span className="text-[var(--pc-text-secondary)]">
                                {timeAgo(reply.created_at)}
                              </span>
                              <button
                                onClick={() => handleCommentLike(reply.id)}
                                className={`hover:text-[var(--pc-primary)] font-semibold flex items-center gap-1 transition-colors ${reply.is_liked_by_me ? "text-[var(--pc-primary)]" : "text-[var(--pc-text-secondary)]"}`}
                              >
                                <ThumbsUp
                                  size={10}
                                  className={
                                    reply.is_liked_by_me
                                      ? "fill-[var(--pc-primary)]"
                                      : ""
                                  }
                                />{" "}
                                {reply.likes_count}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Comment input */}
                <div
                  className={`flex gap-2 items-start ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--pc-primary)] to-emerald-500 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-white font-bold"
                        style={{ fontSize: "12px" }}
                      >
                        {initials(currentUser?.name)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <AnimatePresence>
                      {replyTo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-1.5 bg-[var(--pc-primary)]/10 rounded-lg px-2 py-1"
                        >
                          <span
                            className="text-[var(--pc-primary)] font-semibold"
                            style={{ fontSize: "11px" }}
                          >
                            @{replyTo.author}
                          </span>
                          <button
                            onClick={handleClearReply}
                            className="ml-auto text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div
                      className={`flex items-center gap-2 bg-[var(--pc-surface-alt)] dark:bg-[#1C2128] rounded-2xl px-3 py-2 border border-[var(--pc-border)]/60 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmitComment();
                        }}
                        placeholder={
                          isLoggedIn
                            ? t("feed.comments.placeholder")
                            : "Connectez-vous pour commenter"
                        }
                        disabled={!isLoggedIn || createComment.isPending}
                        className="flex-1 bg-transparent text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none disabled:opacity-60"
                        style={{ fontSize: "13px" }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="text-[var(--pc-primary)] disabled:opacity-40"
                        disabled={
                          !commentText.trim() || createComment.isPending
                        }
                        onClick={handleSubmitComment}
                      >
                        {createComment.isPending ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </>
  );
}
