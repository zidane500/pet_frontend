import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Shield,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Camera,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import client from "../../api/client";
import { uploadApi } from "../../api/upload";
import { UserAvatar } from "../components/UserAvatar";

const AVATAR_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5 Mo (aligné sur UploadController::store, max:5120)

// ── Types ──────────────────────────────────────────────────────

type Tab = "profile" | "notifications" | "privacy" | "security";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface NotifPrefs {
  messages: boolean;
  favorites: boolean;
  new_listings: boolean;
  posts: boolean;
  lost_found: boolean;
  promotions: boolean;
}

// ── Composant input ────────────────────────────────────────────

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--pc-text-secondary)] uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl bg-[var(--pc-surface-2)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] text-sm placeholder:text-[var(--pc-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)] disabled:opacity-50"
      />
    </div>
  );
}

// ── Onglet Profil ──────────────────────────────────────────────

function ProfileTab({ onSaved }: { onSaved: () => void }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    bio: user?.bio ?? "",
  });

  // Sync si user change
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        city: user.city ?? "",
        bio: user.bio ?? "",
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    if (avatarUploading) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-choisir le même fichier ensuite
    if (!file) return;

    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError("Format non supporté (JPG, PNG ou WEBP uniquement).");
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setAvatarError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const { url } = await uploadApi.upload(file, "avatars");
      const { data } = await client.put("/profile", { avatar: url });
      updateUser(data.user ?? data);
      onSaved();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Erreur lors de l'envoi de la photo.";
      setAvatarError(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.put("/profile", {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        bio: form.bio.trim() || null,
      });
      updateUser(data.user ?? data);
      onSaved();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Erreur lors de la sauvegarde.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo de profil */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <div className="relative">
          <UserAvatar name={user?.name} avatar={user?.avatar} size={96} />
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={avatarUploading}
            aria-label="Changer la photo de profil"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--pc-primary)] text-white flex items-center justify-center shadow-md border-2 border-[var(--pc-surface)] disabled:opacity-60"
          >
            {avatarUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Camera size={14} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-[var(--pc-text-secondary)]">
          JPG, PNG ou WEBP · 5 Mo max
        </p>
        {avatarError && (
          <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
            {avatarError}
          </p>
        )}
      </div>

      <Field
        label="Nom complet"
        value={form.name}
        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        placeholder="Votre nom"
      />
      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={() => {}}
        disabled
      />
      <Field
        label="Téléphone"
        type="tel"
        value={form.phone}
        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        placeholder="+216 XX XXX XXX"
      />
      <Field
        label="Ville"
        value={form.city}
        onChange={(v) => setForm((f) => ({ ...f, city: v }))}
        placeholder="Tunis, Sfax..."
      />
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--pc-text-secondary)] uppercase tracking-wide">
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="Parlez-nous de vous..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl bg-[var(--pc-surface-2)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] text-sm placeholder:text-[var(--pc-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)] resize-none"
        />
        <p className="text-xs text-[var(--pc-text-secondary)] text-right">
          {form.bio.length}/500
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--pc-primary)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Check size={16} />
        )}
        {loading ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </div>
  );
}

// ── Onglet Sécurité ────────────────────────────────────────────

function SecurityTab({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState<PasswordForm>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (form.password !== form.password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await client.put("/profile", {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      onSaved();
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors ?? {};
      const msg =
        apiErrors.current_password?.[0] ??
        apiErrors.password?.[0] ??
        err?.response?.data?.message ??
        "Erreur lors du changement de mot de passe.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--pc-text-secondary)] uppercase tracking-wide">
          Mot de passe actuel
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={form.current_password}
            onChange={(e) =>
              setForm((f) => ({ ...f, current_password: e.target.value }))
            }
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-11 rounded-xl bg-[var(--pc-surface-2)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]"
          />
          <button
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)]"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--pc-text-secondary)] uppercase tracking-wide">
          Nouveau mot de passe
        </label>
        <input
          type={show ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl bg-[var(--pc-surface-2)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--pc-text-secondary)] uppercase tracking-wide">
          Confirmer le mot de passe
        </label>
        <input
          type={show ? "text" : "password"}
          value={form.password_confirmation}
          onChange={(e) =>
            setForm((f) => ({ ...f, password_confirmation: e.target.value }))
          }
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl bg-[var(--pc-surface-2)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]"
        />
      </div>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !form.current_password || !form.password}
        className="w-full py-3 rounded-xl bg-[var(--pc-primary)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Lock size={16} />
        )}
        {loading ? "Mise à jour..." : "Changer le mot de passe"}
      </button>
    </div>
  );
}

// ── Onglet Notifications ───────────────────────────────────────

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  messages: true,
  favorites: true,
  new_listings: false,
  posts: true,
  lost_found: true,
  promotions: false,
};

function NotificationsTab({ onSaved }: { onSaved: () => void }) {
  const { user, updateUser } = useAuth();
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF_PREFS);
  const [loading, setLoading] = useState(false);

  // ← Avant, ce formulaire repartait toujours des valeurs par défaut à
  // l'ouverture, donc chaque "Sauvegarder" écrasait silencieusement les
  // vrais choix de l'utilisateur. On charge maintenant ceux stockés sur
  // le compte.
  useEffect(() => {
    if (user) {
      setPrefs({
        ...DEFAULT_NOTIF_PREFS,
        ...(user.notification_preferences ?? {}),
      });
    }
  }, [user]);

  const toggle = (key: keyof NotifPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await client.put("/profile", {
        notification_preferences: prefs,
      });
      updateUser(data.user ?? data);
      onSaved();
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  const items: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: "messages", label: "Messages", desc: "Nouveaux messages reçus" },
    { key: "favorites", label: "Favoris", desc: "Activité sur vos favoris" },
    {
      key: "posts",
      label: "Nouvelles publications",
      desc: "Publications des personnes que vous suivez",
    },
    {
      key: "new_listings",
      label: "Nouvelles annonces",
      desc: "Annonces des personnes que vous suivez",
    },
    {
      key: "lost_found",
      label: "Perdu / Trouvé",
      desc: "Animaux signalés près de vous",
    },
    {
      key: "promotions",
      label: "Promotions",
      desc: "Offres et actualités Animali.tn",
    },
  ];

  return (
    <div className="space-y-4">
      {items.map(({ key, label, desc }) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 rounded-xl bg-[var(--pc-surface-2)]"
        >
          <div>
            <p className="text-[var(--pc-text-primary)] text-sm font-medium">
              {label}
            </p>
            <p className="text-[var(--pc-text-secondary)] text-xs mt-0.5">
              {desc}
            </p>
          </div>
          <button
            onClick={() => toggle(key)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              prefs[key] ? "bg-[var(--pc-primary)]" : "bg-[var(--pc-border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                prefs[key] ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--pc-primary)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Check size={16} />
        )}
        {loading ? "Sauvegarde..." : "Sauvegarder les préférences"}
      </button>
    </div>
  );
}

// ── Onglet Confidentialité ─────────────────────────────────────

function PrivacyTab({ onSaved }: { onSaved: () => void }) {
  const { user, updateUser } = useAuth();
  const [profilePublic, setProfilePublic] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfilePublic(user.privacy?.profile_public ?? true);
      setShowPhone(user.privacy?.show_phone ?? false);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await client.put("/profile", {
        privacy: {
          profile_public: profilePublic,
          show_phone: showPhone,
        },
      });
      updateUser(data.user ?? data);
      onSaved();
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      label: "Profil public",
      desc: "Votre profil est visible par tous les utilisateurs",
      value: profilePublic,
      toggle: () => setProfilePublic((v) => !v),
    },
    {
      label: "Afficher le téléphone",
      desc: "Votre numéro est visible sur vos annonces",
      value: showPhone,
      toggle: () => setShowPhone((v) => !v),
    },
  ];

  return (
    <div className="space-y-4">
      {items.map(({ label, desc, value, toggle }) => (
        <div
          key={label}
          className="flex items-center justify-between p-4 rounded-xl bg-[var(--pc-surface-2)]"
        >
          <div>
            <p className="text-[var(--pc-text-primary)] text-sm font-medium">
              {label}
            </p>
            <p className="text-[var(--pc-text-secondary)] text-xs mt-0.5">
              {desc}
            </p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              value ? "bg-[var(--pc-primary)]" : "bg-[var(--pc-border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                value ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--pc-primary)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Check size={16} />
        )}
        {loading ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────

interface SettingsPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onBack, onNavigate }: SettingsPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profil", icon: User },
    { key: "security", label: "Sécurité", icon: Lock },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "privacy", label: "Confidentialité", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[var(--pc-surface)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--pc-surface)]/80 backdrop-blur-sm border-b border-[var(--pc-border)] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-2)] transition-colors"
          >
            <ArrowLeft size={20} className="text-[var(--pc-text-primary)]" />
          </button>
          <h1 className="text-[var(--pc-text-primary)] font-bold text-lg">
            Paramètres
          </h1>

          {/* Toast succès */}
          {savedMsg && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium"
            >
              <Check size={12} /> Sauvegardé
            </motion.span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs navigation */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[var(--pc-surface-2)]">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === key
                  ? "bg-[var(--pc-primary)] text-white shadow"
                  : "text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet actif */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "profile" && <ProfileTab onSaved={handleSaved} />}
            {activeTab === "security" && <SecurityTab onSaved={handleSaved} />}
            {activeTab === "notifications" && (
              <NotificationsTab onSaved={handleSaved} />
            )}
            {activeTab === "privacy" && <PrivacyTab onSaved={handleSaved} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
