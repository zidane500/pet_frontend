import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, ArrowRight, Check, MapPin, Phone, Mail, ChevronDown,
} from 'lucide-react';

interface CreateListingPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { id: 'adoption', icon: '💚', label: 'Adoption', desc: 'Donnez une chance à un animal', color: 'from-emerald-500 to-teal-500' },
  { id: 'vente', icon: '💰', label: 'Vente', desc: 'Vendez votre animal', color: 'from-blue-500 to-indigo-500' },
  { id: 'perdu', icon: '🔍', label: 'Animal perdu', desc: 'Signalez un animal disparu', color: 'from-orange-500 to-red-500' },
  { id: 'trouve', icon: '🏠', label: 'Animal trouvé', desc: 'Vous avez trouvé un animal', color: 'from-purple-500 to-violet-500' },
  { id: 'accouplement', icon: '🤝', label: 'Accouplement', desc: 'Recherche pour reproduction', color: 'from-yellow-500 to-amber-500' },
  { id: 'conseils', icon: '💡', label: 'Conseil / Discussion', desc: 'Partagez votre expérience', color: 'from-pink-500 to-rose-500' },
];

const SPECIES = ['Chien', 'Chat', 'Lapin', 'Oiseau', 'Reptile', 'Autre'];
const AGE_UNITS = ['mois', 'ans'];
const SEX_OPTIONS = ['Mâle', 'Femelle', 'Inconnu'];

const GOVERNORATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
  'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
];

const STEP_LABELS = ['Catégorie', 'Infos', 'Photos', 'Localisation', 'Publier'];

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
  category: '',
  title: '',
  species: '',
  breed: '',
  ageValue: '',
  ageUnit: 'ans',
  sex: '',
  price: '',
  isFree: false,
  vaccinated: false,
  sterilized: false,
  description: '',
  governorate: '',
  city: '',
  phone: '',
  email: '',
};

export function CreateListingPage({ onBack, onSuccess }: CreateListingPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [published, setPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return !!form.category;
    if (step === 2) return !!form.title && !!form.species;
    if (step === 3) return true;
    if (step === 4) return !!form.governorate;
    return true;
  };

  const goNext = () => {
    if (!canProceed()) return;
    setDirection(1);
    setStep(s => Math.min(5, s + 1));
  };

  const goBack = () => {
    if (step === 1) { onBack(); return; }
    setDirection(-1);
    setStep(s => Math.max(1, s - 1));
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--pc-surface)', color: 'var(--pc-text-primary)' }}
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-30 glass-card border-b"
        style={{ borderColor: 'var(--pc-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={goBack}
              className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ArrowLeft size={20} style={{ color: 'var(--pc-text-secondary)' }} />
            </button>
            <h1 className="text-base font-semibold flex-1" style={{ color: 'var(--pc-text-primary)' }}>
              {step < 5 ? `Étape ${step} / 5 — ${STEP_LABELS[step - 1]}` : 'Récapitulatif'}
            </h1>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {STEP_LABELS.map((label, idx) => {
              const num = idx + 1;
              const isCompleted = num < step;
              const isActive = num === step;
              return (
                <div key={num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                      style={{
                        background: isCompleted || isActive ? 'var(--pc-primary)' : 'var(--pc-border)',
                        color: isCompleted || isActive ? '#fff' : 'var(--pc-text-secondary)',
                      }}
                    >
                      {isCompleted ? <Check size={12} /> : num}
                    </div>
                    <span
                      className="text-[9px] mt-0.5 hidden sm:block whitespace-nowrap"
                      style={{ color: isActive ? 'var(--pc-primary)' : 'var(--pc-text-secondary)' }}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-1 rounded-full transition-all duration-300"
                      style={{ background: num < step ? 'var(--pc-primary)' : 'var(--pc-border)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {step === 1 && <Step1 form={form} updateForm={updateForm} />}
              {step === 2 && <Step2 form={form} updateForm={updateForm} />}
              {step === 3 && <Step3 fileInputRef={fileInputRef} />}
              {step === 4 && <Step4 form={form} updateForm={updateForm} />}
              {step === 5 && !published && (
                <Step5 form={form} onPublish={() => setPublished(true)} />
              )}
              {step === 5 && published && (
                <SuccessState
                  onView={onSuccess}
                  onAnother={() => { setForm(initialForm); setStep(1); setPublished(false); }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky bottom nav */}
      {!(step === 5 && published) && (
        <div
          className="sticky bottom-0 z-30 glass-card border-t"
          style={{ borderColor: 'var(--pc-border)' }}
        >
          <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
            <button
              onClick={goBack}
              className="flex-1 py-3 rounded-2xl font-semibold text-sm border transition-colors"
              style={{
                borderColor: 'var(--pc-border)',
                color: 'var(--pc-text-secondary)',
                background: 'transparent',
              }}
            >
              {step === 1 ? 'Annuler' : 'Retour'}
            </button>
            {step < 5 && (
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className="flex-[2] py-3 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: canProceed()
                    ? 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)'
                    : 'var(--pc-border)',
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                }}
              >
                Suivant
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 1: Category ─── */
function Step1({
  form,
  updateForm,
}: {
  form: FormData;
  updateForm: (k: keyof FormData, v: string | boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--pc-text-primary)' }}>
        Quel type d'annonce souhaitez-vous créer ?
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--pc-text-secondary)' }}>
        Sélectionnez la catégorie qui correspond le mieux à votre annonce
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map(cat => {
          const selected = form.category === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => updateForm('category', cat.id)}
              className="relative p-4 rounded-2xl text-left border-2 glass-card overflow-hidden"
              style={{ borderColor: selected ? 'var(--pc-primary)' : 'transparent' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10`} />
              {selected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--pc-primary)' }}
                >
                  <Check size={11} className="text-white" />
                </div>
              )}
              <span className="text-2xl block mb-2">{cat.icon}</span>
              <span className="text-sm font-bold block" style={{ color: 'var(--pc-text-primary)' }}>
                {cat.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>
                {cat.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 2: Pet Info ─── */
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
      <h2 className="text-xl font-bold" style={{ color: 'var(--pc-text-primary)' }}>
        Informations sur l'animal
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>
          Titre de l'annonce <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={e => updateForm('title', e.target.value)}
          placeholder="Ex: Max — Berger Allemand 3 ans"
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{
            background: 'var(--pc-surface-alt)',
            borderColor: form.title ? 'var(--pc-primary)' : 'var(--pc-border)',
            color: 'var(--pc-text-primary)',
          }}
        />
      </div>

      {/* Species + Breed */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>
            Espèce <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="relative">
            <select
              value={form.species}
              onChange={e => updateForm('species', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border text-sm outline-none appearance-none pr-8"
              style={{
                background: 'var(--pc-surface-alt)',
                borderColor: form.species ? 'var(--pc-primary)' : 'var(--pc-border)',
                color: 'var(--pc-text-primary)',
              }}
            >
              <option value="">Choisir…</option>
              {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--pc-text-secondary)' }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>Race</label>
          <input
            type="text"
            value={form.breed}
            onChange={e => updateForm('breed', e.target.value)}
            placeholder="Ex: Berger Allemand"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: 'var(--pc-surface-alt)',
              borderColor: 'var(--pc-border)',
              color: 'var(--pc-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>Âge</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={form.ageValue}
            onChange={e => updateForm('ageValue', e.target.value)}
            placeholder="Ex: 3"
            min="0"
            className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: 'var(--pc-surface-alt)',
              borderColor: 'var(--pc-border)',
              color: 'var(--pc-text-primary)',
            }}
          />
          <div className="relative">
            <select
              value={form.ageUnit}
              onChange={e => updateForm('ageUnit', e.target.value)}
              className="px-4 py-3 rounded-2xl border text-sm outline-none appearance-none pr-7"
              style={{
                background: 'var(--pc-surface-alt)',
                borderColor: 'var(--pc-border)',
                color: 'var(--pc-text-primary)',
              }}
            >
              {AGE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--pc-text-secondary)' }} />
          </div>
        </div>
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--pc-text-primary)' }}>Sexe</label>
        <div className="flex gap-2">
          {SEX_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => updateForm('sex', opt)}
              className="flex-1 py-2.5 rounded-2xl border text-sm font-medium transition-all"
              style={{
                borderColor: form.sex === opt ? 'var(--pc-primary)' : 'var(--pc-border)',
                background: form.sex === opt ? 'var(--pc-primary)' : 'var(--pc-surface-alt)',
                color: form.sex === opt ? '#fff' : 'var(--pc-text-secondary)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>Prix</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={form.price}
            onChange={e => updateForm('price', e.target.value)}
            disabled={form.isFree}
            placeholder="Prix en DT"
            className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: form.isFree ? 'var(--pc-border)' : 'var(--pc-surface-alt)',
              borderColor: 'var(--pc-border)',
              color: 'var(--pc-text-primary)',
              opacity: form.isFree ? 0.5 : 1,
            }}
          />
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={e => updateForm('isFree', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm" style={{ color: 'var(--pc-text-primary)' }}>Gratuit</span>
          </label>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-4">
        <ToggleField label="Vacciné" value={form.vaccinated} onChange={v => updateForm('vaccinated', v)} />
        <ToggleField label="Stérilisé" value={form.sterilized} onChange={v => updateForm('sterilized', v)} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>Description</label>
        <textarea
          value={form.description}
          onChange={e => updateForm('description', e.target.value)}
          placeholder="Décrivez votre annonce (min. 50 caractères)…"
          rows={5}
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none"
          style={{
            background: 'var(--pc-surface-alt)',
            borderColor: charCount >= 50 ? 'var(--pc-primary)' : 'var(--pc-border)',
            color: 'var(--pc-text-primary)',
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: charCount < 50 ? '#ef4444' : 'var(--pc-success)' }}>
            {charCount < 50 ? `Encore ${50 - charCount} caractères` : 'Longueur OK ✓'}
          </span>
          <span className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>{charCount} car.</span>
        </div>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-between glass-card rounded-2xl px-4 py-3">
      <span className="text-sm font-medium" style={{ color: 'var(--pc-text-primary)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full flex-shrink-0"
        style={{ background: value ? 'var(--pc-primary)' : 'var(--pc-border)' }}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
          animate={{ left: value ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

/* ─── Step 3: Photos ─── */
function Step3({ fileInputRef }: { fileInputRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--pc-text-primary)' }}>
        Photos de l'animal
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--pc-text-secondary)' }}>
        De belles photos augmentent vos chances d'être contacté
      </p>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full glass-card rounded-3xl border-2 border-dashed p-10 flex flex-col items-center gap-3 group"
        style={{ borderColor: 'var(--pc-border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform"
          style={{ background: 'var(--pc-surface-alt)' }}
        >
          📷
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: 'var(--pc-text-primary)' }}>
            Glissez-déposez vos photos
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--pc-text-secondary)' }}>
            ou{' '}
            <span style={{ color: 'var(--pc-primary)' }} className="font-medium">
              parcourir
            </span>
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>
          Max 10 photos, 5 MB chacune
        </p>
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" />

      <div className="grid grid-cols-3 gap-3 mt-5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="aspect-square rounded-2xl flex items-center justify-center border-2 border-dashed cursor-pointer"
            style={{ background: 'var(--pc-surface-alt)', borderColor: 'var(--pc-border)' }}
          >
            <span className="text-2xl" style={{ color: 'var(--pc-border)' }}>+</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 4: Location ─── */
function Step4({
  form,
  updateForm,
}: {
  form: FormData;
  updateForm: (k: keyof FormData, v: string | boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--pc-text-primary)' }}>
        Localisation &amp; contact
      </h2>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>
          Gouvernorat <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="relative">
          <select
            value={form.governorate}
            onChange={e => updateForm('governorate', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none appearance-none pr-8"
            style={{
              background: 'var(--pc-surface-alt)',
              borderColor: form.governorate ? 'var(--pc-primary)' : 'var(--pc-border)',
              color: 'var(--pc-text-primary)',
            }}
          >
            <option value="">Choisir un gouvernorat…</option>
            {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--pc-text-secondary)' }} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>Ville</label>
        <input
          type="text"
          value={form.city}
          onChange={e => updateForm('city', e.target.value)}
          placeholder="Ex: Tunis"
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{
            background: 'var(--pc-surface-alt)',
            borderColor: 'var(--pc-border)',
            color: 'var(--pc-text-primary)',
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>
          Téléphone de contact
        </label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--pc-text-secondary)' }} />
          <input
            type="tel"
            value={form.phone}
            onChange={e => updateForm('phone', e.target.value)}
            placeholder="+216 XX XXX XXX"
            className="w-full pl-9 pr-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: 'var(--pc-surface-alt)',
              borderColor: 'var(--pc-border)',
              color: 'var(--pc-text-primary)',
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pc-text-primary)' }}>
          Email de contact
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--pc-text-secondary)' }} />
          <input
            type="email"
            value={form.email}
            onChange={e => updateForm('email', e.target.value)}
            placeholder="votre@email.com"
            className="w-full pl-9 pr-4 py-3 rounded-2xl border text-sm outline-none"
            style={{
              background: 'var(--pc-surface-alt)',
              borderColor: 'var(--pc-border)',
              color: 'var(--pc-text-primary)',
            }}
          />
        </div>
      </div>

      <div
        className="rounded-3xl flex flex-col items-center justify-center gap-2 py-10"
        style={{ background: 'var(--pc-surface-alt)', border: '1px dashed var(--pc-border)' }}
      >
        <MapPin size={32} style={{ color: 'var(--pc-text-secondary)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--pc-text-secondary)' }}>
          Carte interactive — bientôt disponible
        </p>
      </div>
    </div>
  );
}

/* ─── Step 5: Review ─── */
function Step5({ form, onPublish }: { form: FormData; onPublish: () => void }) {
  const cat = CATEGORIES.find(c => c.id === form.category);
  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--pc-text-primary)' }}>
        Récapitulatif de votre annonce
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--pc-text-secondary)' }}>
        Vérifiez les informations avant de publier
      </p>

      <div className="glass-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cat?.icon ?? '📋'}</span>
          <span
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{ background: 'var(--pc-surface-alt)', color: 'var(--pc-primary)' }}
          >
            {cat?.label ?? form.category}
          </span>
        </div>

        {form.title && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--pc-text-secondary)' }}>Titre</p>
            <p className="font-bold text-lg" style={{ color: 'var(--pc-text-primary)' }}>{form.title}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {form.species && <SummaryField label="Espèce" value={form.species} />}
          {form.breed && <SummaryField label="Race" value={form.breed} />}
          {form.ageValue && <SummaryField label="Âge" value={`${form.ageValue} ${form.ageUnit}`} />}
          {form.sex && <SummaryField label="Sexe" value={form.sex} />}
          <SummaryField label="Prix" value={form.isFree ? 'Gratuit' : form.price ? `${form.price} DT` : 'Non renseigné'} />
          <SummaryField label="Vacciné" value={form.vaccinated ? '✅ Oui' : '❌ Non'} />
          <SummaryField label="Stérilisé" value={form.sterilized ? '✅ Oui' : '❌ Non'} />
          {form.governorate && <SummaryField label="Gouvernorat" value={form.governorate} />}
          {form.city && <SummaryField label="Ville" value={form.city} />}
        </div>

        {form.description && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--pc-text-secondary)' }}>Description</p>
            <p className="text-sm" style={{ color: 'var(--pc-text-primary)' }}>{form.description}</p>
          </div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPublish}
        className="w-full mt-5 py-4 rounded-2xl font-bold text-white text-base"
        style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)' }}
      >
        Publier l'annonce 🚀
      </motion.button>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: 'var(--pc-surface-alt)' }}>
      <p className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>{label}</p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--pc-text-primary)' }}>{value}</p>
    </div>
  );
}

/* ─── Success State ─── */
function SuccessState({ onView, onAnother }: { onView: () => void; onAnother: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center text-center py-12 gap-5"
    >
      <div className="text-6xl">✨🎉✨</div>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)' }}
      >
        <Check size={40} className="text-white" strokeWidth={3} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--pc-text-primary)' }}>
          Annonce publiée !
        </h2>
        <p className="text-sm" style={{ color: 'var(--pc-text-secondary)' }}>
          Votre annonce est maintenant visible par tous les utilisateurs de PetConnect.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <button
          onClick={onView}
          className="py-3 rounded-2xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)' }}
        >
          Voir l'annonce
        </button>
        <button
          onClick={onAnother}
          className="py-3 rounded-2xl font-semibold border"
          style={{
            borderColor: 'var(--pc-border)',
            color: 'var(--pc-text-secondary)',
            background: 'transparent',
          }}
        >
          Créer une autre annonce
        </button>
      </div>
    </motion.div>
  );
}
