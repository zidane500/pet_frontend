import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Upload,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCreateListing } from "../../hooks/useListings";
import { uploadApi } from "../../api/upload";
import { useAuthStore } from "../../store/authStore";

interface CreateListingPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  {
    id: "adoption",
    icon: "💚",
    label: "Adoption",
    desc: "Donnez une chance à un animal",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "vente",
    icon: "💰",
    label: "Vente",
    desc: "Vendez votre animal",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "perdu",
    icon: "🔍",
    label: "Animal perdu",
    desc: "Signalez un animal disparu",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "trouve",
    icon: "🏠",
    label: "Animal trouvé",
    desc: "Vous avez trouvé un animal",
    color: "from-purple-500 to-violet-500",
  },
  {
    id: "accouplement",
    icon: "🤝",
    label: "Accouplement",
    desc: "Recherche pour reproduction",
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "conseils",
    icon: "💡",
    label: "Conseil / Discussion",
    desc: "Partagez votre expérience",
    color: "from-pink-500 to-rose-500",
  },
];

const SPECIES = [
  "Chien",
  "Chat",
  "Lapin",
  "Oiseau",
  "Reptile",
  "Poisson",
  "Rongeur",
  "Autre",
];
const AGE_UNITS = ["mois", "ans"];
const SEX_OPTIONS = ["Mâle", "Femelle", "Inconnu"];
const GOVERNORATES = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kébili",
  "Kef",
  "Mahdia",
  "Manouba",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
];
const STEP_LABELS = ["Catégorie", "Infos", "Photos", "Localisation", "Publier"];

interface FormData {
  category: string;
  title: string;
  species: string;
  breed: string;
  ageValue: string;
  ageUnit: string;
  sex: string;
  price: string;
  isFree: boolean;
  vaccinated: boolean;
  sterilized: boolean;
  description: string;
  governorate: string;
  city: string;
  phone: string;
  email: string;
}

const initialForm: FormData = {
  category: "",
  title: "",
  species: "",
  breed: "",
  ageValue: "",
  ageUnit: "ans",
  sex: "",
  price: "",
  isFree: false,
  vaccinated: false,
  sterilized: false,
  description: "",
  governorate: "",
  city: "",
  phone: "",
  email: "",
};

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({
  form,
  updateForm,
}: {
  form: FormData;
  updateForm: (k: keyof FormData, v: string | boolean) => void;
}) {
  return (
    <div>
      <h2
        className="text-xl font-bold mb-1"
        style={{ color: "var(--pc-text-primary)" }}
      >
        Type d'annonce
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--pc-text-secondary)" }}>
        Choisissez la catégorie qui correspond le mieux
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const selected = form.category === cat.id;
          return (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => updateForm("category", cat.id)}
              className={[
                "relative text-left p-4 rounded-2xl border-2 transition-all",
                selected
                  ? "border-[var(--pc-primary)] bg-[var(--pc-primary)]/5"
                  : "border-[var(--pc-border)] bg-[var(--pc-surface-alt)] hover:border-[var(--pc-primary)]/40",
              ].join(" ")}
            >
              {selected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--pc-primary)] flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
              )}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl mb-3`}
              >
                {cat.icon}
              </div>
              <p
                className="font-bold text-sm"
                style={{ color: "var(--pc-text-primary)" }}
              >
                {cat.label}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--pc-text-secondary)" }}
              >
                {cat.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({
  form,
  updateForm,
}: {
  form: FormData;
  updateForm: (k: keyof FormData, v: string | boolean) => void;
}) {
  const charCount = form.description.length;
  return (
    <div className="space-y-4">
      <h2
        className="text-xl font-bold"
        style={{ color: "var(--pc-text-primary)" }}
      >
        Informations sur l'animal
      </h2>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Titre de l'annonce <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
          placeholder="Ex: Max — Berger Allemand 3 ans"
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{
            background: "var(--pc-surface-alt)",
            borderColor: form.title ? "var(--pc-primary)" : "var(--pc-border)",
            color: "var(--pc-text-primary)",
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--pc-text-primary)" }}
          >
            Espèce <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div className="relative">
            <select
              value={form.species}
              onChange={(e) => updateForm("species", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border text-sm outline-none appearance-none pr-8"
              style={{
                background: "var(--pc-surface-alt)",
                borderColor: form.species
                  ? "var(--pc-primary)"
                  : "var(--pc-border)",
                color: "var(--pc-text-primary)",
              }}
            >
              <option value="">Choisir…</option>
              {SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--pc-text-secondary)" }}
            />
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--pc-text-primary)" }}
          >
            Race
          </label>
          <input
            type="text"
            value={form.breed}
            onChange={(e) => updateForm("breed", e.target.value)}
            placeholder="Ex: Berger Allemand"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: "var(--pc-surface-alt)",
              borderColor: "var(--pc-border)",
              color: "var(--pc-text-primary)",
            }}
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Âge
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={form.ageValue}
            onChange={(e) => updateForm("ageValue", e.target.value)}
            placeholder="Ex: 3"
            min="0"
            className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: "var(--pc-surface-alt)",
              borderColor: "var(--pc-border)",
              color: "var(--pc-text-primary)",
            }}
          />
          <div className="relative">
            <select
              value={form.ageUnit}
              onChange={(e) => updateForm("ageUnit", e.target.value)}
              className="px-4 py-3 rounded-2xl border text-sm outline-none appearance-none pr-8"
              style={{
                background: "var(--pc-surface-alt)",
                borderColor: "var(--pc-border)",
                color: "var(--pc-text-primary)",
              }}
            >
              {AGE_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--pc-text-secondary)" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--pc-text-primary)" }}
          >
            Sexe
          </label>
          <div className="flex gap-2">
            {SEX_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateForm("sex", opt)}
                className="flex-1 py-2 rounded-xl border text-xs font-medium transition-all"
                style={{
                  background:
                    form.sex === opt
                      ? "var(--pc-primary)"
                      : "var(--pc-surface-alt)",
                  borderColor:
                    form.sex === opt ? "var(--pc-primary)" : "var(--pc-border)",
                  color:
                    form.sex === opt ? "white" : "var(--pc-text-secondary)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--pc-text-primary)" }}
          >
            Prix
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => updateForm("isFree", e.target.checked)}
                className="accent-[var(--pc-primary)]"
              />
              <span
                className="text-sm"
                style={{ color: "var(--pc-text-secondary)" }}
              >
                Gratuit / Adoption
              </span>
            </label>
            {!form.isFree && (
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none pr-12"
                  style={{
                    background: "var(--pc-surface-alt)",
                    borderColor: "var(--pc-border)",
                    color: "var(--pc-text-primary)",
                  }}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                  style={{ color: "var(--pc-text-secondary)" }}
                >
                  DT
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.vaccinated}
            onChange={(e) => updateForm("vaccinated", e.target.checked)}
            className="accent-[var(--pc-primary)]"
          />
          <span
            className="text-sm"
            style={{ color: "var(--pc-text-secondary)" }}
          >
            Vacciné
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.sterilized}
            onChange={(e) => updateForm("sterilized", e.target.checked)}
            className="accent-[var(--pc-primary)]"
          />
          <span
            className="text-sm"
            style={{ color: "var(--pc-text-secondary)" }}
          >
            Stérilisé
          </span>
        </label>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateForm("description", e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Décrivez l'animal, son caractère, ses habitudes..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none"
          style={{
            background: "var(--pc-surface-alt)",
            borderColor: "var(--pc-border)",
            color: "var(--pc-text-primary)",
          }}
        />
        <p
          className="text-xs text-right mt-1"
          style={{ color: "var(--pc-text-secondary)" }}
        >
          {charCount}/1000
        </p>
      </div>
    </div>
  );
}

// ─── Step 3 — Photos avec upload réel ────────────────────────────────────────
function Step3({
  photos,
  onPhotosChange,
}: {
  photos: string[];
  onPhotosChange: (urls: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList) => {
    setError("");
    const MAX = 5;
    const remaining = MAX - photos.length;
    if (remaining <= 0) {
      setError("Maximum 5 photos");
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const urls = await Promise.all(
        toUpload.map((f) => uploadApi.upload(f, "listings").then((r) => r.url)),
      );
      onPhotosChange([...photos, ...urls]);
    } catch {
      setError("Erreur lors du téléchargement. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (i: number) => {
    onPhotosChange(photos.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <h2
        className="text-xl font-bold mb-1"
        style={{ color: "var(--pc-text-primary)" }}
      >
        Photos
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--pc-text-secondary)" }}>
        Ajoutez jusqu'à 5 photos (JPG, PNG, WebP · max 5 Mo chacune)
      </p>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-3 bg-red-500/10 rounded-xl px-3 py-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[var(--pc-primary)]"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X size={12} className="text-white" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-[var(--pc-primary)] text-white px-1.5 py-0.5 rounded-full font-bold">
                Principale
              </span>
            )}
          </div>
        ))}

        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-[var(--pc-primary)] disabled:opacity-50"
            style={{
              borderColor: "var(--pc-border)",
              background: "var(--pc-surface-alt)",
            }}
          >
            {uploading ? (
              <Loader2
                size={20}
                className="animate-spin"
                style={{ color: "var(--pc-primary)" }}
              />
            ) : (
              <>
                <Upload
                  size={20}
                  style={{ color: "var(--pc-text-secondary)" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--pc-text-secondary)" }}
                >
                  Ajouter
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <p
        className="text-xs text-center"
        style={{ color: "var(--pc-text-secondary)" }}
      >
        {photos.length}/5 photos ajoutées
      </p>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
function Step4({
  form,
  updateForm,
}: {
  form: FormData;
  updateForm: (k: keyof FormData, v: string | boolean) => void;
}) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="space-y-4">
      <h2
        className="text-xl font-bold"
        style={{ color: "var(--pc-text-primary)" }}
      >
        Localisation & Contact
      </h2>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Gouvernorat <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div className="relative">
          <MapPin
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--pc-text-secondary)" }}
          />
          <select
            value={form.governorate}
            onChange={(e) => updateForm("governorate", e.target.value)}
            className="w-full pl-9 pr-8 py-3 rounded-2xl border text-sm outline-none appearance-none"
            style={{
              background: "var(--pc-surface-alt)",
              borderColor: form.governorate
                ? "var(--pc-primary)"
                : "var(--pc-border)",
              color: "var(--pc-text-primary)",
            }}
          >
            <option value="">Choisir…</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--pc-text-secondary)" }}
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Ville / Quartier
        </label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => updateForm("city", e.target.value)}
          placeholder="Ex: La Marsa, El Menzah..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{
            background: "var(--pc-surface-alt)",
            borderColor: "var(--pc-border)",
            color: "var(--pc-text-primary)",
          }}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Téléphone de contact
        </label>
        <div className="relative">
          <Phone
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--pc-text-secondary)" }}
          />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
            placeholder={user?.phone ?? "+216 XX XXX XXX"}
            className="w-full pl-9 pr-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: "var(--pc-surface-alt)",
              borderColor: "var(--pc-border)",
              color: "var(--pc-text-primary)",
            }}
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Email de contact
        </label>
        <div className="relative">
          <Mail
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--pc-text-secondary)" }}
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            placeholder={user?.email ?? "votre@email.com"}
            className="w-full pl-9 pr-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: "var(--pc-surface-alt)",
              borderColor: "var(--pc-border)",
              color: "var(--pc-text-primary)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 5 — Récapitulatif + Publication ─────────────────────────────────────
function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: "var(--pc-surface-alt)" }}
    >
      <p className="text-xs" style={{ color: "var(--pc-text-secondary)" }}>
        {label}
      </p>
      <p
        className="text-sm font-semibold mt-0.5"
        style={{ color: "var(--pc-text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

function Step5({
  form,
  photos,
  onPublish,
  loading,
  error,
}: {
  form: FormData;
  photos: string[];
  onPublish: () => void;
  loading: boolean;
  error?: string;
}) {
  const cat = CATEGORIES.find((c) => c.id === form.category);
  return (
    <div>
      <h2
        className="text-xl font-bold mb-1"
        style={{ color: "var(--pc-text-primary)" }}
      >
        Récapitulatif
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--pc-text-secondary)" }}>
        Vérifiez les informations avant de publier
      </p>

      {photos.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      )}

      <div className="glass-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cat?.icon ?? "📋"}</span>
          <span
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{
              background: "var(--pc-surface-alt)",
              color: "var(--pc-primary)",
            }}
          >
            {cat?.label ?? form.category}
          </span>
        </div>
        {form.title && (
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide mb-1"
              style={{ color: "var(--pc-text-secondary)" }}
            >
              Titre
            </p>
            <p
              className="font-bold text-lg"
              style={{ color: "var(--pc-text-primary)" }}
            >
              {form.title}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {form.species && <SummaryField label="Espèce" value={form.species} />}
          {form.breed && <SummaryField label="Race" value={form.breed} />}
          {form.ageValue && (
            <SummaryField
              label="Âge"
              value={`${form.ageValue} ${form.ageUnit}`}
            />
          )}
          {form.sex && <SummaryField label="Sexe" value={form.sex} />}
          <SummaryField
            label="Prix"
            value={
              form.isFree ? "Gratuit" : form.price ? `${form.price} DT` : "N/A"
            }
          />
          <SummaryField
            label="Vacciné"
            value={form.vaccinated ? "✅ Oui" : "❌ Non"}
          />
          <SummaryField
            label="Stérilisé"
            value={form.sterilized ? "✅ Oui" : "❌ Non"}
          />
          {form.governorate && (
            <SummaryField label="Gouvernorat" value={form.governorate} />
          )}
          {form.city && <SummaryField label="Ville" value={form.city} />}
        </div>
        {form.description && (
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide mb-1"
              style={{ color: "var(--pc-text-secondary)" }}
            >
              Description
            </p>
            <p
              className="text-sm line-clamp-3"
              style={{ color: "var(--pc-text-primary)" }}
            >
              {form.description}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-3 bg-red-500/10 rounded-xl px-3 py-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPublish}
        disabled={loading}
        className="w-full mt-5 py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Publication...
          </>
        ) : (
          "Publier l'annonce 🚀"
        )}
      </motion.button>
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────
function SuccessState({
  onView,
  onAnother,
}: {
  onView: () => void;
  onAnother: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col items-center text-center py-12 gap-5"
    >
      <div className="text-6xl">✨🎉✨</div>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
        }}
      >
        <Check size={36} className="text-white" strokeWidth={3} />
      </div>
      <div>
        <h2
          className="text-2xl font-black"
          style={{ color: "var(--pc-text-primary)" }}
        >
          Annonce publiée !
        </h2>
        <p
          className="text-sm mt-2"
          style={{ color: "var(--pc-text-secondary)" }}
        >
          Votre annonce est maintenant visible par tous les utilisateurs
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onView}
          className="py-3 rounded-2xl font-bold text-white"
          style={{
            background: "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
          }}
        >
          Voir mes annonces
        </button>
        <button
          type="button"
          onClick={onAnother}
          className="py-3 rounded-2xl font-semibold border"
          style={{
            color: "var(--pc-text-secondary)",
            borderColor: "var(--pc-border)",
          }}
        >
          Publier une autre annonce
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CreateListingPage({
  onBack,
  onSuccess,
}: CreateListingPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [photos, setPhotos] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState("");

  const createListing = useCreateListing();

  const updateForm = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canGoNext = (): boolean => {
    if (step === 1) return !!form.category;
    if (step === 2) return !!(form.title && form.species);
    if (step === 4) return !!form.governorate;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 5));
  };

  const goPrev = () => {
    setDirection(-1);
    if (step === 1) {
      onBack();
      return;
    }
    setStep((s) => s - 1);
  };

  const handlePublish = async () => {
    setPublishError("");
    try {
      const ageInMonths = form.ageValue
        ? form.ageUnit === "ans"
          ? parseInt(form.ageValue) * 12
          : parseInt(form.ageValue)
        : undefined;

      await createListing.mutateAsync({
        title: form.title,
        type: form.category as any,
        species: form.species || undefined,
        breed: form.breed || undefined,
        price: form.isFree
          ? undefined
          : form.price
            ? parseFloat(form.price)
            : undefined,
        is_free: form.isFree,
        is_vaccinated: form.vaccinated,
        is_sterilized: form.sterilized,
        description: form.description || undefined,
        region: form.governorate || undefined,
        city: form.city || undefined,
        contact_phone: form.phone || undefined,
        contact_email: form.email || undefined,
        photos: photos.length > 0 ? photos : undefined,
      } as any);

      setPublished(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Erreur lors de la publication. Vérifiez que vous êtes connecté.";
      setPublishError(msg);
    }
  };

  if (published) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "var(--pc-surface)" }}
      >
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <SuccessState
              onView={onSuccess}
              onAnother={() => {
                setForm(initialForm);
                setPhotos([]);
                setStep(1);
                setPublished(false);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -32 }),
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col"
      style={{ background: "var(--pc-surface)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-4 flex items-center gap-4"
        style={{
          background: "var(--pc-surface)",
          borderBottom: "1px solid var(--pc-border)",
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
        >
          <ArrowLeft size={20} style={{ color: "var(--pc-text-primary)" }} />
        </button>
        <div className="flex-1">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--pc-text-secondary)" }}
          >
            Étape {step}/{STEP_LABELS.length}
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: "var(--pc-text-primary)" }}
          >
            {STEP_LABELS[step - 1]}
          </p>
        </div>
        <div className="flex gap-1">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i + 1 === step ? 24 : 8,
                background:
                  i + 1 <= step ? "var(--pc-primary)" : "var(--pc-border)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {step === 1 && <Step1 form={form} updateForm={updateForm} />}
              {step === 2 && <Step2 form={form} updateForm={updateForm} />}
              {step === 3 && (
                <Step3 photos={photos} onPhotosChange={setPhotos} />
              )}
              {step === 4 && <Step4 form={form} updateForm={updateForm} />}
              {step === 5 && (
                <Step5
                  form={form}
                  photos={photos}
                  onPublish={handlePublish}
                  loading={createListing.isPending}
                  error={publishError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      {step < 5 && (
        <div
          className="sticky bottom-0 px-4 py-4"
          style={{
            background: "var(--pc-surface)",
            borderTop: "1px solid var(--pc-border)",
          }}
        >
          <div className="max-w-lg mx-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={goNext}
              disabled={!canGoNext()}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
              style={{
                background:
                  "linear-gradient(135deg, var(--pc-primary), #2ecc8a)",
              }}
            >
              {step === 3 ? "Continuer" : "Suivant"}
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
