import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bell, CheckCheck, Trash2, ExternalLink, MessageSquare, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ── Types ──────────────────────────────────────────────────────────────────
interface NotificationsPageProps {
  onBack: () => void;
}

type NotifCategory = 'all' | 'messages' | 'annonces' | 'adoptions' | 'systeme';

interface Notification {
  id: string;
  type: string;
  category: NotifCategory;
  icon: string;
  title: string;
  body: string;
  time: string;
  timestamp: number; // ms since epoch
  read: boolean;
  avatar: string | null;
  actionLabel?: string;
  actionType?: 'annonce' | 'reply' | 'profile';
}

// ── Relative time formatting ───────────────────────────────────────────────
function formatRelativeTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  if (hr < 24) return `Il y a ${hr}h`;
  if (day === 1) return 'Hier';
  // For older: show day name
  const d = new Date(ts);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

function getDayGroup(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;
  if (ts >= todayStart) return "Aujourd'hui";
  if (ts >= yesterdayStart) return 'Hier';
  if (ts >= weekStart) return 'Cette semaine';
  return 'Plus ancien';
}

// ── Mock data ──────────────────────────────────────────────────────────────
const NOW = Date.now();
const INITIAL_NOTIFS: Notification[] = [
  { id: 'n1', type: 'message', category: 'messages', icon: '💬', title: 'Nouveau message', body: 'Ahmed Ben Salah: "Bonjour, Max est-il encore disponible ?"', time: 'Il y a 2 min', timestamp: NOW - 2 * 60000, read: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', actionLabel: 'Répondre', actionType: 'reply' },
  { id: 'n2', type: 'view', category: 'annonces', icon: '👁️', title: 'Annonce consultée', body: 'Votre annonce "Max - Berger Allemand" a été vue 45 fois aujourd\'hui', time: 'Il y a 1h', timestamp: NOW - 60 * 60000, read: false, avatar: null, actionLabel: "Voir l'annonce", actionType: 'annonce' },
  { id: 'n3', type: 'follower', category: 'systeme', icon: '👤', title: 'Nouveau abonné', body: 'Dr. Mehdi Gharbi vous suit maintenant', time: 'Il y a 3h', timestamp: NOW - 3 * 60 * 60000, read: false, avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=face', actionLabel: 'Voir le profil', actionType: 'profile' },
  { id: 'n4', type: 'like', category: 'annonces', icon: '❤️', title: 'Nouveau like', body: 'Ines Monastir a aimé votre annonce "Luna - Chatte tigrée"', time: 'Hier', timestamp: NOW - 26 * 60 * 60000, read: true, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face', actionLabel: "Voir l'annonce", actionType: 'annonce' },
  { id: 'n5', type: 'expiring', category: 'annonces', icon: '⏰', title: 'Annonce bientôt expirée', body: 'Votre annonce "Rocky - Lapin Angora" expire dans 3 jours', time: 'Il y a 2j', timestamp: NOW - 2 * 24 * 60 * 60000, read: true, avatar: null, actionLabel: "Voir l'annonce", actionType: 'annonce' },
  { id: 'n6', type: 'offer', category: 'adoptions', icon: '💚', title: 'Demande d\'adoption', body: 'Karim B. a postulé pour adopter Nala - Labrador Mix', time: 'Il y a 3j', timestamp: NOW - 3 * 24 * 60 * 60000, read: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', actionLabel: 'Voir le profil', actionType: 'profile' },
];

const ICON_COLORS: Record<string, string> = {
  message: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  view: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  follower: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  like: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  expiring: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  offer: 'bg-[var(--pc-primary)]/10 text-[var(--pc-primary)]',
};

// ── Notification Item ──────────────────────────────────────────────────────
function NotifItem({
  notif,
  onMarkRead,
}: {
  notif: Notification;
  onMarkRead: (id: string) => void;
}) {
  const iconColor = ICON_COLORS[notif.type] ?? 'bg-gray-100 text-gray-500';
  const relTime = formatRelativeTime(notif.timestamp);

  const ActionIcon = notif.actionType === 'reply' ? MessageSquare : notif.actionType === 'profile' ? User : ExternalLink;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={() => onMarkRead(notif.id)}
      className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-[var(--pc-surface-alt)] dark:hover:bg-[#161B22] relative ${
        !notif.read ? 'bg-[var(--pc-primary)]/[0.04] dark:bg-[var(--pc-primary)]/[0.07]' : ''
      }`}
    >
      {/* Left: avatar or icon */}
      <div className="flex-shrink-0 relative">
        {notif.avatar ? (
          <div className="relative">
            <img
              src={notif.avatar} alt=""
              className="w-11 h-11 rounded-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${notif.id}/44/44`; }}
            />
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] border-2 border-[var(--pc-surface)] ${iconColor}`}>
              {notif.icon}
            </span>
          </div>
        ) : (
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl ${iconColor}`}>
            {notif.icon}
          </div>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 min-w-0">
        <p className={`text-[var(--pc-text-primary)] mb-0.5 leading-tight ${!notif.read ? 'font-bold' : 'font-semibold'}`} style={{ fontSize: '13px' }}>
          {notif.title}
        </p>
        <p className="text-[var(--pc-text-secondary)] leading-snug overflow-hidden" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {notif.body}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <p className="text-[var(--pc-text-secondary)]" style={{ fontSize: '11px' }}>
            {relTime}
          </p>
          {/* Action button */}
          {notif.actionLabel && (
            <button
              onClick={e => { e.stopPropagation(); onMarkRead(notif.id); }}
              className="flex items-center gap-1 text-[var(--pc-primary)] border border-[var(--pc-primary)]/40 rounded-full px-2.5 py-0.5 font-semibold hover:bg-[var(--pc-primary)]/10 transition-colors"
              style={{ fontSize: '10px' }}
            >
              <ActionIcon size={10} /> {notif.actionLabel}
            </button>
          )}
        </div>
      </div>

      {/* Right: unread dot */}
      <div className="flex-shrink-0 flex items-center pt-1">
        <AnimatePresence>
          {!notif.read && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-2.5 h-2.5 rounded-full bg-[var(--pc-primary)]"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const CATEGORY_TABS: { key: NotifCategory; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'messages', label: '💬 Messages' },
  { key: 'annonces', label: '📋 Annonces' },
  { key: 'adoptions', label: '💚 Adoptions' },
  { key: 'systeme', label: '⭐ Système' },
];

// ── Main Component ─────────────────────────────────────────────────────────
export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [category, setCategory] = useState<NotifCategory>('all');

  const unreadCount = notifs.filter(n => !n.read).length;

  const visibleNotifs = notifs
    .filter(n => filter === 'unread' ? !n.read : true)
    .filter(n => category === 'all' ? true : n.category === category);

  // Group by day
  const grouped: { day: string; notifs: Notification[] }[] = [];
  const dayMap = new Map<string, Notification[]>();
  for (const n of visibleNotifs) {
    const day = getDayGroup(n.timestamp);
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(n);
  }
  const DAY_ORDER = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];
  for (const day of DAY_ORDER) {
    if (dayMap.has(day)) grouped.push({ day, notifs: dayMap.get(day)! });
  }

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifs([]);
  };

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12]" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[var(--pc-surface)]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-b border-[var(--pc-border)]">
        <div className={`flex items-center gap-3 px-4 py-3.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Back */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
          >
            <ArrowLeft size={18} className={`text-[var(--pc-text-primary)] ${isRtl ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Title + badge */}
          <div className={`flex-1 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h1 className="font-black text-[var(--pc-text-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px' }}>
              Notifications
            </h1>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-[var(--pc-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Mark all read */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
                onClick={markAllRead}
                className={`flex items-center gap-1.5 text-[var(--pc-primary)] font-semibold hover:opacity-80 transition-opacity ${isRtl ? 'flex-row-reverse' : ''}`}
                style={{ fontSize: '12px' }}
              >
                <CheckCheck size={15} />
                Tout lire
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Read/Unread filter */}
        <div className={`flex px-4 pb-1 gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-4 py-1.5 rounded-full font-semibold transition-all ${
                filter === f
                  ? 'bg-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/25'
                  : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]'
              }`}
              style={{ fontSize: '12px' }}
            >
              {f === 'all' ? 'Toutes' : 'Non lues'}
              {f === 'unread' && unreadCount > 0 && filter !== 'unread' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex px-4 pb-3 gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                category === tab.key
                  ? 'bg-[var(--pc-accent)] text-white shadow-sm'
                  : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]'
              }`}
              style={{ fontSize: '11px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Notification list */}
      <main className="pb-24">
        <AnimatePresence mode="wait">
          {grouped.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center px-8"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                className="text-6xl mb-4"
              >
                🔔
              </motion.div>
              <p className="font-bold text-[var(--pc-text-primary)] mb-1" style={{ fontSize: '18px' }}>
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </p>
              <p className="text-[var(--pc-text-secondary)]" style={{ fontSize: '14px' }}>
                {filter === 'unread'
                  ? 'Vous avez tout lu, bravo !'
                  : 'Vos notifications apparaîtront ici'}
              </p>
              {filter === 'unread' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 bg-[var(--pc-primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  style={{ fontSize: '13px' }}
                >
                  Voir toutes
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--pc-surface)] dark:bg-[#0D1117]"
            >
              {grouped.map(({ day, notifs: dayNotifs }) => (
                <div key={day}>
                  {/* Sticky day header */}
                  <div className="sticky top-0 z-10 px-4 py-2 bg-[var(--pc-surface-alt)]/90 dark:bg-[#0D1117]/90 backdrop-blur-sm border-y border-[var(--pc-border)]/40">
                    <span className="text-[var(--pc-text-secondary)] font-semibold" style={{ fontSize: '11px' }}>{day}</span>
                  </div>
                  <div className="divide-y divide-[var(--pc-border)]/60">
                    <AnimatePresence initial={false}>
                      {dayNotifs.map(notif => (
                        <NotifItem key={notif.id} notif={notif} onMarkRead={markRead} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear all button */}
        <AnimatePresence>
          {notifs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex justify-center mt-6 px-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={clearAll}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-red-400 hover:text-red-500 transition-all ${isRtl ? 'flex-row-reverse' : ''}`}
                style={{ fontSize: '13px' }}
              >
                <Trash2 size={15} />
                Effacer tout
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bell watermark when list is full */}
      {notifs.length > 0 && (
        <div className="fixed bottom-8 right-8 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <Bell size={120} className="text-[var(--pc-text-primary)]" />
        </div>
      )}
    </div>
  );
}
