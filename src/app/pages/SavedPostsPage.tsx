import { useEffect, useState, type MouseEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useFavorites, useToggleFavorite } from "../../hooks/useFavorites";
import { useAuthStore } from "../../store/authStore";
import type { Favorite, Post } from "../../types";

interface SavedPostsPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type SocialItem =
  | number
  | string
  | {
      user_id?: number | string;
      userId?: number | string;
      id?: number | string;
      user?: { id?: number | string };
    };

type PostWithLikeState = Post & {
  is_liked_by_me?: boolean;
  is_liked?: boolean;
  liked_by_me?: boolean;
  has_liked?: boolean;
  liked?: boolean;
  likes?: SocialItem[];
};

type PostLikeUpdatedDetail = {
  postId: number;
  liked: boolean;
  likes_count?: number;
};

// ← Un Post n'a ni titre (Listing) ni nom de clinique (Vet) — sa
// signature unique est le champ "content".
function isPost(item: Favorite["favoritable"]): item is Post {
  return Boolean(item && "content" in item && "likes_count" in item);
}

function getPostLikeStorageKeys(
  postId: number,
  userId?: number | string | null,
) {
  const keys = [`animali-post-like:any:${postId}`];

  if (userId !== undefined && userId !== null) {
    keys.unshift(`animali-post-like:${userId}:${postId}`);
  }

  return keys;
}

function readStoredPostLike(
  postId: number,
  userId?: number | string | null,
): boolean | undefined {
  if (typeof window === "undefined") return undefined;

  for (const key of getPostLikeStorageKeys(postId, userId)) {
    const value = window.localStorage.getItem(key);
    if (value === "true") return true;
    if (value === "false") return false;
  }

  return undefined;
}

function socialListContainsCurrentUser(
  list: SocialItem[] | undefined,
  userId?: number | string | null,
) {
  if (!userId || !Array.isArray(list)) return undefined;

  const currentId = String(userId);

  return list.some((item) => {
    if (typeof item === "number" || typeof item === "string") {
      return String(item) === currentId;
    }

    return (
      String(item.user_id) === currentId ||
      String(item.userId) === currentId ||
      String(item.id) === currentId ||
      String(item.user?.id) === currentId
    );
  });
}

function EmptyState({
  onNavigate,
}: {
  onNavigate: SavedPostsPageProps["onNavigate"];
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--pc-surface-alt)] flex items-center justify-center text-4xl">
        📝
      </div>

      <p className="text-[var(--pc-text-secondary)] text-sm font-medium">
        Aucune publication enregistrée
      </p>

      <button
        type="button"
        onClick={() => onNavigate("feed")}
        className="gradient-btn text-white text-sm font-semibold rounded-full px-6 py-2.5"
      >
        Voir le feed communauté
      </button>
    </div>
  );
}

export function SavedPostsPage({ onBack, onNavigate }: SavedPostsPageProps) {
  const queryClient = useQueryClient();
  const favoritesQuery = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const currentUser = useAuthStore((s) => s.user);
  const [likeUpdates, setLikeUpdates] = useState<
    Record<number, { liked: boolean; likes_count?: number }>
  >({});

  // ← useFavorites() renvoie TOUS les favoris : annonces, vétérinaires,
  // posts confondus. Cette page ne garde que les posts.
  const posts = (favoritesQuery.data ?? []).filter(
    (favorite) =>
      favorite.favoritable_type.toLowerCase().includes("post") &&
      isPost(favorite.favoritable),
  );

  const pendingId = toggleFavorite.variables?.id ?? null;

  useEffect(() => {
    const refetchSocialData = () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      void favoritesQuery.refetch();
    };

    const handlePostLikeUpdated = (event: Event) => {
      const detail = (event as CustomEvent<PostLikeUpdatedDetail>).detail;
      if (!detail?.postId) return;

      setLikeUpdates((prev) => ({
        ...prev,
        [detail.postId]: {
          liked: Boolean(detail.liked),
          likes_count:
            typeof detail.likes_count === "number"
              ? detail.likes_count
              : prev[detail.postId]?.likes_count,
        },
      }));

      refetchSocialData();
    };

    const handlePostSaveUpdated = () => {
      refetchSocialData();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) refetchSocialData();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key?.startsWith("animali-post-like:")) {
        refetchSocialData();
      }
    };

    window.addEventListener("post-like-updated", handlePostLikeUpdated);
    window.addEventListener("post-save-updated", handlePostSaveUpdated);
    window.addEventListener("focus", refetchSocialData);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("post-like-updated", handlePostLikeUpdated);
      window.removeEventListener("post-save-updated", handlePostSaveUpdated);
      window.removeEventListener("focus", refetchSocialData);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [favoritesQuery.refetch, queryClient]);

  const isLikedByCurrentUser = (post: Post): boolean => {
    const localUpdate = likeUpdates[post.id];
    if (localUpdate) return localUpdate.liked;

    const stored = readStoredPostLike(post.id, currentUser?.id);
    if (typeof stored === "boolean") return stored;

    const p = post as PostWithLikeState;

    if (typeof p.is_liked_by_me === "boolean") return p.is_liked_by_me;
    if (typeof p.is_liked === "boolean") return p.is_liked;
    if (typeof p.liked_by_me === "boolean") return p.liked_by_me;
    if (typeof p.has_liked === "boolean") return p.has_liked;
    if (typeof p.liked === "boolean") return p.liked;

    return socialListContainsCurrentUser(p.likes, currentUser?.id) ?? false;
  };

  const getDisplayedLikesCount = (post: Post): number => {
    const localCount = likeUpdates[post.id]?.likes_count;
    return typeof localCount === "number"
      ? localCount
      : (post.likes_count ?? 0);
  };

  const removeFavorite = (favorite: Favorite) => {
    toggleFavorite.mutate(
      { type: "post", id: favorite.favoritable_id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["favorites"] });
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          queryClient.invalidateQueries({
            queryKey: ["post", favorite.favoritable_id],
          });
        },
      },
    );
  };

  return (
    <div
      className="min-h-screen bg-[var(--pc-surface)] text-[var(--pc-text-primary)]"
      dir="ltr"
    >
      <header className="sticky top-0 z-30 glass-card border-b border-[var(--pc-border)]">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="flex-1 text-lg font-bold">
            Publications enregistrées
          </h1>

          {favoritesQuery.isFetching && (
            <Loader2
              size={16}
              className="animate-spin text-[var(--pc-primary)]"
            />
          )}

          {posts.length > 0 && (
            <span className="bg-[var(--pc-primary)] text-white text-xs font-bold rounded-full px-2.5 py-0.5 min-w-[22px] text-center">
              {posts.length}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 pb-24">
        {favoritesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-20 rounded-2xl bg-[var(--pc-surface-alt)] animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState onNavigate={onNavigate} />
        ) : (
          <div className="space-y-3">
            {posts.map((favorite) => {
              const post = favorite.favoritable as Post;
              const thumbnail = post.photos?.[0];
              const snippet = (post.content ?? "").slice(0, 80);
              const busy = pendingId === post.id && toggleFavorite.isPending;
              const likedByMe = isLikedByCurrentUser(post);
              const likesCount = getDisplayedLikesCount(post);

              return (
                <motion.article
                  key={favorite.id}
                  layout
                  className="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow relative"
                  onClick={() =>
                    onNavigate("feed", { postId: String(post.id) })
                  }
                >
                  <div className="w-14 h-14 rounded-2xl bg-[var(--pc-primary)]/10 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      "📝"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">
                      {post.user?.name ?? "Utilisateur"}
                    </p>

                    <p className="text-sm text-[var(--pc-text-secondary)] truncate">
                      {snippet || "Publication sans texte"}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--pc-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Heart
                          size={11}
                          className={
                            likedByMe
                              ? "text-red-500 fill-red-500"
                              : "text-[var(--pc-text-secondary)]"
                          }
                        />
                        {likesCount}
                      </span>

                      <span className="flex items-center gap-1">
                        <MessageCircle size={11} />
                        {post.comments_count ?? 0}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      removeFavorite(favorite);
                    }}
                    disabled={busy}
                    className="w-9 h-9 rounded-full bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] flex items-center justify-center disabled:opacity-50"
                    aria-label="Retirer des enregistrements"
                  >
                    {busy ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Bookmark
                        size={16}
                        className="text-[var(--pc-primary)] fill-[var(--pc-primary)]"
                      />
                    )}
                  </button>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
