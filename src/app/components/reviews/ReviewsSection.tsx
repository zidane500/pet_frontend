import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useCreateReview, useDeleteReview } from "../../../hooks/useReviews";
import { UserAvatar } from "../UserAvatar";
import type { Review } from "../../../types";

interface ReviewsSectionProps {
  type: "vet" | "pet_store";
  targetId: number;
  rating: number | string;
  reviewsCount: number;
  reviews: Review[];
}

function StaticStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
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

// ← Sélecteur d'étoiles cliquable pour le formulaire (survol + clic).
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
          aria-label={`${s} étoiles`}
        >
          <Star
            size={26}
            className={
              s <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({
  type,
  targetId,
  rating,
  reviewsCount,
  reviews,
}: ReviewsSectionProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, isLoggedIn } = useAuth();
  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();

  const numericRating =
    typeof rating === "string" ? parseFloat(rating) : rating;
  const myReview = reviews.find((r) => r.user_id === user?.id);
  const otherReviews = reviews.filter((r) => r.user_id !== user?.id);

  const [formRating, setFormRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [error, setError] = useState("");

  // ← Resynchronise le formulaire si le cache se rafraîchit avec mon propre
  // avis (ex: après invalidateQueries suite à un create/delete).
  useEffect(() => {
    setFormRating(myReview?.rating ?? 0);
    setComment(myReview?.comment ?? "");
  }, [myReview?.id, myReview?.rating, myReview?.comment]);

  // ← Répartition réelle par étoile (remplace l'ancien graphique codé en dur
  // à 70/20/7/3%).
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct =
      reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, pct };
  });

  const handleSubmit = async () => {
    setError("");
    if (formRating < 1) {
      setError("Sélectionnez une note avant de publier.");
      return;
    }
    try {
      await createReview.mutateAsync({
        type,
        id: targetId,
        rating: formRating,
        comment: comment.trim() || undefined,
      });
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Impossible d'enregistrer votre avis. Réessayez.",
      );
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    if (!window.confirm("Supprimer votre avis ?")) return;
    setError("");
    try {
      await deleteReview.mutateAsync({ id: myReview.id, type, targetId });
    } catch {
      setError("Impossible de supprimer votre avis. Réessayez.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex gap-4 items-center mb-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-[var(--pc-text-primary)]">
              {numericRating.toFixed(1)}
            </div>
            <StaticStars rating={numericRating} />
            <div className="text-xs text-[var(--pc-text-secondary)] mt-1">
              {reviewsCount} avis
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {breakdown.map(({ star, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-3">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: "var(--pc-accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire — ajouter / modifier mon avis */}
      {isLoggedIn ? (
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--pc-text-primary)]">
              {myReview ? "Modifier mon avis" : "Laisser un avis"}
            </span>
            {myReview && (
              <button
                onClick={handleDelete}
                disabled={deleteReview.isPending}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500"
              >
                <Trash2 size={13} /> Supprimer
              </button>
            )}
          </div>
          <StarPicker value={formRating} onChange={setFormRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre commentaire (optionnel)"
            rows={3}
            className="w-full mt-3 rounded-xl border border-[var(--pc-border)] bg-transparent px-3 py-2 text-sm text-[var(--pc-text-primary)] placeholder:text-[var(--pc-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]"
          />
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-3 bg-red-500/10 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={createReview.isPending}
            className="w-full mt-3 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: "var(--pc-primary)" }}
          >
            {createReview.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : myReview ? (
              "Mettre à jour"
            ) : (
              "Publier l'avis"
            )}
          </button>
        </div>
      ) : (
        <div className="glass-card p-4 rounded-2xl text-center text-sm text-[var(--pc-text-secondary)]">
          <Link to="/login" className="font-semibold text-[var(--pc-primary)]">
            Connectez-vous
          </Link>{" "}
          pour laisser un avis.
        </div>
      )}

      {/* Liste des avis */}
      {reviewsCount === 0 && (
        <div className="text-center py-8 text-[var(--pc-text-secondary)] text-sm">
          Aucun avis pour le moment
        </div>
      )}

      <div className="space-y-3">
        {otherReviews.map((review) => (
          <div
            key={review.id}
            className={`glass-card p-3 rounded-2xl flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <UserAvatar
              name={review.user?.name}
              avatar={review.user?.avatar}
              size={36}
            />
            <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-[var(--pc-text-primary)]">
                  {review.user?.name ?? "Utilisateur"}
                </span>
                <span className="text-xs text-[var(--pc-text-secondary)] flex-shrink-0">
                  {new Intl.DateTimeFormat(i18n.language, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(review.created_at))}
                </span>
              </div>
              <StaticStars rating={review.rating} size={12} />
              {review.comment && (
                <p className="text-sm text-[var(--pc-text-primary)] mt-1">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
