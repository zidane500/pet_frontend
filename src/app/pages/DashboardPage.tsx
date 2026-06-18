import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  useDashboard,
  useMyListings,
  useDeleteListing,
} from "../../hooks/useDashboard";
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
}

interface NotificationItem {
  id: string;
  type: string;
  icon: string;
  text: string;
  time: string;
  read: boolean;
}

const { user } = useAuthStore();
const { data: dashData, isLoading: dashLoad } = useDashboard();
const { data: listingsData, isLoading: listLoad } = useMyListings();
const deleteListing = useDeleteListing();

const stats = dashData
  ? [
      {
        label: "Annonces actives",
        value: dashData.active_listings,
        icon: "📋",
        color: "from-emerald-500 to-teal-500",
      },
      {
        label: "Vues totales",
        value: dashData.total_views,
        icon: "👁️",
        color: "from-blue-500 to-indigo-500",
      },
      {
        label: "Messages non lus",
        value: dashData.unread_messages,
        icon: "💬",
        color: "from-purple-500 to-violet-500",
      },
      {
        label: "Total annonces",
        value: dashData.listings_count,
        icon: "🐾",
        color: "from-amber-500 to-orange-500",
      },
    ]
  : [];

const myListings = listingsData?.data ?? [];

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

function ProfileRing({ pct }: { pct: number }) {
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
        AB
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
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
            Vues des annonces (30 jours)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={AREA_DATA}
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
              data={BAR_DATA}
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
          {RECENT_ACTIVITY.map((item, i) => (
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
}: {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [listings, setListings] = useState<ListingItem[]>(MOCK_LISTINGS_BASE);
  const [modal, setModal] = useState<ModalState>({
    type: null,
    listingId: null,
    loading: false,
  });
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const openModal = (type: ModalState["type"], listingId: string) => {
    setModal({ type, listingId, loading: false });
  };

  const closeModal = () =>
    setModal({ type: null, listingId: null, loading: false });

  const handleConfirm = () => {
    if (!modal.listingId || !modal.type) return;
    setModal((m) => ({ ...m, loading: true }));

    setTimeout(() => {
      const id = modal.listingId!;
      const type = modal.type!;

      setListings((prev) => {
        if (type === "delete") return prev.filter((l) => l.id !== id);
        if (type === "pause")
          return prev.map((l) =>
            l.id === id ? { ...l, status: "paused" as ListingStatus } : l,
          );
        if (type === "resume")
          return prev.map((l) =>
            l.id === id ? { ...l, status: "active" as ListingStatus } : l,
          );
        if (type === "sold")
          return prev.map((l) =>
            l.id === id ? { ...l, status: "sold" as ListingStatus } : l,
          );
        if (type === "adopted")
          return prev.map((l) =>
            l.id === id ? { ...l, status: "adopted" as ListingStatus } : l,
          );
        if (type === "renew")
          return prev.map((l) =>
            l.id === id
              ? { ...l, daysLeft: 30, status: "active" as ListingStatus }
              : l,
          );
        return prev;
      });

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
    }, 700);
  };

  const handleDuplicate = (listing: ListingItem) => {
    const copy: ListingItem = {
      ...listing,
      id: `${listing.id}-copy-${Date.now()}`,
      title: `${listing.title} (Copie)`,
      status: "active",
      views: 0,
      favorites: 0,
      messages: 0,
      daysLeft: 30,
    };
    setListings((prev) => [copy, ...prev]);
    showToast("Annonce dupliquée");
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
    filter === "all" ? listings : listings.filter((l) => l.status === filter);

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
            ({listings.length})
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
      {visible.length === 0 ? (
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
  const [activeTab, setActiveTab] = useState<MainTab>("overview");

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
      badge: 4,
    },
    {
      key: "myFavorites",
      icon: <Heart size={18} />,
      label: "Favoris",
      badge: 2,
    },
    {
      key: "messages",
      icon: <MessageCircle size={18} />,
      label: "Messages",
      badge: 4,
    },
    {
      key: "notifications",
      icon: <Bell size={18} />,
      label: "Notifications",
      badge: 3,
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
            <ProfileRing pct={75} />
            <div className="flex-1 min-w-0 pt-1">
              <p className="font-bold text-[var(--pc-text-primary)] text-sm leading-tight">
                Ahmed Ben Salah
              </p>
              <p className="text-xs text-[var(--pc-text-secondary)] truncate">
                ahmed@email.com
              </p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                ✓ Vérifié
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--pc-text-secondary)]">
              Profil complété à 75%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--pc-border)] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: "75%", background: "var(--pc-primary)" }}
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
              Ahmed Ben Salah
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
                  <OverviewTab onNavigate={onNavigate} />
                )}
                {activeTab === "myListings" && (
                  <MyListingsTab onNavigate={onNavigate} />
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
