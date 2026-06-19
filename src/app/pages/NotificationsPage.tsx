import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ExternalLink,
  Loader2,
  MessageSquare,
  Trash2,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useDeleteNotifications,
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../hooks/useNotifications";
import type { AppNotification, AppNotificationData } from "../../types";

interface NotificationsPageProps {
  onBack: () => void;
}

type Category = "all" | "messages" | "annonces" | "adoptions" | "systeme";
type ReadFilter = "all" | "unread";

const CATEGORY_TABS: { key: Category; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "messages", label: "💬 Messages" },
  { key: "annonces", label: "📋 Annonces" },
  { key: "adoptions", label: "💚 Adoptions" },
  { key: "systeme", label: "⭐ Système" },
];

const ICON_COLORS: Record<string, string> = {
  message: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  listing:
    "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
  favorite: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
  adoption: "bg-[var(--pc-primary)]/10 text-[var(--pc-primary)]",
  system:
    "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
};

function safeData(
  notification: AppNotification,
): Required<AppNotificationData> {
  const data = notification.data ?? {};
  return {
    title: String(data.title || "Notification"),
    body: String(data.body || ""),
    icon: String(data.icon || "🔔"),
    category: data.category || "systeme",
    action_type: data.action_type || "none",
    action_id: data.action_id ?? null,
    avatar: data.avatar || null,
  };
}

function getTimestamp(date?: string | null): number {
  if (!date) return Date.now();
  const value = new Date(date).getTime();
  return Number.isFinite(value) ? value : Date.now();
}

function formatRelative(date?: string | null): string {
  const diff = Math.max(0, Date.now() - getTimestamp(date));
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  return `Il y a ${days}j`;
}

function groupLabel(date?: string | null): string {
  const ts = getTimestamp(date);
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 6 * 86_400_000;

  if (ts >= todayStart) return "Aujourd'hui";
  if (ts >= yesterdayStart) return "Hier";
  if (ts >= weekStart) return "Cette semaine";
  return "Plus ancien";
}

function actionLabel(type: string): string | null {
  if (type === "message") return "Ouvrir";
  if (type === "listing") return "Voir l’annonce";
  if (type === "profile") return "Voir le profil";
  return null;
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const data = safeData(notification);
  const isRead = Boolean(notification.read_at);
  const color = ICON_COLORS[notification.type] ?? ICON_COLORS.system;
  const ActionIcon =
    data.action_type === "message"
      ? MessageSquare
      : data.action_type === "profile"
        ? User
        : ExternalLink;
  const label = actionLabel(data.action_type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      onClick={() => !isRead && onMarkRead(notification.id)}
      className={`flex items-start gap-3 px-4 py-4 cursor-pointer hover:bg-[var(--pc-surface-alt)] transition-colors ${
        !isRead ? "bg-[var(--pc-primary)]/[0.05]" : ""
      }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${color}`}
      >
        {data.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-[var(--pc-text-primary)] leading-tight ${!isRead ? "font-bold" : "font-semibold"}`}
          style={{ fontSize: 13 }}
        >
          {data.title}
        </p>
        {data.body && (
          <p
            className="text-[var(--pc-text-secondary)] leading-snug mt-1 break-words"
            style={{ fontSize: 12 }}
          >
            {data.body}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span
            className="text-[var(--pc-text-secondary)]"
            style={{ fontSize: 11 }}
          >
            {formatRelative(notification.created_at)}
          </span>
          {label && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--pc-primary)]/40 px-2.5 py-0.5 text-[var(--pc-primary)] font-semibold hover:bg-[var(--pc-primary)]/10 transition-colors"
              style={{ fontSize: 10 }}
            >
              <ActionIcon size={10} /> {label}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isRead && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-2.5 h-2.5 rounded-full bg-[var(--pc-primary)] mt-2 flex-shrink-0"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [category, setCategory] = useState<Category>("all");

  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();
  const deleteNotifications = useDeleteNotifications();

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notifications.filter(
    (notification) => !notification.read_at,
  ).length;

  const visibleNotifications = useMemo(() => {
    return notifications
      .filter((notification) =>
        readFilter === "unread" ? !notification.read_at : true,
      )
      .filter((notification) =>
        category === "all"
          ? true
          : safeData(notification).category === category,
      );
  }, [category, notifications, readFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    for (const notification of visibleNotifications) {
      const label = groupLabel(notification.created_at);
      map.set(label, [...(map.get(label) ?? []), notification]);
    }

    const order = ["Aujourd'hui", "Hier", "Cette semaine", "Plus ancien"];
    return order
      .filter((label) => map.has(label))
      .map((label) => ({ label, items: map.get(label) ?? [] }));
  }, [visibleNotifications]);

  const handleMarkRead = (id: string) => {
    if (!markRead.isPending) markRead.mutate(id);
  };

  return (
    <div
      className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <header className="sticky top-0 z-30 bg-[var(--pc-surface)]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-b border-[var(--pc-border)]">
        <div
          className={`flex items-center gap-3 px-4 py-3.5 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-[var(--pc-border)] flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={18} className={isRtl ? "rotate-180" : ""} />
          </button>
          <div
            className={`flex-1 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <h1 className="font-black text-[var(--pc-text-primary)] text-lg">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-[var(--pc-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {notificationsQuery.isFetching && (
            <Loader2
              size={16}
              className="animate-spin text-[var(--pc-primary)]"
            />
          )}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="inline-flex items-center gap-1.5 text-[var(--pc-primary)] font-semibold disabled:opacity-50"
              style={{ fontSize: 12 }}
            >
              <CheckCheck size={15} /> Tout lire
            </button>
          )}
        </div>

        <div
          className={`flex px-4 pb-2 gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {(["all", "unread"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setReadFilter(filter)}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                readFilter === filter
                  ? "bg-[var(--pc-primary)] text-white"
                  : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]"
              }`}
              style={{ fontSize: 12 }}
            >
              {filter === "all" ? "Toutes" : "Non lues"}
            </button>
          ))}
        </div>

        <div className="flex px-4 pb-3 gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategory(tab.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                category === tab.key
                  ? "bg-[var(--pc-accent)] text-white"
                  : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]"
              }`}
              style={{ fontSize: 11 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-24">
        {notificationsQuery.isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-20 rounded-2xl bg-[var(--pc-surface)] animate-pulse"
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center px-8">
            <div className="text-6xl mb-4">🔔</div>
            <p
              className="font-bold text-[var(--pc-text-primary)] mb-1"
              style={{ fontSize: 18 }}
            >
              {readFilter === "unread"
                ? "Aucune notification non lue"
                : "Aucune notification"}
            </p>
            <p
              className="text-[var(--pc-text-secondary)]"
              style={{ fontSize: 14 }}
            >
              {readFilter === "unread"
                ? "Vous avez tout lu."
                : "Vos notifications apparaîtront ici."}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--pc-surface)] dark:bg-[#0D1117]">
            {groups.map((group) => (
              <section key={group.label}>
                <div className="sticky top-[126px] z-10 px-4 py-2 bg-[var(--pc-surface-alt)]/90 backdrop-blur-sm border-y border-[var(--pc-border)]/40">
                  <span
                    className="text-[var(--pc-text-secondary)] font-semibold"
                    style={{ fontSize: 11 }}
                  >
                    {group.label}
                  </span>
                </div>
                <div className="divide-y divide-[var(--pc-border)]/60">
                  {group.items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="flex justify-center mt-6 px-4">
            <button
              type="button"
              onClick={() => deleteNotifications.mutate()}
              disabled={deleteNotifications.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-red-400 hover:text-red-500 disabled:opacity-50 transition-all"
              style={{ fontSize: 13 }}
            >
              {deleteNotifications.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              Effacer tout
            </button>
          </div>
        )}
      </main>

      {notifications.length > 0 && (
        <div className="fixed bottom-8 right-8 pointer-events-none opacity-[0.03]">
          <Bell size={120} className="text-[var(--pc-text-primary)]" />
        </div>
      )}
    </div>
  );
}
