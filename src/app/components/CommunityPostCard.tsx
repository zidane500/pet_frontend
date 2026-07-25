import { Heart, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import type { Listing } from "../../types";

interface CommunityPostCardProps {
  listing: Listing;
  index?: number;
  onClick?: () => void;
}

// ← Card d'aperçu, non-interactive (pas de like ici) : la vraie action
// "j'aime" se fait dans le vrai feed (/feed, via PostCard.tsx), pour ne
// pas laisser croire qu'un clic ici persiste réellement quelque chose.
export function CommunityPostCard({
  listing,
  index = 0,
  onClick,
}: CommunityPostCardProps) {
  const rotation = index % 2 === 0 ? -1.5 : 1.5;
  const image =
    listing.photos?.[0] ??
    `https://picsum.photos/seed/listing-${listing.id}/300/300`;
  const caption = listing.description || listing.title;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      style={{ rotate: rotation }}
      onClick={onClick}
      className="bg-[var(--pc-surface)] dark:bg-[var(--pc-surface)] rounded-2xl overflow-hidden border border-[var(--pc-border)] dark:border-[var(--pc-border)] cursor-pointer mb-3 transition-all duration-300"
    >
      <div className="relative">
        <img
          src={image}
          alt={caption}
          className="w-full object-cover"
          style={{ aspectRatio: "1/1" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${listing.id}/300/300`;
          }}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={
              listing.user?.avatar ??
              `https://picsum.photos/seed/user-${listing.user_id}/50/50`
            }
            alt={listing.user?.name}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://picsum.photos/seed/${listing.user_id}/50/50`;
            }}
          />
          <span
            className="font-semibold truncate"
            style={{ fontSize: "12px", color: "var(--pc-text-primary)" }}
          >
            {listing.user?.name}
          </span>
        </div>
        <p
          className="text-[var(--pc-text-secondary)] leading-snug"
          style={{
            fontSize: "12px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {caption}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <div
            className="flex items-center gap-1"
            style={{ fontSize: "12px", color: "var(--pc-text-secondary)" }}
          >
            <Heart
              size={13}
              className={
                listing.is_liked_by_me ? "fill-red-500 text-red-500" : ""
              }
            />
            <span>{listing.likes_count ?? 0}</span>
          </div>
          <div
            className="flex items-center gap-1"
            style={{ fontSize: "12px", color: "var(--pc-text-secondary)" }}
          >
            <MessageCircle size={13} />
            <span>{listing.comments_count ?? 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
