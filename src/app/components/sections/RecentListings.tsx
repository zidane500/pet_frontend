import { motion } from 'motion/react';
import { ArrowRight, Flame } from 'lucide-react';
import { ListingCard, type Listing } from '../ListingCard';
import { useTranslation } from 'react-i18next';

const LISTINGS: Listing[] = [
  { id: 'l1', type: 'vente', name: 'Max', breed: 'Berger Allemand', age: '3 ans', price: '850 DT', city: 'Tunis', governorate: 'Tunis', timeAgo: '2h', verified: true, image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop' },
  { id: 'l2', type: 'adoption', name: 'Luna', breed: 'Chatte tigrée', age: '1 an', city: 'Sfax', governorate: 'Sfax', timeAgo: '5h', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop' },
  { id: 'l3', type: 'vente', name: 'Perroquet Ara', breed: 'Ara bleu et jaune', age: '2 ans', price: '1 200 DT', city: 'Sousse', governorate: 'Sousse', timeAgo: '1j', verified: true, image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop' },
  { id: 'l4', type: 'perdu', name: 'Coco', breed: 'Spitz nain blanc', age: '4 ans', city: 'Monastir', governorate: 'Monastir', timeAgo: '12h', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop' },
  { id: 'l5', type: 'vente', name: 'Lapin Angora', breed: 'Angora blanc', age: '8 mois', price: '120 DT', city: 'Bizerte', governorate: 'Bizerte', timeAgo: '3h', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop' },
  { id: 'l6', type: 'adoption', name: 'Rourou', breed: 'Berger croisé', age: '2 ans', city: 'Nabeul', governorate: 'Nabeul', timeAgo: '6h', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
];

export function RecentListings({ onNavigate }: { onNavigate?: (page: string, params?: Record<string,string>) => void } = {}) {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-[var(--pc-surface-alt)] dark:bg-[#060C12] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-[var(--pc-primary)] to-emerald-400" />
              <span className="text-[var(--pc-primary)] font-bold uppercase tracking-widest" style={{ fontSize: '11px' }}>
                {t('listings.badge')}
              </span>
            </div>
            <h2 className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800 }}>
              {t('listings.title')}
            </h2>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-1.5 text-[var(--pc-primary)] font-bold transition-all"
            style={{ fontSize: '14px' }}
          >
            {t('listings.seeAll')} <ArrowRight size={16} />
          </motion.button>
        </div>

        {/* Hot badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-5"
        >
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-full">
            <Flame size={13} className="text-red-500" />
            <span className="text-red-600 dark:text-red-400 font-bold" style={{ fontSize: '12px' }}>6 nouvelles dans la dernière heure</span>
          </div>
        </motion.div>

        {/* Horizontal scroll */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-scroll"
          style={{ scrollbarWidth: 'none' }}
        >
          {LISTINGS.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>

        <p className="text-center text-[var(--pc-text-secondary)] mt-4 sm:hidden" style={{ fontSize: '11px' }}>
          ← Glissez pour voir plus →
        </p>
      </div>
    </section>
  );
}
