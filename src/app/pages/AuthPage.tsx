import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AtSign,
  Phone,
  ChevronLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthView =
  | "login"
  | "register-step1"
  | "register-step2"
  | "forgot"
  | "reset";

export interface AuthPageProps {
  initialView?: "login" | "register";
  onSuccess: (user: { name: string; role: string }) => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onLogin?: (email: string, password: string) => Promise<any>;
  onRegister?: (data: any) => Promise<any>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  {
    id: "owner",
    icon: "🐾",
    title: "Propriétaire / Visiteur",
    desc: "Achetez, adoptez, signalez des animaux perdus",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "vet",
    icon: "🏥",
    title: "Vétérinaire",
    desc: "Gérez votre profil et vos consultations",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "shop",
    icon: "🏪",
    title: "Animalerie",
    desc: "Publiez vos produits et services",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "shelter",
    icon: "🏠",
    title: "Refuge / SPA",
    desc: "Gérez les adoptions et recevez des dons",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "breeder",
    icon: "🐕",
    title: "Éleveur",
    desc: "Publiez vos animaux et gérez vos portées",
    color: "from-purple-500 to-violet-600",
  },
];

const TUNISIAN_CITIES = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Monastir",
  "Bizerte",
  "Nabeul",
  "Ariana",
  "Autres",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email requis";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email invalide";
  return null;
}

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthColors = [
  "bg-red-500",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-emerald-500",
];
const strengthLabels = ["Trop court", "Faible", "Moyen", "Fort"];

// ─── Shared sub-components ────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  error?: string | null;
  suffix?: React.ReactNode;
  disabled?: boolean;
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  suffix,
  disabled,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[var(--pc-text-primary)] font-semibold text-sm block">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-[var(--pc-text-secondary)] pointer-events-none z-10">
            <Icon size={16} />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            "bg-[var(--pc-surface-alt)] border rounded-xl px-4 py-3 w-full",
            "focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40",
            "text-[var(--pc-text-primary)] text-sm transition-all placeholder:text-[var(--pc-text-secondary)]/60",
            Icon ? "pl-9" : "",
            suffix ? "pr-10" : "",
            error
              ? "border-red-400 focus:ring-red-400/30"
              : "border-[var(--pc-border)]",
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        />
        {suffix && <span className="absolute right-3 z-10">{suffix}</span>}
      </div>
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[var(--pc-text-primary)] font-semibold text-sm block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-4 py-3 w-full
          focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40
          text-[var(--pc-text-primary)] text-sm transition-all"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function GradientButton({
  children,
  onClick,
  disabled,
  loading,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="gradient-btn w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
        font-semibold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

// ─── PREMIUM Left branding panel ──────────────────────────────────────────────

function FloatingOrb({
  delay,
  size,
  x,
  y,
  color,
}: {
  delay: number;
  size: number;
  x: string;
  y: string;
  color: string;
}) {
  return (
    <motion.div
      className={`absolute rounded-full ${color} blur-[80px] pointer-events-none`}
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.2, 0.9, 1],
        opacity: [0.3, 0.5, 0.3, 0.4],
      }}
      transition={{
        duration: 8 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    />
  );
}

function Particle({ delay }: { delay: number }) {
  const randomX = Math.random() * 100;
  const randomSize = 2 + Math.random() * 4;
  const duration = 10 + Math.random() * 10;

  return (
    <motion.div
      className="absolute rounded-full bg-white/20 pointer-events-none"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${randomX}%`,
        bottom: "-10px",
      }}
      animate={{
        y: [0, -800],
        x: [0, (Math.random() - 0.5) * 100],
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    />
  );
}

function LeftPanel() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0, rotateY: -30 },
    visible: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8 + i * 0.15,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    }),
  };

  const glowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(85, 210, 225, 0.1)",
        "0 0 60px rgba(85, 210, 225, 0.3)",
        "0 0 40px rgba(45, 144, 186, 0.2)",
        "0 0 20px rgba(85, 210, 225, 0.1)",
      ],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as any },
    },
  };

  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-full relative overflow-hidden bg-[#0A1F1A]">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 50%, rgba(45, 144, 186, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(85, 210, 225, 0.1) 0%, transparent 50%)",
              "radial-gradient(ellipse at 50% 50%, rgba(85, 210, 225, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(45, 144, 186, 0.1) 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 50%, rgba(45, 144, 186, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 20%, rgba(85, 210, 225, 0.1) 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 50%, rgba(45, 144, 186, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(85, 210, 225, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(85,210,225,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(85,210,225,0.5) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <FloatingOrb
        delay={0}
        size={300}
        x="10%"
        y="20%"
        color="bg-[#2D90BA]/20"
      />
      <FloatingOrb
        delay={2}
        size={250}
        x="60%"
        y="60%"
        color="bg-[#55D2E1]/15"
      />
      <FloatingOrb
        delay={4}
        size={200}
        x="30%"
        y="70%"
        color="bg-[#1D7D5F]/20"
      />
      <FloatingOrb
        delay={1}
        size={180}
        x="70%"
        y="10%"
        color="bg-[#55D2E1]/10"
      />
      <FloatingOrb
        delay={3}
        size={220}
        x="-5%"
        y="50%"
        color="bg-[#2D90BA]/15"
      />

      {Array.from({ length: 20 }).map((_, i) => (
        <Particle key={i} delay={i * 0.8} />
      ))}

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative mb-8"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.3, 1.1, 1.4, 1],
              opacity: [0.1, 0.05, 0.08, 0.03, 0.1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(85,210,225,0.3) 0%, transparent 70%)",
              transform: "scale(1.5)",
            }}
          />
          <motion.div
            className="relative w-64 h-56 xl:w-80 xl:h-72"
            animate={{ y: [0, -10, 0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.img
              src="/animali-logo.png"
              alt="Animali.tn Logo"
              className="w-full h-full object-contain drop-shadow-2xl"
              animate={glowVariants.animate}
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(85, 210, 225, 0.3)) drop-shadow(0 0 60px rgba(45, 144, 186, 0.2))",
              }}
            />
          </motion.div>
        </motion.div>

        <motion.div className="text-center" initial="hidden" animate="visible">
          <motion.h1
            custom={0}
            variants={textVariants}
            className="text-5xl xl:text-6xl font-black tracking-tight"
          >
            <motion.span
              className="text-white"
              animate={{
                textShadow: [
                  "0 0 20px rgba(85,210,225,0.3)",
                  "0 0 40px rgba(85,210,225,0.5)",
                  "0 0 20px rgba(85,210,225,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Animali
            </motion.span>
            <motion.span
              className="text-[#55D2E1]"
              animate={{
                textShadow: [
                  "0 0 10px rgba(85,210,225,0.5)",
                  "0 0 30px rgba(85,210,225,0.8)",
                  "0 0 10px rgba(85,210,225,0.5)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              .tn
            </motion.span>
          </motion.h1>

          <motion.div
            className="mt-3 mx-auto h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#55D2E1] to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "60%", opacity: 1 }}
            transition={{
              delay: 1.5,
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1] as any,
            }}
          />

          <motion.p
            custom={1}
            variants={textVariants}
            className="mt-4 text-white/40 text-sm font-medium tracking-[0.3em] uppercase"
          >
            {"La plateforme des passionnés d'animaux"
              .split("")
              .map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 + i * 0.03, duration: 0.1 }}
                >
                  {char}
                </motion.span>
              ))}
          </motion.p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A1F1A] to-transparent pointer-events-none" />
    </div>
  );
}

// ─── LOGIN view ───────────────────────────────────────────────────────────────

function LoginView({
  onSwitch,
  onSuccess,
  onLogin,
}: {
  onSwitch: (v: AuthView) => void;
  onSuccess: (user: { name: string; role: string }) => void;
  onLogin?: (email: string, password: string) => Promise<any>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    const newErrors: typeof errors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    if (!password) newErrors.password = "Mot de passe requis";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setGlobalError("");
    setLoading(true);
    try {
      if (onLogin) {
        const user = await onLogin(email, password);
        onSuccess({ name: user.name, role: user.role });
      } else {
        // Mode démo sans backend
        await new Promise((r) => setTimeout(r, 1000));
        onSuccess({ name: "Utilisateur", role: "owner" });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        "Email ou mot de passe incorrect";
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, password, onSuccess, onLogin]);

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-[var(--pc-text-primary)]">
          Bon retour !
        </h1>
        <p className="text-[var(--pc-text-secondary)] text-sm mt-1">
          Connectez-vous à votre compte Animali.tn
        </p>
      </div>

      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-400 text-sm rounded-xl px-4 py-3"
          >
            <AlertCircle size={16} className="shrink-0" />
            {globalError}
          </motion.div>
        )}
      </AnimatePresence>

      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="vous@exemple.com"
        icon={Mail}
        error={errors.email}
      />

      <InputField
        label="Mot de passe"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        icon={Lock}
        error={errors.password}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer text-[var(--pc-text-secondary)]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-[#1D7D5F]"
          />
          Se souvenir de moi
        </label>
        <button
          type="button"
          onClick={() => onSwitch("forgot")}
          className="text-[#1D7D5F] hover:underline font-medium"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <GradientButton onClick={handleSubmit} loading={loading}>
        Se connecter
      </GradientButton>

      <div className="relative flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-[var(--pc-border)]" />
        <span className="text-[var(--pc-text-secondary)] text-xs">
          ou continuer avec
        </span>
        <div className="flex-1 h-px bg-[var(--pc-border)]" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuer avec Google
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="#1877F2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continuer avec Facebook
        </button>
      </div>

      <p className="text-center text-sm text-[var(--pc-text-secondary)]">
        Pas encore de compte ?{" "}
        <button
          type="button"
          onClick={() => onSwitch("register-step1")}
          className="text-[#1D7D5F] font-semibold hover:underline"
        >
          Créer un compte
        </button>
      </p>
    </div>
  );
}

// ─── REGISTER STEP 1 ──────────────────────────────────────────────────────────

function RegisterStep1View({
  onSwitch,
  selectedRole,
  onSelectRole,
}: {
  onSwitch: (v: AuthView) => void;
  selectedRole: string;
  onSelectRole: (r: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-black text-[var(--pc-text-primary)]">
          Créer votre compte
        </h1>
        <p className="text-[var(--pc-text-secondary)] text-sm mt-1">
          Étape 1/2 — Choisissez votre type de compte
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((role, idx) => {
          const isLast = idx === ROLES.length - 1 && ROLES.length % 2 !== 0;
          const selected = selectedRole === role.id;
          return (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={[
                "relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer bg-[var(--pc-surface-alt)]",
                isLast ? "col-span-2 max-w-[calc(50%-6px)] mx-auto w-full" : "",
                selected
                  ? "border-[#1D7D5F] ring-2 ring-[#1D7D5F]/30 scale-[1.02]"
                  : "border-[var(--pc-border)] hover:border-[#1D7D5F]/50",
              ].join(" ")}
            >
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-lg mb-3`}
              >
                {role.icon}
              </div>
              <p className="font-bold text-[var(--pc-text-primary)] text-sm leading-snug">
                {role.title}
              </p>
              <p className="text-[var(--pc-text-secondary)] text-xs mt-0.5 leading-snug">
                {role.desc}
              </p>
              {selected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#1D7D5F] flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <GradientButton
        onClick={() => onSwitch("register-step2")}
        disabled={!selectedRole}
      >
        Continuer →
      </GradientButton>

      <p className="text-center text-sm text-[var(--pc-text-secondary)]">
        Déjà un compte ?{" "}
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="text-[#1D7D5F] font-semibold hover:underline"
        >
          Se connecter
        </button>
      </p>
    </div>
  );
}

// ─── REGISTER STEP 2 ──────────────────────────────────────────────────────────

function RegisterStep2View({
  onSwitch,
  selectedRole,
  onSuccess,
  onRegister,
}: {
  onSwitch: (v: AuthView) => void;
  selectedRole: string;
  onSuccess: (user: { name: string; role: string }) => void;
  onRegister?: (data: any) => Promise<any>;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  const handleSubmit = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "Prénom requis";
    if (!lastName.trim()) newErrors.lastName = "Nom requis";
    if (!username.trim()) newErrors.username = "Nom d'utilisateur requis";
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    if (!password) newErrors.password = "Mot de passe requis";
    else if (password.length < 8) newErrors.password = "Minimum 8 caractères";
    if (confirmPassword !== password)
      newErrors.confirm = "Les mots de passe ne correspondent pas";
    if (!acceptTerms)
      newErrors.terms = "Veuillez accepter les conditions d'utilisation";
    if (!acceptPrivacy)
      newErrors.privacy = "Veuillez accepter la politique de confidentialité";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      if (onRegister) {
        const user = await onRegister({
          name: `${firstName} ${lastName}`,
          email,
          password,
          password_confirmation: confirmPassword,
          role: selectedRole,
          phone: phone || undefined,
          city: city || undefined,
        });
        onSuccess({ name: user.name, role: user.role });
      } else {
        // Mode démo sans backend
        await new Promise((r) => setTimeout(r, 1000));
        onSuccess({ name: firstName, role: selectedRole });
      }
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors || {};
      const newErr: Record<string, string> = {};
      if (apiErrors.email) newErr.email = apiErrors.email[0];
      if (apiErrors.password) newErr.password = apiErrors.password[0];
      if (apiErrors.name) newErr.firstName = apiErrors.name[0];
      if (!Object.keys(apiErrors).length) {
        newErr.email =
          err.response?.data?.message || "Erreur lors de l'inscription";
      }
      setErrors(newErr);
    } finally {
      setLoading(false);
    }
  }, [
    firstName,
    lastName,
    username,
    email,
    phone,
    city,
    password,
    confirmPassword,
    acceptTerms,
    acceptPrivacy,
    selectedRole,
    onSuccess,
    onRegister,
  ]);

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-black text-[var(--pc-text-primary)]">
          Créer votre compte
        </h1>
        <p className="text-[var(--pc-text-secondary)] text-sm mt-1">
          Étape 2/2 — Informations personnelles
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Prénom"
          value={firstName}
          onChange={setFirstName}
          placeholder="Jean"
          icon={User}
          error={errors.firstName}
        />
        <InputField
          label="Nom"
          value={lastName}
          onChange={setLastName}
          placeholder="Dupont"
          icon={User}
          error={errors.lastName}
        />
      </div>

      <InputField
        label="Nom d'utilisateur"
        value={username}
        onChange={setUsername}
        placeholder="jean_dupont"
        icon={AtSign}
        error={errors.username}
      />
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="vous@exemple.com"
        icon={Mail}
        error={errors.email}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-[var(--pc-text-primary)] font-semibold text-sm block">
          Téléphone
        </label>
        <div className="relative flex items-center">
          <Phone
            size={16}
            className="absolute left-3 text-[var(--pc-text-secondary)] pointer-events-none z-10"
          />
          <span className="absolute left-9 text-[var(--pc-text-secondary)] text-sm pointer-events-none z-10 select-none border-r border-[var(--pc-border)] pr-2 leading-none">
            +216
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="12 345 678"
            className="bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-4 py-3 w-full pl-[72px]
              focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40
              text-[var(--pc-text-primary)] text-sm transition-all placeholder:text-[var(--pc-text-secondary)]/60"
          />
        </div>
      </div>

      <SelectField
        label="Ville"
        value={city}
        onChange={setCity}
        options={TUNISIAN_CITIES}
        placeholder="Sélectionnez une ville"
      />

      <div className="flex flex-col gap-1.5">
        <InputField
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        {password.length > 0 && (
          <div className="space-y-1 mt-1">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength - 1] : "bg-[var(--pc-border)]"}`}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--pc-text-secondary)]">
              {strength > 0 ? strengthLabels[strength - 1] : "Trop court"}
            </p>
          </div>
        )}
      </div>

      <InputField
        label="Confirmer le mot de passe"
        type={showConfirm ? "text" : "password"}
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="••••••••"
        icon={Lock}
        error={errors.confirm}
        suffix={
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div className="space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-[#1D7D5F]"
          />
          <span className="text-sm text-[var(--pc-text-secondary)]">
            J'accepte les{" "}
            <span className="text-[#1D7D5F] font-medium cursor-pointer hover:underline">
              Conditions d'utilisation
            </span>
          </span>
        </label>
        {errors.terms && (
          <p className="text-red-400 text-xs pl-6">{errors.terms}</p>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(e) => setAcceptPrivacy(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-[#1D7D5F]"
          />
          <span className="text-sm text-[var(--pc-text-secondary)]">
            J'accepte la{" "}
            <span className="text-[#1D7D5F] font-medium cursor-pointer hover:underline">
              Politique de confidentialité
            </span>
          </span>
        </label>
        {errors.privacy && (
          <p className="text-red-400 text-xs pl-6">{errors.privacy}</p>
        )}
      </div>

      <GradientButton onClick={handleSubmit} loading={loading}>
        Créer mon compte
      </GradientButton>

      <button
        type="button"
        onClick={() => onSwitch("register-step1")}
        className="w-full flex items-center justify-center gap-1.5 text-sm text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
      >
        <ChevronLeft size={16} /> Retour
      </button>
    </div>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

function ForgotView({ onSwitch }: { onSwitch: (v: AuthView) => void }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  }, [email]);

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-5 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center"
        >
          <CheckCircle size={40} className="text-emerald-500" />
        </motion.div>
        <div>
          <h2 className="text-xl font-black text-[var(--pc-text-primary)]">
            Email envoyé !
          </h2>
          <p className="text-[var(--pc-text-secondary)] text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            Vérifiez votre boîte mail. Le lien est valable 24h.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="text-[#1D7D5F] font-semibold hover:underline text-sm"
        >
          Retour à la connexion
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-black text-[var(--pc-text-primary)]">
          Mot de passe oublié
        </h1>
        <p className="text-[var(--pc-text-secondary)] text-sm mt-1">
          Entrez votre email pour recevoir un lien de récupération
        </p>
      </div>
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="vous@exemple.com"
        icon={Mail}
        error={emailError}
      />
      <GradientButton onClick={handleSubmit} loading={loading}>
        Envoyer le lien de récupération
      </GradientButton>
      <button
        type="button"
        onClick={() => onSwitch("login")}
        className="w-full flex items-center justify-center gap-1.5 text-sm text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
      >
        <ChevronLeft size={16} /> Retour à la connexion
      </button>
    </div>
  );
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

function ResetView({ onSwitch }: { onSwitch: (v: AuthView) => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );

  const handleSubmit = useCallback(async () => {
    const newErrors: typeof errors = {};
    if (!password || password.length < 8)
      newErrors.password = "Minimum 8 caractères";
    if (confirmPassword !== password)
      newErrors.confirm = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => onSwitch("login"), 2000);
  }, [password, confirmPassword, onSwitch]);

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-5 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center"
        >
          <CheckCircle size={40} className="text-emerald-500" />
        </motion.div>
        <div>
          <h2 className="text-xl font-black text-[var(--pc-text-primary)]">
            Mot de passe changé !
          </h2>
          <p className="text-[var(--pc-text-secondary)] text-sm mt-2">
            Redirection vers la connexion…
          </p>
        </div>
        <Loader2 size={20} className="animate-spin text-[#1D7D5F]" />
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-black text-[var(--pc-text-primary)]">
          Réinitialiser le mot de passe
        </h1>
        <p className="text-[var(--pc-text-secondary)] text-sm mt-1">
          Choisissez un nouveau mot de passe sécurisé
        </p>
      </div>
      <InputField
        label="Nouveau mot de passe"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        icon={Lock}
        error={errors.password}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <InputField
        label="Confirmer le mot de passe"
        type={showConfirm ? "text" : "password"}
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="••••••••"
        icon={Lock}
        error={errors.confirm}
        suffix={
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <GradientButton onClick={handleSubmit} loading={loading}>
        Réinitialiser
      </GradientButton>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function AuthPage({
  initialView = "login",
  onSuccess,
  onNavigate: _onNavigate,
  onLogin,
  onRegister,
}: AuthPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const startView: AuthView =
    initialView === "register" ? "register-step1" : "login";
  const [view, setView] = useState<AuthView>(startView);
  const [selectedRole, setSelectedRole] = useState("");
  const [prevView, setPrevView] = useState<AuthView>(startView);

  const viewOrder: AuthView[] = [
    "login",
    "forgot",
    "reset",
    "register-step1",
    "register-step2",
  ];

  const handleSwitch = useCallback(
    (next: AuthView) => {
      setPrevView(view);
      setView(next);
    },
    [view],
  );

  const slideDir =
    viewOrder.indexOf(view) >= viewOrder.indexOf(prevView) ? 1 : -1;

  const viewVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 24 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen flex bg-[var(--pc-surface)]"
    >
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] h-screen sticky top-0">
        <LeftPanel />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto min-h-screen">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl">
          <div className="flex lg:hidden items-center gap-3 justify-center mb-6">
            <motion.img
              src="/animali-logo.png"
              alt="Animali.tn"
              className="w-14 h-14 object-contain"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[var(--pc-text-primary)] text-xl font-black">
              Animali<span className="text-[#55D2E1]">.tn</span>
            </span>
          </div>

          <AnimatePresence mode="wait" custom={slideDir}>
            <motion.div
              key={view}
              custom={slideDir}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {view === "login" && (
                <LoginView
                  onSwitch={handleSwitch}
                  onSuccess={onSuccess}
                  onLogin={onLogin}
                />
              )}
              {view === "register-step1" && (
                <RegisterStep1View
                  onSwitch={handleSwitch}
                  selectedRole={selectedRole}
                  onSelectRole={setSelectedRole}
                />
              )}
              {view === "register-step2" && (
                <RegisterStep2View
                  onSwitch={handleSwitch}
                  selectedRole={selectedRole}
                  onSuccess={onSuccess}
                  onRegister={onRegister}
                />
              )}
              {view === "forgot" && <ForgotView onSwitch={handleSwitch} />}
              {view === "reset" && <ResetView onSwitch={handleSwitch} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
