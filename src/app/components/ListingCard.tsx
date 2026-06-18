import { Heart, MapPin, Clock, Shield, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { PetBadge } from "./PetBadge";

// ─── Type compatible avec l'API Laravel ET les données statiques ───────────────
export interface Listing {
  id: string | number;
  type: "vente" | "adoption" | "perdu" | "trouve" | "accouplement" | "conseils";

  // Champs API Laravel (réels)
  title?: string;
  species?: string;
  breed?: string;
  age_months?: number | null;
  price?: string | number | null;
  is_free?: boolean;
  city?: string;
  region?: string;
  photos?: string[] | null;
  is_vaccinated?: boolean;
  is_sterilized?: boolean;
  is_premium?: boolean;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
    is_verified?: boolean;
  };

  // Champs legacy (données statiques existantes)
  name?: string;
  age?: string;
  governorate?: string;
  timeAgo?: string;
  verified?: boolean;
  image?: string;
}

// ─── Helpers pour unifier les deux formats ────────────────────────────────────

function getDisplayTitle(l: Listing): string {
  return l.title ?? l.name ?? "Annonce sans titre";
}

function getDisplayImage(l: Listing): string {
  if (l.photos && l.photos.length > 0) return l.photos[0];
  if (l.image) return l.image;
  return `https://picsum.photos/seed/${l.id}/400/300`;
}

function getDisplayAge(l: Listing): string | null {
  if (l.age) return l.age;
  if (l.age_months != null) {
    if (l.age_months < 12) return `${l.age_months} mois`;
    const years = Math.floor(l.age_months / 12);
    return `${years} an${years > 1 ? "s" : ""}`;
  }
  return null;
}

function getDisplayBreed(l: Listing): string | null {
  return l.breed ?? l.species ?? null;
}

function getDisplayCity(l: Listing): string | null {
  return l.city ?? l.governorate ?? null;
}

function getDisplayPrice(l: Listing): string | null {
  if (l.is_free) return "Gratuit";
  if (l.price != null && l.price !== "")
    return `${Number(l.price).toLocaleString("fr-TN")} DT`;
  if (typeof l.price === "string" && l.price) return l.price;
  return null;
}

function getDisplayTime(l: Listing): string | null {
  if (l.timeAgo) return l.timeAgo;
  if (l.created_at) {
    const diff = Date.now() - new Date(l.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  }
  return null;
}

function isVerified(l: Listing): boolean {
  return l.verified ?? l.user?.is_verified ?? false;
}

// ─── Couleurs par type ─────────────────────────────────────────────────────────
const TYPE_GLOW: Record<string, string> = {
  vente: "rgba(29,125,95,0.25)",
  adoption: "rgba(59,130,246,0.25)",
  perdu: "rgba(239,68,68,0.25)",
  trouve: "rgba(244,167,50,0.25)",
  accouplement: "rgba(168,85,247,0.25)",
  conseils: "rgba(20,184,166,0.25)",
};

interface ListingCardProps {
  listing: Listing;
  index?: number;
  onClick?: () => void;
}

export function ListingCard({ listing, index = 0, onClick }: ListingCardProps) {
  const [liked, setLiked] = useState(false);

  const title = getDisplayTitle(listing);
  const image = getDisplayImage(listing);
  const age = getDisplayAge(listing);
  const breed = getDisplayBreed(listing);
  const city = getDisplayCity(listing);
  const price = getDisplayPrice(listing);
  const timeAgo = getDisplayTime(listing);
  const verified = isVerified(listing);
  const glow = TYPE_GLOW[listing.type] ?? "rgba(0,0,0,0.1)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        type: "spring",
        stiffness: 200,
      }}
      whileHover={{
        y: -8,
        boxShadow: `0 20px 60px ${glow}, 0 4px 20px rgba(0,0,0,0.12)`,
      }}
      className="flex-shrink-0 w-[82vw] sm:w-72 glass-card rounded-2xl overflow-hidden cursor-pointer group transition-all duration-400"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)", borderRadius: "20px" }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${listing.id}/400/300`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge type */}
        <div className="absolute top-2.5 left-2.5">
          <PetBadge type={listing.type as any} />
        </div>

        {/* Badge vérifié */}
        {verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[var(--pc-primary)] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg"
          >
            <Shield size={9} /> Vérifié
          </motion.div>
        )}

        {/* Badge premium */}
        {listing.is_premium && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              <Tag size={9} /> Premium
            </span>
          </div>
        )}

        {/* Prix au hover */}
        {price && (
          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span
              className="bg-white/95 dark:bg-[var(--pc-surface)]/95 backdrop-blur-sm font-black text-[var(--pc-primary)] px-3 py-1 rounded-full shadow-lg"
              style={{ fontSize: "14px" }}
            >
              {price}
            </span>
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3
              className="font-black text-[var(--pc-text-primary)] truncate"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "15px" }}
            >
              {title}
            </h3>
            {(breed || age) && (
              <p
                className="text-[var(--pc-text-secondary)] truncate mt-0.5"
                style={{ fontSize: "12px" }}
              >
                {[breed, age].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          {price && (
            <p
              className="flex-shrink-0 font-black text-[var(--pc-primary)]"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "15px" }}
            >
              {price}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--pc-border)]/60">
          <div className="flex items-center gap-3">
            {city && (
              <div
                className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
                style={{ fontSize: "11px" }}
              >
                <MapPin size={10} />
                <span>{city}</span>
              </div>
            )}
            {timeAgo && (
              <div
                className="flex items-center gap-1 text-[var(--pc-text-secondary)]"
                style={{ fontSize: "11px" }}
              >
                <Clock size={10} />
                <span>{timeAgo}</span>
              </div>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: liked ? "rgba(239,68,68,0.1)" : "transparent",
            }}
          >
            <Heart
              size={15}
              className={
                liked
                  ? "text-red-500 fill-red-500"
                  : "text-[var(--pc-text-secondary)]"
              }
              fill={liked ? "#ef4444" : "none"}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
