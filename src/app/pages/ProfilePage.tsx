import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, BadgeCheck, MapPin, Calendar, MessageCircle,
  Share2, Star, Eye, Shield, Heart, Clock, MoreHorizontal, Flag, X, Instagram, Facebook, Link,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ── Types ──────────────────────────────────────────────────────────────────
interface ProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  userId?: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────
const USER = {
  id: 'u1',
  name: 'Ahmed Ben Salah',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  coverImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=300&fit=crop',
  type: 'eleveur',
  verified: true,
  bio: 'Éleveur passionné de Bergers Allemands depuis 15 ans. LOF. Basé à Tunis.',
  location: 'Tunis, Tunisie',
  memberSince: 'Janvier 2024',
  responseRate: '98%',
  activeListings: 4,
  followers: 342,
  following: 89,
  rating: 4.8,
  reviews: 23,
  totalListings: 31,
};

const MOCK_RESULTS = [
  { id: 'r1', type: 'vente' as const, title: 'Max - Berger Allemand', breed: 'Berger Allemand', species: 'Chien', price: 850, city: 'Tunis', governorate: 'Tunis', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop', age: '3 ans', sex: 'Mâle', vaccinated: true, verified: true, postedAgo: '2h', views: 1240 },
  { id: 'r2', type: 'adoption' as const, title: 'Luna - Chatte tigrée', breed: 'Européen', species: 'Chat', price: 0, city: 'Sfax', governorate: 'Sfax', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop', age: '1 an', sex: 'Femelle', vaccinated: true, verified: false, postedAgo: '5h', views: 890 },
  { id: 'r3', type: 'vente' as const, title: 'Perroquet Ara Bleu', breed: 'Ara bleu et jaune', species: 'Oiseau', price: 1200, city: 'Sousse', governorate: 'Sousse', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop', age: '2 ans', sex: 'Mâle', vaccinated: false, verified: true, postedAgo: '1j', views: 567 },
  { id: 'r4', type: 'adoption' as const, title: 'Nala - Labrador Mix', breed: 'Labrador', species: 'Chien', price: 0, city: 'Tunis', governorate: 'Tunis', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop', age: '2 ans', sex: 'Femelle', vaccinated: true, verified: true, postedAgo: '3h', views: 2100 },
];

const USER_LISTINGS = MOCK_RESULTS.slice(0, 4);

const USER_REVIEWS = [
  { id: 'rv1', author: 'Marwa T.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', rating: 5, text: 'Très sérieux, chien exactement comme décrit. Je recommande !', date: 'Mai 2026' },
  { id: 'rv2', author: 'Karim B.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', rating: 5, text: 'Transaction parfaite, vendeur honnête et disponible.', date: 'Avril 2026' },
  { id: 'rv3', author: 'Sonia A.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=40&h=40&fit=crop&crop=face', rating: 4, text: 'Bon éleveur, animal en bonne santé. Livraison rapide.', date: 'Mars 2026' },
];

type Tab = 'annonces' | 'publications' | 'avis' | 'favoris' | 'apropos';

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  vente: { label: 'Vente', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
  adoption: { label: 'Adoption', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  perdu: { label: 'Perdu', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
  trouve: { label: 'Trouvé', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
};

// ── Star Rating ────────────────────────────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-[var(--pc-border)]'}
        />
      ))}
    </div>
  );
}

// ── Listing Mini Card ──────────────────────────────────────────────────────
function ListingMiniCard({ listing, onClick }: { listing: typeof USER_LISTINGS[0]; onClick: () => void }) {
  const badge = TYPE_BADGE[listing.type];
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(29,125,95,0.12)' }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={listing.image} alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/400/300`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
        {listing.verified && (
          <div className="absolute top-2 right-2 bg-[var(--pc-primary)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <Shield size={8} /> Vérifié
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white px-1.5 py-0.5 rounded-full" style={{ fontSize: '9px' }}>
          <Eye size={8} /> {listing.views.toLocaleString()}
        </div>
      </div>
      <div className="p-3">
        <p className="font-bold text-[var(--pc-text-primary)] truncate" style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>{listing.title}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-[var(--pc-text-secondary)]" style={{ fontSize: '10px' }}>
            <MapPin size={8} /> {listing.city}
          </div>
          <span className="font-black text-[var(--pc-primary)]" style={{ fontSize: '12px' }}>
            {listing.price > 0 ? `${listing.price} DT` : '💚 Gratuit'}
          </span>
        </div>
        <div className="flex gap-1 mt-1.5">
          <span className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md" style={{ fontSize: '9px' }}>{listing.age}</span>
          <span className="bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] px-1.5 py-0.5 rounded-md" style={{ fontSize: '9px' }}>{listing.sex}</span>
          {listing.vaccinated && (
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md" style={{ fontSize: '9px' }}>💉</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const REPORT_REASONS_PROFILE = ['Faux profil', 'Comportement abusif', 'Spam', 'Arnaque', 'Autre'];

function ProfileReportModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => { if (!selected) return; setSubmitted(true); setTimeout(onClose, 1500); };
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full sm:max-w-sm glass-card rounded-t-3xl sm:rounded-3xl p-6 mx-4" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
        {submitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">✅</div>
            <p className="font-bold text-[var(--pc-text-primary)]">Signalement envoyé</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--pc-text-primary)]" style={{ fontSize: '16px' }}>Signaler ce profil</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] transition-colors"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {REPORT_REASONS_PROFILE.map(reason => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected === reason ? 'border-[var(--pc-primary)] bg-[var(--pc-primary)]' : 'border-[var(--pc-border)]'}`}>
                    {selected === reason && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input type="radio" name="profile-report" value={reason} checked={selected === reason} onChange={() => setSelected(reason)} className="sr-only" />
                  <span className="text-[var(--pc-text-primary)] font-medium" style={{ fontSize: '13px' }}>{reason}</span>
                </label>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={!selected} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, var(--pc-primary), #2aad85)', fontSize: '14px' }}>
              Envoyer le signalement
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function ProfilePage({ onBack, onNavigate, userId }: ProfilePageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const isOwnProfile = !userId || userId === USER.id;
  const [activeTab, setActiveTab] = useState<Tab>('annonces');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(USER.followers);
  const [followAnim, setFollowAnim] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing(prev => {
      setFollowers(f => prev ? f - 1 : f + 1);
      return !prev;
    });
    setFollowAnim(true);
    setTimeout(() => setFollowAnim(false), 600);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`https://animali.tn/profile/${USER.id}`).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'annonces', label: `Annonces (${USER_LISTINGS.length})` },
    { key: 'publications', label: 'Publications' },
    { key: 'avis', label: `Avis (${USER_REVIEWS.length})` },
    { key: 'favoris', label: 'Favoris' },
    { key: 'apropos', label: 'À propos' },
  ];

  // Profile completion calculation
  const completionItems = [
    { label: 'Photo', done: !!USER.avatar },
    { label: 'Bio', done: !!USER.bio },
    { label: 'Localisation', done: !!USER.location },
    { label: 'Téléphone', done: false },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12]" dir={isRtl ? 'rtl' : 'ltr'}>
      <AnimatePresence>
        {showReportModal && <ProfileReportModal onClose={() => { setShowReportModal(false); setShowMoreMenu(false); }} />}
      </AnimatePresence>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card rounded-full px-5 py-2.5 shadow-xl border border-[var(--pc-border)] flex items-center gap-2"
          >
            <Link size={14} className="text-[var(--pc-primary)]" />
            <span className="text-sm font-semibold text-[var(--pc-text-primary)]">Lien copié !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button — floats over cover */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
        >
          <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
        </motion.button>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShareProfile}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
          >
            <Share2 size={18} />
          </motion.button>
          {/* (...) dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMoreMenu(v => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
            >
              <MoreHorizontal size={18} />
            </motion.button>
            <AnimatePresence>
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -8 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-40 w-48 glass-card rounded-2xl border border-[var(--pc-border)] shadow-xl overflow-hidden"
                  >
                    <button onClick={() => { setShowReportModal(true); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Flag size={14} /> Signaler ce profil
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div className="relative h-40 sm:h-56 overflow-hidden">
        <img
          src={USER.coverImage} alt="cover"
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/cover/800/300'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* Profile section */}
      <div className="relative px-4 -mt-16">
        <div className="flex items-end gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={USER.avatar} alt={USER.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--pc-surface)] dark:ring-[#0D1117] shadow-xl"
              onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/avatar/200/200'; }}
            />
            {USER.verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--pc-primary)] rounded-full flex items-center justify-center shadow-lg">
                <BadgeCheck size={16} className="text-white" />
              </div>
            )}
          </div>
          {/* Spacer so actions float right */}
          <div className="flex-1" />
          {/* Action buttons (desktop) */}
          <div className={`hidden sm:flex items-center gap-2 pb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {isOwnProfile ? (
              <>
                <button className="px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all" style={{ fontSize: '13px' }}>
                  Modifier le profil
                </button>
                <motion.button whileTap={{ scale: 0.95 }} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors">
                  <Share2 size={16} className="text-[var(--pc-text-secondary)]" />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  animate={followAnim ? { scale: [1, 1.12, 1] } : {}}
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 rounded-xl font-bold transition-all ${isFollowing ? 'border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-red-400 hover:text-red-500' : 'bg-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/25'}`}
                  style={{ fontSize: '13px' }}
                >
                  {isFollowing ? 'Abonné ✓' : 'Suivre'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all" style={{ fontSize: '13px' }}>
                  <MessageCircle size={15} /> Message
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareProfile} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors">
                  <Share2 size={16} className="text-[var(--pc-text-secondary)]" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="mb-4">
          <div className={`flex items-center gap-2 flex-wrap mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h1 className="font-black text-[var(--pc-text-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px' }}>{USER.name}</h1>
            {USER.verified && <BadgeCheck size={20} className="text-[var(--pc-primary)]" />}
            <span className="bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] px-2.5 py-0.5 rounded-full font-semibold capitalize" style={{ fontSize: '11px' }}>{USER.type}</span>
          </div>
          <p className="text-[var(--pc-text-secondary)] mb-3 leading-relaxed" style={{ fontSize: '13px' }}>{USER.bio}</p>
          <div className={`flex flex-wrap items-center gap-3 text-[var(--pc-text-secondary)] ${isRtl ? 'flex-row-reverse' : ''}`} style={{ fontSize: '12px' }}>
            <span className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}><MapPin size={12} /> {USER.location}</span>
            <span className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}><Calendar size={12} /> Membre depuis {USER.memberSince}</span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className={`flex flex-wrap gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Shield size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold" style={{ fontSize: '11px' }}>Compte vérifié</span>
          </div>
          <div className={`flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Clock size={12} className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-400 font-semibold" style={{ fontSize: '11px' }}>Répond {USER.responseRate}</span>
          </div>
          <div className={`flex items-center gap-1.5 bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Eye size={12} className="text-[var(--pc-text-secondary)]" />
            <span className="text-[var(--pc-text-secondary)] font-semibold" style={{ fontSize: '11px' }}>{USER.activeListings} annonces actives</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="glass-card rounded-2xl grid grid-cols-4 divide-x divide-[var(--pc-border)] mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {[
            { label: 'Abonnés', value: followers.toLocaleString() },
            { label: 'Abonnements', value: USER.following.toLocaleString() },
            { label: 'Annonces', value: USER.totalListings.toLocaleString() },
            { label: 'Note', value: USER.rating.toFixed(1) },
          ].map(({ label, value }) => (
            <button key={label} className="flex flex-col items-center py-3 hover:bg-[var(--pc-surface-alt)] transition-colors rounded-2xl">
              <span className="font-black text-[var(--pc-text-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px' }}>{value}</span>
              <span className="text-[var(--pc-text-secondary)]" style={{ fontSize: '10px' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Rating */}
        <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <StarRating rating={Math.round(USER.rating)} size={16} />
          <span className="font-bold text-[var(--pc-text-primary)]" style={{ fontSize: '14px' }}>{USER.rating}</span>
          <span className="text-[var(--pc-text-secondary)]" style={{ fontSize: '12px' }}>({USER.reviews} avis)</span>
        </div>

        {/* Profile completion bar (own profile only) */}
        {isOwnProfile && (
          <div className="glass-card rounded-2xl p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[var(--pc-text-primary)]" style={{ fontSize: '13px' }}>Complétude du profil</span>
              <span className="font-black text-[var(--pc-primary)]" style={{ fontSize: '14px' }}>{completionPct}%</span>
            </div>
            <div className="h-2 bg-[var(--pc-border)] rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--pc-primary)] to-emerald-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {completionItems.map(item => (
                <span key={item.label} className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.done ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                  {item.label} {item.done ? '✓' : '✗'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mobile action buttons */}
        <div className={`sm:hidden flex items-center gap-2 mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {isOwnProfile ? (
            <>
              <button className="flex-1 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all" style={{ fontSize: '13px' }}>
                Modifier le profil
              </button>
              <motion.button whileTap={{ scale: 0.95 }} className="w-11 h-11 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors">
                <Share2 size={17} className="text-[var(--pc-text-secondary)]" />
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={followAnim ? { scale: [1, 1.12, 1] } : {}}
                onClick={handleFollowToggle}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isFollowing ? 'border border-[var(--pc-border)] text-[var(--pc-text-secondary)]' : 'bg-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/25'}`}
                style={{ fontSize: '13px' }}
              >
                {isFollowing ? 'Abonné ✓' : 'Suivre'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] font-semibold hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-all" style={{ fontSize: '13px' }}>
                <MessageCircle size={15} /> Message
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareProfile} className="w-11 h-11 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors">
                <Share2 size={17} className="text-[var(--pc-text-secondary)]" />
              </motion.button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className={`flex items-center border-b border-[var(--pc-border)] mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === key ? 'text-[var(--pc-primary)]' : 'text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]'}`}
              style={{ fontSize: '13px' }}
            >
              {label}
              {activeTab === key && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--pc-primary)] rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'annonces' && (
            <motion.div
              key="annonces"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-8"
            >
              {USER_LISTINGS.map(listing => (
                <ListingMiniCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => onNavigate('pet-detail', { id: listing.id })}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'publications' && (
            <motion.div
              key="publications"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="columns-3 gap-2 pb-8"
            >
              {USER_LISTINGS.concat(USER_LISTINGS).map((listing, i) => (
                <motion.div
                  key={`pub-${listing.id}-${i}`}
                  whileHover={{ scale: 1.02 }}
                  className="break-inside-avoid mb-2 rounded-xl overflow-hidden cursor-pointer group relative"
                >
                  <img
                    src={listing.image} alt={listing.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-400"
                    style={{ aspectRatio: i % 3 === 1 ? '1/1.4' : '1/1' }}
                    onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id + i}/300/300`; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white">
                    <span style={{ fontSize: '11px' }}><Eye size={12} className="inline mr-1" />{listing.views}</span>
                    <span style={{ fontSize: '11px' }}><Heart size={12} className="inline mr-1" />12</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'avis' && (
            <motion.div
              key="avis"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 pb-8"
            >
              {/* Summary */}
              <div className="glass-card rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="text-center">
                  <p className="font-black text-[var(--pc-text-primary)]" style={{ fontFamily: 'Sora, sans-serif', fontSize: '36px' }}>{USER.rating}</p>
                  <StarRating rating={Math.round(USER.rating)} size={14} />
                  <p className="text-[var(--pc-text-secondary)] mt-1" style={{ fontSize: '11px' }}>{USER.reviews} avis</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = star === 5 ? 18 : star === 4 ? 4 : star === 3 ? 1 : 0;
                    const pct = (count / USER.reviews) * 100;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[var(--pc-text-secondary)] w-2 text-right" style={{ fontSize: '10px' }}>{star}</span>
                        <Star size={9} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-1.5 bg-[var(--pc-border)] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[var(--pc-text-secondary)] w-3" style={{ fontSize: '10px' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual reviews */}
              {USER_REVIEWS.map(review => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-4"
                  style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                >
                  <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={review.avatar} alt={review.author}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${review.id}/40/40`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center justify-between gap-2 mb-1 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <p className="font-bold text-[var(--pc-text-primary)]" style={{ fontSize: '13px' }}>{review.author}</p>
                        <span className="text-[var(--pc-text-secondary)]" style={{ fontSize: '11px' }}>{review.date}</span>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                      <p className="text-[var(--pc-text-secondary)] mt-2 leading-relaxed" style={{ fontSize: '13px' }}>{review.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          {activeTab === 'favoris' && (
            <motion.div
              key="favoris"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-20 gap-4 text-center pb-8"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--pc-surface-alt)] flex items-center justify-center text-4xl">🤍</div>
              <p className="text-[var(--pc-text-secondary)] text-sm font-medium">Les favoris sont privés</p>
            </motion.div>
          )}

          {activeTab === 'apropos' && (
            <motion.div
              key="apropos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 pb-8"
            >
              {/* Bio */}
              <div className="glass-card rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p className="font-bold text-[var(--pc-text-primary)] mb-2" style={{ fontSize: '13px' }}>Bio</p>
                <p className="text-[var(--pc-text-secondary)] leading-relaxed" style={{ fontSize: '13px' }}>{USER.bio}</p>
              </div>

              {/* Info chips */}
              <div className="glass-card rounded-2xl p-4 flex flex-col gap-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--pc-primary)]" />
                  <span className="text-[var(--pc-text-secondary)]" style={{ fontSize: '12px' }}>Membre depuis {USER.memberSince}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold" style={{ fontSize: '12px' }}>Compte vérifié</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-[var(--pc-text-secondary)]" style={{ fontSize: '12px' }}>Taux de réponse : {USER.responseRate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-[var(--pc-text-secondary)]" style={{ fontSize: '12px' }}>Spécialité : Bergers Allemands LOF</span>
                </div>
              </div>

              {/* Social links */}
              <div className="glass-card rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p className="font-bold text-[var(--pc-text-primary)] mb-3" style={{ fontSize: '13px' }}>Réseaux sociaux</p>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-pink-400 hover:text-pink-500 transition-all" style={{ fontSize: '12px' }}>
                    <Instagram size={14} /> Instagram
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-blue-500 hover:text-blue-600 transition-all" style={{ fontSize: '12px' }}>
                    <Facebook size={14} /> Facebook
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
