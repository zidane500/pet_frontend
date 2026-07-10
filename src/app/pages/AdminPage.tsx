import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  List,
  BarChart2,
  ArrowLeft,
  Search,
  Shield,
  BadgeCheck,
  Ban,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  X,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  Loader2,
  CheckCircle,
  UserCheck,
  Edit3,
  ShoppingBag,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  useAdminStats,
  useAdminUsers,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminDeleteUser,
  useAdminBanUser,
  useAdminUnbanUser,
  useAdminVerifyUser,
  useAdminListings,
  useAdminDeleteListing,
  useAdminToggleListing,
  useAdminProducts,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminToggleProduct,
  useAdminDeleteProduct,
  useAdminOrders,
  useAdminUpdateOrderStatus,
} from "../../hooks/useAdmin";
import type { User, Listing, Product, Order } from "../../types";
import type { CreateUserPayload, UpdateUserPayload } from "../../api/admin";
import { uploadApi } from "../../api/upload";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = "overview" | "users" | "listings" | "products" | "orders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-TN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function roleBadge(role: string) {
  const map: Record<string, { label: string; color: string }> = {
    owner: {
      label: "Propriétaire",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    vet: {
      label: "Vétérinaire",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    shop: {
      label: "Animalerie",
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    shelter: {
      label: "Refuge",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    breeder: {
      label: "Éleveur",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    admin: {
      label: "Admin",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  };
  const b = map[role] ?? { label: role, color: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.color}`}
    >
      {b.label}
    </span>
  );
}

function planBadge(plan: string) {
  const map: Record<string, string> = {
    free: "bg-gray-100 text-gray-600",
    basic: "bg-sky-100 text-sky-700",
    premium: "bg-amber-100 text-amber-700",
    pro: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[plan] ?? "bg-gray-100 text-gray-600"}`}
    >
      {plan}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  show,
  message,
  error,
}: {
  show: boolean;
  message: string;
  error?: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold ${error ? "bg-red-500" : "bg-emerald-600"}`}
        >
          {error ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  variant,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: "danger" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--pc-surface)] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-[var(--pc-border)]"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${variant === "danger" ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}
            >
              <AlertTriangle
                size={22}
                className={
                  variant === "danger" ? "text-red-500" : "text-amber-500"
                }
              />
            </div>
            <h3 className="text-center font-bold text-[var(--pc-text-primary)] mb-2">
              {title}
            </h3>
            <p className="text-center text-sm text-[var(--pc-text-secondary)] mb-6">
              {message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold text-sm hover:bg-[var(--pc-surface-alt)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 ${variant === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"} transition-colors`}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── User Form Modal ──────────────────────────────────────────────────────────

const ROLES = ["owner", "vet", "shop", "shelter", "breeder", "admin"];
const PLANS = ["free", "basic", "premium", "pro"];

function UserFormModal({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!user;
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "owner",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    plan: user?.plan ?? "free",
    is_verified: user?.is_verified ?? false,
    is_active: user?.is_active ?? true,
  });

  // ── Resync le formulaire à chaque fois qu'un nouvel utilisateur est passé ──
  useEffect(() => {
    setForm({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "owner",
      phone: user?.phone ?? "",
      city: user?.city ?? "",
      plan: user?.plan ?? "free",
      is_verified: user?.is_verified ?? false,
      is_active: user?.is_active ?? true,
    });
  }, [user?.id, open]);

  const set = (key: keyof typeof form, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const isPending = createUser.isPending || updateUser.isPending;

  async function handleSubmit() {
    try {
      if (isEdit && user) {
        const payload: UpdateUserPayload = { ...form };
        if (!payload.password) delete payload.password;
        await updateUser.mutateAsync({ id: user.id, payload });
        onSaved("Utilisateur modifié ✅");
      } else {
        const payload: CreateUserPayload = {
          ...form,
          password: form.password || "Password123!",
        };
        await createUser.mutateAsync(payload);
        onSaved("Utilisateur créé ✅");
      }
      onClose();
    } catch {
      onSaved("Erreur — vérifiez les champs");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-[var(--pc-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--pc-border)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--pc-border)]">
              <h2 className="font-bold text-[var(--pc-text-primary)]">
                {isEdit ? `Modifier — ${user?.name}` : "Créer un utilisateur"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "name", label: "Nom complet", type: "text" },
                    { key: "email", label: "Email", type: "email" },
                  ] as const
                ).map(({ key, label, type }) => (
                  <div key={key} className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                    />
                  </div>
                ))}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                    {isEdit
                      ? "Nouveau mot de passe (optionnel)"
                      : "Mot de passe"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder={
                      isEdit
                        ? "Laisser vide pour ne pas changer"
                        : "Min. 8 caractères"
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                    Rôle
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                    Plan
                  </label>
                  <select
                    value={form.plan}
                    onChange={(e) => set("plan", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_verified}
                    onChange={(e) => set("is_verified", e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--pc-primary)]"
                  />
                  <span className="text-sm text-[var(--pc-text-primary)]">
                    Vérifié
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => set("is_active", e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--pc-primary)]"
                  />
                  <span className="text-sm text-[var(--pc-text-primary)]">
                    Actif
                  </span>
                </label>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pc-primary), #15a870)",
                }}
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isPending
                  ? "Enregistrement..."
                  : isEdit
                    ? "Enregistrer"
                    : "Créer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: "👥",
      label: "Utilisateurs",
      value: stats?.users.total ?? 0,
      color: "text-blue-500",
    },
    {
      icon: "✅",
      label: "Actifs",
      value: stats?.users.active ?? 0,
      color: "text-emerald-500",
    },
    {
      icon: "🚫",
      label: "Bannis",
      value: stats?.users.banned ?? 0,
      color: "text-red-500",
    },
    {
      icon: "📋",
      label: "Annonces",
      value: stats?.listings.total ?? 0,
      color: "text-purple-500",
    },
    {
      icon: "🟢",
      label: "Actives",
      value: stats?.listings.active ?? 0,
      color: "text-green-500",
    },
    {
      icon: "💬",
      label: "Messages",
      value: stats?.messages ?? 0,
      color: "text-amber-500",
    },
    {
      icon: "🐾",
      label: "Perdus/Trouvés",
      value: stats?.lost_found ?? 0,
      color: "text-indigo-500",
    },
    {
      icon: "👑",
      label: "Admins",
      value: stats?.users.by_role?.admin ?? 0,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className={`text-2xl font-black ${s.color}`}>
                {s.value.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--pc-text-secondary)]">
                {s.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rôles par utilisateur */}
      {stats?.users.by_role && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-bold text-[var(--pc-text-primary)] mb-4 text-sm flex items-center gap-2">
            <Users size={15} className="text-[var(--pc-primary)]" /> Répartition
            par rôle
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.users.by_role).map(([role, count]) => (
              <div
                key={role}
                className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-xl"
              >
                {roleBadge(role)}
                <span className="font-bold text-sm text-[var(--pc-text-primary)]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-bold text-[var(--pc-text-primary)] mb-4 text-sm flex items-center gap-2">
            <TrendingUp size={15} className="text-[var(--pc-primary)]" />{" "}
            Nouveaux utilisateurs (7j)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={stats?.charts.users_per_day ?? []}
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
              />
              <Bar
                dataKey="count"
                fill="var(--pc-primary)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-bold text-[var(--pc-text-primary)] mb-4 text-sm flex items-center gap-2">
            <List size={15} className="text-[var(--pc-primary)]" /> Nouvelles
            annonces (7j)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={stats?.charts.listings_per_day ?? []}
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
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--pc-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({
  onToast,
}: {
  onToast: (msg: string, err?: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirm, setConfirm] = useState<{ type: string; user: User } | null>(
    null,
  );

  const { data, isLoading, refetch } = useAdminUsers({
    search: search || undefined,
    role: role || undefined,
    status: (status || undefined) as any,
    page,
    per_page: 15,
  });
  const banUser = useAdminBanUser();
  const unbanUser = useAdminUnbanUser();
  const verifyUser = useAdminVerifyUser();
  const deleteUser = useAdminDeleteUser();

  const users = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  async function handleConfirm() {
    if (!confirm) return;
    const { type, user } = confirm;
    try {
      if (type === "ban") await banUser.mutateAsync(user.id);
      if (type === "unban") await unbanUser.mutateAsync(user.id);
      if (type === "verify") await verifyUser.mutateAsync(user.id);
      if (type === "delete") await deleteUser.mutateAsync(user.id);
      const msgs: Record<string, string> = {
        ban: "Utilisateur banni ✅",
        unban: "Utilisateur réactivé ✅",
        verify: "Compte vérifié ✅",
        delete: "Utilisateur supprimé ✅",
      };
      onToast(msgs[type] ?? "Action effectuée");
      setConfirm(null);
    } catch {
      onToast("Action impossible", true);
      setConfirm(null);
    }
  }

  const confirmConfig: Record<
    string,
    {
      title: string;
      message: string;
      label: string;
      variant: "danger" | "warning";
    }
  > = {
    ban: {
      title: "Bannir cet utilisateur ?",
      message:
        "Il sera déconnecté immédiatement et ne pourra plus se connecter.",
      label: "Bannir",
      variant: "danger",
    },
    unban: {
      title: "Réactiver cet utilisateur ?",
      message: "Il pourra de nouveau se connecter à la plateforme.",
      label: "Réactiver",
      variant: "warning",
    },
    verify: {
      title: "Vérifier ce compte ?",
      message: 'Le badge "vérifié" sera affiché sur son profil.',
      label: "Vérifier",
      variant: "warning",
    },
    delete: {
      title: "Supprimer définitivement ?",
      message: "Toutes les données de cet utilisateur seront supprimées.",
      label: "Supprimer",
      variant: "danger",
    },
  };

  return (
    <div>
      <UserFormModal
        open={showForm}
        user={editUser}
        onClose={() => {
          setShowForm(false);
          setEditUser(null);
        }}
        onSaved={(msg) => onToast(msg)}
      />

      {confirm && confirmConfig[confirm.type] && (
        <ConfirmModal
          open={!!confirm}
          title={confirmConfig[confirm.type].title}
          message={confirmConfig[confirm.type].message}
          confirmLabel={confirmConfig[confirm.type].label}
          variant={confirmConfig[confirm.type].variant}
          loading={
            banUser.isPending ||
            unbanUser.isPending ||
            verifyUser.isPending ||
            deleteUser.isPending
          }
          onConfirm={handleConfirm}
          onClose={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-[var(--pc-text-primary)]">
          Utilisateurs{" "}
          <span className="text-[var(--pc-text-secondary)] font-normal text-sm">
            ({data?.total ?? 0})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
          >
            <RefreshCw size={15} className="text-[var(--pc-text-secondary)]" />
          </button>
          <button
            onClick={() => {
              setEditUser(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, var(--pc-primary), #15a870)",
            }}
          >
            <Plus size={15} /> Créer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-[var(--pc-surface-alt)] rounded-xl px-3 py-2 border border-[var(--pc-border)]">
          <Search
            size={14}
            className="text-[var(--pc-text-secondary)] shrink-0"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom ou email..."
            className="flex-1 bg-transparent text-sm text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)] focus:outline-none"
        >
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)] focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="banned">Bannis</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-14 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-[var(--pc-text-secondary)] text-sm">
            Aucun utilisateur trouvé
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pc-border)] bg-[var(--pc-surface-alt)]">
                  {[
                    "Utilisateur",
                    "Rôle",
                    "Plan",
                    "Statut",
                    "Inscrit",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-bold text-[var(--pc-text-secondary)] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--pc-border)] last:border-0 hover:bg-[var(--pc-surface-alt)]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: "var(--pc-primary)" }}
                          >
                            {u.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[var(--pc-text-primary)] flex items-center gap-1">
                            {u.name}
                            {u.is_verified && (
                              <BadgeCheck
                                size={12}
                                className="text-[var(--pc-primary)]"
                              />
                            )}
                          </div>
                          <div className="text-xs text-[var(--pc-text-secondary)]">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3">{planBadge(u.plan)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
                      >
                        {u.is_active ? "Actif" : "Banni"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--pc-text-secondary)]">
                      {timeAgo(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditUser(u);
                            setShowForm(true);
                          }}
                          title="Modifier"
                          className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        {!u.is_verified && (
                          <button
                            onClick={() =>
                              setConfirm({ type: "verify", user: u })
                            }
                            title="Vérifier"
                            className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors"
                          >
                            <UserCheck size={13} />
                          </button>
                        )}
                        {u.is_active ? (
                          <button
                            onClick={() => setConfirm({ type: "ban", user: u })}
                            title="Bannir"
                            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 transition-colors"
                          >
                            <Ban size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setConfirm({ type: "unban", user: u })
                            }
                            title="Réactiver"
                            className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors"
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setConfirm({ type: "delete", user: u })
                          }
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--pc-border)]">
              <span className="text-xs text-[var(--pc-text-secondary)]">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Listings Tab ─────────────────────────────────────────────────────────────

function ListingsTab({
  onToast,
}: {
  onToast: (msg: string, err?: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{
    type: string;
    listing: Listing;
  } | null>(null);

  const { data, isLoading, refetch } = useAdminListings({
    search: search || undefined,
    type: type || undefined,
    page,
    per_page: 15,
  });
  const deleteListing = useAdminDeleteListing();
  const toggleListing = useAdminToggleListing();

  const listings = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  async function handleConfirm() {
    if (!confirm) return;
    try {
      if (confirm.type === "delete")
        await deleteListing.mutateAsync(confirm.listing.id);
      if (confirm.type === "toggle")
        await toggleListing.mutateAsync(confirm.listing.id);
      onToast(
        confirm.type === "delete"
          ? "Annonce supprimée ✅"
          : "Statut modifié ✅",
      );
      setConfirm(null);
    } catch {
      onToast("Action impossible", true);
      setConfirm(null);
    }
  }

  const LISTING_TYPES = [
    "adoption",
    "vente",
    "perdu",
    "trouve",
    "accouplement",
    "conseils",
  ];

  return (
    <div>
      {confirm && (
        <ConfirmModal
          open={!!confirm}
          title={
            confirm.type === "delete"
              ? "Supprimer définitivement ?"
              : confirm.listing.is_active
                ? "Désactiver cette annonce ?"
                : "Activer cette annonce ?"
          }
          message={
            confirm.type === "delete"
              ? "Cette annonce sera supprimée définitivement."
              : confirm.listing.is_active
                ? "L'annonce n'apparaîtra plus dans les résultats."
                : "L'annonce sera de nouveau visible."
          }
          confirmLabel={
            confirm.type === "delete"
              ? "Supprimer"
              : confirm.listing.is_active
                ? "Désactiver"
                : "Activer"
          }
          variant={confirm.type === "delete" ? "danger" : "warning"}
          loading={deleteListing.isPending || toggleListing.isPending}
          onConfirm={handleConfirm}
          onClose={() => setConfirm(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-[var(--pc-text-primary)]">
          Annonces{" "}
          <span className="text-[var(--pc-text-secondary)] font-normal text-sm">
            ({data?.total ?? 0})
          </span>
        </h2>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
        >
          <RefreshCw size={15} className="text-[var(--pc-text-secondary)]" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-[var(--pc-surface-alt)] rounded-xl px-3 py-2 border border-[var(--pc-border)]">
          <Search
            size={14}
            className="text-[var(--pc-text-secondary)] shrink-0"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher une annonce..."
            className="flex-1 bg-transparent text-sm text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none"
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)] focus:outline-none"
        >
          <option value="">Tous les types</option>
          {LISTING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-14 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-[var(--pc-text-secondary)] text-sm">
            Aucune annonce trouvée
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pc-border)] bg-[var(--pc-surface-alt)]">
                  {[
                    "Annonce",
                    "Type",
                    "Utilisateur",
                    "Vues",
                    "Statut",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-bold text-[var(--pc-text-secondary)] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l, i) => (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--pc-border)] last:border-0 hover:bg-[var(--pc-surface-alt)]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            l.photos?.[0] ??
                            `https://picsum.photos/seed/al-${l.id}/60/60`
                          }
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://picsum.photos/seed/alfb-${l.id}/60/60`;
                          }}
                        />
                        <span className="font-medium text-[var(--pc-text-primary)] line-clamp-1 max-w-[160px]">
                          {l.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]">
                        {l.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--pc-text-secondary)]">
                      {l.user?.name ?? `#${l.user_id}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--pc-text-secondary)]">
                      {(l.views_count ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${l.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
                      >
                        {l.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setConfirm({ type: "toggle", listing: l })
                          }
                          title={l.is_active ? "Désactiver" : "Activer"}
                          className={`p-1.5 rounded-lg transition-colors ${l.is_active ? "hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600" : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600"}`}
                        >
                          {l.is_active ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({ type: "delete", listing: l })
                          }
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--pc-border)]">
              <span className="text-xs text-[var(--pc-text-secondary)]">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PRODUCT_CATEGORIES = ["chat", "chien", "oiseau", "autre"] as const;

function ProductFormModal({
  open,
  product,
  onClose,
  onSaved,
}: {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!product;
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "autre",
    price: product?.price?.toString() ?? "",
    stock_quantity: product?.stock_quantity?.toString() ?? "",
    is_active: product?.is_active ?? true,
  });
  const [photos, setPhotos] = useState<string[]>(product?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Resync le formulaire à chaque fois qu'un nouveau produit est passé ──
  useEffect(() => {
    setForm({
      name: product?.name ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "autre",
      price: product?.price?.toString() ?? "",
      stock_quantity: product?.stock_quantity?.toString() ?? "",
      is_active: product?.is_active ?? true,
    });
    setPhotos(product?.photos ?? []);
    setError(null);
  }, [product?.id, open]);

  const set = (key: keyof typeof form, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const isPending = createProduct.isPending || updateProduct.isPending;

  async function handlePhotoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 6 - photos.length;
    if (remaining <= 0) {
      setError("Maximum 6 photos.");
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError(null);
    try {
      const urls = await Promise.all(
        toUpload.map((f) => uploadApi.upload(f, "products").then((r) => r.url)),
      );
      setPhotos((p) => [...p, ...urls]);
    } catch {
      setError("Échec de l'envoi d'une image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock_quantity, 10);

    if (!form.name.trim() || form.name.trim().length < 3) {
      setError("Le nom doit contenir au moins 3 caractères.");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setError("Prix invalide.");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      setError("Quantité en stock invalide.");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      category: form.category as Product["category"],
      price,
      stock_quantity: stock,
      photos,
      is_active: form.is_active,
    };

    try {
      if (isEdit && product) {
        await updateProduct.mutateAsync({ id: product.id, payload });
        onSaved("Produit modifié ✅");
      } else {
        await createProduct.mutateAsync(payload);
        onSaved("Produit créé ✅");
      }
      onClose();
    } catch {
      setError("Erreur — vérifiez les champs.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-[var(--pc-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--pc-border)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--pc-border)]">
              <h2 className="font-bold text-[var(--pc-text-primary)]">
                {isEdit ? `Modifier — ${product?.name}` : "Créer un produit"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                    Catégorie
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                    Prix (DT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                    Stock disponible
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => set("stock_quantity", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => set("is_active", e.target.checked)}
                      className="w-4 h-4 rounded accent-[var(--pc-primary)]"
                    />
                    <span className="text-sm text-[var(--pc-text-primary)]">
                      Visible dans la boutique
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                  Photos ({photos.length}/6)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((url, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <img
                        src={url}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <button
                        onClick={() =>
                          setPhotos((p) => p.filter((_, idx) => idx !== i))
                        }
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[var(--pc-border)] flex items-center justify-center cursor-pointer hover:border-[var(--pc-primary)] transition-colors">
                      {uploading ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-[var(--pc-text-secondary)]"
                        />
                      ) : (
                        <Plus
                          size={18}
                          className="text-[var(--pc-text-secondary)]"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handlePhotoUpload(e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={isPending || uploading}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pc-primary), #15a870)",
                }}
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isPending
                  ? "Enregistrement..."
                  : isEdit
                    ? "Enregistrer"
                    : "Créer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({
  onToast,
}: {
  onToast: (msg: string, err?: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [formModal, setFormModal] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });
  const [confirm, setConfirm] = useState<{
    type: string;
    product: Product;
  } | null>(null);

  const { data, isLoading, refetch } = useAdminProducts({
    search: search || undefined,
    category: (category || undefined) as Product["category"] | undefined,
    page,
    per_page: 15,
  });
  const toggleProduct = useAdminToggleProduct();
  const deleteProduct = useAdminDeleteProduct();

  const products = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  async function handleConfirm() {
    if (!confirm) return;
    try {
      if (confirm.type === "delete")
        await deleteProduct.mutateAsync(confirm.product.id);
      if (confirm.type === "toggle")
        await toggleProduct.mutateAsync(confirm.product.id);
      onToast(
        confirm.type === "delete" ? "Produit supprimé ✅" : "Statut modifié ✅",
      );
      setConfirm(null);
    } catch {
      onToast("Action impossible", true);
      setConfirm(null);
    }
  }

  return (
    <div>
      <ProductFormModal
        open={formModal.open}
        product={formModal.product}
        onClose={() => setFormModal({ open: false, product: null })}
        onSaved={onToast}
      />

      {confirm && (
        <ConfirmModal
          open={!!confirm}
          title={
            confirm.type === "delete"
              ? "Supprimer définitivement ?"
              : confirm.product.is_active
                ? "Masquer ce produit ?"
                : "Activer ce produit ?"
          }
          message={
            confirm.type === "delete"
              ? "Ce produit sera supprimé définitivement."
              : confirm.product.is_active
                ? "Le produit n'apparaîtra plus dans la boutique."
                : "Le produit sera de nouveau visible."
          }
          confirmLabel={
            confirm.type === "delete"
              ? "Supprimer"
              : confirm.product.is_active
                ? "Masquer"
                : "Activer"
          }
          variant={confirm.type === "delete" ? "danger" : "warning"}
          loading={deleteProduct.isPending || toggleProduct.isPending}
          onConfirm={handleConfirm}
          onClose={() => setConfirm(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-[var(--pc-text-primary)]">
          Produits{" "}
          <span className="text-[var(--pc-text-secondary)] font-normal text-sm">
            ({data?.total ?? 0})
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
          >
            <RefreshCw size={15} className="text-[var(--pc-text-secondary)]" />
          </button>
          <button
            onClick={() => setFormModal({ open: true, product: null })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--pc-primary), #15a870)",
            }}
          >
            <Plus size={15} /> Nouveau produit
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-[var(--pc-surface-alt)] rounded-xl px-3 py-2 border border-[var(--pc-border)]">
          <Search
            size={14}
            className="text-[var(--pc-text-secondary)] shrink-0"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un produit..."
            className="flex-1 bg-transparent text-sm text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)] focus:outline-none"
        >
          <option value="">Toutes catégories</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-14 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="text-[var(--pc-text-secondary)] text-sm">
            Aucun produit — crée le premier !
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pc-border)] bg-[var(--pc-surface-alt)]">
                  {[
                    "Produit",
                    "Catégorie",
                    "Prix",
                    "Stock",
                    "Statut",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-bold text-[var(--pc-text-secondary)] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--pc-border)] last:border-0 hover:bg-[var(--pc-surface-alt)]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.photos?.[0] ??
                            `https://picsum.photos/seed/prod-${p.id}/60/60`
                          }
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://picsum.photos/seed/prodfb-${p.id}/60/60`;
                          }}
                        />
                        <span className="font-medium text-[var(--pc-text-primary)] line-clamp-1 max-w-[160px]">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-[var(--pc-primary)]">
                      {Number(p.price).toLocaleString("fr-TN")} DT
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--pc-text-secondary)]">
                      {p.stock_quantity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
                      >
                        {p.is_active ? "Actif" : "Masqué"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setFormModal({ open: true, product: p })
                          }
                          title="Modifier"
                          className="p-1.5 rounded-lg hover:bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({ type: "toggle", product: p })
                          }
                          title={p.is_active ? "Masquer" : "Activer"}
                          className={`p-1.5 rounded-lg transition-colors ${p.is_active ? "hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600" : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600"}`}
                        >
                          {p.is_active ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({ type: "delete", product: p })
                          }
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--pc-border)]">
              <span className="text-xs text-[var(--pc-text-secondary)]">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  shipped:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  delivered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function OrdersTab({
  onToast,
}: {
  onToast: (msg: string, err?: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading, refetch } = useAdminOrders({
    search: search || undefined,
    status: (status || undefined) as Order["status"] | undefined,
    page,
    per_page: 15,
  });
  const updateStatus = useAdminUpdateOrderStatus();

  const orders = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      await updateStatus.mutateAsync({
        id,
        status: newStatus as Order["status"],
      });
      onToast("Statut mis à jour ✅");
    } catch {
      onToast("Action impossible", true);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-[var(--pc-text-primary)]">
          Commandes{" "}
          <span className="text-[var(--pc-text-secondary)] font-normal text-sm">
            ({data?.total ?? 0})
          </span>
        </h2>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
        >
          <RefreshCw size={15} className="text-[var(--pc-text-secondary)]" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-[var(--pc-surface-alt)] rounded-xl px-3 py-2 border border-[var(--pc-border)]">
          <Search
            size={14}
            className="text-[var(--pc-text-secondary)] shrink-0"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Nom ou téléphone du client..."
            className="flex-1 bg-transparent text-sm text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)] focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-14 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-[var(--pc-text-secondary)] text-sm">
            Aucune commande pour l'instant
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[var(--pc-text-primary)] text-sm">
                    #{o.id} — {o.shipping_name}
                  </p>
                  <p className="text-xs text-[var(--pc-text-secondary)]">
                    {o.shipping_phone} · {o.shipping_city}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-black text-[var(--pc-primary)] text-sm">
                    {Number(o.total_amount).toLocaleString("fr-TN")} DT
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[o.status]}`}
                  >
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </div>
              </button>

              {expanded === o.id && (
                <div className="px-4 pb-4 border-t border-[var(--pc-border)] pt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                      Articles
                    </p>
                    {(o.items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-[var(--pc-text-primary)] py-1"
                      >
                        <span>
                          {item.quantity}× {item.product_name}
                        </span>
                        <span>
                          {Number(item.subtotal).toLocaleString("fr-TN")} DT
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                      Adresse
                    </p>
                    <p className="text-xs text-[var(--pc-text-primary)]">
                      {o.shipping_address}, {o.shipping_city}
                    </p>
                  </div>
                  {o.notes && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                        Note du client
                      </p>
                      <p className="text-xs text-[var(--pc-text-primary)]">
                        {o.notes}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1">
                      Changer le statut
                    </label>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      disabled={updateStatus.isPending}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-xs text-[var(--pc-text-secondary)]">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-[var(--pc-border)] disabled:opacity-40 hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    error: false,
  });

  function showToast(msg: string, error = false) {
    setToast({ show: true, message: msg, error });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2800);
  }

  const tabs = [
    {
      key: "overview" as AdminTab,
      icon: <LayoutDashboard size={16} />,
      label: "Vue globale",
    },
    {
      key: "users" as AdminTab,
      icon: <Users size={16} />,
      label: "Utilisateurs",
    },
    {
      key: "listings" as AdminTab,
      icon: <List size={16} />,
      label: "Annonces",
    },
    {
      key: "products" as AdminTab,
      icon: <ShoppingBag size={16} />,
      label: "Produits",
    },
    {
      key: "orders" as AdminTab,
      icon: <Package size={16} />,
      label: "Commandes",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12]">
      <Toast show={toast.show} message={toast.message} error={toast.error} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--pc-surface)] border-b border-[var(--pc-border)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--pc-primary)" }}
            >
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-[var(--pc-text-primary)] text-sm leading-none">
                Panel Admin
              </h1>
              <p className="text-[10px] text-[var(--pc-text-secondary)]">
                Animali.tn — Accès restreint
              </p>
            </div>
          </div>

          {/* Tabs desktop */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--pc-surface-alt)] rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.key ? "text-white shadow-sm" : "text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"}`}
                style={
                  activeTab === tab.key
                    ? { background: "var(--pc-primary)" }
                    : {}
                }
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs mobile */}
        <div className="sm:hidden max-w-6xl mx-auto flex gap-1 mt-3 bg-[var(--pc-surface-alt)] rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.key ? "text-white" : "text-[var(--pc-text-secondary)]"}`}
              style={
                activeTab === tab.key ? { background: "var(--pc-primary)" } : {}
              }
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "users" && <UsersTab onToast={showToast} />}
            {activeTab === "listings" && <ListingsTab onToast={showToast} />}
            {activeTab === "products" && <ProductsTab onToast={showToast} />}
            {activeTab === "orders" && <OrdersTab onToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
