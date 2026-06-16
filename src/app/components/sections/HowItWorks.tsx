import { motion } from 'motion/react';
import { UserPlus, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function HowItWorks({ onNavigate }: { onNavigate?: (page: string, params?: Record<string,string>) => void } = {}) {
  const { t } = useTranslation();

  const STEPS = [
    { number: '01', icon: UserPlus, title: t('howItWorks.step1Title'), description: t('howItWorks.step1Desc'), color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/40' },
    { number: '02', icon: Search, title: t('howItWorks.step2Title'), description: t('howItWorks.step2Desc'), color: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-500/40' },
    { number: '03', icon: ShieldCheck, title: t('howItWorks.step3Title'), description: t('howItWorks.step3Desc'), color: 'from-[var(--pc-primary)] to-emerald-600', glow: 'shadow-[var(--pc-primary)]/40' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--pc-surface-alt)] dark:bg-[#060C12]" />
      {/* Subtle grid */}
      <div className="absolute inset-0 dark:block hidden opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[var(--pc-primary-light)] dark:bg-[var(--pc-primary-light)] text-[var(--pc-primary)] px-4 py-2 rounded-full mb-5"
          >
            <span className="font-bold uppercase tracking-wider" style={{ fontSize: '12px' }}>{t('howItWorks.badge')}</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800 }}
            className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
          >
            {t('howItWorks.title')}
          </motion.h2>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Desktop connector */}
          <div className="hidden lg:block absolute top-14 left-[20%] right-[20%] h-px">
            <div className="w-full h-full border-t-2 border-dashed border-[var(--pc-border)] dark:border-[var(--pc-border)]" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="absolute inset-0 border-t-2 border-[var(--pc-primary)] origin-left"
              style={{ borderStyle: 'dashed' }}
            />
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.18, type: 'spring', stiffness: 180 }}
                className="flex flex-col items-center text-center relative"
              >
                {/* Mobile connector */}
                {i < STEPS.length - 1 && (
                  <div className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
                    <div className="w-px h-5 bg-gradient-to-b from-[var(--pc-primary)] to-transparent" />
                  </div>
                )}

                {/* Step number */}
                <div className="relative mb-6">
                  <span
                    className="absolute -top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.06] dark:opacity-[0.08]"
                    style={{ fontFamily: 'Sora, sans-serif', fontSize: '90px', fontWeight: 900, color: 'var(--pc-primary)', lineHeight: 1 }}
                  >
                    {step.number}
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl ${step.glow}`}
                  >
                    <Icon size={34} className="text-white" strokeWidth={1.8} />
                  </motion.div>
                  {/* Step indicator */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--pc-accent)] text-white flex items-center justify-center font-black shadow-md" style={{ fontSize: '10px' }}>
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)] mb-3" style={{ fontFamily: 'Sora, sans-serif', fontSize: '19px', fontWeight: 700 }}>
                  {step.title}
                </h3>
                <p className="text-[var(--pc-text-secondary)] leading-relaxed max-w-xs" style={{ fontSize: '14px' }}>
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-14"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="gradient-btn inline-flex items-center gap-2.5 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-[var(--pc-primary)]/35 touch-manipulation"
            style={{ fontSize: '16px' }}
          >
            {t('howItWorks.cta')} <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
