import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { StoreCard, type Store } from '../StoreCard';
import { useTranslation } from 'react-i18next';

const STORES: Store[] = [
  { id: 's1', name: 'Animalerie Tunis Center', city: 'Tunis', image: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=400&h=200&fit=crop', rating: 4.7, reviews: 203, isOpen: true, products: 'Nourriture · Accessoires · Soins · Toilettage' },
  { id: 's2', name: 'PetShop El Amal', city: 'Sfax', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=200&fit=crop', rating: 4.5, reviews: 91, isOpen: true, products: 'Nourriture · Médicaments · Cages' },
  { id: 's3', name: 'Mon Animal Monastir', city: 'Monastir', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=200&fit=crop', rating: 4.8, reviews: 67, isOpen: false, products: 'Accessoires · Literie · Jouets' },
  { id: 's4', name: 'PetWorld Sousse', city: 'Sousse', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=200&fit=crop', rating: 4.6, reviews: 145, isOpen: true, products: 'Aquariophilie · Terrariophilie · Exotiques' },
];

export function PetStores() {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-[var(--pc-surface-alt)] dark:bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-3"
            >
              {t('stores.badge')}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800 }}
              className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
            >
              {t('stores.title')}
            </motion.h2>
            <p className="text-[var(--pc-text-secondary)] mt-1" style={{ fontSize: '14px' }}>{t('stores.subtitle')}</p>
          </div>
          <button className="flex items-center gap-1.5 text-[var(--pc-primary)] font-semibold flex-shrink-0" style={{ fontSize: '14px' }}>
            {t('stores.seeAll')} <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STORES.map((store, i) => (
            <StoreCard key={store.id} store={store} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
