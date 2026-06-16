import { motion } from 'motion/react';
import { Facebook, Instagram, Phone, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LangSelector } from '../LangSelector';

export function Footer() {
  const { t } = useTranslation();

  const COLUMNS = [
    {
      titleKey: 'footer.columns.listings', emoji: '📋',
      links: [
        { key: 'footer.links.sale' }, { key: 'footer.links.adoption' },
        { key: 'footer.links.requests' }, { key: 'footer.links.lostAnimals' },
      ],
    },
    {
      titleKey: 'footer.columns.directories', emoji: '📍',
      links: [
        { key: 'footer.links.vets' }, { key: 'footer.links.petStores' },
        { key: 'footer.links.breeders' },
      ],
    },
    {
      titleKey: 'footer.columns.community', emoji: '🐾',
      links: [
        { key: 'footer.links.feed' }, { key: 'footer.links.petProfile' },
        { key: 'footer.links.qrCode' }, { key: 'footer.links.healthRecord' },
      ],
    },
    {
      titleKey: 'footer.columns.platform', emoji: '⚙️',
      links: [
        { key: 'footer.links.about' }, { key: 'footer.links.premium' },
        { key: 'footer.links.advertising' }, { key: 'footer.links.contact' },
        { key: 'footer.links.tos' }, { key: 'footer.links.privacy' },
      ],
    },
  ] as const;

  return (
    <footer className="relative overflow-hidden border-t border-[var(--pc-border)] dark:border-[var(--pc-border)]">
      <div className="absolute inset-0 bg-[var(--pc-surface-alt)] dark:bg-[#060C12]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[var(--pc-primary)]/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">

        {/* Top row */}
        <div className="flex flex-col lg:flex-row gap-12 mb-14">
          {/* Brand */}
          <div className="lg:w-72 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="text-3xl">🐾</span>
              <div>
                <span className="font-black bg-gradient-to-r from-[var(--pc-primary)] to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px' }}>Animali</span>
                <span className="font-black text-[var(--pc-accent)]" style={{ fontSize: '14px' }}>.tn</span>
              </div>
            </motion.div>
            <p className="text-[var(--pc-text-secondary)] mb-6 leading-relaxed" style={{ fontSize: '14px' }}>
              {t('hero.line1')} {t('hero.line2')} {t('hero.line3')}
            </p>

            <div className="flex items-center gap-2.5">
              {[
                { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600 hover:border-blue-600 hover:text-white' },
                { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-500 hover:border-pink-500 hover:text-white' },
                { icon: Phone, label: 'WhatsApp', color: 'hover:bg-green-500 hover:border-green-500 hover:text-white' },
              ].map(({ icon: Icon, label, color }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  aria-label={label}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--pc-border)] dark:border-[var(--pc-border)] text-[var(--pc-text-secondary)] ${color} transition-all duration-300`}
                >
                  <Icon size={17} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {COLUMNS.map((col, ci) => (
              <motion.div
                key={col.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span>{col.emoji}</span>
                  <h4 className="font-bold text-[var(--pc-text-primary)]" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {t(col.titleKey)}
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.key}>
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-primary)] transition-colors text-left"
                        style={{ fontSize: '13px' }}
                      >
                        {t(link.key)}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter strip */}
        <div className="glass-card border border-[var(--pc-border)]/60 dark:border-[var(--pc-border)]/40 rounded-2xl p-5 mb-12 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-[var(--pc-text-primary)]" style={{ fontSize: '15px' }}>
              📬 {t('footer.newsletter')}
            </p>
            <p className="text-[var(--pc-text-secondary)]" style={{ fontSize: '12px' }}>{t('footer.newsletterSub')}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder')}
              className="flex-1 sm:w-52 bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40 transition-all"
              style={{ fontSize: '13px' }}
            />
            <button className="gradient-btn text-white font-bold px-5 py-2.5 rounded-xl touch-manipulation flex-shrink-0" style={{ fontSize: '13px' }}>
              {t('footer.subscribe')}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--pc-border)]">
          <p className="text-[var(--pc-text-secondary)] text-center sm:text-left" style={{ fontSize: '13px' }}>
            {t('footer.copyright')}
          </p>
          <LangSelector direction="up" />
        </div>

        <p className="text-center text-[var(--pc-text-secondary)] mt-5 flex items-center justify-center gap-1.5" style={{ fontSize: '12px' }}>
          {t('footer.madeWith')} <Heart size={11} className="text-red-500 fill-red-500" /> {t('footer.inTunisia')}
        </p>
      </div>
    </footer>
  );
}
