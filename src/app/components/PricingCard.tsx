import { Check, Zap, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingCardProps {
  variant: 'free' | 'premium';
}

const freeFeatures = [
  '3 annonces actives',
  'Messagerie de base',
  'Accès à toutes les annonces',
  'Profil public',
];

const premiumFeatures = [
  'Annonces illimitées',
  'Badge Premium visible',
  'Annonces mises en avant',
  'Alertes SMS animaux perdus',
  'Statistiques de vues détaillées',
  'Support prioritaire 24/7',
  'Profil vérifié certifié',
];

export function PricingCard({ variant }: PricingCardProps) {
  const isPremium = variant === 'premium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: isPremium ? 0.15 : 0, type: 'spring', stiffness: 160 }}
      whileHover={{ y: isPremium ? -10 : -6 }}
      className={`relative rounded-3xl p-7 flex flex-col transition-all duration-400 ${
        isPremium
          ? 'premium-card-glow holo-border'
          : 'glass-card border border-[var(--pc-border)]/60 dark:border-[var(--pc-border)]/40'
      }`}
    >
      {/* Premium gradient bg */}
      {isPremium && (
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--pc-primary)] via-emerald-600 to-teal-700 dark:from-[var(--pc-primary)] dark:via-emerald-700 dark:to-teal-800" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        </div>
      )}

      {/* Popular badge */}
      {isPremium && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[var(--pc-accent)] text-white text-[11px] font-black px-5 py-1.5 rounded-full shadow-lg shadow-[var(--pc-accent)]/40 uppercase tracking-wider whitespace-nowrap"
        >
          <Star size={11} fill="white" /> Le plus populaire
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          {isPremium && <Zap size={22} className="text-[var(--pc-accent)]" />}
          <h3
            className={isPremium ? 'text-white' : 'text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]'}
            style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', fontWeight: 900 }}
          >
            {isPremium ? 'Premium' : 'Gratuit'}
          </h3>
        </div>

        <div className="mb-6">
          {isPremium ? (
            <div className="flex items-end gap-1">
              <span className="text-white font-black" style={{ fontFamily: 'Sora, sans-serif', fontSize: '44px', lineHeight: 1 }}>19</span>
              <div className="mb-1.5">
                <span className="text-white/80 font-bold text-lg">DT</span>
                <p className="text-white/60 text-xs">/mois</p>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-1">
              <span className="font-black text-[var(--pc-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '44px', lineHeight: 1 }}>0</span>
              <div className="mb-1.5">
                <span className="text-[var(--pc-text-secondary)] font-bold text-lg">DT</span>
                <p className="text-[var(--pc-text-secondary)] text-xs">/toujours</p>
              </div>
            </div>
          )}
        </div>

        <ul className="space-y-3 flex-1 mb-7">
          {(isPremium ? premiumFeatures : freeFeatures).map((feat, i) => (
            <motion.li
              key={feat}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${isPremium ? 'bg-white/20' : 'bg-[var(--pc-primary-light)] dark:bg-[var(--pc-primary-light)]'}`}>
                <Check size={12} className={isPremium ? 'text-white' : 'text-[var(--pc-primary)]'} strokeWidth={3} />
              </div>
              <span className={isPremium ? 'text-white/90' : 'text-[var(--pc-text-secondary)] dark:text-[var(--pc-text-secondary)]'} style={{ fontSize: '14px' }}>
                {feat}
              </span>
            </motion.li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 touch-manipulation shadow-lg ${
            isPremium
              ? 'bg-[var(--pc-accent)] text-white shadow-[var(--pc-accent)]/40 hover:opacity-90'
              : 'gradient-btn text-white shadow-[var(--pc-primary)]/20'
          }`}
          style={{ fontSize: '15px' }}
        >
          {isPremium ? '⚡ Commencer Premium →' : 'Commencer gratuitement'}
        </motion.button>
      </div>
    </motion.div>
  );
}
