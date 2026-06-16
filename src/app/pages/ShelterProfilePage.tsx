import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Share2, Heart, MapPin, Phone, Mail, Star,
  BadgeCheck, Globe, Users, Home, CheckCircle, HeartHandshake,
} from 'lucide-react';

const SHELTER = {
  name: 'Refuge Espoir Tunis',
  tagline: 'Chaque animal mérite une famille',
  address: 'Route de La Marsa, Tunis',
  phone: '+216 71 456 789',
  email: 'contact@refuge-espoir.tn',
  website: 'refuge-espoir.tn',
  rating: 4.8,
  reviews: 89,
  verified: true,
  nonprofit: true,
  memberSince: 'Février 2020',
  volunteers: 24,
  animalsHelped: 1240,
  capacity: 80,
  currentAnimals: 63,
  logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
  cover: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=300&fit=crop',
};

const AVAILABLE_ANIMALS = [
  { id: 'a1', name: 'Nala', species: 'Chienne', breed: 'Labrador mix', age: '2 ans', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop', vaccinated: true },
  { id: 'a2', name: 'Simba', species: 'Chat', breed: 'Européen', age: '1 an', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop', vaccinated: true },
  { id: 'a3', name: 'Cookie', species: 'Chienne', breed: 'Berger croisé', age: '3 ans', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', vaccinated: false },
  { id: 'a4', name: 'Mimi', species: 'Chatte', breed: 'Siamoise', age: '6 mois', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop', vaccinated: true },
];

const SUCCESS_STORIES = [
  { id: 's1', name: 'Luna', adoptedBy: 'Famille Bouzid', date: 'Mai 2026', avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop', species: 'Chienne' },
  { id: 's2', name: 'Oscar', adoptedBy: 'Rania M.', date: 'Avril 2026', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=60&h=60&fit=crop', species: 'Chien' },
  { id: 's3', name: 'Bella', adoptedBy: 'Famille Cherif', date: 'Mars 2026', avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=60&h=60&fit=crop', species: 'Chatte' },
];

const VOLUNTEERS = [
  { id: 'v1', name: 'Amira Ben Ali', role: 'Coordinatrice', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=80&h=80&fit=crop&crop=face' },
  { id: 'v2', name: 'Youssef K.', role: 'Soignant', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { id: 'v3', name: 'Nadia T.', role: 'Bénévole', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
  { id: 'v4', name: 'Khaled M.', role: 'Chauffeur', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
];

const DONATION_TIERS = [
  { amount: '10 DT', label: 'Repas', desc: 'Nourrit un animal pendant 3 jours', emoji: '🍖' },
  { amount: '25 DT', label: 'Soins', desc: 'Couvre les frais vétérinaires de base', emoji: '💊' },
  { amount: '50 DT', label: 'Famille', desc: 'Soutient un animal pendant un mois', emoji: '🏠' },
  { amount: 'Autre', label: 'Libre', desc: 'Montant de votre choix', emoji: '💛' },
];

const RECENT_DONORS = [
  { name: 'Fatma B.', amount: '50 DT', date: 'il y a 2h' },
  { name: 'Anonyme', amount: '25 DT', date: 'il y a 5h' },
  { name: 'Ahmed S.', amount: '10 DT', date: 'hier' },
];

const TABS = ['Animaux disponibles', 'Adoptions réussies', 'Dons', 'Bénévoles'] as const;
type Tab = typeof TABS[number];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

export function ShelterProfilePage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<Tab>('Animaux disponibles');
  const [saved, setSaved] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);

  const capacityPct = Math.round((SHELTER.currentAnimals / SHELTER.capacity) * 100);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--pc-surface)] pb-24">
      {/* Hero Cover */}
      <div className="relative h-48 sm:h-64">
        <img src={SHELTER.cover} alt="Shelter cover" className="w-full h-full object-cover" />
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
            src={SHELTER.logo}
            alt={SHELTER.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
          />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-[var(--pc-text-primary)]">{SHELTER.name}</h1>
          {SHELTER.verified && <BadgeCheck size={20} className="text-[var(--pc-primary)] mt-0.5" />}
          {SHELTER.nonprofit && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              Association à but non lucratif
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--pc-text-secondary)] mt-1 italic">"{SHELTER.tagline}"</p>

        <div className="flex items-center gap-2 mt-2">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-sm">{SHELTER.rating}</span>
          <span className="text-xs text-[var(--pc-text-secondary)]">({SHELTER.reviews} avis)</span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <MapPin size={14} className="text-[var(--pc-primary)] shrink-0" />
            {SHELTER.address}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <Phone size={14} className="text-[var(--pc-primary)] shrink-0" />
            {SHELTER.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <Globe size={14} className="text-[var(--pc-primary)] shrink-0" />
            {SHELTER.website}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: SHELTER.animalsHelped.toLocaleString(), label: 'Accueillis' },
            { value: SHELTER.volunteers.toString(), label: 'Bénévoles' },
            { value: SHELTER.capacity.toString(), label: 'Capacité' },
            { value: SHELTER.currentAnimals.toString(), label: 'Actuellement' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-2 text-center rounded-2xl">
              <div className="font-bold text-base text-[var(--pc-text-primary)]">{stat.value}</div>
              <div className="text-xs text-[var(--pc-text-secondary)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        <div className="glass-card p-3 rounded-2xl mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--pc-text-secondary)]">Occupation</span>
            <span className="font-semibold text-[var(--pc-text-primary)]">
              {SHELTER.currentAnimals}/{SHELTER.capacity} ({capacityPct}%)
            </span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: capacityPct > 80
                  ? '#ef4444'
                  : capacityPct > 60
                  ? 'var(--pc-accent)'
                  : 'var(--pc-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab('Animaux disponibles')}
            className="py-2.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
          >
            <Home size={15} />
            Adopter
          </button>
          <button
            onClick={() => setActiveTab('Dons')}
            className="py-2.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--pc-accent), #d4871a)' }}
          >
            <HeartHandshake size={15} />
            Faire un don
          </button>
          <button
            onClick={() => setActiveTab('Bénévoles')}
            className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2"
          >
            <Users size={15} />
            Devenir bénévole
          </button>
          <button className="py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)] flex items-center justify-center gap-2">
            <Mail size={15} />
            Contacter
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
          {activeTab === 'Animaux disponibles' && (
            <motion.div
              key="animals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {AVAILABLE_ANIMALS.map((animal) => (
                <div key={animal.id} className="glass-card rounded-2xl overflow-hidden">
                  <div className="relative">
                    <img src={animal.image} alt={animal.name} className="w-full h-36 object-cover" />
                    {animal.vaccinated && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
                        <CheckCircle size={10} />
                        Vacciné
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-sm text-[var(--pc-text-primary)]">{animal.name}</div>
                    <div className="text-xs text-[var(--pc-text-secondary)] mb-1">{animal.breed}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--pc-text-secondary)]">{animal.age}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ background: 'var(--pc-primary)' }}
                      >
                        {animal.species}
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigate('pet-detail', { id: animal.id })}
                      className="w-full py-1.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1"
                      style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
                    >
                      <Heart size={12} />
                      Adopter
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'Adoptions réussies' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-0"
            >
              {SUCCESS_STORIES.map((story, i) => (
                <div key={story.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
                    >
                      ❤️
                    </div>
                    {i < SUCCESS_STORIES.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[var(--pc-border)] my-2 min-h-[24px]" />
                    )}
                  </div>

                  <div className="glass-card p-4 rounded-2xl mb-3 flex-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={story.avatar}
                        alt={story.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-bold text-sm text-[var(--pc-text-primary)]">{story.name}</div>
                        <div className="text-xs text-[var(--pc-text-secondary)]">
                          Adopté par <span className="font-semibold">{story.adoptedBy}</span>
                        </div>
                        <div className="text-xs text-[var(--pc-text-secondary)]">{story.date}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'Dons' && (
            <motion.div
              key="donations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Donation tiers */}
              <div className="grid grid-cols-2 gap-3">
                {DONATION_TIERS.map((tier) => (
                  <button
                    key={tier.amount}
                    onClick={() => setSelectedDonation(tier.amount)}
                    className={`glass-card p-4 rounded-2xl text-left transition-all ${
                      selectedDonation === tier.amount
                        ? 'ring-2 ring-[var(--pc-accent)]'
                        : ''
                    }`}
                  >
                    <div className="text-2xl mb-2">{tier.emoji}</div>
                    <div className="font-bold text-[var(--pc-text-primary)]">{tier.amount}</div>
                    <div className="text-xs font-semibold text-[var(--pc-accent)]">{tier.label}</div>
                    <div className="text-xs text-[var(--pc-text-secondary)] mt-1">{tier.desc}</div>
                  </button>
                ))}
              </div>

              {selectedDonation && (
                <button
                  className="w-full py-3 rounded-2xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--pc-accent), #d4871a)' }}
                >
                  Faire un don de {selectedDonation === 'Autre' ? 'montant libre' : selectedDonation}
                </button>
              )}

              {/* Monthly goal progress */}
              <div className="glass-card p-4 rounded-2xl">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-[var(--pc-text-primary)]">Objectif mensuel</span>
                  <span className="text-[var(--pc-primary)] font-bold">680 / 1000 DT</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--pc-primary)' }}
                  />
                </div>
                <div className="text-xs text-[var(--pc-text-secondary)]">68% de l'objectif atteint ce mois</div>
              </div>

              {/* Recent donors */}
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="font-semibold text-sm text-[var(--pc-text-primary)] mb-3">Donateurs récents</h3>
                <div className="space-y-2">
                  {RECENT_DONORS.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: 'var(--pc-primary)' }}
                        >
                          {d.name[0]}
                        </div>
                        <span className="text-[var(--pc-text-primary)]">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[var(--pc-accent)]">{d.amount}</div>
                        <div className="text-xs text-[var(--pc-text-secondary)]">{d.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Bénévoles' && (
            <motion.div
              key="volunteers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {VOLUNTEERS.map((v) => (
                  <div key={v.id} className="glass-card p-4 rounded-2xl flex flex-col items-center text-center">
                    <img
                      src={v.avatar}
                      alt={v.name}
                      className="w-16 h-16 rounded-full object-cover mb-2 ring-2 ring-[var(--pc-primary)]/30"
                    />
                    <div className="font-semibold text-sm text-[var(--pc-text-primary)]">{v.name}</div>
                    <div
                      className="text-xs px-2 py-0.5 rounded-full text-white mt-1"
                      style={{ background: 'var(--pc-primary)' }}
                    >
                      {v.role}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
              >
                <Users size={16} />
                Rejoindre l'équipe
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
