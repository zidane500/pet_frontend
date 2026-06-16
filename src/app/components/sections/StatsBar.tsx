import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { StatCounter } from '../StatCounter';

export function StatsBar() {
  const { t } = useTranslation();
  const STATS = [
    { icon: '🐾', target: 2400, prefix: '+', suffix: '', label: t('stats.listings') },
    { icon: '👥', target: 8000, prefix: '+', suffix: '', label: t('stats.members') },
    { icon: '📍', target: 150, prefix: '+', suffix: '', label: t('stats.vets') },
    { icon: '💚', target: 320, prefix: '+', suffix: '', label: t('stats.adoptions') },
  ];

  return (
    <section className="relative bg-[var(--pc-primary)] dark:bg-[var(--pc-primary)] py-12 overflow-hidden noise-overlay">
      {/* Animated mesh overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[var(--pc-accent)]/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              {/* Divider line on desktop */}
              {i > 0 && (
                <div className="hidden lg:block absolute left-0 top-4 bottom-4 w-px bg-white/20" />
              )}
              <StatCounter
                icon={stat.icon}
                target={stat.target}
                prefix={stat.prefix}
                suffix={stat.suffix}
                label={stat.label}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
