import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Shield,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  Smartphone,
  Monitor,
  Trash2,
  AlertTriangle,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type SettingsTab = 'profile' | 'security' | 'notifications' | 'privacy';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[var(--pc-primary)]' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md mt-0.5 ${
          checked ? 'ml-5' : 'ml-0.5'
        }`}
      />
    </button>
  );
}

// ─── Password Strength Bar ────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  function getStrength(pw: string): { level: number; label: string; color: string } {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: score, label: 'Faible', color: 'bg-red-500' };
    if (score === 2) return { level: score, label: 'Moyen', color: 'bg-amber-400' };
    if (score === 3) return { level: score, label: 'Fort', color: 'bg-[var(--pc-primary)]' };
    return { level: score, label: 'Très fort', color: 'bg-emerald-500' };
  }

  const { level, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${i <= level ? color : 'bg-transparent'}`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 font-medium ${level <= 1 ? 'text-red-500' : level === 2 ? 'text-amber-500' : level === 3 ? 'text-[var(--pc-primary)]' : 'text-emerald-500'}`}>
        {label}
      </p>
    </div>
  );
}

// ─── Success Toast ─────────────────────────────────────────────────────────────

function SuccessToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 glass-card rounded-full px-5 py-2.5 shadow-xl border border-[var(--pc-border)]"
        >
          <CheckCircle size={16} className="text-[var(--pc-primary)]" />
          <span className="text-sm font-medium text-[var(--pc-text-primary)]">Modifications enregistrées</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────

function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === 'SUPPRIMER';

  function handleClose() {
    setConfirmText('');
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass-card rounded-3xl p-6 w-full max-w-sm border border-red-200 dark:border-red-900/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-[var(--pc-text-primary)] mb-2">Supprimer mon compte</h3>
              <p className="text-sm text-[var(--pc-text-secondary)] leading-relaxed">
                Cette action est <strong>irréversible</strong>. Toutes vos données, annonces et messages seront définitivement supprimés.
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-2">
                Tapez <span className="font-bold text-red-500">SUPPRIMER</span> pour confirmer
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-red-400 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] transition-colors"
              >
                Annuler
              </button>
              <button
                disabled={!canDelete}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-all ${
                  canDelete
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-red-300 dark:bg-red-900/40 cursor-not-allowed'
                }`}
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ onSaved }: { onSaved: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string>('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face');
  const [form, setForm] = useState({
    prenom: 'Ahmed',
    nom: 'Ben Salah',
    username: 'ahmed.bensalah',
    email: 'ahmed.bensalah@email.com',
    phone: '+216 22 345 678',
    city: 'Tunis',
    bio: 'Passionné des animaux, propriétaire de 2 chats et 1 chien.',
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  }

  function handleChange(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-[var(--pc-text-primary)]">Informations personnelles</h2>

      {/* Avatar Upload */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-[var(--pc-border)]"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--pc-primary)] flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <Camera size={13} className="text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold text-sm text-[var(--pc-text-primary)]">{form.prenom} {form.nom}</p>
          <p className="text-xs text-[var(--pc-text-secondary)] mt-0.5">@{form.username}</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-1.5 text-xs text-[var(--pc-primary)] font-medium hover:underline"
          >
            Changer la photo
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'prenom', label: 'Prénom' },
          { key: 'nom', label: 'Nom' },
          { key: 'username', label: "Nom d'utilisateur" },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone', label: 'Téléphone', type: 'tel' },
          { key: 'city', label: 'Ville' },
        ].map(({ key, label, type = 'text' }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1.5">{label}</label>
            <input
              type={type}
              value={(form as Record<string, string>)[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1.5">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors resize-none"
        />
      </div>

      <button
        onClick={onSaved}
        className="gradient-btn text-white font-bold rounded-full px-8 py-2.5 text-sm"
      >
        <span>Enregistrer les modifications</span>
      </button>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  function handleSavePw() {
    if (!newPw || newPw !== confirmPw) return;
    setPwSaved(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSaved(false), 2500);
  }

  const sessions = [
    { id: 's1', device: 'Cet appareil', location: 'Tunis', icon: Monitor, current: true },
    { id: 's2', device: 'iPhone 14', location: 'Tunis', icon: Smartphone, current: false },
  ];

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <section>
        <h2 className="text-base font-bold text-[var(--pc-text-primary)] mb-4">Changer le mot de passe</h2>
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1.5">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                placeholder="••••••••"
              />
              <button onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)]">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:border-[var(--pc-primary)] transition-colors"
                placeholder="••••••••"
              />
              <button onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)]">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrength password={newPw} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[var(--pc-text-secondary)] mb-1.5">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none transition-colors ${
                  confirmPw && confirmPw !== newPw
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-[var(--pc-border)] focus:border-[var(--pc-primary)]'
                }`}
                placeholder="••••••••"
              />
              <button onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)]">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPw && confirmPw !== newPw && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          {pwSaved && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-primary)]">
              <CheckCircle size={15} />
              Mot de passe mis à jour !
            </div>
          )}

          <button
            onClick={handleSavePw}
            disabled={!currentPw || !newPw || newPw !== confirmPw}
            className="gradient-btn text-white font-bold rounded-full px-7 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Mettre à jour</span>
          </button>
        </div>
      </section>

      {/* 2FA */}
      <section className="glass-card rounded-2xl p-4 border border-[var(--pc-border)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-sm text-[var(--pc-text-primary)]">Authentification à deux facteurs</p>
            <p className="text-xs text-[var(--pc-text-secondary)] mt-1 leading-relaxed">
              Renforcez la sécurité de votre compte en activant la vérification en deux étapes via SMS ou application d'authentification.
            </p>
          </div>
          <Toggle checked={twoFA} onChange={setTwoFA} />
        </div>
        <AnimatePresence>
          {twoFA && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-[var(--pc-border)]">
                <p className="text-xs text-[var(--pc-primary)] font-medium">
                  ✓ Authentification à deux facteurs activée. Vous recevrez un code SMS à chaque connexion.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Active Sessions */}
      <section>
        <h3 className="text-sm font-bold text-[var(--pc-text-primary)] mb-3">Sessions actives</h3>
        <div className="space-y-3">
          {sessions.map((session) => {
            const Icon = session.icon;
            return (
              <div key={session.id} className="glass-card rounded-2xl p-4 border border-[var(--pc-border)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--pc-surface-alt)] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[var(--pc-text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--pc-text-primary)]">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 text-[10px] bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] rounded-full px-2 py-0.5 font-bold">
                        Actif
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--pc-text-secondary)]">{session.location}</p>
                </div>
                {!session.current && (
                  <button className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-600 transition-colors">
                    <LogOut size={13} />
                    Déconnecter
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="border-2 border-red-200 dark:border-red-900/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-red-500 mb-1">Zone de danger</h3>
        <p className="text-xs text-[var(--pc-text-secondary)] mb-4 leading-relaxed">
          La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
        </p>
        <button
          onClick={onDeleteAccount}
          className="flex items-center gap-2 text-sm font-bold text-red-500 border-2 border-red-300 dark:border-red-700 rounded-full px-5 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={15} />
          Supprimer mon compte
        </button>
      </section>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab({ onSaved }: { onSaved: () => void }) {
  const [emailNotifs, setEmailNotifs] = useState({
    messages: true,
    adoptions: true,
    updates: true,
    newsletter: false,
  });

  const [pushNotifs, setPushNotifs] = useState({
    messages: true,
    likes: false,
    lostPets: true,
  });

  const emailFields: { key: keyof typeof emailNotifs; label: string }[] = [
    { key: 'messages', label: 'Nouveaux messages' },
    { key: 'adoptions', label: "Demandes d'adoption" },
    { key: 'updates', label: "Mises à jour d'annonces" },
    { key: 'newsletter', label: 'Newsletter mensuelle' },
  ];

  const pushFields: { key: keyof typeof pushNotifs; label: string }[] = [
    { key: 'messages', label: 'Nouveaux messages' },
    { key: 'likes', label: 'Likes et commentaires' },
    { key: 'lostPets', label: 'Alertes animaux perdus' },
  ];

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <section className="glass-card rounded-2xl border border-[var(--pc-border)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--pc-border)] bg-[var(--pc-surface-alt)]/50">
          <h3 className="text-sm font-bold text-[var(--pc-text-primary)]">Notifications par email</h3>
        </div>
        <div className="divide-y divide-[var(--pc-border)]">
          {emailFields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-[var(--pc-text-primary)]">{label}</span>
              <Toggle
                checked={emailNotifs[key]}
                onChange={(v) => setEmailNotifs((n) => ({ ...n, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Push Notifications */}
      <section className="glass-card rounded-2xl border border-[var(--pc-border)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--pc-border)] bg-[var(--pc-surface-alt)]/50">
          <h3 className="text-sm font-bold text-[var(--pc-text-primary)]">Notifications push</h3>
        </div>
        <div className="divide-y divide-[var(--pc-border)]">
          {pushFields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-[var(--pc-text-primary)]">{label}</span>
              <Toggle
                checked={pushNotifs[key]}
                onChange={(v) => setPushNotifs((n) => ({ ...n, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </section>

      <button onClick={onSaved} className="gradient-btn text-white font-bold rounded-full px-8 py-2.5 text-sm">
        <span>Enregistrer</span>
      </button>
    </div>
  );
}

// ─── Privacy Tab ──────────────────────────────────────────────────────────────

function PrivacyTab({ onSaved }: { onSaved: () => void }) {
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'friends'>('public');
  const [phoneVisibility, setPhoneVisibility] = useState<'all' | 'verified' | 'none'>('verified');
  const [locationVisibility, setLocationVisibility] = useState<'exact' | 'city' | 'hidden'>('city');

  const [toggles, setToggles] = useState({
    nonFollowers: true,
    searchable: true,
    analytics: false,
  });

  function RadioGroup<T extends string>({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: T;
    options: { key: T; label: string }[];
    onChange: (v: T) => void;
  }) {
    return (
      <div className="glass-card rounded-2xl border border-[var(--pc-border)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--pc-border)] bg-[var(--pc-surface-alt)]/50">
          <h3 className="text-sm font-bold text-[var(--pc-text-primary)]">{label}</h3>
        </div>
        <div className="divide-y divide-[var(--pc-border)]">
          {options.map((opt) => (
            <label key={opt.key} className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[var(--pc-surface-alt)]/40 transition-colors">
              <span
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  value === opt.key
                    ? 'border-[var(--pc-primary)]'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {value === opt.key && (
                  <span className="w-2 h-2 rounded-full bg-[var(--pc-primary)]" />
                )}
              </span>
              <span className="text-sm text-[var(--pc-text-primary)]">{opt.label}</span>
              <input
                type="radio"
                className="sr-only"
                checked={value === opt.key}
                onChange={() => onChange(opt.key)}
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  const toggleFields: { key: keyof typeof toggles; label: string }[] = [
    { key: 'nonFollowers', label: 'Autoriser les messages de non-abonnés' },
    { key: 'searchable', label: 'Apparaître dans les recherches' },
    { key: 'analytics', label: 'Données analytiques anonymes' },
  ];

  return (
    <div className="space-y-5">
      <RadioGroup
        label="Visibilité du profil"
        value={profileVisibility}
        options={[
          { key: 'public', label: 'Public' },
          { key: 'private', label: 'Privé' },
          { key: 'friends', label: 'Amis seulement' },
        ]}
        onChange={setProfileVisibility}
      />

      <RadioGroup
        label="Afficher mon numéro"
        value={phoneVisibility}
        options={[
          { key: 'all', label: 'Tout le monde' },
          { key: 'verified', label: 'Membres vérifiés' },
          { key: 'none', label: 'Personne' },
        ]}
        onChange={setPhoneVisibility}
      />

      <RadioGroup
        label="Afficher ma localisation"
        value={locationVisibility}
        options={[
          { key: 'exact', label: 'Exacte' },
          { key: 'city', label: 'Ville seulement' },
          { key: 'hidden', label: 'Cachée' },
        ]}
        onChange={setLocationVisibility}
      />

      {/* Toggles */}
      <div className="glass-card rounded-2xl border border-[var(--pc-border)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--pc-border)] bg-[var(--pc-surface-alt)]/50">
          <h3 className="text-sm font-bold text-[var(--pc-text-primary)]">Préférences</h3>
        </div>
        <div className="divide-y divide-[var(--pc-border)]">
          {toggleFields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-[var(--pc-text-primary)]">{label}</span>
              <Toggle
                checked={toggles[key]}
                onChange={(v) => setToggles((t) => ({ ...t, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </div>

      <button onClick={onSaved} className="gradient-btn text-white font-bold rounded-full px-8 py-2.5 text-sm">
        <span>Enregistrer</span>
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SettingsPage({ onBack, onNavigate: _onNavigate }: SettingsPageProps) {
  useTranslation();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function handleSaved() {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  }

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'profile', label: 'Profil', icon: <User size={16} />, description: 'Informations personnelles' },
    { key: 'security', label: 'Sécurité', icon: <Lock size={16} />, description: 'Mot de passe et accès' },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} />, description: 'Préférences alertes' },
    { key: 'privacy', label: 'Confidentialité', icon: <Shield size={16} />, description: 'Visibilité et données' },
  ];

  return (
    <div className="min-h-screen bg-[var(--pc-surface)] text-[var(--pc-text-primary)]" dir="ltr">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-[var(--pc-border)]">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-lg font-bold">Paramètres</h1>
        </div>

        {/* Mobile tab pills */}
        <div className="md:hidden max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[var(--pc-primary)] text-white shadow-sm'
                  : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                activeTab === tab.key
                  ? 'bg-[var(--pc-primary)]/10 text-[var(--pc-primary)]'
                  : 'text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] hover:text-[var(--pc-text-primary)]'
              }`}
            >
              <span className={activeTab === tab.key ? 'text-[var(--pc-primary)]' : ''}>{tab.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${activeTab === tab.key ? 'text-[var(--pc-primary)]' : ''}`}>
                  {tab.label}
                </p>
                <p className="text-[10px] text-[var(--pc-text-secondary)] truncate">{tab.description}</p>
              </div>
              <ChevronRight size={14} className={`flex-shrink-0 transition-opacity ${activeTab === tab.key ? 'opacity-100 text-[var(--pc-primary)]' : 'opacity-0 group-hover:opacity-50'}`} />
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && <ProfileTab onSaved={handleSaved} />}
              {activeTab === 'security' && <SecurityTab onDeleteAccount={() => setShowDeleteModal(true)} />}
              {activeTab === 'notifications' && <NotificationsTab onSaved={handleSaved} />}
              {activeTab === 'privacy' && <PrivacyTab onSaved={handleSaved} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Success Toast */}
      <SuccessToast show={showSavedToast} />

      {/* Delete Account Modal */}
      <DeleteAccountModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}
