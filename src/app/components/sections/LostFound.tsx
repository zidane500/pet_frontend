import { motion } from 'motion/react';
import { MapPin, Calendar, Bell, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LOST = [
  { id: 'lf1', name: 'Tobi', species: 'Chien Spitz', date: '07 juin 2026', location: 'Lac 2, Tunis', image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=200&h=160&fit=crop' },
  { id: 'lf2', name: 'Isis', species: 'Chatte persane', date: '05 juin 2026', location: 'Menzah 6, Ariana', image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=160&fit=crop' },
];

const FOUND = [
  { id: 'lf3', name: 'Inconnu', species: 'Chien bâtard', date: '08 juin 2026', location: 'Ain Zaghouan, Sfax', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200&h=160&fit=crop' },
  { id: 'lf4', name: 'Inconnu', species: 'Perroquet', date: '06 juin 2026', location: 'Corniche, Sousse', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=160&fit=crop' },
];

function PetAlertCard({ pet, type }: { pet: typeof LOST[0]; type: 'lost' | 'found' }) {
  const { t } = useTranslation();
  const isLost = type === 'lost';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex gap-3 bg-[var(--pc-surface)] dark:bg-[var(--pc-surface)] rounded-2xl p-3.5 border border-[var(--pc-border)] dark:border-[var(--pc-border)]"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <img src={pet.image} alt={pet.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${pet.id}/100/100`; }} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLost ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
            {isLost ? t('lostFound.lostLabel') : t('lostFound.foundLabel')}
          </span>
        </div>
        <p className="font-bold text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)] truncate" style={{ fontSize: '14px', fontFamily: 'Sora, sans-serif' }}>
          {pet.name}
        </p>
        <p className="text-[var(--pc-text-secondary)] truncate" style={{ fontSize: '12px' }}>{pet.species}</p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-[var(--pc-text-secondary)]" style={{ fontSize: '11px' }}>
            <MapPin size={10} /><span className="truncate">{pet.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--pc-text-secondary)]" style={{ fontSize: '11px' }}>
            <Calendar size={10} /><span>{pet.date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LostFound() {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-white dark:bg-[var(--pc-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Alert banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-start sm:items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-10"
        >
          <Bell size={20} className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-amber-800 dark:text-amber-200" style={{ fontSize: '14px' }}>
            <strong>🔔 Activez les alertes de votre zone</strong> — soyez notifié si un animal est signalé près de chez vous
          </p>
          <button className="flex-shrink-0 ml-auto bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 touch-manipulation">
            Activer
          </button>
        </motion.div>

        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800 }}
            className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
          >
            {t('lostFound.title')}
          </motion.h2>
          <p className="text-[var(--pc-text-secondary)] mt-2" style={{ fontSize: '15px' }}>{t('lostFound.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Lost */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2.5">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-red-700 dark:text-red-400" style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px' }}>{t('lostFound.lost')}</h3>
              <span className="ml-auto bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">24 actifs</span>
            </div>
            <div className="space-y-3">
              {LOST.map((p) => <PetAlertCard key={p.id} pet={p} type="lost" />)}
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-red-400 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 active:scale-95 transition-all touch-manipulation" style={{ fontSize: '14px' }}>
              {t('lostFound.alert')}
            </button>
          </div>

          {/* Map placeholder */}
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-[var(--pc-primary-light)] to-[var(--pc-primary)]/10 dark:from-[var(--pc-primary-light)] dark:to-[var(--pc-primary)]/20 rounded-2xl flex flex-col items-center justify-center gap-3 border border-[var(--pc-border)] dark:border-[var(--pc-border)] p-4">
              <div className="text-5xl">🗺️</div>
              <p className="font-bold text-[var(--pc-primary)] text-center" style={{ fontSize: '14px', fontFamily: 'Sora, sans-serif' }}>Carte interactive</p>
              <p className="text-[var(--pc-text-secondary)] text-center" style={{ fontSize: '12px' }}>Signalements en temps réel à travers la Tunisie</p>
              <div className="flex gap-2 flex-wrap justify-center mt-1">
                {['📍 Tunis', '📍 Sfax', '📍 Sousse'].map(c => (
                  <span key={c} className="text-[10px] bg-white dark:bg-[var(--pc-surface)] border border-[var(--pc-border)] px-2 py-1 rounded-full text-[var(--pc-text-secondary)]">{c}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Found */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-2.5">
              <span className="text-green-500">🐾</span>
              <h3 className="font-bold text-green-700 dark:text-green-400" style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px' }}>{t('lostFound.found')}</h3>
              <span className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">11 actifs</span>
            </div>
            <div className="space-y-3">
              {FOUND.map((p) => <PetAlertCard key={p.id} pet={p} type="found" />)}
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-green-400 text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 active:scale-95 transition-all touch-manipulation" style={{ fontSize: '14px' }}>
              {t('lostFound.signal')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
