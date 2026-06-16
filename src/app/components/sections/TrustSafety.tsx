import { motion } from 'motion/react';
import { ShieldCheck, MessageCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TrustSafety() {
  const { t } = useTranslation();

  const PILLARS = [
    { icon: ShieldCheck, title: t('trust.verifiedTitle'), description: t('trust.verifiedDesc'), gradient: 'from-emerald-500 to-teal-500', glow: 'group-hover:shadow-emerald-500/25', num: t('trust.verifiedNum'), numLabel: t('trust.verifiedNumLabel') },
    { icon: MessageCircle, title: t('trust.chatTitle'), description: t('trust.chatDesc'), gradient: 'from-blue-500 to-indigo-500', glow: 'group-hover:shadow-blue-500/25', num: t('trust.chatNum'), numLabel: t('trust.chatNumLabel') },
    { icon: Star, title: t('trust.reputationTitle'), description: t('trust.reputationDesc'), gradient: 'from-amber-500 to-orange-500', glow: 'group-hover:shadow-amber-500/25', num: t('trust.reputationNum'), numLabel: t('trust.reputationNumLabel') },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-white dark:bg-[var(--pc-surface)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800 }}
            className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
          >
            {t('trust.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[var(--pc-text-secondary)] mt-3"
            style={{ fontSize: '16px' }}
          >
            {t('trust.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 180 }}
                whileHover={{ y: -8 }}
                className={`group glass-card p-7 rounded-3xl border border-[var(--pc-border)]/60 dark:border-[var(--pc-border)]/40 transition-all duration-400 cursor-pointer shadow-lg ${pillar.glow} hover:shadow-xl relative overflow-hidden`}
              >
                {/* Hover gradient bg */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 bg-gradient-to-br ${pillar.gradient} transition-opacity duration-400`} />

                <div className="relative">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className="text-white" strokeWidth={1.8} />
                  </div>

                  {/* Stats chip */}
                  <div className="absolute top-0 right-0 glass-card border border-[var(--pc-border)]/60 px-3 py-1.5 rounded-xl">
                    <p className="font-black text-[var(--pc-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px' }}>{pillar.num}</p>
                    <p className="text-[var(--pc-text-secondary)]" style={{ fontSize: '9px', fontWeight: 600 }}>{pillar.numLabel}</p>
                  </div>

                  <h3 className="font-black mb-3 text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '19px' }}>
                    {pillar.title}
                  </h3>
                  <p className="text-[var(--pc-text-secondary)] leading-relaxed" style={{ fontSize: '14px' }}>
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
