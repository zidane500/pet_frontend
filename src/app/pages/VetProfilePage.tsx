import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Phone,
  Mail,
  Star,
  BadgeCheck,
  Clock,
  Calendar,
  X,
  Stethoscope,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useVet } from "../../hooks/useVets";
import { useToggleFavorite } from "../../hooks/useFavorites";
import { useAuth } from "../../hooks/useAuth";
import type { Vet } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ["Services", "Horaires", "Galerie", "Avis"] as const;
type Tab = (typeof TABS)[number];

const WEEK_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const TIME_SLOTS_AM = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];
const TIME_SLOTS_PM = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDoctorName(
  name?: string | null,
  clinic?: string | null,
): string {
  const base = name || clinic || "Vétérinaire";
  return /^dr\.?\s/i.test(base.trim()) ? base.trim() : `Dr. ${base.trim()}`;
}

function hasEmergency(vet: Vet): boolean {
  const services = vet.services ?? [];
  const hours = Object.values(vet.opening_hours ?? {});
  return [...services, ...hours].some((v) => /urgence|24h|24\/24/i.test(v));
}

function buildHoursRows(
  vet: Vet,
): { day: string; time: string; open: boolean }[] {
  const hours = vet.opening_hours;
  if (!hours || Object.keys(hours).length === 0) {
    return [
      { day: "Lundi - Vendredi", time: "08:00 - 18:00", open: true },
      { day: "Samedi", time: "08:00 - 13:00", open: true },
      { day: "Dimanche", time: "Fermé", open: false },
    ];
  }
  return Object.entries(hours).map(([day, time]) => ({
    day,
    time: String(time),
    open: !/fermé|closed/i.test(String(time)),
  }));
}

function buildServicesList(vet: Vet): { name: string; icon: string }[] {
  const icons: Record<string, string> = {
    vaccination: "💉",
    chirurgie: "⚕️",
    radiographie: "🔬",
    urgence: "🚨",
    toilettage: "✂️",
    consultation: "🩺",
    dentisterie: "🦷",
    dermatologie: "🐾",
    ophtalmologie: "👁️",
  };
  return (vet.services ?? ["Consultation générale"]).map((s) => {
    const key =
      Object.keys(icons).find((k) => s.toLowerCase().includes(k)) ?? "";
    return { name: s, icon: icons[key] ?? "🩺" };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[var(--pc-surface)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[var(--pc-text-secondary)]">
        <Loader2 size={32} className="animate-spin text-[var(--pc-primary)]" />
        <p className="text-sm">Chargement du profil...</p>
      </div>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--pc-surface)] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="font-bold text-[var(--pc-text-primary)] mb-2">
          Vétérinaire introuvable
        </h2>
        <p className="text-sm text-[var(--pc-text-secondary)] mb-4">
          Ce profil n'existe pas ou a été supprimé.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: "var(--pc-primary)" }}
        >
          Retour
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface VetProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  vetId?: string;
}

export function VetProfilePage({
  onBack,
  onNavigate,
  vetId,
}: VetProfilePageProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { isLoggedIn } = useAuth();

  // ── State ──
  const [activeTab, setActiveTab] = useState<Tab>("Services");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // ── API ──
  const id = vetId ? Number(vetId) : 0;
  const { data: vet, isLoading, isError } = useVet(id);
  const { mutate: toggleFavorite, isPending: favPending } = useToggleFavorite();
  const [savedLocally, setSavedLocally] = useState(false);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  // ── Guards ──
  if (!vetId || isLoading) return <LoadingState />;
  if (isError || !vet) return <ErrorState onBack={onBack} />;

  // ── Derived data ──
  const name = formatDoctorName(vet.doctor_name, vet.clinic_name);
  const specialty = vet.speciality ?? "Médecine générale";
  const clinic = vet.clinic_name ?? "";
  const address = vet.address ?? "";
  const phone = vet.phone ?? "";
  const email = vet.email ?? "";
  const rating = Number(vet.rating ?? 0);
  const reviewsCount = vet.reviews_count ?? 0;
  const emergency = hasEmergency(vet);
  const avatar =
    vet.photo ?? `https://picsum.photos/seed/vet-${vet.id}/200/200`;
  // Cover image: use a consistent seed per vet since there's no cover field in the API
  const cover = `https://picsum.photos/seed/vet-cover-${vet.id}/800/300`;
  const services = buildServicesList(vet);
  const hoursRows = buildHoursRows(vet);
  // Gallery: generate consistent images from vet id
  const gallery = [
    `https://picsum.photos/seed/vet-g1-${vet.id}/400/300`,
    `https://picsum.photos/seed/vet-g2-${vet.id}/400/300`,
    `https://picsum.photos/seed/vet-g3-${vet.id}/400/300`,
  ];
  const selectedServiceName = services[0]?.name ?? "Consultation";

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      onNavigate("login");
      return;
    }
    setSavedLocally((prev) => !prev);
    toggleFavorite({ type: "vet", id: vet.id });
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--pc-surface)] pb-24"
    >
      {/* Hero Cover */}
      <div className="relative h-48 sm:h-64">
        <img
          src={cover}
          alt="Clinic cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md">
            <Share2 size={18} />
          </button>
          <button
            onClick={handleToggleFavorite}
            disabled={favPending}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
          >
            <Heart
              size={18}
              className={
                savedLocally ? "fill-red-500 text-red-500" : "text-gray-600"
              }
            />
          </button>
        </div>

        <div className="absolute -bottom-12 left-6">
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://picsum.photos/seed/vet-fb-${vet.id}/100/100`;
            }}
          />
        </div>
      </div>

      {/* Profile header */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-[var(--pc-text-primary)]">
            {name}
          </h1>
          {vet.is_verified && (
            <BadgeCheck size={20} className="text-[var(--pc-primary)] mt-0.5" />
          )}
        </div>
        <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] text-xs rounded-full font-medium">
          {specialty}
        </span>
        {clinic && (
          <p className="text-sm text-[var(--pc-text-secondary)] mt-1">
            {clinic}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
            <span className="text-xs text-[var(--pc-text-secondary)]">
              ({reviewsCount} avis)
            </span>
          </div>
          {emergency && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
              🚨 Urgences 24h
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1.5">
          {address && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <MapPin size={14} className="text-[var(--pc-primary)] shrink-0" />
              {address}
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <Phone size={14} className="text-[var(--pc-primary)] shrink-0" />
              {phone}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
              <Mail size={14} className="text-[var(--pc-primary)] shrink-0" />
              {email}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <Stethoscope size={18} />,
              value: services.length.toString(),
              label: "Services",
            },
            {
              icon: (
                <Star size={18} className="fill-amber-400 text-amber-400" />
              ),
              value: `${rating.toFixed(1)}★`,
              label: "Note",
            },
            {
              icon: <Award size={18} />,
              value: vet.city ?? "—",
              label: "Ville",
            },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-3 text-center rounded-2xl">
              <div className="flex justify-center mb-1 text-[var(--pc-primary)]">
                {stat.icon}
              </div>
              <div className="font-bold text-sm text-[var(--pc-text-primary)]">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--pc-text-secondary)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowBooking(true)}
            className="col-span-2 py-3 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--pc-primary), #15634a)",
            }}
          >
            <Calendar size={16} />
            Prendre RDV
          </button>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2"
            >
              <Phone size={15} />
              Appeler
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2"
            >
              <Mail size={15} />
              Email
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? "text-white"
                  : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]"
              }`}
              style={
                activeTab === tab ? { background: "var(--pc-primary)" } : {}
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === "Services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {services.length > 0 ? (
                services.map((svc, i) => (
                  <div key={i} className="glass-card p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-[var(--pc-surface-alt)]">
                      {svc.icon}
                    </div>
                    <div className="font-semibold text-sm text-[var(--pc-text-primary)]">
                      {svc.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-[var(--pc-text-secondary)] text-sm">
                  Aucun service renseigné
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Horaires" && (
            <motion.div
              key="hours"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {hoursRows.map((h, i) => (
                <div
                  key={i}
                  className={`glass-card p-4 rounded-2xl flex items-center justify-between ${
                    !h.open ? "opacity-50" : ""
                  } ${i === 0 ? "ring-2 ring-[var(--pc-primary)]/30" : ""}`}
                >
                  <span className="font-medium text-sm text-[var(--pc-text-primary)]">
                    {h.day}
                  </span>
                  <span
                    className={`text-sm font-semibold ${h.open ? "text-[var(--pc-primary)]" : "text-red-500"}`}
                  >
                    {h.time}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "Galerie" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-2"
            >
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxImg(img)}
                  className="aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Galerie ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === "Avis" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="glass-card p-4 rounded-2xl">
                <div className="flex gap-4 items-center mb-3">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[var(--pc-text-primary)]">
                      {rating.toFixed(1)}
                    </div>
                    <StarRow rating={rating} />
                    <div className="text-xs text-[var(--pc-text-secondary)] mt-1">
                      {reviewsCount} avis
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct =
                        star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 3;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: "var(--pc-accent)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {reviewsCount === 0 && (
                <div className="text-center py-8 text-[var(--pc-text-secondary)] text-sm">
                  Aucun avis pour le moment
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
              onClick={() => setLightboxImg(null)}
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={lightboxImg}
              alt="Galerie plein écran"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowBooking(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full sm:max-w-md bg-[var(--pc-surface)] rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--pc-text-primary)]">
                  Prendre RDV — {name}
                </h2>
                <button
                  onClick={() => setShowBooking(false)}
                  className="w-8 h-8 rounded-full bg-[var(--pc-surface-alt)] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {services.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
                    Service
                  </label>
                  <select
                    defaultValue={selectedServiceName}
                    className="w-full p-3 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)]"
                  >
                    {services.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
                  Date
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(i)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs transition-all ${
                        selectedDay === i
                          ? "text-white"
                          : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]"
                      }`}
                      style={
                        selectedDay === i
                          ? { background: "var(--pc-primary)" }
                          : {}
                      }
                    >
                      <span>{WEEK_DAYS[d.getDay()]}</span>
                      <span className="font-bold">{d.getDate()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
                  Matin
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {TIME_SLOTS_AM.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedSlot === slot
                          ? "text-white"
                          : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]"
                      }`}
                      style={
                        selectedSlot === slot
                          ? { background: "var(--pc-primary)" }
                          : {}
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
                  Après-midi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS_PM.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedSlot === slot
                          ? "text-white"
                          : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]"
                      }`}
                      style={
                        selectedSlot === slot
                          ? { background: "var(--pc-primary)" }
                          : {}
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowBooking(false)}
                disabled={!selectedSlot}
                className="w-full py-3 rounded-2xl font-semibold text-white transition-opacity disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pc-primary), #15634a)",
                }}
              >
                Confirmer le RDV{selectedSlot ? ` à ${selectedSlot}` : ""}
              </button>

              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="block text-center mt-3 text-sm text-[var(--pc-text-secondary)] hover:text-[var(--pc-primary)] transition-colors"
                >
                  Ou appeler directement : {phone}
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
