import { Heart, MapPin, Clock, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { PetBadge } from './PetBadge';

export interface Listing {
  id: string;
  type: 'vente' | 'adoption' | 'perdu' | 'trouve';
  name: string;
  breed: string;
  age: string;
  price?: string;
  city: string;
  governorate: string;
  timeAgo: string;
  verified?: boolean;
  image: string;
}

const TYPE_GLOW = {
  vente: 'rgba(29,125,95,0.25)',
  adoption: 'rgba(59,130,246,0.25)',
  perdu: 'rgba(239,68,68,0.25)',
  trouve: 'rgba(244,167,50,0.25)',
};

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07, type: 'spring', stiffness: 200 }}
      whileHover={{
        y: -8,
        boxShadow: `0 20px 60px ${TYPE_GLOW[listing.type]}, 0 4px 20px rgba(0,0,0,0.12)`,
      }}
      className="flex-shrink-0 w-[82vw] sm:w-72 glass-card rounded-2xl overflow-hidden cursor-pointer group transition-all duration-400"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', borderRadius: '20px' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <motion.img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5 }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/400/300`; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2.5 left-2.5">
          <PetBadge type={listing.type} />
        </div>

        {listing.verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[var(--pc-primary)] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg"
          >
            <Shield size={9} /> Vérifié
          </motion.div>
        )}

        {/* Price overlay on hover */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/95 dark:bg-[var(--pc-surface)]/95 backdrop-blur-sm font-black text-[var(--pc-primary)] px-3 py-1 rounded-full shadow-lg" style={{ fontSize: '14px' }}>
            {listing.price || (listing.type === 'adoption' ? '💚 Adoption' : 'Gratuit')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-black text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)] truncate" style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px' }}>
              {listing.name}
            </h3>
            <p className="text-[var(--pc-text-secondary)] truncate mt-0.5" style={{ fontSize: '12px' }}>
              {listing.breed} · {listing.age}
            </p>
          </div>
          {listing.price && (
            <p className="flex-shrink-0 font-black text-[var(--pc-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px' }}>
              {listing.price}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--pc-border)]/60 dark:border-[var(--pc-border)]/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[var(--pc-text-secondary)]" style={{ fontSize: '11px' }}>
              <MapPin size={10} /><span>{listing.city}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--pc-text-secondary)]" style={{ fontSize: '11px' }}>
              <Clock size={10} /><span>{listing.timeAgo}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            style={{ background: liked ? 'rgba(239,68,68,0.1)' : 'transparent' }}
          >
            <Heart size={15} className={liked ? 'text-red-500 fill-red-500' : 'text-[var(--pc-text-secondary)]'} fill={liked ? '#ef4444' : 'none'} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
