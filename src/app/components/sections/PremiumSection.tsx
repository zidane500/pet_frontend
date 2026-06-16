import { motion } from 'motion/react';
import { PricingCard } from '../PricingCard';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PremiumSection() {
  const { t } = useTranslation();
  return (
    <section className="py-24 relative overflow-hidden noise-overlay">
      {/* Rich background */}
      <div className="absolute inset-0 dark:bg-[#060C12] bg-[var(--pc-surface-alt)]" />
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--pc-primary)]/8 dark:bg-[var(--pc-primary)]/15 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[var(--pc-accent)]/8 dark:bg-[var(--pc-accent)]/12 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--pc-accent)]/20 to-amber-400/10 border border-amber-300/40 dark:border-amber-600/30 text-amber-600 dark:text-amber-400 px-5 py-2 rounded-full mb-5"
          >
            <Sparkles size={14} />
            <span className="font-bold uppercase tracking-wider" style={{ fontSize: '12px' }}>{t('premium.badge')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1 }}
            className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
          >
            {t('premium.title')}{' '}
            <span className="shimmer-text">{t('premium.titleHighlight')}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--pc-text-secondary)] mt-3 max-w-md mx-auto"
            style={{ fontSize: '16px' }}
          >
            {t('premium.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto pt-5">
          <PricingCard variant="free" />
          <PricingCard variant="premium" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-[var(--pc-text-secondary)] mt-10"
          style={{ fontSize: '13px' }}
        >
          ✓ Annulable à tout moment &nbsp;·&nbsp; ✓ Paiement sécurisé &nbsp;·&nbsp; ✓ Sans engagement
        </motion.p>
      </div>
    </section>
  );
}
