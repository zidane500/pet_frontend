import { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Phone,
  Globe,
  FileText,
  Stethoscope,
  Store,
  Heart,
  PawPrint,
  Camera,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import client from "../../api/client";

// ── Types ──────────────────────────────────────────────────────

type Role = "vet" | "shop" | "shelter" | "breeder" | "owner";

interface BaseForm {
  phone: string;
  city: string;
  address: string;
  description: string;
  website: string;
}

interface VetForm extends BaseForm {
  speciality: string;
  clinic_name: string;
  years_experience: string;
}

interface ShopForm extends BaseForm {
  shop_name: string;
  opening_hours: string;
}

interface ShelterForm extends BaseForm {
  shelter_name: string;
  capacity: string;
}

interface BreederForm extends BaseForm {
  breeder_name: string;
  speciality: string;
}

// ── Metadata par rôle ──────────────────────────────────────────

const ROLE_META: Record<
  Role,
  { label: string; icon: React.ElementType; color: string }
> = {
  vet: { label: "Vétérinaire", icon: Stethoscope, color: "text-blue-500" },
  shop: { label: "Animalerie", icon: Store, color: "text-purple-500" },
  shelter: { label: "Refuge", icon: Heart, color: "text-rose-500" },
  breeder: { label: "Éleveur", icon: PawPrint, color: "text-amber-500" },
  owner: { label: "Propriétaire", icon: Check, color: "text-green-500" },
};

// ── Composants input partagés ──────────────────────────────────

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--pc-surface-2)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] text-sm placeholder:text-[var(--pc-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)] transition-all";

function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--pc-text-secondary)] uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)]"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} ${Icon ? "pl-9" : ""} ${error ? "border-red-400" : ""}`}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 500,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--pc-text-secondary)] uppercase tracking-wide">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={maxLength}
        className={`${inputClass} resize-none`}
      />
      <p className="text-xs text-[var(--pc-text-secondary)] text-right">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}

// ── Formulaire Vétérinaire ─────────────────────────────────────

function VetFormFields({
  form,
  setForm,
  errors,
}: {
  form: VetForm;
  setForm: React.Dispatch<React.SetStateAction<VetForm>>;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Nom de la clinique"
        value={form.clinic_name}
        onChange={(v) => setForm((f) => ({ ...f, clinic_name: v }))}
        placeholder="Clinique Vétérinaire El Amal"
        icon={Stethoscope}
        required
        error={errors.clinic_name}
      />
      <FormInput
        label="Spécialité"
        value={form.speciality}
        onChange={(v) => setForm((f) => ({ ...f, speciality: v }))}
        placeholder="Chirurgie, Dermatologie, Généraliste..."
        error={errors.speciality}
      />
      <FormInput
        label="Années d'expérience"
        type="number"
        value={form.years_experience}
        onChange={(v) => setForm((f) => ({ ...f, years_experience: v }))}
        placeholder="5"
      />
      <FormInput
        label="Téléphone"
        type="tel"
        value={form.phone}
        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        placeholder="+216 XX XXX XXX"
        icon={Phone}
        required
        error={errors.phone}
      />
      <FormInput
        label="Ville"
        value={form.city}
        onChange={(v) => setForm((f) => ({ ...f, city: v }))}
        placeholder="Tunis, Sfax, Sousse..."
        icon={MapPin}
        required
        error={errors.city}
      />
      <FormInput
        label="Adresse"
        value={form.address}
        onChange={(v) => setForm((f) => ({ ...f, address: v }))}
        placeholder="Rue, quartier..."
        icon={MapPin}
      />
      <FormInput
        label="Site web"
        value={form.website}
        onChange={(v) => setForm((f) => ({ ...f, website: v }))}
        placeholder="www.mavet.tn"
        icon={Globe}
      />
      <FormTextarea
        label="Description"
        value={form.description}
        onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        placeholder="Décrivez votre clinique et vos services..."
      />
    </div>
  );
}

// ── Formulaire Animalerie ──────────────────────────────────────

function ShopFormFields({
  form,
  setForm,
  errors,
}: {
  form: ShopForm;
  setForm: React.Dispatch<React.SetStateAction<ShopForm>>;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Nom de l'animalerie"
        value={form.shop_name}
        onChange={(v) => setForm((f) => ({ ...f, shop_name: v }))}
        placeholder="Pet World Tunis"
        icon={Store}
        required
        error={errors.shop_name}
      />
      <FormInput
        label="Téléphone"
        type="tel"
        value={form.phone}
        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        placeholder="+216 XX XXX XXX"
        icon={Phone}
        required
        error={errors.phone}
      />
      <FormInput
        label="Ville"
        value={form.city}
        onChange={(v) => setForm((f) => ({ ...f, city: v }))}
        placeholder="Tunis, Sfax, Sousse..."
        icon={MapPin}
        required
        error={errors.city}
      />
      <FormInput
        label="Adresse"
        value={form.address}
        onChange={(v) => setForm((f) => ({ ...f, address: v }))}
        placeholder="Rue, quartier..."
        icon={MapPin}
      />
      <FormInput
        label="Horaires d'ouverture"
        value={form.opening_hours}
        onChange={(v) => setForm((f) => ({ ...f, opening_hours: v }))}
        placeholder="Lun-Sam 9h-18h"
        icon={FileText}
      />
      <FormInput
        label="Site web"
        value={form.website}
        onChange={(v) => setForm((f) => ({ ...f, website: v }))}
        placeholder="www.monanimalerie.tn"
        icon={Globe}
      />
      <FormTextarea
        label="Description"
        value={form.description}
        onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        placeholder="Décrivez votre animalerie et vos produits..."
      />
    </div>
  );
}

// ── Formulaire Refuge ──────────────────────────────────────────

function ShelterFormFields({
  form,
  setForm,
  errors,
}: {
  form: ShelterForm;
  setForm: React.Dispatch<React.SetStateAction<ShelterForm>>;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Nom du refuge"
        value={form.shelter_name}
        onChange={(v) => setForm((f) => ({ ...f, shelter_name: v }))}
        placeholder="Refuge Espoir Tunis"
        icon={Heart}
        required
        error={errors.shelter_name}
      />
      <FormInput
        label="Capacité d'accueil"
        type="number"
        value={form.capacity}
        onChange={(v) => setForm((f) => ({ ...f, capacity: v }))}
        placeholder="50"
      />
      <FormInput
        label="Téléphone"
        type="tel"
        value={form.phone}
        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        placeholder="+216 XX XXX XXX"
        icon={Phone}
        required
        error={errors.phone}
      />
      <FormInput
        label="Ville"
        value={form.city}
        onChange={(v) => setForm((f) => ({ ...f, city: v }))}
        placeholder="Tunis, Sfax, Sousse..."
        icon={MapPin}
        required
        error={errors.city}
      />
      <FormInput
        label="Adresse"
        value={form.address}
        onChange={(v) => setForm((f) => ({ ...f, address: v }))}
        placeholder="Rue, quartier..."
        icon={MapPin}
      />
      <FormInput
        label="Site web"
        value={form.website}
        onChange={(v) => setForm((f) => ({ ...f, website: v }))}
        placeholder="www.monrefuge.tn"
        icon={Globe}
      />
      <FormTextarea
        label="Description"
        value={form.description}
        onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        placeholder="Décrivez votre refuge et votre mission..."
      />
    </div>
  );
}

// ── Formulaire Éleveur ─────────────────────────────────────────

function BreederFormFields({
  form,
  setForm,
  errors,
}: {
  form: BreederForm;
  setForm: React.Dispatch<React.SetStateAction<BreederForm>>;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Nom de l'élevage"
        value={form.breeder_name}
        onChange={(v) => setForm((f) => ({ ...f, breeder_name: v }))}
        placeholder="Élevage Atlas"
        icon={PawPrint}
        required
        error={errors.breeder_name}
      />
      <FormInput
        label="Spécialité (races)"
        value={form.speciality}
        onChange={(v) => setForm((f) => ({ ...f, speciality: v }))}
        placeholder="Berger Allemand, Labrador..."
        error={errors.speciality}
      />
      <FormInput
        label="Téléphone"
        type="tel"
        value={form.phone}
        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        placeholder="+216 XX XXX XXX"
        icon={Phone}
        required
        error={errors.phone}
      />
      <FormInput
        label="Ville"
        value={form.city}
        onChange={(v) => setForm((f) => ({ ...f, city: v }))}
        placeholder="Tunis, Sfax, Sousse..."
        icon={MapPin}
        required
        error={errors.city}
      />
      <FormInput
        label="Adresse"
        value={form.address}
        onChange={(v) => setForm((f) => ({ ...f, address: v }))}
        placeholder="Rue, quartier..."
        icon={MapPin}
      />
      <FormInput
        label="Site web"
        value={form.website}
        onChange={(v) => setForm((f) => ({ ...f, website: v }))}
        placeholder="www.monelevage.tn"
        icon={Globe}
      />
      <FormTextarea
        label="Description"
        value={form.description}
        onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        placeholder="Décrivez votre élevage et vos pratiques..."
      />
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────

interface ProfileSetupPageProps {
  role: Role;
  onComplete: () => void;
  onSkip: () => void;
}

export function ProfileSetupPage({
  role,
  onComplete,
  onSkip,
}: ProfileSetupPageProps) {
  const { i18n } = useTranslation();
  const { updateUser } = useAuth();
  const isRtl = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // États formulaires par rôle
  const [vetForm, setVetForm] = useState<VetForm>({
    clinic_name: "",
    speciality: "",
    years_experience: "",
    phone: "",
    city: "",
    address: "",
    description: "",
    website: "",
  });
  const [shopForm, setShopForm] = useState<ShopForm>({
    shop_name: "",
    opening_hours: "",
    phone: "",
    city: "",
    address: "",
    description: "",
    website: "",
  });
  const [shelterForm, setShelterForm] = useState<ShelterForm>({
    shelter_name: "",
    capacity: "",
    phone: "",
    city: "",
    address: "",
    description: "",
    website: "",
  });
  const [breederForm, setBreederForm] = useState<BreederForm>({
    breeder_name: "",
    speciality: "",
    phone: "",
    city: "",
    address: "",
    description: "",
    website: "",
  });

  const meta = ROLE_META[role];

  // ── Validation ─────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (role === "vet") {
      if (!vetForm.clinic_name.trim()) errs.clinic_name = "Champ obligatoire";
      if (!vetForm.phone.trim()) errs.phone = "Champ obligatoire";
      if (!vetForm.city.trim()) errs.city = "Champ obligatoire";
    }
    if (role === "shop") {
      if (!shopForm.shop_name.trim()) errs.shop_name = "Champ obligatoire";
      if (!shopForm.phone.trim()) errs.phone = "Champ obligatoire";
      if (!shopForm.city.trim()) errs.city = "Champ obligatoire";
    }
    if (role === "shelter") {
      if (!shelterForm.shelter_name.trim())
        errs.shelter_name = "Champ obligatoire";
      if (!shelterForm.phone.trim()) errs.phone = "Champ obligatoire";
      if (!shelterForm.city.trim()) errs.city = "Champ obligatoire";
    }
    if (role === "breeder") {
      if (!breederForm.breeder_name.trim())
        errs.breeder_name = "Champ obligatoire";
      if (!breederForm.phone.trim()) errs.phone = "Champ obligatoire";
      if (!breederForm.city.trim()) errs.city = "Champ obligatoire";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Mise à jour du profil utilisateur de base
      let profilePayload: Record<string, any> = {};
      let entityPayload: Record<string, any> = {};
      let entityEndpoint = "";

      if (role === "vet") {
        profilePayload = { phone: vetForm.phone, city: vetForm.city };
        entityPayload = {
          name: vetForm.clinic_name,
          speciality: vetForm.speciality,
          years_experience: Number(vetForm.years_experience) || 0,
          phone: vetForm.phone,
          city: vetForm.city,
          address: vetForm.address,
          description: vetForm.description,
          website: vetForm.website,
        };
        entityEndpoint = "/vets";
      }

      if (role === "shop") {
        profilePayload = { phone: shopForm.phone, city: shopForm.city };
        entityPayload = {
          name: shopForm.shop_name,
          opening_hours: shopForm.opening_hours,
          phone: shopForm.phone,
          city: shopForm.city,
          address: shopForm.address,
          description: shopForm.description,
          website: shopForm.website,
        };
        entityEndpoint = "/pet-stores";
      }

      if (role === "shelter") {
        profilePayload = { phone: shelterForm.phone, city: shelterForm.city };
        entityPayload = {
          name: shelterForm.shelter_name,
          capacity: Number(shelterForm.capacity) || 0,
          phone: shelterForm.phone,
          city: shelterForm.city,
          address: shelterForm.address,
          description: shelterForm.description,
          website: shelterForm.website,
        };
        entityEndpoint = "/shelters";
      }

      if (role === "breeder") {
        profilePayload = { phone: breederForm.phone, city: breederForm.city };
        entityPayload = {
          name: breederForm.breeder_name,
          speciality: breederForm.speciality,
          phone: breederForm.phone,
          city: breederForm.city,
          address: breederForm.address,
          description: breederForm.description,
          website: breederForm.website,
        };
        entityEndpoint = "/breeders";
      }

      // 2. Mise à jour du profil utilisateur
      if (Object.keys(profilePayload).length > 0) {
        const { data } = await client.put("/profile", profilePayload);
        updateUser(data.user ?? data);
      }

      // 3. Création de l'entité métier (vet, shop, shelter, breeder)
      if (entityEndpoint && Object.keys(entityPayload).length > 0) {
        await client.post(entityEndpoint, entityPayload);
      }

      onComplete();
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors ?? {};
      if (Object.keys(apiErrors).length > 0) {
        const mapped: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(mapped);
      } else {
        setError(
          err?.response?.data?.message ?? "Une erreur est survenue. Réessayez.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    role,
    vetForm,
    shopForm,
    shelterForm,
    breederForm,
    updateUser,
    onComplete,
  ]);

  // ── Rendu ──────────────────────────────────────────────────

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--pc-surface)] flex flex-col"
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[var(--pc-surface)]/80 backdrop-blur-sm border-b border-[var(--pc-border)] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-[var(--pc-text-primary)] text-lg font-black hidden sm:block">
              Animali<span className="text-[#F4A732]">.tn</span>
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-[var(--pc-text-secondary)] text-sm hover:text-[var(--pc-text-primary)] transition-colors"
          >
            Passer cette étape →
          </button>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-3"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-[var(--pc-surface-2)] flex items-center justify-center mx-auto ${meta.color}`}
            >
              <meta.icon size={28} />
            </div>
            <h1 className="text-[var(--pc-text-primary)] text-2xl font-bold">
              Configurez votre profil {meta.label}
            </h1>
            <p className="text-[var(--pc-text-secondary)] text-sm max-w-md mx-auto">
              Ces informations seront visibles par les utilisateurs de la
              plateforme. Vous pourrez les modifier à tout moment dans vos
              paramètres.
            </p>
          </motion.div>

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-[var(--pc-surface-2)] rounded-2xl p-6 space-y-4"
          >
            {role === "vet" && (
              <VetFormFields
                form={vetForm}
                setForm={setVetForm}
                errors={errors}
              />
            )}
            {role === "shop" && (
              <ShopFormFields
                form={shopForm}
                setForm={setShopForm}
                errors={errors}
              />
            )}
            {role === "shelter" && (
              <ShelterFormFields
                form={shelterForm}
                setForm={setShelterForm}
                errors={errors}
              />
            )}
            {role === "breeder" && (
              <BreederFormFields
                form={breederForm}
                setForm={setBreederForm}
                errors={errors}
              />
            )}
            {role === "owner" && (
              <div className="text-center py-8 space-y-3">
                <Check size={40} className="text-green-500 mx-auto" />
                <p className="text-[var(--pc-text-primary)] font-semibold">
                  Votre compte est prêt !
                </p>
                <p className="text-[var(--pc-text-secondary)] text-sm">
                  Vous pouvez commencer à explorer la plateforme.
                </p>
              </div>
            )}
          </motion.div>

          {/* Erreur globale */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl text-center">
              {error}
            </p>
          )}

          {/* Bouton submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl bg-[#F4A732] text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enregistrement...
              </>
            ) : role === "owner" ? (
              <>
                <Check size={18} />
                Commencer
              </>
            ) : (
              <>
                Enregistrer mon profil
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
