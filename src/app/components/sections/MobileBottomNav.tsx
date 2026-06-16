import { Home, Search, MessageCircle, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const MESSAGE_COUNT = 2;

export function MobileBottomNav({
  onNavigate,
  isLoggedIn = false,
}: {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
}) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  const NAV_ITEMS = [
    { icon: Home, label: t('mobileNav.home'), page: 'home' },
    { icon: Search, label: t('mobileNav.search'), page: 'search' },
    { label: t('mobileNav.publish'), isPublish: true, page: 'create-listing' },
    { icon: MessageCircle, label: t('mobileNav.messages'), page: isLoggedIn ? 'messages' : 'login', badge: isLoggedIn ? MESSAGE_COUNT : 0 },
    { icon: User, label: t('mobileNav.profile'), page: isLoggedIn ? 'profile' : 'login' },
  ] as const;

  return (
    <>
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div
          className="flex items-center justify-around px-2 py-2.5 rounded-[28px] shadow-2xl"
          style={{
            background: 'rgba(var(--pc-surface-rgb, 255,255,255), 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          {NAV_ITEMS.map((item, i) => {
            if (item.isPublish) {
              return (
                <motion.button
                  key="publish"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => onNavigate?.('create-listing')}
                  className="flex flex-col items-center -mt-7 touch-manipulation"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl touch-manipulation"
                    style={{
                      background: 'linear-gradient(135deg, var(--pc-accent) 0%, #f59e0b 100%)',
                      boxShadow: '0 8px 24px rgba(244,167,50,0.5)',
                    }}
                  >
                    <span className="text-white font-black" style={{ fontSize: '28px', lineHeight: 1 }}>+</span>
                  </div>
                  <span className="text-[var(--pc-accent)] font-bold mt-1.5" style={{ fontSize: '10px' }}>Publier</span>
                </motion.button>
              );
            }

            const Icon = item.icon!;
            const isActive = active === i;

            return (
              <motion.button
                key={item.label}
                onClick={() => { setActive(i); if ('page' in item) onNavigate?.(item.page); }}
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all duration-200 touch-manipulation min-w-[48px] relative"
              >
                {/* Active background bubble */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 rounded-2xl bg-[var(--pc-primary-light)] dark:bg-[var(--pc-primary-light)]"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative">
                  <motion.div
                    animate={isActive ? { y: -2 } : { y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      size={22}
                      className={`transition-colors duration-200 ${isActive ? 'text-[var(--pc-primary)]' : 'text-[var(--pc-text-secondary)]'}`}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </motion.div>
                  {'badge' in item && (item as { badge?: number }).badge ? (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center font-bold" style={{ fontSize: '8px' }}>
                      {(item as { badge?: number }).badge}
                    </span>
                  ) : null}
                </div>

                <motion.span
                  animate={{ color: isActive ? 'var(--pc-primary)' : 'var(--pc-text-secondary)' }}
                  className="font-semibold relative"
                  style={{ fontSize: '9px' }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Spacer */}
      <div className="lg:hidden h-24" />
    </>
  );
}
