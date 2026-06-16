import { Star, MapPin, Phone, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export interface Vet {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  city: string;
  phone: string;
  emergency?: boolean;
  image: string;
}

interface VetCardProps {
  vet: Vet;
  index?: number;
}

export function VetCard({ vet, index = 0 }: VetCardProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -8 }}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 24px 60px rgba(29,125,95,0.18)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)')}
      className="glass-card rounded-2xl p-5 border border-[var(--pc-border)]/60 dark:border-[var(--pc-border)]/40 group cursor-pointer relative overflow-hidden transition-shadow duration-300"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--pc-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl pointer-events-none" />

      <div className="relative flex gap-3.5 mb-4">
        <div className="relative flex-shrink-0">
          <img
            src={vet.image}
            alt={vet.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[var(--pc-border)] dark:ring-[var(--pc-border)] group-hover:ring-[var(--pc-primary)] transition-all duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${vet.id}/100/100`; }}
          />
          {vet.emergency && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md blink-dot">24h</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-black text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)] leading-tight" style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px' }}>
            Dr. {vet.name}
          </h3>
          <span className="inline-block mt-1.5 bg-gradient-to-r from-[var(--pc-primary-light)] to-[var(--pc-primary-light)] dark:from-[var(--pc-primary-light)] dark:to-[var(--pc-primary-light)] text-[var(--pc-primary)] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[var(--pc-primary)]/20">
            {vet.specialty}
          </span>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-3.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={13} className={i < Math.floor(vet.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'} />
        ))}
        <span className="text-[var(--pc-text-secondary)] ml-1 font-semibold" style={{ fontSize: '12px' }}>
          {vet.rating} ({vet.reviews})
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        {[
          { icon: MapPin, text: vet.city },
          { icon: Phone, text: vet.phone },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-[var(--pc-text-secondary)]" style={{ fontSize: '12px' }}>
            <Icon size={11} className="flex-shrink-0 text-[var(--pc-primary)]" />
            <span>{text}</span>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 gradient-btn text-white font-bold py-3 rounded-xl shadow-lg shadow-[var(--pc-primary)]/20 touch-manipulation"
        style={{ fontSize: '13px' }}
      >
        <Calendar size={14} />
        {t('vets.bookBtn')}
      </motion.button>
    </motion.div>
  );
}
