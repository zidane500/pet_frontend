import { type MouseEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Heart, Loader2, MessageCircle } from "lucide-react";
import { useFavorites, useToggleFavorite } from "../../hooks/useFavorites";
import type { Favorite, Post } from "../../types";

interface SavedPostsPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

// ← Un Post n'a ni titre (Listing) ni nom de clinique (Vet) — sa
// signature unique est le champ "content".
function isPost(item: Favorite["favoritable"]): item is Post {
  return Boolean(item && "content" in item && "likes_count" in item);
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
  const favoritesQuery = useFavorites();
  const toggleFavorite = useToggleFavorite();

  // ← useFavorites() renvoie TOUS les favoris (annonces, vétérinaires,
  // posts confondus) — cette page ne garde que les posts. C'est
  // volontairement la même source que FavoritesPage : un seul favori
  // reste un seul favori côté backend, seule la présentation diffère.
  const posts = (favoritesQuery.data ?? []).filter(
    (favorite) =>
      favorite.favoritable_type.toLowerCase().includes("post") &&
      isPost(favorite.favoritable),
  );

  const pendingId = toggleFavorite.variables?.id ?? null;

  const removeFavorite = (favorite: Favorite) => {
    toggleFavorite.mutate({ type: "post", id: favorite.favoritable_id });
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
                        <Heart size={11} /> {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={11} /> {post.comments_count}
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
                    className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-50"
                    aria-label="Retirer des favoris"
                  >
                    {busy ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Heart size={16} className="fill-red-500" />
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
