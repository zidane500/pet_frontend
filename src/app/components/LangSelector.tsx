import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'en', flag: '🇬🇧' },
] as const;

export function LangSelector({ direction = 'down' }: { direction?: 'up' | 'down' }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--pc-border)] dark:border-[var(--pc-border)] bg-[var(--pc-surface)] dark:bg-[#161B22] hover:border-[var(--pc-primary)] transition-all duration-200 touch-manipulation"
        style={{ fontSize: '13px' }}
      >
        <span>{current.flag}</span>
        <span className="font-semibold text-[var(--pc-text-primary)]">
          {t(`lang.${current.code}` as any)}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-[var(--pc-text-secondary)]" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'down' ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'down' ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${direction === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'} right-0 min-w-[150px] rounded-xl overflow-hidden z-[200] border border-[var(--pc-border)] dark:border-[var(--pc-border)]`}
            style={{ background: 'var(--pc-surface)', boxShadow: '0 16px 48px rgba(0,0,0,0.22)' }}
          >
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => switchLang(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 transition-colors duration-150 ${
                    isActive
                      ? 'bg-[var(--pc-primary)] text-white'
                      : 'text-[var(--pc-text-primary)] hover:bg-[var(--pc-surface-alt)] dark:hover:bg-[#1C2128]'
                  }`}
                  style={{ fontSize: '14px', fontFamily: lang.code === 'ar' ? 'Cairo, sans-serif' : undefined }}
                >
                  <span>{lang.flag}</span>
                  <span className="flex-1 text-left font-medium">{t(`lang.${lang.code}` as any)}</span>
                  {isActive && <Check size={13} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
