import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Upload,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Clock,
  Users,
  Home,
  CheckCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileSetupPageProps {
  role: 'vet' | 'shop' | 'shelter' | 'breeder';
  onComplete: () => void;
  onSkip: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TUNISIAN_CITIES = ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Bizerte', 'Nabeul', 'Ariana', 'Autres'];

const ROLE_META: Record<string, { label: string; color: string; icon: string }> = {
  vet: { label: 'Vétérinaire', color: 'from-blue-500 to-indigo-600', icon: '🏥' },
  shop: { label: 'Animalerie', color: 'from-amber-500 to-orange-600', icon: '🏪' },
  shelter: { label: 'Refuge / SPA', color: 'from-pink-500 to-rose-600', icon: '🏠' },
  breeder: { label: 'Éleveur', color: 'from-purple-500 to-violet-600', icon: '🐕' },
};

// ─── Shared input components ──────────────────────────────────────────────────

const inputClass =
  'bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40 text-[var(--pc-text-primary)] text-sm transition-all placeholder:text-[var(--pc-text-secondary)]/60';

const labelClass = 'text-[var(--pc-text-primary)] font-semibold text-sm mb-1.5 block';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  error?: string;
}

function FormInput({ label, type = 'text', value, onChange, placeholder, icon: Icon, required, error }: FormInputProps) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] pointer-events-none">
            <Icon size={15} />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} ${Icon ? 'pl-9' : ''} ${error ? 'border-red-400' : ''}`}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function FormSelect({ label, value, onChange, options, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}

function CheckboxGroup({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                checked
                  ? 'bg-[#1D7D5F] border-[#1D7D5F] text-white'
                  : 'bg-[var(--pc-surface-alt)] border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[#1D7D5F]/60',
              ].join(' ')}
            >
              {checked && <span className="mr-1">✓</span>}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({
  label,
  accept = 'image/*',
  multiple = false,
  icon: Icon = Camera,
  hint,
  onFiles,
  previewUrls,
}: {
  label: string;
  accept?: string;
  multiple?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  hint?: string;
  onFiles: (files: File[]) => void;
  previewUrls?: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    onFiles(Array.from(fileList));
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={[
          'border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all flex flex-col items-center gap-2 text-center',
          dragOver
            ? 'border-[#1D7D5F] bg-[#1D7D5F]/5'
            : 'border-[var(--pc-border)] bg-[var(--pc-surface-alt)] hover:border-[#1D7D5F]/60 hover:bg-[#1D7D5F]/5',
        ].join(' ')}
      >
        {previewUrls && previewUrls.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {previewUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
            ))}
          </div>
        ) : (
          <Icon size={28} className="text-[var(--pc-text-secondary)]" />
        )}
        <p className="text-sm text-[var(--pc-text-secondary)] font-medium">
          {previewUrls && previewUrls.length > 0 ? 'Cliquez pour changer' : 'Cliquez ou glissez vos fichiers ici'}
        </p>
        {hint && <p className="text-xs text-[var(--pc-text-secondary)]/70">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ─── Vet form ─────────────────────────────────────────────────────────────────

function VetForm({ onSubmit, loading }: { onSubmit: () => void; loading: boolean }) {
  const [clinicName, setClinicName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [profilePreviews, setProfilePreviews] = useState<string[]>([]);
  const [clinicPreviews, setClinicPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleProfileFiles = (files: File[]) => {
    setProfilePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleClinicFiles = (files: File[]) => {
    setClinicPreviews(files.slice(0, 5).map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!clinicName.trim()) newErrors.clinicName = 'Nom de la clinique requis';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Nom de la clinique"
        value={clinicName}
        onChange={setClinicName}
        placeholder="Clinique Vétérinaire Al-Shifa"
        required
        error={errors.clinicName}
        icon={Home}
      />

      <FormSelect
        label="Spécialité"
        value={specialty}
        onChange={setSpecialty}
        options={['Généraliste', 'Chirurgie', 'Dermatologie', 'Urgences', 'Exotiques', 'Orthopédie']}
        placeholder="Sélectionnez une spécialité"
      />

      <FormInput
        label="Adresse"
        value={address}
        onChange={setAddress}
        placeholder="12 Rue Ibn Khaldoun"
        icon={MapPin}
      />

      <FormSelect
        label="Ville"
        value={city}
        onChange={setCity}
        options={TUNISIAN_CITIES}
        placeholder="Sélectionnez une ville"
      />

      <FormInput
        label="Téléphone"
        type="tel"
        value={phone}
        onChange={setPhone}
        placeholder="+216 12 345 678"
        icon={Phone}
      />

      <FormTextarea
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Décrivez votre clinique, vos services et votre approche…"
        rows={3}
      />

      <FormInput
        label="Horaires de travail"
        value={hours}
        onChange={setHours}
        placeholder="Lun-Ven 8h-18h, Sam 8h-12h"
        icon={Clock}
      />

      <UploadZone
        label="Photo de profil"
        icon={Camera}
        hint="JPG, PNG — max 5 Mo"
        onFiles={handleProfileFiles}
        previewUrls={profilePreviews}
      />

      <UploadZone
        label="Photos de la clinique"
        icon={Upload}
        multiple
        hint="Max 5 photos"
        onFiles={handleClinicFiles}
        previewUrls={clinicPreviews}
      />

      <SubmitButton onClick={handleSubmit} loading={loading} />
    </div>
  );
}

// ─── Shop form ────────────────────────────────────────────────────────────────

function ShopForm({ onSubmit, loading }: { onSubmit: () => void; loading: boolean }) {
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [logoPreviews, setLogoPreviews] = useState<string[]>([]);
  const [coverPreviews, setCoverPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!shopName.trim()) newErrors.shopName = 'Nom de la boutique requis';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Nom de la boutique"
        value={shopName}
        onChange={setShopName}
        placeholder="Animalerie Mon Ami"
        required
        error={errors.shopName}
        icon={Home}
      />

      <FormInput
        label="Adresse"
        value={address}
        onChange={setAddress}
        placeholder="45 Avenue Habib Bourguiba"
        icon={MapPin}
      />

      <FormInput
        label="Téléphone"
        type="tel"
        value={phone}
        onChange={setPhone}
        placeholder="+216 12 345 678"
        icon={Phone}
      />

      <FormTextarea
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Décrivez votre boutique et vos services…"
        rows={3}
      />

      <CheckboxGroup
        label="Catégories vendues"
        options={['Nourriture', 'Accessoires', 'Médicaments', 'Toilettage', 'Cages', 'Jouets']}
        selected={categories}
        onChange={setCategories}
      />

      <UploadZone
        label="Logo"
        icon={Camera}
        hint="JPG, PNG — max 5 Mo"
        onFiles={(files) => setLogoPreviews(files.map((f) => URL.createObjectURL(f)))}
        previewUrls={logoPreviews}
      />

      <UploadZone
        label="Image de couverture"
        icon={Upload}
        hint="Recommandé: 1200×400px"
        onFiles={(files) => setCoverPreviews(files.map((f) => URL.createObjectURL(f)))}
        previewUrls={coverPreviews}
      />

      <SubmitButton onClick={handleSubmit} loading={loading} />
    </div>
  );
}

// ─── Shelter form ─────────────────────────────────────────────────────────────

function ShelterForm({ onSubmit, loading }: { onSubmit: () => void; loading: boolean }) {
  const [orgName, setOrgName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [capacity, setCapacity] = useState('');
  const [animals, setAnimals] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!orgName.trim()) newErrors.orgName = "Nom de l'organisation requis";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Nom de l'organisation"
        value={orgName}
        onChange={setOrgName}
        placeholder="Refuge Les Amis des Animaux"
        required
        error={errors.orgName}
        icon={Home}
      />

      <FormTextarea
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Décrivez votre refuge, votre mission…"
        rows={3}
      />

      <FormInput
        label="Adresse"
        value={address}
        onChange={setAddress}
        placeholder="Rue des Fleurs, Tunis"
        icon={MapPin}
      />

      <FormInput
        label="Téléphone de contact"
        type="tel"
        value={contactPhone}
        onChange={setContactPhone}
        placeholder="+216 12 345 678"
        icon={Phone}
      />

      <FormInput
        label="Email de contact"
        type="email"
        value={contactEmail}
        onChange={setContactEmail}
        placeholder="contact@refuge.tn"
        icon={Mail}
      />

      <FormInput
        label="Capacité d'accueil"
        type="number"
        value={capacity}
        onChange={setCapacity}
        placeholder="50"
        icon={Users}
      />

      <CheckboxGroup
        label="Animaux acceptés"
        options={['Chiens', 'Chats', 'Lapins', 'Oiseaux', 'Autres']}
        selected={animals}
        onChange={setAnimals}
      />

      <SubmitButton onClick={handleSubmit} loading={loading} />
    </div>
  );
}

// ─── Breeder form ─────────────────────────────────────────────────────────────

function BreederForm({ onSubmit, loading }: { onSubmit: () => void; loading: boolean }) {
  const [breedingName, setBreedingName] = useState('');
  const [animalCategories, setAnimalCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [certifications, setCertifications] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!breedingName.trim()) newErrors.breedingName = "Nom de l'élevage requis";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Nom de l'élevage"
        value={breedingName}
        onChange={setBreedingName}
        placeholder="Élevage Al-Amal"
        required
        error={errors.breedingName}
        icon={Home}
      />

      <CheckboxGroup
        label="Catégories d'animaux"
        options={['Chiens', 'Chats', 'Lapins', 'Oiseaux', 'Reptiles']}
        selected={animalCategories}
        onChange={setAnimalCategories}
      />

      <FormTextarea
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Présentez votre élevage, vos méthodes, vos valeurs…"
        rows={3}
      />

      <FormSelect
        label="Localisation"
        value={city}
        onChange={setCity}
        options={TUNISIAN_CITIES}
        placeholder="Sélectionnez une ville"
      />

      <FormInput
        label="Certifications"
        value={certifications}
        onChange={setCertifications}
        placeholder="Ex : ANCSEP, agréé ministère…"
        icon={FileText}
      />

      <FormInput
        label="Site web"
        type="url"
        value={website}
        onChange={setWebsite}
        placeholder="https://votre-site.tn"
        icon={Globe}
      />

      <SubmitButton onClick={handleSubmit} loading={loading} />
    </div>
  );
}

// ─── Submit button (shared) ───────────────────────────────────────────────────

function SubmitButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="gradient-btn w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
        font-semibold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Création en cours…
        </>
      ) : (
        <>
          <CheckCircle size={16} />
          Créer mon profil
        </>
      )}
    </button>
  );
}

// ─── Progress indicator ───────────────────────────────────────────────────────

function ProgressIndicator({ role }: { role: string }) {
  const steps = ['Inscription', 'Profil', 'Terminé'];
  const current = 1; // We're on step 2 (Profil)

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={[
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            i < current
              ? 'bg-[#1D7D5F] text-white'
              : i === current
                ? 'bg-[#1D7D5F] text-white ring-4 ring-[#1D7D5F]/20'
                : 'bg-[var(--pc-border)] text-[var(--pc-text-secondary)]',
          ].join(' ')}>
            {i < current ? <CheckCircle size={14} /> : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-[var(--pc-text-primary)]' : 'text-[var(--pc-text-secondary)]'}`}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px ${i < current ? 'bg-[#1D7D5F]' : 'bg-[var(--pc-border)]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function ProfileSetupPage({ role, onComplete, onSkip }: ProfileSetupPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [loading, setLoading] = useState(false);

  const meta = ROLE_META[role];

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onComplete();
  }, [onComplete]);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[var(--pc-surface)] flex flex-col"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[var(--pc-surface)]/80 backdrop-blur-sm border-b border-[var(--pc-border)] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-[var(--pc-text-primary)] text-lg font-black hidden sm:block">
              Animali<span className="text-[#F4A732]">.tn</span>
            </span>
          </div>

          <ProgressIndicator role={role} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-3"
          >
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--pc-text-primary)]">
              Configurer votre profil
            </h1>
            <p className="text-[var(--pc-text-secondary)] text-sm">
              Complétez votre profil pour commencer à utiliser Animali.tn
            </p>

            {/* Role badge */}
            <div className="inline-flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${meta.color}`}>
                <span>{meta.icon}</span>
                {meta.label}
              </span>
            </div>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            {/* Form title */}
            <h2 className="text-lg font-black text-[var(--pc-text-primary)] mb-6 flex items-center gap-2">
              <span className="text-xl">{meta.icon}</span>
              {role === 'vet' && 'Profil Vétérinaire'}
              {role === 'shop' && 'Profil Animalerie'}
              {role === 'shelter' && 'Profil Refuge'}
              {role === 'breeder' && 'Profil Éleveur'}
            </h2>

            {role === 'vet' && <VetForm onSubmit={handleSubmit} loading={loading} />}
            {role === 'shop' && <ShopForm onSubmit={handleSubmit} loading={loading} />}
            {role === 'shelter' && <ShelterForm onSubmit={handleSubmit} loading={loading} />}
            {role === 'breeder' && <BreederForm onSubmit={handleSubmit} loading={loading} />}
          </motion.div>

          {/* Skip link */}
          <div className="text-center pb-8">
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
            >
              Configurer plus tard →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
