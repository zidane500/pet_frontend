import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'buying',
    label: 'Acheter un animal',
    icon: '🐾',
    items: [
      {
        id: 'b1',
        question: 'Comment acheter un animal en toute sécurité ?',
        answer:
          'Vérifiez toujours le profil du vendeur et ses avis. Utilisez exclusivement la messagerie intégrée pour communiquer. Rencontrez le vendeur en personne dans un lieu public ou chez lui pour constater l\'état de l\'animal. Demandez les documents sanitaires (carnet de vaccination, certificat vétérinaire). Évitez les paiements à l\'avance avant de voir l\'animal. En cas de doute, signalez l\'annonce.',
      },
      {
        id: 'b2',
        question: 'Quels documents dois-je demander au vendeur ?',
        answer:
          'Pour un chien ou chat : le carnet de santé avec les vaccins à jour, le certificat de naissance (pedigree si applicable), et idéalement un certificat vétérinaire récent. Pour les animaux exotiques : vérifiez qu\'ils sont légalement détenus et demandez les autorisations nécessaires.',
      },
      {
        id: 'b3',
        question: 'Comment savoir si une annonce est fiable ?',
        answer:
          'Les annonces fiables ont des photos claires et authentiques, un profil vendeur vérifié (badge vert), des avis d\'autres acheteurs, une description détaillée et cohérente. Méfiez-vous des prix anormalement bas, des photos copiées sur internet, ou des vendeurs qui refusent toute rencontre en personne.',
      },
    ],
  },
  {
    id: 'adoption',
    label: 'Adoption',
    icon: '❤️',
    items: [
      {
        id: 'a1',
        question: 'Comment fonctionne l\'adoption ?',
        answer:
          'Parcourez les annonces d\'adoption gratuites ou les profils des refuges partenaires. Contactez le refuge ou le propriétaire via la messagerie intégrée. Après un entretien et une visite, remplissez un formulaire d\'adoption. Certains refuges demandent un droit d\'adoption symbolique pour couvrir les frais vétérinaires de l\'animal.',
      },
      {
        id: 'a2',
        question: 'Puis-je adopter si je suis locataire ?',
        answer:
          'Oui, si votre bail le permet ou si votre propriétaire accepte les animaux. Il est recommandé d\'obtenir l\'accord écrit de votre propriétaire avant d\'adopter. Certains refuges peuvent demander une preuve de l\'accord de votre propriétaire.',
      },
      {
        id: 'a3',
        question: 'Y a-t-il des frais pour adopter via Animali ?',
        answer:
          'L\'utilisation d\'Animali pour trouver un animal à adopter est entièrement gratuite. Les frais éventuels (droit d\'adoption symbolique, frais vétérinaires) sont fixés par le refuge ou le propriétaire actuel de l\'animal, indépendamment de notre plateforme.',
      },
    ],
  },
  {
    id: 'lost',
    label: 'Animaux perdus',
    icon: '🔍',
    items: [
      {
        id: 'l1',
        question: 'Mon annonce d\'animal perdu a-t-elle une durée limite ?',
        answer:
          'Non, les annonces de perte et de recherche restent actives sans limite de temps jusqu\'à ce que vous les marquiez comme résolues. Nous vous recommandons de les mettre à jour régulièrement pour maintenir leur visibilité dans les résultats de recherche.',
      },
      {
        id: 'l2',
        question: 'Comment augmenter les chances de retrouver mon animal ?',
        answer:
          'Publiez immédiatement une annonce avec des photos récentes et claires, mentionnez des caractéristiques distinctives (tatouage, puce électronique, marque particulière). Partagez votre annonce sur les réseaux sociaux. Contactez les vétérinaires et refuges de votre région. Distribuez des affiches dans votre quartier et utilisez la fonction d\'alerte de proximité dans l\'application.',
      },
    ],
  },
  {
    id: 'vet',
    label: 'Services vétérinaires',
    icon: '🩺',
    items: [
      {
        id: 'v1',
        question: 'Comment prendre rendez-vous avec un vétérinaire ?',
        answer:
          'Accédez au profil du vétérinaire via la section "Vétérinaires" de l\'application. Cliquez sur "Prendre RDV", sélectionnez votre service, choisissez une date et un créneau horaire disponible, puis confirmez. Vous recevrez une notification de confirmation et un rappel avant votre rendez-vous.',
      },
      {
        id: 'v2',
        question: 'Puis-je consulter un vétérinaire en urgence via l\'application ?',
        answer:
          'Oui ! Utilisez le filtre "Urgences 24h" dans la section vétérinaires pour trouver des professionnels disponibles immédiatement. Les vétérinaires avec le badge rouge "🚨 Urgences 24h" proposent des consultations d\'urgence à tout moment.',
      },
      {
        id: 'v3',
        question: 'Les tarifs affichés sont-ils garantis ?',
        answer:
          'Les tarifs affichés sont fournis par les vétérinaires eux-mêmes et sont donnés à titre indicatif. Des frais supplémentaires peuvent s\'appliquer selon la complexité de la consultation ou les traitements nécessaires. Nous vous recommandons de confirmer les tarifs directement avec le vétérinaire lors de la prise de rendez-vous.',
      },
    ],
  },
  {
    id: 'premium',
    label: 'Compte Premium',
    icon: '⭐',
    items: [
      {
        id: 'p1',
        question: 'Que comprend le plan Premium Professionnel ?',
        answer:
          'Le plan Premium Professionnel inclut : annonces illimitées, photos HD et vidéos, mise en avant dans les résultats de recherche, badge "Pro" sur votre profil, statistiques détaillées de vos annonces, accès à la messagerie prioritaire, support client dédié et accès aux outils de gestion multi-annonces.',
      },
      {
        id: 'p2',
        question: 'Comment passer au Premium ?',
        answer:
          'Accédez à la section "Premium" depuis votre profil ou depuis le menu principal. Choisissez le plan qui vous convient (Particulier ou Professionnel), et procédez au paiement sécurisé. Votre compte est activé instantanément après confirmation du paiement.',
      },
      {
        id: 'p3',
        question: 'Puis-je annuler mon abonnement Premium ?',
        answer:
          'Oui, vous pouvez annuler à tout moment depuis les paramètres de votre compte. L\'annulation prend effet à la fin de la période de facturation en cours. Vous conservez tous les avantages Premium jusqu\'à la date d\'expiration.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Gestion du compte',
    icon: '👤',
    items: [
      {
        id: 'ac1',
        question: 'Comment modifier mon profil ou mes informations personnelles ?',
        answer:
          'Accédez à votre profil en cliquant sur votre avatar en haut de l\'écran, puis sur "Modifier le profil". Vous pouvez y mettre à jour votre photo, votre nom, votre localisation et vos coordonnées. Les modifications sont enregistrées instantanément.',
      },
      {
        id: 'ac2',
        question: 'Comment signaler un utilisateur ou une annonce suspecte ?',
        answer:
          'Sur chaque annonce ou profil, appuyez sur le menu "..." ou l\'icône de signalement. Sélectionnez la raison du signalement (fraude, contenu inapproprié, animal en danger, etc.). Notre équipe de modération examine chaque signalement sous 24h et prend les mesures appropriées.',
      },
    ],
  },
];

export function FAQPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCategory === 'all'
        ? FAQ_CATEGORIES
        : FAQ_CATEGORIES.filter((c) => c.id === activeCategory);
    }
    const q = searchQuery.toLowerCase();
    return FAQ_CATEGORIES.filter((cat) => {
      const matchingItems = cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
      return matchingItems.length > 0;
    }).map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      ),
    }));
  }, [searchQuery, activeCategory]);

  const totalResults = filteredCategories.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--pc-surface)] pb-24">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
      >
        <button
          onClick={onBack}
          className="mb-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <HelpCircle size={28} className="text-white" />
          <h1 className="text-2xl font-bold text-white">FAQ</h1>
        </div>
        <p className="text-white/80 text-sm mb-4">
          Trouvez rapidement des réponses à vos questions
        </p>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une question..."
            className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white text-sm text-gray-800 placeholder-gray-400 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!searchQuery && (
        <div className="px-4 py-3 bg-[var(--pc-surface)]">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'text-white'
                  : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]'
              }`}
              style={activeCategory === 'all' ? { background: 'var(--pc-primary)' } : {}}
            >
              Toutes
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'text-white'
                    : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)]'
                }`}
                style={activeCategory === cat.id ? { background: 'var(--pc-primary)' } : {}}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results count */}
      {searchQuery && (
        <div className="px-4 py-2 text-sm text-[var(--pc-text-secondary)]">
          {totalResults} résultat{totalResults !== 1 ? 's' : ''} pour "{searchQuery}"
        </div>
      )}

      {/* FAQ Accordions */}
      <div className="px-4 mt-2 space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <div className="font-semibold text-[var(--pc-text-primary)] mb-1">Aucun résultat</div>
            <div className="text-sm text-[var(--pc-text-secondary)]">
              Essayez d'autres mots-clés
            </div>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cat.icon}</span>
                <h2 className="font-bold text-[var(--pc-text-primary)]">{cat.label}</h2>
                <span className="ml-auto text-xs text-[var(--pc-text-secondary)]">
                  {cat.items.length} question{cat.items.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {cat.items.map((item) => {
                  const isOpen = openItems.has(item.id);
                  return (
                    <div key={item.id} className="glass-card rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="font-medium text-sm text-[var(--pc-text-primary)] pr-3 flex-1">
                          {item.question}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="shrink-0 text-[var(--pc-text-secondary)]"
                        >
                          <ChevronDown size={18} />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-[var(--pc-border)]">
                              <p className="text-sm text-[var(--pc-text-secondary)] leading-relaxed pt-3">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 mt-8">
        <div className="glass-card p-5 rounded-2xl text-center">
          <div className="text-3xl mb-2">💬</div>
          <h3 className="font-bold text-[var(--pc-text-primary)] mb-1">
            Vous n'avez pas trouvé votre réponse ?
          </h3>
          <p className="text-sm text-[var(--pc-text-secondary)] mb-4">
            Notre équipe est disponible pour vous aider
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 rounded-2xl font-semibold text-white flex items-center gap-2 mx-auto"
            style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
          >
            <MessageCircle size={16} />
            Contacter le support
          </button>
        </div>
      </div>
    </div>
  );
}
