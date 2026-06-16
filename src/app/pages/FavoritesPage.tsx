import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Star,
  Store,
  PawPrint,
  RotateCcw,
  X,
  CalendarDays,
  ExternalLink,
  Stethoscope,
  Bookmark,
  ImageIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FavoritesPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type FavTab = 'animals' | 'vets' | 'shops' | 'posts';

interface FavAnimal {
  id: string;
  title: string;
  type: 'vente' | 'adoption';
  price: string;
  city: string;
  image: string;
  verified: boolean;
}

interface FavVet {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  city: string;
  image: string;
  emergency: boolean;
}

interface FavShop {
  id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
  isOpen: boolean;
}

interface FavPost {
  id: string;
  image: string;
  caption: string;
  author: string;
  likes: number;
  saved: boolean;
}

interface ToastItem {
  id: string;
  onUndo: () => void;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const FAV_POSTS_INIT: FavPost[] = [
  { id: 'fp1', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=350&fit=crop', caption: 'Mon Max au lac de Tunis 🐕', author: 'SaraaTN', likes: 147, saved: true },
  { id: 'fp2', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=250&fit=crop', caption: 'Luna explore le jardin 🐱', author: 'AhmedSfax', likes: 89, saved: true },
  { id: 'fp3', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=400&fit=crop', caption: 'Kakapo apprend à parler 🦜', author: 'MarwaSousse', likes: 312, saved: true },
];

const FAV_ANIMALS_INIT: FavAnimal[] = [
  { id: 'a1', title: 'Max - Berger Allemand', type: 'vente', price: '850 DT', city: 'Tunis', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop', verified: true },
  { id: 'a2', title: 'Luna - Chatte tigrée', type: 'adoption', price: 'Gratuit', city: 'Sfax', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop', verified: false },
  { id: 'a3', title: 'Nala - Labrador Mix', type: 'adoption', price: 'Gratuit', city: 'Tunis', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop', verified: true },
  { id: 'a4', title: 'Rocky - Lapin Angora', type: 'vente', price: '120 DT', city: 'Sousse', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop', verified: false },
];

const FAV_VETS_INIT: FavVet[] = [
  { id: 'v1', name: 'Dr. Mehdi Trabelsi', specialty: 'Chirurgie', rating: 4.9, reviews: 128, city: 'Tunis', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face', emergency: true },
  { id: 'v2', name: 'Dr. Sonia Ben Amor', specialty: 'NAC & Exotiques', rating: 4.8, reviews: 96, city: 'Sfax', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face', emergency: false },
];

const FAV_SHOPS_INIT: FavShop[] = [
  { id: 's1', name: 'Animalerie Tunis Center', city: 'Tunis', image: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=400&h=200&fit=crop', rating: 4.7, isOpen: true },
  { id: 's2', name: 'PetShop El Amal', city: 'Sfax', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=200&fit=crop', rating: 4.5, isOpen: false },
];

// ─── Toast Stack ──────────────────────────────────────────────────────────────

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="pointer-events-auto flex items-center gap-3 glass-card rounded-full px-4 py-2.5 shadow-xl border border-[var(--pc-border)]"
          >
            <span className="text-sm font-medium text-[var(--pc-text-primary)]">Retiré des favoris</span>
            <button
              onClick={() => { t.onUndo(); onDismiss(t.id); }}
              className="flex items-center gap-1 text-xs font-bold text-[var(--pc-primary)] hover:opacity-75 transition-opacity"
            >
              <RotateCcw size={12} />
              Annuler
            </button>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon, label, cta, onCta }: { icon: string; label: string; cta: string; onCta: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-[var(--pc-surface-alt)] flex items-center justify-center text-4xl">
        {icon}
      </div>
      <p className="text-[var(--pc-text-secondary)] text-sm font-medium">{label}</p>
      <button
        onClick={onCta}
        className="gradient-btn text-white text-sm font-semibold rounded-full px-6 py-2.5"
      >
        {cta}
      </button>
    </motion.div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FavoritesPage({ onBack, onNavigate }: FavoritesPageProps) {
  useTranslation();

  const [activeTab, setActiveTab] = useState<FavTab>('animals');
  const [animals, setAnimals] = useState<FavAnimal[]>(FAV_ANIMALS_INIT);
  const [vets, setVets] = useState<FavVet[]>(FAV_VETS_INIT);
  const [shops, setShops] = useState<FavShop[]>(FAV_SHOPS_INIT);
  const [favPosts, setFavPosts] = useState<FavPost[]>(FAV_POSTS_INIT);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const totalCount = animals.length + vets.length + shops.length + favPosts.length;

  function addToast(onUndo: () => void) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, onUndo }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function removeAnimal(id: string) {
    const item = animals.find((a) => a.id === id)!;
    setAnimals((prev) => prev.filter((a) => a.id !== id));
    addToast(() => setAnimals((prev) => [item, ...prev]));
  }

  function removeVet(id: string) {
    const item = vets.find((v) => v.id === id)!;
    setVets((prev) => prev.filter((v) => v.id !== id));
    addToast(() => setVets((prev) => [item, ...prev]));
  }

  function removeShop(id: string) {
    const item = shops.find((s) => s.id === id)!;
    setShops((prev) => prev.filter((s) => s.id !== id));
    addToast(() => setShops((prev) => [item, ...prev]));
  }

  function removePost(id: string) {
    const item = favPosts.find((p) => p.id === id)!;
    setFavPosts((prev) => prev.filter((p) => p.id !== id));
    addToast(() => setFavPosts((prev) => [item, ...prev]));
  }

  const tabs: { key: FavTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'animals', label: 'Animaux', icon: <PawPrint size={14} />, count: animals.length },
    { key: 'vets', label: 'Vétérinaires', icon: <Stethoscope size={14} />, count: vets.length },
    { key: 'shops', label: 'Animaleries', icon: <Store size={14} />, count: shops.length },
    { key: 'posts', label: 'Publications', icon: <ImageIcon size={14} />, count: favPosts.length },
  ];

  return (
    <div className="min-h-screen bg-[var(--pc-surface)] text-[var(--pc-text-primary)]" dir="ltr">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-[var(--pc-border)]">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-lg font-bold">Mes Favoris</h1>
          {totalCount > 0 && (
            <span className="bg-[var(--pc-primary)] text-white text-xs font-bold rounded-full px-2.5 py-0.5 min-w-[22px] text-center">
              {totalCount}
            </span>
          )}
        </div>

        {/* Tab Pills */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[var(--pc-primary)] text-white shadow-sm'
                  : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-0 leading-5 ${
                    activeTab === tab.key
                      ? 'bg-white/25 text-white'
                      : 'bg-[var(--pc-primary)]/15 text-[var(--pc-primary)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-5 pb-24">
        <AnimatePresence mode="wait">
          {/* ── Animals Tab ── */}
          {activeTab === 'animals' && (
            <motion.div
              key="animals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {animals.length === 0 ? (
                <EmptyState
                  icon="🤍"
                  label="Aucun animal sauvegardé"
                  cta="Explorer les annonces"
                  onCta={() => onNavigate('feed')}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {animals.map((animal) => (
                      <motion.div
                        key={animal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.18 } }}
                        className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                        onClick={() => onNavigate('pet-detail', { id: animal.id })}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={animal.image}
                            alt={animal.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Type badge */}
                          <span
                            className={`absolute top-2 left-2 text-[10px] font-bold rounded-full px-2 py-0.5 leading-5 ${
                              animal.type === 'adoption'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {animal.type === 'adoption' ? '🟢 Adoption' : '🔵 Vente'}
                          </span>
                          {/* Remove heart */}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeAnimal(animal.id); }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:scale-110 transition-transform"
                            aria-label="Retirer des favoris"
                          >
                            <Heart size={15} className="fill-red-500 text-red-500" />
                          </button>
                          {/* Verified badge */}
                          {animal.verified && (
                            <span className="absolute bottom-2 left-2 bg-[var(--pc-primary)] text-white text-[9px] font-bold rounded-full px-2 py-0.5">
                              ✓ Vérifié
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm text-[var(--pc-text-primary)] truncate">{animal.title}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[var(--pc-primary)] font-bold text-sm">{animal.price}</span>
                            <span className="flex items-center gap-1 text-xs text-[var(--pc-text-secondary)]">
                              <MapPin size={11} />
                              {animal.city}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Vets Tab ── */}
          {activeTab === 'vets' && (
            <motion.div
              key="vets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-3"
            >
              {vets.length === 0 ? (
                <EmptyState
                  icon="🏥"
                  label="Aucun vétérinaire sauvegardé"
                  cta="Trouver un vétérinaire"
                  onCta={() => onNavigate('search', { tab: 'vets' })}
                />
              ) : (
                <AnimatePresence>
                  {vets.map((vet) => (
                    <motion.div
                      key={vet.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12, transition: { duration: 0.18 } }}
                      className="glass-card rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={vet.image}
                          alt={vet.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[var(--pc-border)]"
                        />
                        {vet.emergency && (
                          <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-4">
                            Urgence
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[var(--pc-text-primary)]">{vet.name}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] rounded-full px-2 py-0.5">
                          {vet.specialty}
                        </span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Stars rating={vet.rating} />
                          <span className="text-xs font-semibold">{vet.rating}</span>
                          <span className="text-xs text-[var(--pc-text-secondary)]">({vet.reviews} avis)</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-[var(--pc-text-secondary)] mt-0.5">
                          <MapPin size={10} />
                          {vet.city}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button
                          onClick={() => removeVet(vet.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label="Retirer des favoris"
                        >
                          <Heart size={16} className="fill-red-500 text-red-500" />
                        </button>
                        <button className="flex items-center gap-1 text-xs font-semibold text-white bg-[var(--pc-primary)] rounded-full px-3 py-1.5 hover:opacity-90 transition-opacity whitespace-nowrap">
                          <CalendarDays size={12} />
                          Prendre RDV
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* ── Shops Tab ── */}
          {activeTab === 'shops' && (
            <motion.div
              key="shops"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {shops.length === 0 ? (
                <EmptyState
                  icon="🏪"
                  label="Aucune animalerie sauvegardée"
                  cta="Explorer les animaleries"
                  onCta={() => onNavigate('search', { tab: 'shops' })}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {shops.map((shop) => (
                      <motion.div
                        key={shop.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.18 } }}
                        className="glass-card rounded-2xl overflow-hidden group"
                      >
                        <div className="relative overflow-hidden h-28">
                          <img
                            src={shop.image}
                            alt={shop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span
                            className={`absolute top-2 left-2 text-[10px] font-bold rounded-full px-2 py-0.5 leading-5 ${
                              shop.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                            }`}
                          >
                            {shop.isOpen ? 'Ouvert' : 'Fermé'}
                          </span>
                          <button
                            onClick={() => removeShop(shop.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:scale-110 transition-transform"
                            aria-label="Retirer des favoris"
                          >
                            <Heart size={13} className="fill-red-500 text-red-500" />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm text-[var(--pc-text-primary)] truncate">{shop.name}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-[var(--pc-text-secondary)]">
                              <MapPin size={10} />
                              {shop.city}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                              <Star size={11} className="fill-amber-400" />
                              {shop.rating}
                            </span>
                          </div>
                          <button className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--pc-primary)] border border-[var(--pc-primary)] rounded-full py-1.5 hover:bg-[var(--pc-primary)] hover:text-white transition-colors">
                            <ExternalLink size={11} />
                            Voir boutique
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
          {/* ── Posts Tab ── */}
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {favPosts.length === 0 ? (
                <EmptyState
                  icon="🔖"
                  label="Aucune publication sauvegardée"
                  cta="Explorer le fil"
                  onCta={() => onNavigate('feed')}
                />
              ) : (
                <div className="columns-2 gap-3">
                  <AnimatePresence>
                    {favPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.18 } }}
                        className="break-inside-avoid mb-3 rounded-xl overflow-hidden cursor-pointer group relative"
                      >
                        <img
                          src={post.image}
                          alt={post.caption}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                          onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.id}/300/350`; }}
                        />
                        {/* Remove bookmark button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removePost(post.id); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform"
                          aria-label="Retirer des favoris"
                        >
                          <Bookmark size={14} className="fill-[var(--pc-accent)] text-[var(--pc-accent)]" />
                        </button>
                        {/* Author + likes overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-b-xl px-3 py-2.5">
                          <p className="text-white font-semibold truncate" style={{ fontSize: '11px' }}>{post.caption}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-white/80" style={{ fontSize: '10px' }}>@{post.author}</span>
                            <span className="flex items-center gap-1 text-white/80" style={{ fontSize: '10px' }}>
                              <Heart size={9} className="fill-red-400 text-red-400" /> {post.likes}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
