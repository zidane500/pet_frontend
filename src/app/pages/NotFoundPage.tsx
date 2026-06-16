import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Home, Search } from 'lucide-react';

export function NotFoundPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background:
          'radial-gradient(ellipse at 20% 20%, rgba(29,125,95,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(244,167,50,0.10) 0%, transparent 50%), var(--pc-surface)',
      }}
    >
      {/* Background aurora blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--pc-primary), transparent 70%)',
          }}
        />
        <motion.div
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 25, -15, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--pc-accent), transparent 70%)',
          }}
        />
        <motion.div
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, var(--pc-primary), transparent 70%)',
          }}
        />
      </div>

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card relative z-10 max-w-lg w-full p-8 sm:p-12 rounded-3xl text-center shadow-2xl"
      >
        {/* 404 number */}
        <div className="relative mb-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', damping: 12 }}
            className="font-bold leading-none select-none"
            style={{
              fontSize: 'clamp(80px, 20vw, 120px)',
              fontFamily: "'Sora', sans-serif",
              background:
                'linear-gradient(135deg, var(--pc-primary) 0%, var(--pc-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </motion.div>

          {/* Floating paw */}
          <motion.div
            animate={{
              y: [-6, 6, -6],
              rotate: [-8, 8, -8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-2 -right-2 sm:right-4 text-4xl select-none"
            aria-hidden="true"
          >
            🐾
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-[var(--pc-text-primary)] mb-3"
        >
          Page introuvable
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[var(--pc-text-secondary)] text-sm sm:text-base mb-8 leading-relaxed"
        >
          Oups ! Cette page s'est peut-être perdue comme un animal... Mais on va vous aider à
          retrouver votre chemin.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
          >
            <Home size={18} />
            Retour à l'accueil
          </button>

          <button
            onClick={() => onNavigate('search')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold border border-[var(--pc-border)] text-[var(--pc-text-primary)] bg-[var(--pc-surface)] transition-transform hover:scale-105 active:scale-95"
          >
            <Search size={18} />
            Rechercher
          </button>
        </motion.div>

        {/* Decorative paw prints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center gap-3"
          aria-hidden="true"
        >
          {['🐾', '🐾', '🐾'].map((p, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
              className="text-lg"
            >
              {p}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
