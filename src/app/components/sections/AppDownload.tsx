import { motion } from 'motion/react';
import { Bell, Smartphone, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PHONE_ITEMS = [
  { emoji: '🐕', label: 'Max · Berger allemand', sub: 'Tunis · 850 DT', color: 'from-emerald-500/20 to-teal-500/10' },
  { emoji: '🐈', label: 'Luna · Chat siamois', sub: 'Sfax · Adoption', color: 'from-blue-500/20 to-indigo-500/10' },
  { emoji: '🐇', label: 'Lola · Lapin angora', sub: 'Sousse · 120 DT', color: 'from-amber-500/20 to-orange-500/10' },
];

export function AppDownload() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden noise-overlay">
      {/* Deep dark bg with rich glows */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #060C12 0%, #0A1A12 50%, #060C12 100%)' }} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--pc-primary)]/20 blur-3xl" style={{ animation: 'aurora-shift 15s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[var(--pc-accent)]/12 blur-3xl" style={{ animation: 'aurora-shift-2 18s ease-in-out infinite' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 border border-[var(--pc-primary)]/40 bg-[var(--pc-primary)]/15 text-[var(--pc-primary)] px-4 py-2 rounded-full mb-6"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <Smartphone size={15} />
              {t('download.badge')}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1 }}
            >
              {t('download.title1')}<br />
              <span className="shimmer-text">{t('download.title2')}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/55 mb-8 max-w-md mx-auto lg:mx-0"
              style={{ fontSize: '16px' }}
            >
              {t('download.subtitle')}
            </motion.p>

            {/* Email form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0"
            >
              {!submitted ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('download.placeholder')}
                    className="flex-1 glass-card text-white placeholder-white/35 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/60 transition-all"
                    style={{ fontSize: '14px' }}
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-[var(--pc-accent)] hover:opacity-90 text-white font-bold px-7 py-4 rounded-2xl shadow-xl shadow-[var(--pc-accent)]/35 touch-manipulation flex-shrink-0"
                    style={{ fontSize: '14px' }}
                  >
                    <Bell size={16} />
                    {t('download.notify')}
                  </motion.button>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 glass-card border border-[var(--pc-primary)]/40 text-[var(--pc-primary)] px-5 py-4 rounded-2xl"
                >
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold" style={{ fontSize: '14px' }}>{t('download.notified')}</span>
                </motion.div>
              )}
            </motion.form>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start"
            >
              {[t('download.feature1'), t('download.feature2'), t('download.feature3')].map((f) => (
                <div key={f} className="glass-card border border-white/10 text-white/70 px-3.5 py-2 rounded-xl" style={{ fontSize: '12px', fontWeight: 500 }}>
                  {f}
                </div>
              ))}
            </motion.div>

            {/* Store badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 mt-7 justify-center lg:justify-start"
            >
              {[{ icon: '🍎', name: 'App Store' }, { icon: '🤖', name: 'Google Play' }].map((s) => (
                <div key={s.name} className="flex items-center gap-3 glass-card border border-white/10 px-4 py-3 rounded-2xl opacity-50 cursor-not-allowed">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-white/40" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bientôt</p>
                    <p className="text-white font-bold" style={{ fontSize: '13px' }}>{s.name}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 140 }}
            className="flex-shrink-0 relative"
          >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            className="relative"
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-72 rounded-full bg-[var(--pc-primary)]/30 blur-3xl" />
            </div>

            {/* Phone frame */}
            <div
              className="relative w-56 h-[480px] rounded-[44px] border-[5px] overflow-hidden shadow-2xl"
              style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'linear-gradient(160deg, #0d1117 0%, #1a2d1f 100%)', boxShadow: '0 0 100px rgba(29,125,95,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            >
              {/* Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full z-20" style={{ background: 'rgba(0,0,0,0.8)' }}>
                <div className="absolute right-4 top-1.5 w-2 h-2 rounded-full bg-[var(--pc-primary)]/60" />
              </div>

              {/* Screen content */}
              <div className="absolute inset-0 pt-12 px-3 flex flex-col gap-2.5 overflow-hidden">
                {/* App header */}
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-white font-black" style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px' }}>🐾 Animali</span>
                  <div className="w-7 h-7 rounded-full bg-[var(--pc-primary)]/40 border border-[var(--pc-primary)]/30 flex items-center justify-center">
                    <Bell size={12} className="text-[var(--pc-primary)]" />
                  </div>
                </div>

                {/* Search */}
                <div className="bg-white/8 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Zap size={12} className="text-[var(--pc-primary)]" />
                  <span className="text-white/40" style={{ fontSize: '11px' }}>Rechercher animaux...</span>
                </div>

                {/* Cards */}
                {PHONE_ITEMS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 60, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                    className={`rounded-2xl p-3 bg-gradient-to-r ${item.color} border border-white/8`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">{item.emoji}</div>
                      <div>
                        <p className="text-white font-bold" style={{ fontSize: '11px' }}>{item.label}</p>
                        <p className="text-white/55" style={{ fontSize: '10px' }}>{item.sub}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Bottom nav preview */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/8 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-around border border-white/10">
                  {['🏠', '🔍', '➕', '💬', '👤'].map((icon, i) => (
                    <div key={i} className={`flex flex-col items-center gap-0.5 ${i === 0 ? 'text-[var(--pc-primary)]' : 'text-white/40'}`}>
                      <span style={{ fontSize: i === 2 ? '20px' : '14px' }}>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
