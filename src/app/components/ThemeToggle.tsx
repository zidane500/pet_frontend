import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('petconnect-theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('petconnect-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('petconnect-theme', 'light');
    }
  }, [dark]);

  return (
    <motion.button
      onClick={() => setDark(!dark)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden"
      style={{
        background: dark
          ? 'linear-gradient(135deg, #1A3D2F, #0A1A12)'
          : 'linear-gradient(135deg, #E8F5F0, #d1fae5)',
        border: `1px solid ${dark ? 'rgba(46,168,122,0.3)' : 'rgba(29,125,95,0.2)'}`,
        boxShadow: dark ? '0 0 16px rgba(46,168,122,0.2)' : '0 2px 8px rgba(29,125,95,0.12)',
      }}
      aria-label="Toggle dark mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className="absolute"
          >
            <Sun size={17} className="text-amber-400" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className="absolute"
          >
            <Moon size={17} className="text-[var(--pc-primary)]" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
