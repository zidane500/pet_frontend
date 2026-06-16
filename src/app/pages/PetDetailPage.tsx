import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Heart, Share2, MapPin, Eye, Calendar, Star,
  ChevronLeft, ChevronRight, Phone, MessageCircle, Tag,
  BadgeCheck, AlertCircle,
} from 'lucide-react';

interface PetDetailPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  listingId?: string;
}

const LISTING = {
  id: 'l1',
  type: 'vente',
  title: 'Max - Berger Allemand',
  price: 850,
  city: 'Tunis',
  governorate: 'Tunis',
  postedDate: '10 juin 2026',
  views: 1240,
  favorites: 34,
  animal: {
    species: 'Chien',
    breed: 'Berger Allemand',
    sex: 'Mâle',
    age: '3 ans',
    size: 'Grand',
    color: 'Fauve et noir',
    vaccinated: true,
    sterilized: false,
    pedigree: true,
    microchip: true,
  },
  description:
    "Magnifique Berger Allemand de 3 ans, LOF, toutes vaccinations à jour. Très sociable avec les enfants et les autres animaux. Élevé en famille depuis son plus jeune âge. Vendu pour raisons personnelles. Possibilité de fournir son carnet de santé complet et son certificat de pedigree. Prix ferme, sérieux s'abstenir.",
  images: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1617882624124-5c36a20b97f5?w=800&h=600&fit=crop',
  ],
  seller: {
    id: 'u1',
    name: 'Ahmed Ben Salah',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    type: 'particulier',
    verified: true,
    memberSince: 'Jan 2024',
    responseRate: '98%',
    responseTime: '< 1h',
    rating: 4.8,
    reviews: 23,
    totalListings: 7,
  },
};

const SIMILAR = [
  {
    id: 's1',
    title: 'Rex - Berger Allemand',
    price: '650 DT',
    city: 'Sfax',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=200&fit=crop',
    type: 'vente',
  },
  {
    id: 's2',
    title: 'Zeus - Berger croisé',
    price: '450 DT',
    city: 'Sousse',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    type: 'vente',
  },
  {
    id: 's3',
    title: 'Luna - Berger Belge',
    price: 'Adoption',
    city: 'Monastir',
    image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=300&h=200&fit=crop',
    type: 'adoption',
  },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  vente: { label: 'Vente', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: '🔵' },
  adoption: { label: 'Adoption', color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: '💚' },
  perdu: { label: 'Animal perdu', color: '#F97316', bg: 'rgba(249,115,22,0.12)', icon: '🔍' },
  trouve: { label: 'Animal trouvé', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', icon: '🏠' },
  accouplement: { label: 'Accouplement', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: '🤝' },
  conseils: { label: 'Conseils', color: '#EC4899', bg: 'rgba(236,72,153,0.12)', icon: '💡' },
};

export function PetDetailPage({ onBack, onNavigate, listingId: _listingId }: PetDetailPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [currentImg, setCurrentImg] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const typeConfig = TYPE_CONFIG[LISTING.type] ?? TYPE_CONFIG.vente;
  const descShort = LISTING.description.slice(0, 180);
  const isLongDesc = LISTING.description.length > 180;

  const prevImg = () => setCurrentImg(i => (i === 0 ? LISTING.images.length - 1 : i - 1));
  const nextImg = () => setCurrentImg(i => (i === LISTING.images.length - 1 ? 0 : i + 1));

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? nextImg() : prevImg();
    setTouchStart(null);
  };

  const CharacteristicGrid = () => {
    const traits: { label: string; value: string }[] = [
      { label: 'Espèce', value: LISTING.animal.species },
      { label: 'Race', value: LISTING.animal.breed },
      { label: 'Sexe', value: LISTING.animal.sex },
      { label: 'Âge', value: LISTING.animal.age },
      { label: 'Taille', value: LISTING.animal.size },
      { label: 'Couleur', value: LISTING.animal.color },
      { label: 'Vacciné', value: LISTING.animal.vaccinated ? '✅ Oui' : '❌ Non' },
      { label: 'Stérilisé', value: LISTING.animal.sterilized ? '✅ Oui' : '❌ Non' },
      { label: 'Pedigree', value: LISTING.animal.pedigree ? '✅ Oui' : '❌ Non' },
      { label: 'Micropuce', value: LISTING.animal.microchip ? '✅ Oui' : '❌ Non' },
    ];
    return (
      <div className="grid grid-cols-2 gap-2">
        {traits.map(t => (
          <div
            key={t.label}
            className="rounded-2xl p-3"
            style={{ background: 'var(--pc-surface-alt)' }}
          >
            <p className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>{t.label}</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--pc-text-primary)' }}>{t.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const Gallery = () => (
    <div className="relative select-none">
      <div
        className="relative w-full overflow-hidden rounded-b-3xl lg:rounded-3xl"
        style={{ aspectRatio: '16/9' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImg}
            src={LISTING.images[currentImg]}
            alt={LISTING.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Counter badge */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          {currentImg + 1}/{LISTING.images.length}
        </div>

        {/* Share button */}
        <button
          className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => navigator.share?.({ title: LISTING.title, url: window.location.href })}
        >
          <Share2 size={16} className="text-white" />
        </button>

        {/* Favorite button */}
        <button
          onClick={() => setFavorited(f => !f)}
          className="absolute top-3 right-12 w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <Heart
            size={16}
            className={favorited ? 'fill-red-500 text-red-500' : 'text-white'}
          />
        </button>

        {/* Prev / Next */}
        {LISTING.images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-2 px-1">
        {LISTING.images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className="w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0"
            style={{ borderColor: currentImg === i ? 'var(--pc-primary)' : 'transparent' }}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );

  const InfoSection = () => (
    <div className="space-y-3">
      {/* Type badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: typeConfig.bg, color: typeConfig.color }}
        >
          {typeConfig.icon} {typeConfig.label}
        </span>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--pc-text-secondary)' }}>
          <Eye size={12} />
          <span>{LISTING.views.toLocaleString()} vues</span>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--pc-text-secondary)' }}>
          <Calendar size={12} />
          <span>{LISTING.postedDate}</span>
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-2xl font-bold leading-tight"
        style={{ color: 'var(--pc-text-primary)', fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}
      >
        {LISTING.title}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-extrabold"
          style={{ color: 'var(--pc-primary)' }}
        >
          {LISTING.price} DT
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5" style={{ color: 'var(--pc-text-secondary)' }}>
        <MapPin size={15} />
        <span className="text-sm">{LISTING.city}, {LISTING.governorate}</span>
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={14}
            className={star <= Math.round(LISTING.seller.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm font-medium ml-1" style={{ color: 'var(--pc-text-primary)' }}>
          {LISTING.seller.rating}
        </span>
        <span className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>
          ({LISTING.seller.reviews} avis)
        </span>
      </div>
    </div>
  );

  const DescriptionSection = () => (
    <div>
      <h3 className="text-base font-bold mb-2" style={{ color: 'var(--pc-text-primary)' }}>Description</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--pc-text-secondary)' }}>
        {isLongDesc && !showMore ? descShort + '…' : LISTING.description}
      </p>
      {isLongDesc && (
        <button
          onClick={() => setShowMore(s => !s)}
          className="mt-2 text-sm font-semibold"
          style={{ color: 'var(--pc-primary)' }}
        >
          {showMore ? 'Voir moins' : 'Voir plus'}
        </button>
      )}
    </div>
  );

  const SellerCard = () => (
    <div className="glass-card rounded-3xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={LISTING.seller.avatar}
            alt={LISTING.seller.name}
            className="w-14 h-14 rounded-2xl object-cover"
          />
          {LISTING.seller.verified && (
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--pc-primary)' }}
            >
              <BadgeCheck size={11} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-sm" style={{ color: 'var(--pc-text-primary)' }}>
              {LISTING.seller.name}
            </p>
            {LISTING.seller.verified && (
              <BadgeCheck size={14} style={{ color: 'var(--pc-primary)' }} />
            )}
          </div>
          <span
            className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full capitalize font-medium"
            style={{ background: 'var(--pc-surface-alt)', color: 'var(--pc-text-secondary)' }}
          >
            {LISTING.seller.type}
          </span>
          <p className="text-xs mt-1" style={{ color: 'var(--pc-text-secondary)' }}>
            Membre depuis {LISTING.seller.memberSince}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl p-2" style={{ background: 'var(--pc-surface-alt)' }}>
          <p className="font-bold text-sm" style={{ color: 'var(--pc-primary)' }}>{LISTING.seller.rating}</p>
          <p className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>Note</p>
        </div>
        <div className="rounded-2xl p-2" style={{ background: 'var(--pc-surface-alt)' }}>
          <p className="font-bold text-sm" style={{ color: 'var(--pc-primary)' }}>{LISTING.seller.responseRate}</p>
          <p className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>Réponse</p>
        </div>
        <div className="rounded-2xl p-2" style={{ background: 'var(--pc-surface-alt)' }}>
          <p className="font-bold text-sm" style={{ color: 'var(--pc-primary)' }}>{LISTING.seller.totalListings}</p>
          <p className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>Annonces</p>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--pc-text-secondary)' }}>
        Temps de réponse moyen : <span className="font-semibold">{LISTING.seller.responseTime}</span>
      </p>

      {/* CTA buttons */}
      <div className="space-y-2">
        <button
          className="w-full py-3 rounded-2xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderColor: 'var(--pc-border)',
            color: 'var(--pc-text-primary)',
            background: 'transparent',
          }}
        >
          <Phone size={16} />
          Appeler
        </button>
        <button
          className="w-full py-3 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)' }}
          onClick={() => onNavigate('messages', { sellerId: LISTING.seller.id })}
        >
          <MessageCircle size={16} />
          Envoyer un message
        </button>
        <button
          className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: 'rgba(244,167,50,0.15)', color: 'var(--pc-accent)' }}
        >
          <Tag size={16} />
          Faire une offre
        </button>
      </div>

      <div className="text-center">
        <button
          className="text-xs flex items-center gap-1 mx-auto"
          style={{ color: 'var(--pc-text-secondary)' }}
        >
          <AlertCircle size={12} />
          Signaler cette annonce
        </button>
      </div>
    </div>
  );

  const SimilarListings = () => (
    <div>
      <h3 className="text-base font-bold mb-3" style={{ color: 'var(--pc-text-primary)' }}>
        Annonces similaires
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {SIMILAR.map(item => {
          const tc = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.vente;
          return (
            <button
              key={item.id}
              className="flex-shrink-0 w-44 glass-card rounded-2xl overflow-hidden text-left"
              onClick={() => onNavigate('pet-detail', { listingId: item.id })}
            >
              <img src={item.image} alt={item.title} className="w-full h-28 object-cover" />
              <div className="p-3">
                <p
                  className="text-sm font-semibold leading-tight line-clamp-2"
                  style={{ color: 'var(--pc-text-primary)' }}
                >
                  {item.title}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: item.type === 'adoption' ? 'var(--pc-primary)' : 'var(--pc-primary)' }}
                  >
                    {item.price}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>
                    {item.city}
                  </span>
                </div>
                <span
                  className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: tc.bg, color: tc.color }}
                >
                  {tc.icon} {tc.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen"
      style={{ background: 'var(--pc-surface)', color: 'var(--pc-text-primary)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 glass-card border-b"
        style={{ borderColor: 'var(--pc-border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: 'var(--pc-text-secondary)' }} />
            <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--pc-text-secondary)' }}>
              Retour
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavorited(f => !f)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Heart
                size={20}
                className={favorited ? 'fill-red-500 text-red-500' : ''}
                style={!favorited ? { color: 'var(--pc-text-secondary)' } : {}}
              />
            </button>
            <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <Share2 size={20} style={{ color: 'var(--pc-text-secondary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="lg:flex lg:gap-8 lg:items-start">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            <Gallery />

            {/* Mobile: info below gallery */}
            <div className="lg:hidden space-y-5">
              <InfoSection />
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm border flex items-center justify-center gap-2"
                  style={{
                    borderColor: 'var(--pc-border)',
                    color: 'var(--pc-text-primary)',
                    background: 'transparent',
                  }}
                >
                  <Phone size={16} />
                  Appeler
                </button>
                <button
                  className="flex-[2] py-3 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)' }}
                  onClick={() => onNavigate('messages', { sellerId: LISTING.seller.id })}
                >
                  <MessageCircle size={16} />
                  Contacter
                </button>
              </div>
            </div>

            <DescriptionSection />

            <div>
              <h3 className="text-base font-bold mb-3" style={{ color: 'var(--pc-text-primary)' }}>
                Caractéristiques
              </h3>
              <CharacteristicGrid />
            </div>

            {/* Seller card on mobile */}
            <div className="lg:hidden">
              <h3 className="text-base font-bold mb-3" style={{ color: 'var(--pc-text-primary)' }}>
                Vendeur
              </h3>
              <SellerCard />
            </div>

            <SimilarListings />
          </div>

          {/* Right column — desktop only */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="glass-card rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: typeConfig.bg, color: typeConfig.color }}
                  >
                    {typeConfig.icon} {typeConfig.label}
                  </span>
                </div>
                <h2
                  className="font-bold text-xl leading-tight"
                  style={{ color: 'var(--pc-text-primary)', fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}
                >
                  {LISTING.title}
                </h2>
                <div className="text-3xl font-extrabold" style={{ color: 'var(--pc-primary)' }}>
                  {LISTING.price} DT
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--pc-text-secondary)' }}>
                  <MapPin size={14} />
                  {LISTING.city}, {LISTING.governorate}
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--pc-text-secondary)' }}>
                  <span className="flex items-center gap-1"><Eye size={12} />{LISTING.views.toLocaleString()} vues</span>
                  <span className="flex items-center gap-1"><Heart size={12} />{LISTING.favorites} favoris</span>
                  <span className="flex items-center gap-1"><Calendar size={12} />{LISTING.postedDate}</span>
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    className="w-full py-3 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)' }}
                    onClick={() => onNavigate('messages', { sellerId: LISTING.seller.id })}
                  >
                    <MessageCircle size={16} />
                    Envoyer un message
                  </button>
                  <button
                    className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'rgba(244,167,50,0.15)', color: 'var(--pc-accent)' }}
                  >
                    <Tag size={16} />
                    Faire une offre
                  </button>
                </div>
              </div>

              <SellerCard />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-card border-t px-4 py-3 flex items-center gap-3"
        style={{ borderColor: 'var(--pc-border)' }}
      >
        <div className="flex-1">
          <p className="text-xs" style={{ color: 'var(--pc-text-secondary)' }}>Prix</p>
          <p className="text-xl font-extrabold" style={{ color: 'var(--pc-primary)' }}>
            {LISTING.price} DT
          </p>
        </div>
        <button
          className="flex-shrink-0 px-6 py-3 rounded-2xl font-semibold text-sm text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2ecc8a)' }}
          onClick={() => onNavigate('messages', { sellerId: LISTING.seller.id })}
        >
          <MessageCircle size={16} />
          Contacter
        </button>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
