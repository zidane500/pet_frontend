import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Share2, Heart, MapPin, Phone, Mail, Star,
  BadgeCheck, Globe, ShoppingCart, Clock, Users, Tag,
} from 'lucide-react';

const SHOP = {
  name: 'Animalerie Tunis Center',
  tagline: 'Tout pour votre animal de compagnie',
  address: '45 Avenue Habib Bourguiba, Tunis Centre',
  phone: '+216 71 345 678',
  email: 'contact@animalerie-tunis.tn',
  website: 'www.animalerie-tunis.tn',
  rating: 4.7,
  reviews: 203,
  isOpen: true,
  verified: true,
  memberSince: 'Janvier 2022',
  followers: 1240,
  logo: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=200&h=200&fit=crop',
  cover: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=300&fit=crop',
  categories: ['Nourriture', 'Accessoires', 'Médicaments', 'Toilettage', 'Cages', 'Jouets'],
  hours: [
    { day: 'Lun - Ven', time: '09:00 - 19:00', open: true },
    { day: 'Samedi', time: '09:00 - 20:00', open: true },
    { day: 'Dimanche', time: '10:00 - 15:00', open: true },
  ],
};

const PRODUCTS = [
  { id: 'p1', name: 'Royal Canin Adult 15kg', price: '89 DT', oldPrice: '99 DT', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=200&h=200&fit=crop', category: 'Nourriture', badge: 'Promo' },
  { id: 'p2', name: 'Cage perroquet XL', price: '149 DT', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop', category: 'Cages', badge: 'Nouveau' },
  { id: 'p3', name: 'Kit toilettage chat', price: '45 DT', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop', category: 'Toilettage', badge: null },
  { id: 'p4', name: 'Jouet interactif chien', price: '29 DT', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop', category: 'Jouets', badge: null },
  { id: 'p5', name: 'Antiparasitaire chat', price: '18 DT', image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop', category: 'Médicaments', badge: 'Populaire' },
  { id: 'p6', name: 'Litière agglomérante 10kg', price: '22 DT', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop', category: 'Accessoires', badge: null },
];

const REVIEWS_SHOP = [
  { id: 'r1', author: 'Leila S.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=40&h=40&fit=crop&crop=face', rating: 5, text: 'Boutique très bien fournie, personnel sympa !', date: 'Juin 2026' },
  { id: 'r2', author: 'Karim M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', rating: 4, text: 'Bons produits, livraison rapide.', date: 'Mai 2026' },
];

const TABS = ['Produits', 'Promotions', 'Avis', 'À propos'] as const;
type Tab = typeof TABS[number];

const BADGE_COLORS: Record<string, string> = {
  Promo: 'bg-red-500',
  Nouveau: 'bg-blue-500',
  Populaire: 'bg-amber-500',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

export function PetShopProfilePage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<Tab>('Produits');
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [cart, setCart] = useState<string[]>([]);

  const allCategories = ['Tous', ...SHOP.categories];
  const filteredProducts =
    activeCategory === 'Tous'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const addToCart = (id: string) => setCart((prev) => [...prev, id]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--pc-surface)] pb-24">
      {/* Hero Cover */}
      <div className="relative h-48 sm:h-64">
        <img src={SHOP.cover} alt="Shop cover" className="w-full h-full object-cover" />
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

        {/* Floating logo */}
        <div className="absolute -bottom-12 left-6">
          <img
            src={SHOP.logo}
            alt={SHOP.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
          />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-[var(--pc-text-primary)]">{SHOP.name}</h1>
          {SHOP.verified && <BadgeCheck size={20} className="text-[var(--pc-primary)] mt-0.5" />}
          <span
            className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold text-white ${
              SHOP.isOpen ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {SHOP.isOpen ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
        <p className="text-sm text-[var(--pc-text-secondary)] mt-1">{SHOP.tagline}</p>

        <div className="flex items-center gap-2 mt-2">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-sm">{SHOP.rating}</span>
          <span className="text-xs text-[var(--pc-text-secondary)]">({SHOP.reviews} avis)</span>
          <span className="text-xs text-[var(--pc-text-secondary)]">· {SHOP.followers} abonnés</span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <MapPin size={14} className="text-[var(--pc-primary)] shrink-0" />
            {SHOP.address}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <Phone size={14} className="text-[var(--pc-primary)] shrink-0" />
            {SHOP.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
            <Globe size={14} className="text-[var(--pc-primary)] shrink-0" />
            {SHOP.website}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Star size={18} className="fill-amber-400 text-amber-400" />, value: `${SHOP.rating}★`, label: 'Note' },
            { icon: <Users size={18} />, value: SHOP.followers.toLocaleString(), label: 'Abonnés' },
            { icon: <Clock size={18} />, value: SHOP.memberSince, label: 'Membre depuis' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-3 text-center rounded-2xl">
              <div className="flex justify-center mb-1 text-[var(--pc-primary)]">{stat.icon}</div>
              <div className="font-bold text-sm text-[var(--pc-text-primary)]">{stat.value}</div>
              <div className="text-xs text-[var(--pc-text-secondary)]">{stat.label}</div>
            </div>
          ))}
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
          {activeTab === 'Produits' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Category filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-3">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeCategory === cat
                        ? 'text-white border-transparent'
                        : 'bg-transparent border-[var(--pc-border)] text-[var(--pc-text-secondary)]'
                    }`}
                    style={activeCategory === cat ? { background: 'var(--pc-accent)', borderColor: 'var(--pc-accent)' } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="glass-card rounded-2xl overflow-hidden">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-36 object-cover"
                      />
                      {product.badge && (
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${
                            BADGE_COLORS[product.badge] ?? 'bg-gray-500'
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm text-[var(--pc-text-primary)] mb-1 line-clamp-2">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-[var(--pc-primary)]">{product.price}</span>
                        {product.oldPrice && (
                          <span className="text-xs text-[var(--pc-text-secondary)] line-through">
                            {product.oldPrice}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product.id)}
                        className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                          cart.includes(product.id)
                            ? 'bg-green-100 text-green-700'
                            : 'text-white'
                        }`}
                        style={
                          !cart.includes(product.id)
                            ? { background: 'var(--pc-primary)' }
                            : {}
                        }
                      >
                        <ShoppingCart size={12} />
                        {cart.includes(product.id) ? 'Ajouté ✓' : 'Ajouter au panier'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'Promotions' && (
            <motion.div
              key="promos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div
                className="rounded-2xl p-5 text-white"
                style={{ background: 'linear-gradient(135deg, #e84393, #f43f5e)' }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  Offre Spéciale
                </div>
                <div className="text-2xl font-bold mb-1">Nourriture Premium</div>
                <div className="text-sm opacity-90 mb-3">
                  -10% sur toutes les croquettes Royal Canin et Purina
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black">-10%</span>
                  <button className="bg-white text-pink-600 px-4 py-2 rounded-xl text-sm font-bold">
                    Voir offre
                  </button>
                </div>
              </div>

              <div
                className="rounded-2xl p-5 text-white"
                style={{ background: 'linear-gradient(135deg, var(--pc-primary), #0f4f3a)' }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  Promo Weekend
                </div>
                <div className="text-2xl font-bold mb-1">Accessoires & Jouets</div>
                <div className="text-sm opacity-90 mb-3">
                  Achetez 2 jouets et obtenez le 3ème gratuit
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black">2+1</span>
                  <button className="bg-white text-[var(--pc-primary)] px-4 py-2 rounded-xl text-sm font-bold">
                    Voir offre
                  </button>
                </div>
              </div>

              <div
                className="rounded-2xl p-5 text-white"
                style={{ background: 'linear-gradient(135deg, var(--pc-accent), #d4871a)' }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  Fidélité
                </div>
                <div className="text-2xl font-bold mb-1">Carte de fidélité</div>
                <div className="text-sm opacity-90 mb-3">
                  Cumulez des points à chaque achat et obtenez des réductions exclusives
                </div>
                <button className="bg-white text-amber-600 px-4 py-2 rounded-xl text-sm font-bold">
                  S'inscrire
                </button>
              </div>
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
              <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[var(--pc-text-primary)]">{SHOP.rating}</div>
                  <StarRow rating={5} />
                  <div className="text-xs text-[var(--pc-text-secondary)] mt-1">{SHOP.reviews} avis</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
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

              {REVIEWS_SHOP.map((rev) => (
                <div key={rev.id} className="glass-card p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={rev.avatar} alt={rev.author} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-sm text-[var(--pc-text-primary)]">{rev.author}</div>
                      <div className="flex items-center gap-2">
                        <StarRow rating={rev.rating} />
                        <span className="text-xs text-[var(--pc-text-secondary)]">{rev.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--pc-text-secondary)]">{rev.text}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'À propos' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Categories */}
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="font-semibold text-sm text-[var(--pc-text-primary)] mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-[var(--pc-primary)]" />
                  Catégories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SHOP.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ background: 'var(--pc-primary)' }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="font-semibold text-sm text-[var(--pc-text-primary)] mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[var(--pc-primary)]" />
                  Horaires d'ouverture
                </h3>
                <div className="space-y-2">
                  {SHOP.hours.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--pc-text-secondary)]">{h.day}</span>
                      <span className="font-medium text-[var(--pc-primary)]">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="glass-card p-4 rounded-2xl space-y-3">
                <h3 className="font-semibold text-sm text-[var(--pc-text-primary)] mb-1">Contact</h3>
                {[
                  { icon: <Phone size={14} />, value: SHOP.phone },
                  { icon: <Mail size={14} />, value: SHOP.email },
                  { icon: <Globe size={14} />, value: SHOP.website },
                  { icon: <MapPin size={14} />, value: SHOP.address },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
                    <span className="text-[var(--pc-primary)]">{item.icon}</span>
                    {item.value}
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden bg-[var(--pc-surface-alt)] h-40 flex items-center justify-center border border-[var(--pc-border)]">
                <div className="text-center text-[var(--pc-text-secondary)]">
                  <MapPin size={32} className="mx-auto mb-2 text-[var(--pc-primary)]" />
                  <div className="text-sm font-medium">Voir sur la carte</div>
                  <div className="text-xs">{SHOP.address}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
