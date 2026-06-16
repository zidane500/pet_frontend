import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Share2, Heart, MapPin, Phone, Mail, Star,
  BadgeCheck, Clock, Calendar, X, Stethoscope, Award,
} from 'lucide-react';

const VET = {
  name: 'Dr. Mehdi Trabelsi',
  specialty: 'Chirurgie & Médecine générale',
  clinic: 'Clinique Vétérinaire El Amal',
  address: '12 Rue des Jasmin, Les Berges du Lac, Tunis',
  phone: '+216 71 234 567',
  email: 'dr.trabelsi@clinique.tn',
  rating: 4.9,
  reviews: 128,
  emergency: true,
  verified: true,
  memberSince: 'Mars 2023',
  responseTime: '< 30 min',
  consultations: 847,
  avatar:
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
  cover:
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=300&fit=crop',
  gallery: [
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=400&h=300&fit=crop',
  ],
  services: [
    { name: 'Consultation générale', price: '40 DT', duration: '30 min', icon: '🩺' },
    { name: 'Chirurgie', price: 'À partir de 150 DT', duration: 'Variable', icon: '⚕️' },
    { name: 'Vaccination', price: '25 DT', duration: '15 min', icon: '💉' },
    { name: 'Radiographie', price: '60 DT', duration: '20 min', icon: '🔬' },
    { name: 'Urgences 24h', price: '80 DT', duration: 'Immédiat', icon: '🚨' },
    { name: 'Toilettage', price: '35 DT', duration: '45 min', icon: '✂️' },
  ],
  hours: [
    { day: 'Lundi - Vendredi', time: '08:00 - 18:00', open: true },
    { day: 'Samedi', time: '08:00 - 13:00', open: true },
    { day: 'Dimanche', time: 'Fermé', open: false },
  ],
  reviews_list: [
    {
      id: 'r1',
      author: 'Marwa T.',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      rating: 5,
      text: "Excellent vétérinaire, très professionnel et attentionné. Mon chien Max a été très bien pris en charge.",
      date: 'Mai 2026',
      animal: 'Chien',
    },
    {
      id: 'r2',
      author: 'Ahmed B.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      rating: 5,
      text: "Disponible même le soir pour les urgences. Je recommande vivement !",
      date: 'Avril 2026',
      animal: 'Chat',
    },
    {
      id: 'r3',
      author: 'Sonia K.',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=40&h=40&fit=crop&crop=face',
      rating: 4,
      text: "Très compétent, explique bien les traitements. Tarifs raisonnables.",
      date: 'Mars 2026',
      animal: 'Lapin',
    },
  ],
};

const TABS = ['Services', 'Horaires', 'Galerie', 'Avis'] as const;
type Tab = typeof TABS[number];

const WEEK_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const TIME_SLOTS_AM = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const TIME_SLOTS_PM = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export function VetProfilePage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<Tab>('Services');
  const [saved, setSaved] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(VET.services[0].name);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--pc-surface)] pb-24">
      {/* Hero Cover */}
      <div className="relative h-48 sm:h-64">
        <img src={VET.cover} alt="Clinic cover" className="w-full h-full object-cover" />
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
            onClick={() => setSaved(!saved)}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
          >
            <Heart size={18} className={saved ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          </button>
        </div>

        <div className="absolute -bottom-12 left-6">
          <img
            src={VET.avatar}
            alt={VET.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
          />
        </div>
      </div>

      {/* Profile header */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-[var(--pc-text-primary)]">{VET.name}</h1>
          {VET.verified && <BadgeCheck size={20} className="text-[var(--pc-primary)] mt-0.5" />}
        </div>
        <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] text-xs rounded-full font-medium">
          {VET.specialty}
        </span>
        <p className="text-sm text-[var(--pc-text-secondary)] mt-1">{VET.clinic}</p>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold text-sm">{VET.rating}</span>
            <span className="text-xs text-[var(--pc-text-secondary)]">({VET.reviews} avis)</span>
          </div>
          {VET.emergency && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
              🚨 Urgences 24h
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <MapPin size={14} className="text-[var(--pc-primary)] shrink-0" />
            {VET.address}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <Phone size={14} className="text-[var(--pc-primary)] shrink-0" />
            {VET.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <Mail size={14} className="text-[var(--pc-primary)] shrink-0" />
            {VET.email}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Stethoscope size={18} />, value: VET.consultations.toLocaleString(), label: 'Consultations' },
            { icon: <Star size={18} className="fill-amber-400 text-amber-400" />, value: `${VET.rating}★`, label: 'Note' },
            { icon: <Award size={18} />, value: VET.memberSince, label: 'Membre depuis' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-3 text-center rounded-2xl">
              <div className="flex justify-center mb-1 text-[var(--pc-primary)]">{stat.icon}</div>
              <div className="font-bold text-sm text-[var(--pc-text-primary)]">{stat.value}</div>
              <div className="text-xs text-[var(--pc-text-secondary)]">{stat.label}</div>
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
            style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
          >
            <Calendar size={16} />
            Prendre RDV
          </button>
          <button className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2">
            <Phone size={15} />
            Appeler
          </button>
          <button className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2">
            <Mail size={15} />
            Message
          </button>
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
                  ? 'text-white'
                  : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]'
              }`}
              style={activeTab === tab ? { background: 'var(--pc-primary)' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'Services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {VET.services.map((svc, i) => (
                <div key={i} className="glass-card p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-[var(--pc-surface-alt)]">
                    {svc.icon}
                  </div>
                  <div className="font-semibold text-sm text-[var(--pc-text-primary)] mb-1">
                    {svc.name}
                  </div>
                  <div
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mb-1"
                    style={{ background: 'var(--pc-primary)' }}
                  >
                    {svc.price}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--pc-text-secondary)]">
                    <Clock size={11} />
                    {svc.duration}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'Horaires' && (
            <motion.div
              key="hours"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {VET.hours.map((h, i) => (
                <div
                  key={i}
                  className={`glass-card p-4 rounded-2xl flex items-center justify-between ${
                    !h.open ? 'opacity-50' : ''
                  } ${i === 0 ? 'ring-2 ring-[var(--pc-primary)]/30' : ''}`}
                >
                  <span className="font-medium text-sm text-[var(--pc-text-primary)]">{h.day}</span>
                  <span className={`text-sm font-semibold ${h.open ? 'text-[var(--pc-primary)]' : 'text-red-500'}`}>
                    {h.time}
                  </span>
                </div>
              ))}
              <div className="glass-card p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
                  <Clock size={14} className="text-[var(--pc-primary)]" />
                  Temps de réponse moyen : {VET.responseTime}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Galerie' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-2"
            >
              {VET.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxImg(img)}
                  className="aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'Avis' && (
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
                    <div className="text-4xl font-bold text-[var(--pc-text-primary)]">{VET.rating}</div>
                    <StarRow rating={5} />
                    <div className="text-xs text-[var(--pc-text-secondary)] mt-1">{VET.reviews} avis</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 80 : star === 4 ? 15 : star === 3 ? 5 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: 'var(--pc-accent)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {VET.reviews_list.map((rev) => (
                <div key={rev.id} className="glass-card p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={rev.avatar} alt={rev.author} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-[var(--pc-text-primary)]">{rev.author}</div>
                      <div className="flex items-center gap-2">
                        <StarRow rating={rev.rating} />
                        <span className="text-xs text-[var(--pc-text-secondary)]">{rev.date}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-[var(--pc-surface-alt)] text-xs rounded-full text-[var(--pc-text-secondary)]">
                      {rev.animal}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--pc-text-secondary)]">{rev.text}</p>
                </div>
              ))}
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
              alt="Gallery fullscreen"
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full sm:max-w-md bg-[var(--pc-surface)] rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--pc-text-primary)]">Prendre RDV</h2>
                <button
                  onClick={() => setShowBooking(false)}
                  className="w-8 h-8 rounded-full bg-[var(--pc-surface-alt)] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
                  Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)]"
                >
                  {VET.services.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.icon} {s.name} — {s.price}
                    </option>
                  ))}
                </select>
              </div>

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
                        selectedDay === i ? 'text-white' : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]'
                      }`}
                      style={selectedDay === i ? { background: 'var(--pc-primary)' } : {}}
                    >
                      <span>{WEEK_DAYS[d.getDay()]}</span>
                      <span className="font-bold">{d.getDate()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">Matin</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {TIME_SLOTS_AM.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedSlot === slot ? 'text-white' : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]'
                      }`}
                      style={selectedSlot === slot ? { background: 'var(--pc-primary)' } : {}}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">Après-midi</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS_PM.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedSlot === slot ? 'text-white' : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]'
                      }`}
                      style={selectedSlot === slot ? { background: 'var(--pc-primary)' } : {}}
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
                style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
              >
                Confirmer le RDV{selectedSlot ? ` à ${selectedSlot}` : ''}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
