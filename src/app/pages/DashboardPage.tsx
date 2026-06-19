import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  useDashboard,
  useDeleteListing,
  useMyListings,
  useUpdateListing,
} from "../../hooks/useDashboard";
import { useCreateListing } from "../../hooks/useListings";
import { useAuthStore } from "../../store/authStore";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  LayoutDashboard,
  List,
  Heart,
  MessageCircle,
  Bell,
  Settings,
  Eye,
  TrendingUp,
  Plus,
  Edit3,
  Pause,
  Play,
  Trash2,
  CheckCircle,
  User,
  Lock,
  Palette,
  Globe,
  ChevronRight,
  Copy,
  Sun,
  Moon,
  Monitor,
  Camera,
  RefreshCw,
  Clock,
} from "lucide-react";
import { ConfirmModal } from "../components/ui/GlobalModals";
import { ThemeToggle } from "../components/ThemeToggle";
import { LangSelector } from "../components/LangSelector";
import type { DashboardData, Listing } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type MainTab =
  | "overview"
  | "myListings"
  | "myFavorites"
  | "messages"
  | "notifications"
  | "settings";
type SettingsSubTab = "profile" | "security" | "appearance" | "language";
type ListingStatus =
  | "active"
  | "paused"
  | "sold"
  | "adopted"
  | "expired"
  | "pending";

interface ListingItem {
  id: string;
  title: string;
  type: string;
  price: string;
  city: string;
  image: string;
  views: number;
  favorites: number;
  messages: number;
  status: ListingStatus;
  daysLeft: number;
  source?: Listing;
}

interface NotificationItem {
  id: string;
  type: string;
  icon: string;
  text: string;
  time: string;
  read: boolean;
}

// ─── Static / Mock Data ───────────────────────────────────────────────────────

const STATS: {
  label: string;
  value: number;
  icon: string;
  color: string;
  trend: number;
}[] = [
  {
    label: "Annonces actives",
    value: 4,
    icon: "📋",
    color: "emerald",
    trend: 1,
  },
  {
    label: "Vues totales",
    value: 1248,
    icon: "👁️",
    color: "blue",
    trend: 84,
  },
  {
    label: "Messages non lus",
    value: 3,
    icon: "💬",
    color: "purple",
    trend: 0,
  },
  {
    label: "Total annonces",
    value: 12,
    icon: "🐾",
    color: "amber",
    trend: 2,
  },
];

const AREA_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `J${i + 1}`,
  views: Math.floor(20 + Math.random() * 80),
}));

const BAR_DATA = [
  { day: "Lun", count: 4 },
  { day: "Mar", count: 7 },
  { day: "Mer", count: 3 },
  { day: "Jeu", count: 9 },
  { day: "Ven", count: 5 },
  { day: "Sam", count: 11 },
  { day: "Dim", count: 6 },
];

const RECENT_ACTIVITY = [
  {
    icon: "💬",
    text: "Nouveau message de Sami Trabelsi concernant votre annonce Labrador",
    time: "Il y a 5 min",
  },
  {
    icon: "❤️",
    text: "Quelqu'un a ajouté votre annonce Chat Siamois en favori",
    time: "Il y a 22 min",
  },
  {
    icon: "👁️",
    text: "Votre annonce Perroquet Ara a reçu 34 nouvelles vues",
    time: "Il y a 1h",
  },
  {
    icon: "✅",
    text: "Votre profil a été vérifié avec succès",
    time: "Il y a 2h",
  },
];

const MOCK_LISTINGS_BASE: ListingItem[] = [
  {
    id: "1",
    title: "Labrador Retriever Mâle 3 mois",
    type: "vente",
    price: "800 DT",
    city: "Tunis",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=250&fit=crop",
    views: 342,
    favorites: 18,
    messages: 7,
    status: "active",
    daysLeft: 18,
  },
  {
    id: "2",
    title: "Chat Siamois Femelle 2 ans",
    type: "adoption",
    price: "Gratuit",
    city: "Sfax",
    image:
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400&h=250&fit=crop",
    views: 156,
    favorites: 12,
    messages: 4,
    status: "active",
    daysLeft: 5,
  },
  {
    id: "3",
    title: "Perroquet Ara Bleu",
    type: "vente",
    price: "1200 DT",
    city: "Sousse",
    image:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=250&fit=crop",
    views: 89,
    favorites: 5,
    messages: 2,
    status: "paused",
    daysLeft: 22,
  },
  {
    id: "4",
    title: "Lapin Nain Blanc",
    type: "adoption",
    price: "Gratuit",
    city: "Monastir",
    image:
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=250&fit=crop",
    views: 203,
    favorites: 9,
    messages: 3,
    status: "sold",
    daysLeft: 0,
  },
];

const MOCK_FAVORITES: ListingItem[] = [
  {
    id: "f1",
    title: "Golden Retriever Femelle 4 mois",
    type: "vente",
    price: "950 DT",
    city: "La Marsa",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=250&fit=crop",
    views: 511,
    favorites: 34,
    messages: 12,
    status: "active",
    daysLeft: 28,
  },
  {
    id: "f2",
    title: "Berger Allemand Mâle 1 an",
    type: "adoption",
    price: "Gratuit",
    city: "Ariana",
    image:
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=250&fit=crop",
    views: 287,
    favorites: 21,
    messages: 8,
    status: "active",
    daysLeft: 14,
  },
];

const MOCK_CONVERSATIONS = [
  {
    id: "c1",
    avatar: "ST",
    name: "Sami Trabelsi",
    lastMessage: "Bonjour, est-ce que le chien est toujours disponible ?",
    time: "5 min",
    unread: 2,
  },
  {
    id: "c2",
    avatar: "LB",
    name: "Leila Brahmi",
    lastMessage: "Merci pour votre réponse rapide !",
    time: "1h",
    unread: 0,
  },
  {
    id: "c3",
    avatar: "MK",
    name: "Mohamed Karim",
    lastMessage: "Quel est le prix final ?",
    time: "3h",
    unread: 1,
  },
];

const MOCK_NOTIFICATIONS_DATA: NotificationItem[] = [
  {
    id: "n1",
    type: "message",
    icon: "💬",
    text: "Sami Trabelsi vous a envoyé un message concernant Labrador Retriever",
    time: "Il y a 5 min",
    read: false,
  },
  {
    id: "n2",
    type: "favorite",
    icon: "❤️",
    text: "Votre annonce Chat Siamois a été ajoutée en favori",
    time: "Il y a 22 min",
    read: false,
  },
  {
    id: "n3",
    type: "view",
    icon: "👁️",
    text: "Votre annonce Perroquet Ara a reçu 34 nouvelles vues aujourd'hui",
    time: "Il y a 1h",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    icon: "✅",
    text: "Votre profil a été vérifié avec succès",
    time: "Il y a 2h",
    read: true,
  },
  {
    id: "n5",
    type: "expiry",
    icon: "⏰",
    text: "Votre annonce Chat Siamois expire dans 5 jours",
    time: "Il y a 3h",
    read: false,
  },
];

// ─── Status Badges ────────────────────────────────────────────────────────────

const STATUS_BADGES: Record<
  ListingStatus,
  { label: string; color: string; dot: string }
> = {
  active: { label: "Actif", color: "bg-emerald-500", dot: "🟢" },
  paused: { label: "En pause", color: "bg-amber-500", dot: "🟡" },
  sold: { label: "Vendu", color: "bg-blue-500", dot: "🔵" },
  adopted: { label: "Adopté", color: "bg-pink-500", dot: "🩷" },
  expired: { label: "Expiré", color: "bg-red-500", dot: "🔴" },
  pending: { label: "En révision", color: "bg-purple-500", dot: "🟣" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  pink: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  indigo: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
  teal: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
};

function typeBadgeClass(type: string): string {
  switch (type) {
    case "adoption":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "vente":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "perdu":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
    case "trouve":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

interface DashboardStat {
  label: string;
  value: number;
  icon: string;
  color: string;
  trend: number;
}

interface RecentActivityItem {
  icon: string;
  text: string;
  time: string;
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatPriceFromListing(listing: Listing): string {
  if (listing.is_free || listing.type === "adoption") return "Gratuit";
  if (
    listing.price === null ||
    listing.price === undefined ||
    listing.price === ""
  )
    return "—";
  return `${toNumber(listing.price).toLocaleString("fr-TN")} DT`;
}

function getDaysLeft(expiresAt?: string | null): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function resolveListingStatus(listing: Listing): ListingStatus {
  if (
    listing.expires_at &&
    new Date(listing.expires_at).getTime() < Date.now()
  ) {
    return "expired";
  }

  if (listing.status) return listing.status as ListingStatus;
  return listing.is_active ? "active" : "paused";
}

function mapListingToItem(listing: Listing): ListingItem {
  return {
    id: String(listing.id),
    title: listing.title,
    type: listing.type,
    price: formatPriceFromListing(listing),
    city: listing.city ?? listing.region ?? "—",
    image:
      listing.photos?.[0] ??
      `https://picsum.photos/seed/dashboard-${listing.id}/400/250`,
    views: listing.views_count ?? 0,
    favorites:
      (listing as Listing & { favorites_count?: number }).favorites_count ?? 0,
    messages:
      (listing as Listing & { messages_count?: number }).messages_count ?? 0,
    status: resolveListingStatus(listing),
    daysLeft: getDaysLeft(listing.expires_at),
    source: listing,
  };
}

function userInitials(name?: string | null): string {
  const parts = (name ?? "Utilisateur")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

function getProfileCompletion(
  user: DashboardData["user"] | null | undefined,
): number {
  if (!user) return 0;

  const fields = [
    user.name,
    user.email,
    user.phone,
    user.city,
    user.region,
    user.avatar,
    user.bio,
    user.is_verified,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

function buildStats(dashboard?: DashboardData | null): DashboardStat[] {
  return [
    {
      label: "Annonces actives",
      value: dashboard?.active_listings ?? 0,
      icon: "📋",
      color: "emerald",
      trend: 0,
    },
    {
      label: "Vues totales",
      value: dashboard?.total_views ?? 0,
      icon: "👁️",
      color: "blue",
      trend: 0,
    },
    {
      label: "Messages non lus",
      value: dashboard?.unread_messages ?? 0,
      icon: "💬",
      color: "purple",
      trend: 0,
    },
    {
      label: "Total annonces",
      value: dashboard?.listings_count ?? 0,
      icon: "🐾",
      color: "amber",
      trend: 0,
    },
  ];
}

function buildViewsData(dashboard?: DashboardData | null) {
  const data = dashboard?.views_by_listing ?? [];
  if (data.length > 0) return data;
  return [{ day: "Aucune", views: 0 }];
}

function buildMessagesData(dashboard?: DashboardData | null) {
  const data = dashboard?.messages_by_day ?? [];
  if (data.length > 0) return data;
  return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => ({
    day,
    count: 0,
  }));
}

function timeAgoLabel(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.max(0, Math.floor(diff / 60_000));
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

function buildRecentActivity(
  dashboard?: DashboardData | null,
): RecentActivityItem[] {
  const items: RecentActivityItem[] = [];

  if ((dashboard?.unread_messages ?? 0) > 0) {
    items.push({
      icon: "💬",
      text: `Vous avez ${dashboard?.unread_messages} message(s) non lu(s).`,
      time: "Maintenant",
    });
  }

  if ((dashboard?.total_views ?? 0) > 0) {
    items.push({
      icon: "👁️",
      text: `Vos annonces ont reçu ${dashboard?.total_views.toLocaleString("fr-TN")} vue(s) au total.`,
      time: "Aujourd'hui",
    });
  }

  dashboard?.recent_listings?.slice(0, 3).forEach((listing) => {
    items.push({
      icon: "🐾",
      text: `Annonce « ${listing.title} » publiée ou mise à jour.`,
      time: timeAgoLabel(listing.created_at),
    });
  });

  if (items.length === 0) {
    items.push({
      icon: "✨",
      text: "Aucune activité récente pour le moment.",
      time: "—",
    });
  }

  return items.slice(0, 5);
}

function positiveBadge(value: number | undefined): number | undefined {
  return value && value > 0 ? value : undefined;
}

const tabVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium"
        >
          <CheckCircle size={16} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Profile Ring ──────────────────────────────────────────────────────────────

function ProfileRing({ pct, initials }: { pct: number; initials: string }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="4"
          className="stroke-[var(--pc-border)]"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="4"
          stroke="var(--pc-primary)"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold"
        style={{
          background: "linear-gradient(135deg, var(--pc-primary), #15a870)",
          borderRadius: "50%",
          margin: 6,
        }}
      >
        {initials}
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  onNavigate,
  stats,
  areaData,
  barData,
  recentActivity,
  isLoading,
}: {
  onNavigate: (page: string) => void;
  stats: DashboardStat[];
  areaData: { day: string; views?: number }[];
  barData: { day: string; count?: number }[];
  recentActivity: RecentActivityItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-4 h-28 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl h-56 animate-pulse" />
          <div className="glass-card rounded-2xl h-56 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4 flex flex-col gap-2"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${COLOR_MAP[stat.color] ?? ""}`}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--pc-text-primary)]">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--pc-text-secondary)] leading-tight mt-0.5">
                {stat.label}
              </div>
            </div>
            {stat.trend !== 0 && (
              <div
                className={`text-xs font-semibold flex items-center gap-0.5 ${stat.trend > 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                {stat.trend > 0 ? "↑" : "↓"} {Math.abs(stat.trend)}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area Chart */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-[var(--pc-text-primary)] mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={15} className="text-[var(--pc-primary)]" />
            Vues par annonces récentes
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={areaData}
              margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--pc-primary)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--pc-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--pc-border)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "var(--pc-text-secondary)" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--pc-text-secondary)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--pc-surface)",
                  border: "1px solid var(--pc-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--pc-text-secondary)" }}
                itemStyle={{ color: "var(--pc-primary)" }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--pc-primary)"
                strokeWidth={2}
                fill="url(#areaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-[var(--pc-text-primary)] mb-4 flex items-center gap-2 text-sm">
            <MessageCircle size={15} className="text-[var(--pc-primary)]" />
            Messages reçus (7 jours)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={barData}
              margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--pc-border)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "var(--pc-text-secondary)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--pc-text-secondary)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--pc-surface)",
                  border: "1px solid var(--pc-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--pc-text-secondary)" }}
                itemStyle={{ color: "var(--pc-primary)" }}
              />
              <Bar
                dataKey="count"
                fill="var(--pc-primary)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-[var(--pc-text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--pc-primary)]" />
          Activité récente
        </h2>
        <div className="space-y-0">
          {recentActivity.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="flex items-start gap-3 py-3 border-b border-[var(--pc-border)] last:border-0"
            >
              <span className="text-lg leading-none mt-0.5">{item.icon}</span>
              <p className="flex-1 text-sm text-[var(--pc-text-primary)] leading-snug">
                {item.text}
              </p>
              <span className="text-xs text-[var(--pc-text-secondary)] shrink-0">
                {item.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA row */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("create-listing")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-white"
          style={{
            background: "linear-gradient(135deg, var(--pc-primary), #15a870)",
          }}
        >
          <Plus size={16} />
          Créer une annonce
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("messages")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-[var(--pc-border)] text-[var(--pc-text-primary)] bg-[var(--pc-surface)] hover:bg-[var(--pc-surface-alt)] transition-colors"
        >
          <MessageCircle size={16} />
          Voir les messages
        </motion.button>
      </div>
    </div>
  );
}

// ─── My Listings Tab ───────────────────────────────────────────────────────────

type FilterKey = "all" | ListingStatus;

interface ModalState {
  type: "pause" | "resume" | "sold" | "adopted" | "delete" | "renew" | null;
  listingId: string | null;
  loading: boolean;
}

const MODAL_CONFIG: Record<
  string,
  {
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "warning" | "success";
  }
> = {
  pause: {
    title: "Mettre en pause ?",
    message: "Votre annonce n'apparaîtra plus dans les recherches.",
    confirmLabel: "Mettre en pause",
    variant: "warning",
  },
  resume: {
    title: "Réactiver l'annonce ?",
    message: "Votre annonce sera de nouveau visible dans les recherches.",
    confirmLabel: "Réactiver",
    variant: "success",
  },
  sold: {
    title: "Marquer comme vendu ?",
    message: 'L\'annonce sera archivée avec le badge "Vendu".',
    confirmLabel: "Marquer vendu",
    variant: "success",
  },
  adopted: {
    title: "Marquer comme adopté ?",
    message: 'L\'annonce sera archivée avec le badge "Adopté".',
    confirmLabel: "Marquer adopté",
    variant: "success",
  },
  delete: {
    title: "Supprimer définitivement ?",
    message:
      "Cette action est irréversible. L'annonce sera supprimée définitivement.",
    confirmLabel: "Supprimer",
    variant: "danger",
  },
  renew: {
    title: "Renouveler l'annonce ?",
    message: "L'annonce sera visible pour 30 jours supplémentaires.",
    confirmLabel: "Renouveler",
    variant: "success",
  },
};

function MyListingsTab({
  onNavigate,
  listings,
  isLoading,
}: {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  listings: Listing[];
  isLoading: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [modal, setModal] = useState<ModalState>({
    type: null,
    listingId: null,
    loading: false,
  });
  const [toast, setToast] = useState({ show: false, message: "" });

  const deleteListing = useDeleteListing();
  const updateListing = useUpdateListing();
  const createListing = useCreateListing();

  const listingItems = useMemo(
    () => listings.map(mapListingToItem),
    [listings],
  );

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const openModal = (type: ModalState["type"], listingId: string) => {
    setModal({ type, listingId, loading: false });
  };

  const closeModal = () =>
    setModal({ type: null, listingId: null, loading: false });

  const handleConfirm = async () => {
    if (!modal.listingId || !modal.type) return;
    setModal((m) => ({ ...m, loading: true }));

    const id = Number(modal.listingId);
    const type = modal.type;

    try {
      if (type === "delete") {
        await deleteListing.mutateAsync(id);
      }

      if (type === "pause") {
        await updateListing.mutateAsync({
          id,
          data: { is_active: false, status: "paused" },
        });
      }

      if (type === "resume") {
        await updateListing.mutateAsync({
          id,
          data: { is_active: true, status: "active" },
        });
      }

      if (type === "sold") {
        await updateListing.mutateAsync({
          id,
          data: { is_active: false, status: "sold" },
        });
      }

      if (type === "adopted") {
        await updateListing.mutateAsync({
          id,
          data: { is_active: false, status: "adopted" },
        });
      }

      if (type === "renew") {
        const nextExpiry = new Date(Date.now() + 30 * 86_400_000).toISOString();
        await updateListing.mutateAsync({
          id,
          data: { is_active: true, status: "active", expires_at: nextExpiry },
        });
      }

      const toastMessages: Record<string, string> = {
        delete: "Annonce supprimée",
        pause: "Annonce mise en pause",
        resume: "Annonce réactivée",
        sold: "Annonce marquée comme vendue",
        adopted: "Annonce marquée comme adoptée",
        renew: "Annonce renouvelée pour 30 jours",
      };
      showToast(toastMessages[type] ?? "Action effectuée");
      closeModal();
    } catch {
      showToast("Action impossible. Vérifiez l'API ou votre connexion.");
      setModal((m) => ({ ...m, loading: false }));
    }
  };

  const handleDuplicate = async (listing: ListingItem) => {
    if (!listing.source) return;

    try {
      const source = listing.source;
      await createListing.mutateAsync({
        title: `${source.title} (Copie)`,
        description: source.description,
        type: source.type,
        species: source.species ?? undefined,
        breed: source.breed ?? undefined,
        age_months: source.age_months ?? undefined,
        price: source.price ?? undefined,
        is_free: source.is_free,
        city: source.city ?? undefined,
        region: source.region ?? undefined,
        photos: source.photos ?? undefined,
        contact_phone: source.contact_phone ?? undefined,
        contact_email: source.contact_email ?? undefined,
        is_vaccinated: source.is_vaccinated,
        is_sterilized: source.is_sterilized,
      });
      showToast("Annonce dupliquée");
    } catch {
      showToast("Duplication impossible. Vérifiez les champs obligatoires.");
    }
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "active", label: "Actives" },
    { key: "paused", label: "En pause" },
    { key: "sold", label: "Vendues" },
    { key: "adopted", label: "Adoptées" },
    { key: "expired", label: "Expirées" },
  ];

  const visible =
    filter === "all"
      ? listingItems
      : listingItems.filter((l) => l.status === filter);

  const currentModalCfg = modal.type ? MODAL_CONFIG[modal.type] : null;

  return (
    <div>
      <Toast show={toast.show} message={toast.message} />

      {currentModalCfg && (
        <ConfirmModal
          open={modal.type !== null}
          onClose={closeModal}
          onConfirm={handleConfirm}
          title={currentModalCfg.title}
          message={currentModalCfg.message}
          confirmLabel={currentModalCfg.confirmLabel}
          variant={currentModalCfg.variant}
          loading={modal.loading}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--pc-text-primary)]">
          Mes annonces{" "}
          <span className="text-[var(--pc-text-secondary)] font-normal text-sm">
            ({listingItems.length})
          </span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("create-listing")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, var(--pc-primary), #15a870)",
          }}
        >
          <Plus size={14} />
          Créer une annonce
        </motion.button>
      </div>

      {/* Filter pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-5"
        style={{ scrollbarWidth: "none" }}
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? "text-white shadow-sm"
                : "bg-[var(--pc-surface)] border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
            }`}
            style={filter === f.key ? { background: "var(--pc-primary)" } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl h-72 animate-pulse"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
          <span className="text-4xl">📋</span>
          <p className="text-[var(--pc-text-secondary)] text-sm">
            Aucune annonce dans cette catégorie
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visible.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onView={() => onNavigate("pet-detail", { id: listing.id })}
              onPause={() =>
                openModal(
                  listing.status === "active" ? "pause" : "resume",
                  listing.id,
                )
              }
              onSold={() => openModal("sold", listing.id)}
              onAdopted={() => openModal("adopted", listing.id)}
              onDelete={() => openModal("delete", listing.id)}
              onDuplicate={() => handleDuplicate(listing)}
              onRenew={() => openModal("renew", listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ListingCardProps {
  listing: ListingItem;
  onView: () => void;
  onPause: () => void;
  onSold: () => void;
  onAdopted: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRenew: () => void;
}

function ListingCard({
  listing,
  onView,
  onPause,
  onSold,
  onAdopted,
  onDelete,
  onDuplicate,
  onRenew,
}: ListingCardProps) {
  const badge = STATUS_BADGES[listing.status];
  const isActive = listing.status === "active";
  const isDone = listing.status === "sold" || listing.status === "adopted";
  const expiresWarn = isActive && listing.daysLeft > 0 && listing.daysLeft < 7;

  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden flex flex-col"
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(29,125,95,0.12)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full aspect-video object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" fill="%23374151"%3E%3Crect width="400" height="250"/%3E%3C/svg%3E';
          }}
        />
        <span
          className={`absolute top-2 left-2 ${badge.color} text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow`}
        >
          {badge.dot} {badge.label}
        </span>
        {expiresWarn && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Clock size={10} /> {listing.daysLeft}j
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-3 py-2 bg-[var(--pc-surface-alt)] text-xs text-[var(--pc-text-secondary)]">
        <span className="flex items-center gap-1">
          <Eye size={11} /> {listing.views.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Heart size={11} /> {listing.favorites}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={11} /> {listing.messages}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--pc-text-primary)] text-sm leading-tight line-clamp-2 flex-1">
            {listing.title}
          </h3>
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeClass(listing.type)}`}
          >
            {listing.type}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--pc-text-secondary)]">
          <span>📍 {listing.city}</span>
          <span className="font-semibold text-[var(--pc-text-primary)]">
            {listing.price}
          </span>
        </div>
        {expiresWarn && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Clock size={11} />
            Expire dans {listing.daysLeft} jour{listing.daysLeft > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
        <button
          onClick={onView}
          className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-colors font-medium"
        >
          <Eye size={11} /> Voir
        </button>
        <button className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] hover:bg-[var(--pc-primary)]/20 transition-colors font-medium">
          <Edit3 size={11} /> Modifier
        </button>
        <button
          onClick={onDuplicate}
          className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] transition-colors font-medium"
        >
          <Copy size={11} /> Copier
        </button>

        {!isDone && (
          <button
            onClick={onPause}
            className={`flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg transition-colors font-medium ${
              isActive
                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
            }`}
          >
            {isActive ? <Pause size={11} /> : <Play size={11} />}
            {isActive ? "Pause" : "Reprendre"}
          </button>
        )}

        {!isDone && (
          <button
            onClick={listing.type === "adoption" ? onAdopted : onSold}
            className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
          >
            <CheckCircle size={11} />
            {listing.type === "adoption" ? "Adopté" : "Vendu"}
          </button>
        )}

        {expiresWarn && (
          <button
            onClick={onRenew}
            className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 transition-colors font-medium"
          >
            <RefreshCw size={11} /> Renouveler
          </button>
        )}

        <button
          onClick={onDelete}
          className={`flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-500 dark:border-red-900/40 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium ${isDone ? "col-span-3" : ""}`}
        >
          <Trash2 size={11} /> Supprimer
        </button>
      </div>
    </motion.div>
  );
}

// ─── My Favorites Tab ──────────────────────────────────────────────────────────

function MyFavoritesTab({
  onNavigate,
}: {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const [favorites, setFavorites] = useState<ListingItem[]>(MOCK_FAVORITES);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  if (favorites.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <Heart size={28} className="text-rose-500" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--pc-text-primary)] mb-1">
            Aucun favori
          </h3>
          <p className="text-sm text-[var(--pc-text-secondary)]">
            Explorez les annonces et ajoutez-les à vos favoris.
          </p>
        </div>
        <button
          onClick={() => onNavigate("search")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white"
          style={{ background: "var(--pc-primary)" }}
        >
          Explorer les annonces
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--pc-text-primary)]">
          Mes favoris{" "}
          <span className="text-[var(--pc-text-secondary)] font-normal text-sm">
            ({favorites.length})
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {favorites.map((listing) => (
          <motion.div
            key={listing.id}
            className="glass-card rounded-2xl overflow-hidden flex flex-col"
            whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(29,125,95,0.12)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full aspect-video object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" fill="%23374151"%3E%3Crect width="400" height="250"/%3E%3C/svg%3E';
                }}
              />
              <button
                onClick={() => removeFavorite(listing.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors shadow"
              >
                <Heart size={14} className="fill-rose-500" />
              </button>
            </div>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[var(--pc-text-primary)] text-sm leading-tight line-clamp-2 flex-1">
                  {listing.title}
                </h3>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeClass(listing.type)}`}
                >
                  {listing.type}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--pc-text-secondary)]">
                <span>📍 {listing.city}</span>
                <span className="font-semibold text-[var(--pc-text-primary)]">
                  {listing.price}
                </span>
              </div>
            </div>
            <div className="px-3 pb-3">
              <button
                onClick={() => onNavigate("pet-detail", { id: listing.id })}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border border-[var(--pc-border)] text-[var(--pc-text-primary)] hover:bg-[var(--pc-surface-alt)] transition-colors"
              >
                <Eye size={13} /> Voir l'annonce
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Messages Tab ──────────────────────────────────────────────────────────────

function MessagesTab({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--pc-text-primary)]">
          Messages
        </h2>
        <button
          onClick={() => onNavigate("messages")}
          className="text-xs text-[var(--pc-primary)] font-medium hover:underline"
        >
          Voir tout
        </button>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {MOCK_CONVERSATIONS.map((conv, i) => (
          <motion.button
            key={conv.id}
            whileHover={{ backgroundColor: "rgba(29,125,95,0.05)" }}
            onClick={() => onNavigate("messages")}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
              i < MOCK_CONVERSATIONS.length - 1
                ? "border-b border-[var(--pc-border)]"
                : ""
            }`}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--pc-primary), #15a870)",
              }}
            >
              {conv.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-[var(--pc-text-primary)]">
                  {conv.name}
                </span>
                <span className="text-xs text-[var(--pc-text-secondary)]">
                  {conv.time}
                </span>
              </div>
              <p
                className={`text-sm truncate ${conv.unread > 0 ? "text-[var(--pc-text-primary)] font-medium" : "text-[var(--pc-text-secondary)]"}`}
              >
                {conv.lastMessage}
              </p>
            </div>
            {conv.unread > 0 && (
              <span
                className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                style={{ background: "var(--pc-primary)" }}
              >
                {conv.unread}
              </span>
            )}
            <ChevronRight
              size={14}
              className="text-[var(--pc-text-secondary)] shrink-0"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────────────────────

function NotificationsTab() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    MOCK_NOTIFICATIONS_DATA,
  );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--pc-text-primary)]">
          Notifications
          {unreadCount > 0 && (
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full text-white font-semibold"
              style={{ background: "var(--pc-primary)" }}
            >
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-[var(--pc-primary)] hover:underline font-medium"
          >
            <CheckCircle size={13} />
            Tout lire
          </button>
        )}
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-start gap-3 p-4 ${
              i < notifications.length - 1
                ? "border-b border-[var(--pc-border)]"
                : ""
            } ${!notif.read ? "bg-[var(--pc-primary)]/5" : ""}`}
          >
            <span className="text-xl leading-none mt-0.5">{notif.icon}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm leading-snug ${notif.read ? "text-[var(--pc-text-secondary)]" : "text-[var(--pc-text-primary)] font-medium"}`}
              >
                {notif.text}
              </p>
              <span className="text-xs text-[var(--pc-text-secondary)] mt-0.5 block">
                {notif.time}
              </span>
            </div>
            {!notif.read && (
              <span
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ background: "var(--pc-primary)" }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const { i18n } = useTranslation();
  const [subTab, setSubTab] = useState<SettingsSubTab>("profile");
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("petconnect-theme");
    if (saved === "dark") return "dark";
    if (saved === "light") return "light";
    return "system";
  });

  const [profileForm, setProfileForm] = useState({
    firstName: "Ahmed",
    lastName: "Ben Salah",
    email: "ahmed@email.com",
    phone: "+216 98 765 432",
    bio: "Passionné des animaux depuis toujours. Éleveur amateur à Tunis.",
    location: "Tunis, Tunisie",
  });

  const [securityForm, setSecurityForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const subTabs: {
    key: SettingsSubTab;
    icon: React.ReactNode;
    label: string;
  }[] = [
    { key: "profile", icon: <User size={14} />, label: "Profil" },
    { key: "security", icon: <Lock size={14} />, label: "Sécurité" },
    { key: "appearance", icon: <Palette size={14} />, label: "Apparence" },
    { key: "language", icon: <Globe size={14} />, label: "Langue" },
  ];

  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷", native: "Français" },
    { code: "ar", label: "Arabic", flag: "🇹🇳", native: "العربية" },
    { code: "en", label: "English", flag: "🇬🇧", native: "English" },
  ];

  const profileFields: { key: keyof typeof profileForm; label: string }[] = [
    { key: "firstName", label: "Prénom" },
    { key: "lastName", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Téléphone" },
    { key: "location", label: "Ville" },
  ];

  const applyTheme = (th: "light" | "dark" | "system") => {
    setTheme(th);
    if (th === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("petconnect-theme", "dark");
    } else if (th === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("petconnect-theme", "light");
    } else {
      localStorage.removeItem("petconnect-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-[var(--pc-text-primary)] mb-4">
        Paramètres
      </h2>

      {/* Sub-tab pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-6"
        style={{ scrollbarWidth: "none" }}
      >
        {subTabs.map((st) => (
          <button
            key={st.key}
            onClick={() => setSubTab(st.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
              subTab === st.key
                ? "text-white shadow-md"
                : "bg-[var(--pc-surface)] text-[var(--pc-text-secondary)] border border-[var(--pc-border)] hover:text-[var(--pc-text-primary)]"
            }`}
            style={subTab === st.key ? { background: "var(--pc-primary)" } : {}}
          >
            {st.icon} {st.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {subTab === "profile" && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pc-primary), #15a870)",
                    }}
                  >
                    AB
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--pc-accent)] flex items-center justify-center shadow">
                    <Camera size={12} className="text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-[var(--pc-text-primary)]">
                    {profileForm.firstName} {profileForm.lastName}
                  </p>
                  <p className="text-xs text-[var(--pc-text-secondary)]">
                    Changer la photo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profileFields.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                      {label}
                    </label>
                    <input
                      value={profileForm[key]}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/30 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/30 transition-all resize-none"
                />
              </div>

              <button
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pc-primary), #15a870)",
                }}
              >
                Enregistrer les modifications
              </button>
            </div>
          )}

          {subTab === "security" && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-[var(--pc-text-primary)] flex items-center gap-2">
                <Lock size={16} className="text-[var(--pc-primary)]" />
                Changer le mot de passe
              </h3>
              {[
                { key: "current" as const, label: "Mot de passe actuel" },
                { key: "newPass" as const, label: "Nouveau mot de passe" },
                { key: "confirm" as const, label: "Confirmer le mot de passe" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                    {label}
                  </label>
                  <input
                    type="password"
                    value={securityForm[key]}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/30 transition-all"
                  />
                </div>
              ))}
              <button
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pc-primary), #15a870)",
                }}
              >
                Mettre à jour le mot de passe
              </button>
            </div>
          )}

          {subTab === "appearance" && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-[var(--pc-text-primary)] flex items-center gap-2">
                <Palette size={16} className="text-[var(--pc-primary)]" />
                Thème
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    key: "light" as const,
                    icon: <Sun size={20} />,
                    label: "Clair",
                  },
                  {
                    key: "dark" as const,
                    icon: <Moon size={20} />,
                    label: "Sombre",
                  },
                  {
                    key: "system" as const,
                    icon: <Monitor size={20} />,
                    label: "Système",
                  },
                ].map((opt) => (
                  <motion.button
                    key={opt.key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyTheme(opt.key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      theme === opt.key
                        ? "border-[var(--pc-primary)] bg-[var(--pc-primary)]/10 text-[var(--pc-primary)]"
                        : "border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)]/40"
                    }`}
                  >
                    {opt.icon}
                    <span className="text-xs font-medium">{opt.label}</span>
                    {theme === opt.key && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: "var(--pc-primary)" }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {subTab === "language" && (
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-[var(--pc-text-primary)] flex items-center gap-2">
                <Globe size={16} className="text-[var(--pc-primary)]" />
                Langue
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {languages.map((lang) => {
                  const isActive = i18n.language === lang.code;
                  return (
                    <motion.button
                      key={lang.code}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        isActive
                          ? "border-[var(--pc-primary)] bg-[var(--pc-primary)]/10"
                          : "border-[var(--pc-border)] bg-[var(--pc-surface)] hover:border-[var(--pc-primary)]/40"
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${isActive ? "text-[var(--pc-primary)]" : "text-[var(--pc-text-primary)]"}`}
                        >
                          {lang.native}
                        </p>
                        <p className="text-xs text-[var(--pc-text-secondary)]">
                          {lang.label}
                        </p>
                      </div>
                      {isActive && (
                        <CheckCircle
                          size={15}
                          className="text-[var(--pc-primary)] shrink-0"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Nav Tabs Config ──────────────────────────────────────────────────────────

interface NavTab {
  key: MainTab;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export function DashboardPage({ onBack, onNavigate }: DashboardPageProps) {
  // ✅ FIXED: Hooks are now correctly called INSIDE the component
  const { user } = useAuthStore();
  const { data: dashData, isLoading: dashLoading } = useDashboard();
  const { data: listingsData, isLoading: listingsLoading } = useMyListings();

  const [activeTab, setActiveTab] = useState<MainTab>("overview");

  const dashboardUser = dashData?.user ?? user;
  const myListings = listingsData?.data ?? [];
  const dashboardStats = useMemo(() => buildStats(dashData), [dashData]);
  const viewsChartData = useMemo(() => buildViewsData(dashData), [dashData]);
  const messagesChartData = useMemo(
    () => buildMessagesData(dashData),
    [dashData],
  );
  const recentActivity = useMemo(
    () => buildRecentActivity(dashData),
    [dashData],
  );
  const profilePct = getProfileCompletion(dashboardUser);
  const initials = userInitials(dashboardUser?.name);

  const displayName = dashboardUser?.name ?? "Utilisateur";

  const NAV_TABS: NavTab[] = [
    {
      key: "overview",
      icon: <LayoutDashboard size={18} />,
      label: "Vue d'ensemble",
    },
    {
      key: "myListings",
      icon: <List size={18} />,
      label: "Mes annonces",
      badge: positiveBadge(dashData?.listings_count),
    },
    {
      key: "myFavorites",
      icon: <Heart size={18} />,
      label: "Favoris",
      badge: positiveBadge(dashData?.favorites_count),
    },
    {
      key: "messages",
      icon: <MessageCircle size={18} />,
      label: "Messages",
      badge: positiveBadge(dashData?.unread_messages),
    },
    {
      key: "notifications",
      icon: <Bell size={18} />,
      label: "Notifications",
      badge: positiveBadge(dashData?.unread_notifications),
    },
    { key: "settings", icon: <Settings size={18} />, label: "Paramètres" },
  ];

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] flex">
      {/* ── Desktop Left Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 fixed top-0 left-0 h-screen border-r border-[var(--pc-border)] bg-[var(--pc-surface)] overflow-y-auto z-20">
        {/* Back button */}
        <div className="p-4 border-b border-[var(--pc-border)]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>

        {/* Profile section */}
        <div className="p-5 border-b border-[var(--pc-border)]">
          <div className="flex items-start gap-3 mb-3">
            <ProfileRing pct={profilePct} initials={initials} />
            <div className="flex-1 min-w-0 pt-1">
              <p className="font-bold text-[var(--pc-text-primary)] text-sm leading-tight">
                {displayName}
              </p>
              <p className="text-xs text-[var(--pc-text-secondary)] truncate">
                {dashboardUser?.email ?? "—"}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                {dashboardUser?.is_verified ? "✓ Vérifié" : "Non vérifié"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--pc-text-secondary)]">
              Profil complété à {profilePct}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--pc-border)] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${profilePct}%`,
                background: "var(--pc-primary)",
              }}
            />
          </div>
          <button className="mt-2 text-xs text-[var(--pc-primary)] hover:underline font-medium">
            Compléter mon profil →
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.key
                  ? "text-white shadow-sm"
                  : "text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] hover:text-[var(--pc-text-primary)]"
              }`}
              style={
                activeTab === tab.key ? { background: "var(--pc-primary)" } : {}
              }
            >
              {tab.icon}
              <span className="flex-1">{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-[var(--pc-primary)]/15 text-[var(--pc-primary)]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Create listing CTA + bottom tools */}
        <div className="p-4 border-t border-[var(--pc-border)]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("create-listing")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
            style={{
              background: "linear-gradient(135deg, var(--pc-primary), #15a870)",
            }}
          >
            <Plus size={16} />
            Créer une annonce
          </motion.button>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--pc-border)]">
            <ThemeToggle />
            <LangSelector direction="up" />
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top header */}
        <header className="lg:hidden sticky top-0 z-10 bg-[var(--pc-surface)] border-b border-[var(--pc-border)] px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <p className="font-bold text-[var(--pc-text-primary)] text-sm">
              Mon tableau de bord
            </p>
            <p className="text-xs text-[var(--pc-text-secondary)]">
              {displayName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LangSelector direction="down" />
          </div>
        </header>

        {/* Mobile tab pills */}
        <div className="lg:hidden sticky top-[57px] z-10 bg-[var(--pc-surface)] border-b border-[var(--pc-border)] px-4 py-2">
          <div
            className="flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {NAV_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? "text-white"
                    : "text-[var(--pc-text-secondary)] bg-[var(--pc-surface-alt)] hover:text-[var(--pc-text-primary)]"
                }`}
                style={
                  activeTab === tab.key
                    ? { background: "var(--pc-primary)" }
                    : {}
                }
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`text-xs px-1 rounded-full font-bold ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-[var(--pc-primary)]/15 text-[var(--pc-primary)]"}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {activeTab === "overview" && (
                  <OverviewTab
                    onNavigate={onNavigate}
                    stats={dashboardStats}
                    areaData={viewsChartData}
                    barData={messagesChartData}
                    recentActivity={recentActivity}
                    isLoading={dashLoading}
                  />
                )}
                {activeTab === "myListings" && (
                  <MyListingsTab
                    onNavigate={onNavigate}
                    listings={myListings}
                    isLoading={listingsLoading}
                  />
                )}
                {activeTab === "myFavorites" && (
                  <MyFavoritesTab onNavigate={onNavigate} />
                )}
                {activeTab === "messages" && (
                  <MessagesTab onNavigate={onNavigate} />
                )}
                {activeTab === "notifications" && <NotificationsTab />}
                {activeTab === "settings" && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
