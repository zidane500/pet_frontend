import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Building2,
  Star,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PremiumPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Billing = 'monthly' | 'annual';

// ─── Plan Features ────────────────────────────────────────────────────────────

const STARTER_FEATURES = [
  '3 annonces actives',
  'Messagerie basique',
  'Profil public',
  'Recherche standard',
];

const PRO_FEATURES = [
  'Annonces illimitées',
  'Photos HD (20 par annonce)',
  'Mise en avant prioritaire',
  'Badge "Vérifié Pro"',
  'Statistiques détaillées',
  'Support prioritaire',
  'Messagerie illimitée',
  'QR Code animal',
];

const BUSINESS_FEATURES = [
  'Tout ce qu\'inclut Pro',
  'Multi-profils',
  'API access',
  'Tableau de bord analytique',
  'Gestionnaire de compte dédié',
  'Intégration website',
  'Badges personnalisés',
];

// ─── Comparison Table Data ────────────────────────────────────────────────────

type CellValue = string | boolean;

interface CompRow {
  feature: string;
  starter: CellValue;
  pro: CellValue;
  business: CellValue;
}

const COMP_ROWS: CompRow[] = [
  { feature: 'Annonces actives', starter: '3', pro: 'Illimitées', business: 'Illimitées' },
  { feature: 'Photos par annonce', starter: '5', pro: '20', business: '30' },
  { feature: 'Mise en avant', starter: false, pro: true, business: '✅ Premium' },
  { feature: 'Badge vérifié', starter: false, pro: '✅ Pro', business: '✅ Business' },
  { feature: 'Statistiques', starter: 'Basiques', pro: 'Détaillées', business: 'Avancées' },
  { feature: 'Support', starter: 'Email', pro: 'Prioritaire', business: 'Dédié' },
  { feature: 'QR Code', starter: false, pro: true, business: true },
  { feature: 'Multi-profils', starter: false, pro: false, business: true },
  { feature: 'API', starter: false, pro: false, business: true },
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Comment fonctionne le paiement ?',
    answer: 'Paiement sécurisé par carte bancaire ou virement. La facturation est mensuelle ou annuelle selon votre choix. Vous recevrez une facture par email après chaque paiement.',
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer: 'Oui, sans frais ni engagement. Votre abonnement reste actif jusqu\'à la fin de la période en cours. Aucun remboursement au prorata n\'est appliqué.',
  },
  {
    question: 'Y a-t-il un essai gratuit ?',
    answer: 'Oui ! Profitez de 14 jours d\'essai gratuit pour le plan Professionnel, sans carte bancaire requise. Vous pouvez annuler avant la fin de l\'essai sans frais.',
  },
];

// ─── Cell Renderer ────────────────────────────────────────────────────────────

function CompCell({ value }: { value: CellValue }) {
  if (value === true) {
    return <Check size={16} className="text-[var(--pc-primary)] mx-auto" />;
  }
  if (value === false) {
    return <X size={14} className="text-gray-400 dark:text-gray-600 mx-auto" />;
  }
  return <span className="text-xs font-medium text-[var(--pc-text-primary)]">{value}</span>;
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[var(--pc-border)] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[var(--pc-surface-alt)] transition-colors"
      >
        <span className="font-semibold text-sm text-[var(--pc-text-primary)]">{item.question}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-[var(--pc-text-secondary)]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-[var(--pc-text-secondary)] leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sparkle Decoration ──────────────────────────────────────────────────────

function SparkleDecor() {
  const sparks = [
    { top: '12%', left: '8%', size: 16, delay: 0 },
    { top: '25%', right: '6%', size: 12, delay: 0.6 },
    { top: '60%', left: '4%', size: 10, delay: 1.1 },
    { top: '75%', right: '10%', size: 14, delay: 0.3 },
    { top: '45%', left: '50%', size: 8, delay: 0.9 },
  ];

  return (
    <>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none text-[var(--pc-accent)]"
          style={{ top: s.top, left: (s as Record<string, unknown>).left as string | undefined, right: (s as Record<string, unknown>).right as string | undefined }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          <Sparkles size={s.size} />
        </motion.div>
      ))}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PremiumPage({ onBack, onNavigate: _onNavigate }: PremiumPageProps) {
  useTranslation();

  const [billing, setBilling] = useState<Billing>('monthly');

  const proPrice = billing === 'monthly' ? '29 DT/mois' : '23 DT/mois';
  const businessPrice = billing === 'monthly' ? '79 DT/mois' : '63 DT/mois';

  return (
    <div className="min-h-screen bg-[var(--pc-surface)] text-[var(--pc-text-primary)]" dir="ltr">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-[var(--pc-border)]">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-lg font-bold">Premium</h1>
          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--pc-accent)] bg-[var(--pc-accent)]/10 rounded-full px-3 py-1">
            <Sparkles size={12} />
            14 jours gratuits
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="dark-glow-bg relative overflow-hidden py-16 px-4">
        <SparkleDecor />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-widest uppercase text-[var(--pc-accent)] mb-3"
          >
            Animali Premium
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-3xl sm:text-4xl font-extrabold leading-tight shimmer-text mb-4"
          >
            Débloquez tout le potentiel d'Animali
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-gray-300 text-base leading-relaxed"
          >
            Plus de visibilité, plus d'outils, plus de résultats. Choisissez le plan qui vous convient.
          </motion.p>
        </div>
      </section>

      {/* Billing Toggle */}
      <div className="flex justify-center py-8 px-4">
        <div className="flex items-center gap-1 glass-card rounded-full p-1 border border-[var(--pc-border)]">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billing === 'monthly'
                ? 'bg-[var(--pc-primary)] text-white shadow-sm'
                : 'text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billing === 'annual'
                ? 'bg-[var(--pc-primary)] text-white shadow-sm'
                : 'text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]'
            }`}
          >
            Annuel
            <span className="bg-[var(--pc-accent)] text-black text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-4">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {/* Starter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          className="glass-card rounded-3xl p-6 flex flex-col border border-[var(--pc-border)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Zap size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-[var(--pc-text-primary)]">Starter</p>
              <p className="text-xs text-[var(--pc-text-secondary)]">Pour commencer</p>
            </div>
          </div>
          <div className="mb-6">
            <span className="text-3xl font-extrabold text-[var(--pc-text-primary)]">Gratuit</span>
          </div>
          <ul className="flex-1 flex flex-col gap-2.5 mb-6">
            {STARTER_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[var(--pc-text-secondary)]">
                <Check size={14} className="text-gray-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full py-2.5 rounded-full text-sm font-semibold bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] cursor-not-allowed"
          >
            Plan actuel
          </button>
        </motion.div>

        {/* Professional — Recommended */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="holo-border premium-card-glow rounded-3xl p-6 flex flex-col relative"
        >
          {/* Popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 bg-[var(--pc-accent)] text-black text-xs font-extrabold rounded-full px-3 py-1 shadow-lg whitespace-nowrap">
              <Star size={11} className="fill-black" />
              Le plus populaire
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4 mt-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--pc-primary)]/15 flex items-center justify-center">
              <Star size={18} className="text-[var(--pc-primary)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--pc-text-primary)]">Professionnel</p>
              <p className="text-xs text-[var(--pc-text-secondary)]">Le plus choisi</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-extrabold text-[var(--pc-primary)]">{proPrice}</span>
            {billing === 'annual' && (
              <p className="text-xs text-[var(--pc-text-secondary)] mt-0.5 line-through">29 DT/mois</p>
            )}
          </div>

          <ul className="flex-1 flex flex-col gap-2.5 mb-6">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[var(--pc-text-primary)]">
                <Check size={14} className="text-[var(--pc-primary)] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button className="gradient-btn w-full py-2.5 rounded-full text-sm font-bold text-white">
            <span>Passer à Pro</span>
          </button>
        </motion.div>

        {/* Business */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-3xl p-6 flex flex-col border border-[var(--pc-border)] bg-[#0D1117] dark:bg-[#0D1117]"
          style={{ background: 'linear-gradient(160deg, #0D1117 60%, #14231c)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[var(--pc-accent)]/15 flex items-center justify-center">
              <Building2 size={18} className="text-[var(--pc-accent)]" />
            </div>
            <div>
              <p className="font-bold text-white">Business</p>
              <p className="text-xs text-gray-400">Pour les professionnels</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-extrabold text-[var(--pc-accent)]">{businessPrice}</span>
            {billing === 'annual' && (
              <p className="text-xs text-gray-500 mt-0.5 line-through">79 DT/mois</p>
            )}
          </div>

          <ul className="flex-1 flex flex-col gap-2.5 mb-6">
            {BUSINESS_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <Check size={14} className="text-[var(--pc-accent)] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button className="w-full py-2.5 rounded-full text-sm font-bold text-[var(--pc-primary)] border-2 border-[var(--pc-primary)] hover:bg-[var(--pc-primary)] hover:text-white transition-colors">
            Contacter l'équipe
          </button>
        </motion.div>
      </div>

      {/* Comparison Table */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <h3 className="text-xl font-bold text-center text-[var(--pc-text-primary)] mb-6">Comparaison des plans</h3>
        <div className="glass-card rounded-3xl overflow-hidden border border-[var(--pc-border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-[var(--pc-border)]">
                  <th className="sticky left-0 bg-[var(--pc-surface)] dark:bg-[#161B22] text-left px-5 py-4 text-sm font-bold text-[var(--pc-text-primary)] w-40 z-10">
                    Fonctionnalité
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--pc-text-secondary)] w-32">Starter</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-[var(--pc-primary)] w-32">Pro</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-[var(--pc-accent)] w-32">Business</th>
                </tr>
              </thead>
              <tbody>
                {COMP_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[var(--pc-border)] last:border-0 ${
                      i % 2 === 0 ? '' : 'bg-[var(--pc-surface-alt)]/50'
                    }`}
                  >
                    <td className="sticky left-0 bg-inherit px-5 py-3.5 text-sm text-[var(--pc-text-secondary)] font-medium z-10">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CompCell value={row.starter} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CompCell value={row.pro} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CompCell value={row.business} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <h3 className="text-xl font-bold text-center text-[var(--pc-text-primary)] mb-6">Questions fréquentes</h3>
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordion key={item.question} item={item} />
          ))}
        </div>

        {/* CTA at bottom */}
        <div className="text-center mt-12">
          <p className="text-sm text-[var(--pc-text-secondary)] mb-4">
            Une question ? Notre équipe est là pour vous aider.
          </p>
          <button className="gradient-btn text-white font-bold rounded-full px-8 py-3 text-sm">
            <span>Commencer l'essai gratuit</span>
          </button>
        </div>
      </section>
    </div>
  );
}
