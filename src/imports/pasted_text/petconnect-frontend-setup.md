Tu es en train de compléter le frontend de PetConnect.tn, 
une plateforme animalière tunisienne déjà partiellement 
construite. Le design system est en place (couleurs, 
glassmorphism, dark mode, i18n FR/AR/EN). 

TON TRAVAIL : rendre TOUT fonctionnel, connecté et interactif.
Ne recrée rien du design — améliore uniquement la logique, 
les interactions, et les connexions entre pages.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — ROUTING ET NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Remplace le NavigationContext maison par React Router v7.
Chaque page doit avoir une URL propre :

/ → Home (landing page)
/recherche → SearchPage (avec query params: ?q=&espece=&type=&gouvernorat=)
/annonces/:id → PetDetailPage
/publier → CreateListingPage (protégée, redirect login si non connecté)
/profil/:userId → ProfilePage
/tableau-de-bord → DashboardPage (protégée)
/messages → MessagingPage (protégée)
/messages/:conversationId → MessagingPage avec conversation ouverte
/favoris → FavoritesPage (protégée)
/notifications → NotificationsPage (protégée)
/veterinaires → page liste vétérinaires
/veterinaires/:id → VetProfilePage
/animaleries/:id → PetShopProfilePage
/refuges/:id → ShelterProfilePage
/premium → PremiumPage
/parametres → SettingsPage (protégée)
/connexion → AuthPage (login)
/inscription → AuthPage (register)
/faq → FAQPage
/contact → ContactPage
/404 → NotFoundPage

Le bouton "retour" du navigateur doit fonctionner partout.
Toute navigation interne utilise <Link> ou useNavigate().
Scroll to top automatique à chaque changement de route.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — AUTHENTIFICATION LOCALE (MOCK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Crée un AuthContext global avec :
- currentUser: { id, name, email, role, avatar, isPremium }
- isLoggedIn: boolean
- login(email, password) → mock async 800ms → retourne user
- logout() → clear state + redirect /
- register(data) → mock async 1200ms → retourne user
- Persistance dans localStorage (clé: 'petconnect-session')
- Au chargement de l'app, restaurer la session depuis localStorage

Comptes de test disponibles :
- owner@test.tn / 123456 → role: 'owner', isPremium: false
- premium@test.tn / 123456 → role: 'owner', isPremium: true  
- vet@test.tn / 123456 → role: 'vet'
- shop@test.tn / 123456 → role: 'shop'
- shelter@test.tn / 123456 → role: 'shelter'

Routes protégées : si non connecté → redirect /connexion 
avec state { from: currentPath } → après login, redirect 
vers la page demandée.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — ÉTAT GLOBAL (STORE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Crée les contextes React suivants :

ListingsContext :
- listings: Listing[] (mock data centralisée dans /data/listings.ts)
- favorites: string[] (IDs des annonces favoris)
- addFavorite(id) / removeFavorite(id) / isFavorite(id)
- createListing(data) → ajoute à la liste + toast succès
- updateListing(id, data) / deleteListing(id)
- Persistance favorites dans localStorage

NotificationsContext :
- notifications: Notification[]
- unreadCount: number
- markAsRead(id) / markAllAsRead()
- addNotification(notif) → déclenche badge sur cloche navbar

MessagesContext :
- conversations: Conversation[]
- messages: Record<convId, Message[]>
- sendMessage(convId, text) → ajoute message + mock réponse 
  auto après 1.5s
- unreadMessagesCount: number
- Marquer conversation comme lue au clic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — BOUTONS ET INTERACTIONS : 
NAVBAR & LAYOUT GLOBAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Navbar — tous les boutons doivent fonctionner :

Logo "Animali.tn" → navigate('/')
Lien "Annonces" → navigate('/recherche')
Lien "Vétérinaires" → navigate('/veterinaires')  
Lien "Animaleries" → navigate('/recherche?type=shop')
Lien "Communauté" → navigate('/feed')

Bouton "Publier une annonce" (accent/amber) :
- Si connecté → navigate('/publier')
- Si non connecté → ouvre modal de connexion rapide 
  (LoginModal) avec message "Connectez-vous pour publier"
  Après login → redirect /publier

Icône cloche (notifications) :
- Badge rouge avec unreadCount si > 0
- Clic → navigate('/notifications')
- Badge disparaît après visit

Icône message :
- Badge avec unreadMessagesCount si > 0  
- Clic → navigate('/messages')

Avatar / dropdown profil (si connecté) :
- "Mon Profil" → navigate('/profil/' + user.id)
- "Mes Annonces" → navigate('/tableau-de-bord?tab=myListings')
- "Mes Favoris" → navigate('/favoris')
- "Paramètres" → navigate('/parametres')
- "Déconnexion" → logout() + toast "À bientôt !" + navigate('/')

Bouton "Connexion / Inscription" (si non connecté) :
- Clic → navigate('/connexion')

Toggle Dark/Light → persiste dans localStorage 'petconnect-theme'

Sélecteur de langue (FR/AR/EN) :
- Change i18n.language
- Pour AR : document.dir = 'rtl' + fontFamily Cairo
- Persiste dans localStorage 'petconnect-lang'

Mobile hamburger menu :
- Ouvre drawer full-screen avec animation slide-in gauche
- Tous les liens du drawer fonctionnent et ferment le drawer
- Bouton "Publier" dans drawer → même logique que desktop

Mobile Bottom Nav (5 boutons) :
- 🏠 Accueil → navigate('/')
- 🔍 Recherche → navigate('/recherche')  
- ➕ Publier (bouton central gold surélevé) → 
    Si connecté → navigate('/publier')
    Si non → LoginModal
- 💬 Messages → navigate('/messages') + badge unread
- 👤 Profil → Si connecté → navigate('/profil/' + user.id)
                Si non → navigate('/connexion')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — HERO SECTION & LANDING PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SearchBar (hero) :
- Dropdown Espèce → filtre par species
- Dropdown Gouvernorat → filtre par gouvernorat (24 de Tunisie)
- Dropdown Type → Vente / Adoption / Perdu / Trouvé
- Bouton "Rechercher" → navigate('/recherche?q=&espece=X&gouvernorat=Y&type=Z')
- Touche Enter dans le champ texte → même comportement

CategoryChips (chiens, chats, etc.) :
- Clic sur chip → navigate('/recherche?espece=chien') 
  (adapter selon espèce)
- Chip actif → highlight visuel vert

Bouton "Voir tout →" (section Annonces récentes) :
- navigate('/recherche')

Bouton "Voir toutes les adoptions" (AdoptionSpotlight) :
- navigate('/recherche?type=adoption')

Bouton "Signaler un animal" (LostFound) :
- Si connecté → navigate('/publier') avec état pré-sélectionné 
  sur catégorie "perdu"
- Si non → LoginModal

Bouton "Activer les alertes" (bannière LostFound) :
- Ouvre modal AlertsModal avec :
  - Sélecteur gouvernorat
  - Sélecteur espèce
  - Toggle email / push
  - Bouton "Activer" → toast "Alertes activées pour [ville]!"
  - Persiste préférences dans localStorage

Bouton "Voir tout" (CommunityFeed) :
- navigate('/feed')

Bouton "Commencer" / "Voir les offres" (PremiumSection) :
- navigate('/premium')

Bouton "Trouver un vétérinaire" (AppDownload ou HowItWorks) :
- navigate('/veterinaires')

Chaque ListingCard :
- onClick complet → navigate('/annonces/' + listing.id)
- Bouton ❤️ (favoris) :
    Si connecté → toggle favori + toast "Ajouté aux favoris" / 
    "Retiré des favoris" + animation cœur
    Si non → LoginModal
- Bouton partage (si présent) → Web Share API avec fallback 
  copy link

StatsBar (compteurs animés) :
- Utilise IntersectionObserver pour déclencher l'animation 
  count-up une seule fois quand visible

VetCard (VetDirectory) :
- onClick → navigate('/veterinaires/' + vet.id)
- Bouton "Prendre RDV" → navigate('/veterinaires/' + vet.id + '?action=rdv')

StoreCard (PetStores) :
- onClick → navigate('/animaleries/' + store.id)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — PAGE RECHERCHE (SearchPage)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Lire les query params URL au mount : 
  useSearchParams() → initialiser les filtres
- La barre de recherche en haut est live (filtre au keystroke 
  avec debounce 300ms)
- Bouton filtres (SlidersHorizontal) :
    Mobile → ouvre Drawer bottom avec FilterPanel
    Desktop → ouvre panneau latéral slide-in
- Chaque filtre appliqué → update URL query params EN TEMPS RÉEL
  (replaceState, pas pushState pour ne pas polluer l'historique)
- Bouton "Effacer les filtres" → reset tout + update URL
- Badge count filtres actifs sur le bouton filtre
- Toggle vue grille / liste → persiste en localStorage
- Tri (Récent / Prix croissant / Prix décroissant / Plus vus) → 
  réorganise les résultats
- Chaque carte résultat → navigate('/annonces/' + result.id)
- Bouton ❤️ sur chaque carte → même logique favoris
- Pagination ou infinite scroll (préférer infinite scroll) :
  bouton "Charger plus" au bas, ajoute 6 résultats de plus
- État vide : illustration + message + bouton "Effacer les filtres"
- État chargement : 6 skeleton cards animées

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — DÉTAIL ANNONCE (PetDetailPage)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Charger l'annonce depuis ListingsContext par listingId
- Si annonce non trouvée → redirect /404

Galerie photos :
- Flèches gauche/droite → changent currentImg
- Swipe tactile (touch events) sur mobile
- Clic sur miniature → change photo principale  
- Bouton plein écran → ouvre LightboxModal
- LightboxModal : fermer avec Escape ou bouton X

Bouton ❤️ Favoris :
- Toggle isFavorite(listing.id) + animation
- Toast confirmation

Bouton "Partager" :
- Tente navigator.share() (mobile natif)
- Fallback desktop : copie URL dans clipboard + toast 
  "Lien copié !"

Bouton "Contacter le vendeur" (vert principal) :
- Si connecté → ouvre modal ContactModal avec :
    Message pré-rempli "Bonjour, je suis intéressé par [nom]"
    Champ texte éditable
    Bouton "Envoyer" → crée conversation dans MessagesContext
    → toast "Message envoyé !" → navigate('/messages')
- Si non connecté → LoginModal

Bouton "Appeler" (si téléphone présent) :
- Mobile → tel: link direct
- Desktop → affiche le numéro dans tooltip/popover

Bouton "Signaler cette annonce" (lien discret en bas) :
- Ouvre ReportModal avec :
    Raisons : Arnaque / Fausses photos / Animal interdit / 
    Coordonnées incorrectes / Autre
    Champ description optionnel
    Bouton "Signaler" → toast "Signalement envoyé. Merci !"

Profil vendeur → clic sur avatar/nom → 
  navigate('/profil/' + seller.id)

Annonces similaires → clic → navigate('/annonces/' + id)

Breadcrumb : Accueil → Recherche → [nom annonce]
Chaque niveau cliquable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — CRÉER UNE ANNONCE (CreateListingPage)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stepper 5 étapes (Catégorie → Infos → Photos → 
Localisation → Publier) :

Étape 1 — Catégorie :
- 6 cartes cliquables (Adoption / Vente / Perdu / Trouvé / 
  Accouplement / Conseils)
- Sélection → highlight + coche verte
- Bouton "Suivant" → désactivé si rien sélectionné

Étape 2 — Informations :
- Champ "Titre de l'annonce" : validation min 10 chars
- Select "Espèce" : obligatoire
- Champ "Race" : optionnel avec suggestions (autocomplete mock)
- Âge : input nombre + select mois/ans
- Sexe : boutons radio Mâle / Femelle / Inconnu
- Prix : input numérique, disabled si "Gratuit" coché
- Toggle "Gratuit" : désactive le champ prix
- Toggles vacciné / stérilisé
- Textarea description : min 30 chars, compteur caractères
- Bouton "Suivant" → validé uniquement si titre + espèce remplis

Étape 3 — Photos :
- Zone drag & drop (react-dropzone ou zone native)
- Clic → ouvre file picker (images seulement, max 8 fichiers)
- Preview grille 2×4 avec bouton X pour supprimer chaque photo
- Réordonnement drag & drop des photos (1ère = photo principale)
- Indicateur "Photo principale" sur la 1ère
- Validation : au moins 1 photo requise
- Mock upload : simuler progress bar 0→100% sur 1.5s
- Bouton "Suivant" → disponible dès 1 photo

Étape 4 — Localisation :
- Select gouvernorat : obligatoire (24 gouvernorats tunisiens)
- Champ ville/délégation : optionnel
- Checkbox "Afficher mon adresse exacte" → si coché, champ adresse
- Bouton "Utiliser ma position" → navigator.geolocation → 
  remplit gouvernorat automatiquement (mock geocoding)
- Mini carte Leaflet affichant un marker sur la région sélectionnée
  (optionnel, afficher seulement si Leaflet est installé)
- Bouton "Suivant" → disponible si gouvernorat sélectionné

Étape 5 — Contact & Publication :
- Champ téléphone : validation format tunisien (+216 XX XXX XXX)
- Champ email : pré-rempli depuis currentUser.email
- Options de visibilité : Public / Membres seulement
- Durée de l'annonce : 7j / 15j / 30j
- Récapitulatif de l'annonce complète
- Bouton "Publier maintenant" :
  → animation loading 2s
  → createListing(formData) dans ListingsContext
  → toast "Annonce publiée avec succès ! 🎉" 
  → confetti (canvas-confetti déjà installé)
  → navigate('/tableau-de-bord?tab=myListings')

Barre de progression en haut : étape 1/5, 2/5... animée
Bouton "Retour" à chaque étape : revient à l'étape précédente
Sauvegarde automatique du brouillon dans localStorage 
  toutes les 30s → toast discret "Brouillon sauvegardé"
Bouton "Sauvegarder en brouillon" → même logique

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9 — TABLEAU DE BORD (DashboardPage)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Navigation onglets (sidebar desktop / tabs mobile) :
- Tous les onglets changent le contenu sans rechargement
- L'onglet actif persiste dans l'URL : ?tab=overview

Onglet "Vue d'ensemble" :
- Graphiques recharts : cliquables (hover tooltip)
- Cartes stats (vues, favoris, messages) : vraies données mock
- "Voir plus" sur chaque mini-section → change d'onglet

Onglet "Mes Annonces" :
- Liste des annonces depuis ListingsContext (filtré par user.id)
- Pour chaque annonce :
  Bouton "Modifier" → ouvre EditListingModal (même formulaire 
    que CreateListing, pré-rempli)
  Bouton "Pause/Reprendre" → toggle status active/paused + 
    toast confirmation
  Bouton "Supprimer" → ConfirmModal "Êtes-vous sûr ?" 
    → deleteListing(id) + toast
  Bouton "Voir" → navigate('/annonces/' + id)
  Bouton "Dupliquer" → copie annonce avec "(Copie)" dans titre
- Bouton "Nouvelle annonce" → navigate('/publier')
- Filtres par statut (Actives / En pause / Vendues / Expirées)

Onglet "Mes Favoris" :
- Liste depuis ListingsContext.favorites
- Bouton ❤️ → removeFavorite(id) + animation disparition
- Bouton "Voir l'annonce" → navigate('/annonces/' + id)
- État vide → illustration + "Vous n'avez pas encore de favoris"
  + bouton "Explorer les annonces"

Onglet "Messages" :
- Preview des conversations (3 dernières) 
- Bouton "Voir tous les messages" → navigate('/messages')

Onglet "Notifications" :
- Liste complète depuis NotificationsContext
- Clic sur notification → markAsRead(id) + navigate vers 
  la page concernée
- Bouton "Tout marquer comme lu" → markAllAsRead()

Onglet "Paramètres" (dans dashboard) :
- Même contenu que SettingsPage mais en tab
- Ou redirect vers /parametres

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10 — MESSAGERIE (MessagingPage)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout split : liste conversations (gauche) + chat (droite)
Mobile : liste seule → clic → chat full screen → bouton retour

Liste conversations :
- Tri par date dernier message (plus récent en haut)
- Badge unread par conversation
- Barre de recherche → filtre conversations par nom
- Clic sur conversation → ouvre le chat, marque comme lu

Zone de chat active :
- Scroll automatique vers le bas à l'ouverture ET à chaque 
  nouveau message (smooth scroll)
- Input message : Enter envoie, Shift+Enter = nouvelle ligne
- Bouton envoyer → sendMessage(convId, text) → ajoute message
  → mock réponse auto après 1.5-2s (textes variés selon 
  le contexte de la conversation)
- Indicateur "En train d'écrire..." pendant la réponse mock
- Bouton emoji → ouvre EmojiPicker simple (6×5 emojis courants)
- Bouton pièce jointe → file picker images → preview dans message
  (mock, pas d'upload réel)
- Bouton micro → toast "Fonctionnalité bientôt disponible"
- Bouton MoreVertical (⋮) → menu :
    "Voir l'annonce concernée" → navigate('/annonces/' + regarding.id)
    "Bloquer cet utilisateur" → ConfirmModal → toast
    "Signaler" → ReportModal

Messages :
- Bulles alignées droite (moi) / gauche (eux)
- Timestamp affiché au hover
- Coche simple (envoyé) / double coche (lu)
- Séparateurs de date ("Aujourd'hui", "Hier", "Lundi 9 juin")
- Réactions emoji : double clic sur message → sélecteur 3 emojis
  → affiche réaction sous le message avec compteur

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 11 — PROFILS (ProfilePage, VetProfilePage, etc.)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ProfilePage (profil utilisateur) :
- Si userId === currentUser.id → afficher bouton "Modifier profil"
  Sinon → afficher bouton "Contacter" + "Suivre"
- Bouton "Modifier profil" → ouvre EditProfileModal :
    Upload photo de profil (preview local)
    Champs : nom, bio, ville, téléphone (optionnel)
    Bouton "Sauvegarder" → update currentUser + toast
- Bouton "Contacter" → ContactModal → sendMessage
- Annonces du profil → clic → navigate('/annonces/' + id)

VetProfilePage :
- Bouton "Prendre rendez-vous" (primary, en haut) :
    Ouvre AppointmentModal :
      Calendrier (react-day-picker installé) → sélectionner date
      Grille créneaux horaires (9h, 10h, 11h... 17h)
      Créneaux déjà pris grisés (mock)
      Champ "Motif de la consultation"
      Select "Animal concerné" (depuis listings user)
      Bouton "Confirmer le RDV" → toast "RDV confirmé pour 
        le [date] à [heure] avec Dr. [nom]" 
        + addNotification()

- Bouton "Appeler" → tel: link
- Bouton "Itinéraire" → ouvre Google Maps avec l'adresse
- Bouton "Partager" → Web Share API
- Avis/Reviews : bouton "Laisser un avis" :
    Si connecté → ReviewModal : note 1-5 étoiles + texte
    Bouton "Publier l'avis" → ajoute à la liste + toast
    Si non connecté → LoginModal

PetShopProfilePage :
- Bouton "Appeler" → tel: link
- Bouton "Voir sur la carte" → ouvre Google Maps
- Bouton "Contacter" → ContactModal
- Produits/Services : chaque carte cliquable (detail modal)
- Bouton "S'abonner aux offres" → toggle + toast

ShelterProfilePage :
- Bouton "Adopter un animal" → navigate('/recherche?type=adoption&shelter=' + id)
- Bouton "Faire un don" → ouvre DonationModal :
    Montants prédéfinis : 10 DT / 20 DT / 50 DT / Autre
    Champ montant libre
    Bouton "Faire un don" → toast "Merci pour votre don ! 💚"
- Bouton "Devenir bénévole" → ContactModal avec sujet pré-rempli
- Animaux disponibles → clic → navigate('/annonces/' + id)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 12 — AUTRES PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FeedPage (Communauté) :
- Bouton "+" ou "Nouveau post" → ouvre CreatePostModal :
    Textarea (min 20 chars)
    Bouton attacher photo
    Bouton "Publier" → ajoute post en tête de liste + toast
- Bouton ❤️ sur chaque post → toggle like + compteur animé
- Bouton 💬 Commenter → ouvre section commentaires inline
- Champ commentaire → Enter pour publier
- Bouton "Partager" → Web Share API

FavoritesPage :
- Même logique que dans Dashboard/Favoris
- Bouton "Voir l'annonce" → navigate('/annonces/' + id)
- Bouton ❤️ retirer → removeFavorite + disparition animée

NotificationsPage :
- Clic sur chaque notification → markAsRead + navigate
- Bouton "Tout marquer comme lu" → markAllAsRead()
- Filtre par type : Tout / Messages / Vues / Favoris / Système

PremiumPage :
- Bouton "Choisir [offre]" sur chaque plan :
    Si déjà premium → toast "Vous êtes déjà abonné Premium !"
    Sinon → ouvre PaymentModal :
      Récapitulatif de l'offre choisie
      Champ numéro de carte (format masqué 1234 XXXX XXXX)
      Champ expiration + CVV
      Bouton "Payer [montant] DT" → loading 2s → 
        toast "Abonnement Premium activé ! 🌟" 
        → update currentUser.isPremium = true
        → confetti

SettingsPage :
- Tous les toggles sauvegardent immédiatement + toast discret
- Bouton "Changer de mot de passe" → ouvre ChangePasswordModal
- Bouton "Supprimer le compte" → ConfirmModal texte rouge 
  "Cette action est irréversible" → logout() + navigate('/')
- Upload photo profil → preview + "Sauvegarder"
- Tous les champs text → bouton "Sauvegarder" par section

AuthPage :
- Formulaire login : Enter soumet le formulaire
- Validation en temps réel (rouge si invalide, vert si valide)
- Bouton "Se connecter" → login() mock + loading state + 
  redirect vers page d'origine ou /tableau-de-bord
- Bouton "Mot de passe oublié" → affiche le formulaire forgot
- Formulaire forgot → "Envoyer" → toast "Email envoyé à [email]"
- Inscription étape 1 : sélection rôle → bouton "Continuer"
- Inscription étape 2 : formulaire complet → "Créer mon compte"
  → register() mock → si role non-owner → ProfileSetupPage
  → sinon → /tableau-de-bord

FAQPage :
- Accordion : chaque question → expand/collapse animé
- Barre de recherche FAQ → filtre les questions en temps réel
- Bouton "Contacter le support" → navigate('/contact')

ContactPage :
- Formulaire : validation complète tous les champs
- Bouton "Envoyer" → loading 1.5s → toast "Message envoyé !"
  → reset formulaire

NotFoundPage :
- Bouton "Retour à l'accueil" → navigate('/')
- Bouton "Rechercher" → navigate('/recherche')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 13 — MODALES GLOBALES REQUISES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Crée ces modales réutilisables dans GlobalModals.tsx :

LoginModal :
- Message contextuel passé en prop (ex: "Connectez-vous 
  pour ajouter aux favoris")
- Formulaire email + password compact
- Bouton "Se connecter"
- Lien "Créer un compte" → navigate('/inscription')
- Fermeture : bouton X, clic backdrop, touche Escape

ContactModal(recipientName, listingTitle?) :
- Message pré-rempli intelligent selon le contexte
- Bouton "Envoyer" → sendMessage()

ConfirmModal(title, description, onConfirm, danger?) :
- Deux boutons : "Annuler" (gris) + "Confirmer" (rouge si danger)

ReportModal(targetId, targetType) :
- Choix de raison + description
- Bouton "Signaler"

AppointmentModal(vetId, vetName) :
- Calendrier + créneaux + motif

ReviewModal(targetId, targetType) :
- Étoiles interactives (hover + clic) + textarea

LightboxModal(images[], initialIndex) :
- Galerie plein écran avec navigation

AlertsModal :
- Préférences de zone et espèce

PaymentModal(plan) :
- Formulaire carte bancaire mock

EditListingModal(listing) :
- Formulaire pré-rempli

EditProfileModal(user) :
- Formulaire profil

DonationModal(shelterName) :
- Montants + confirmation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 14 — FEEDBACK UTILISATEUR GLOBAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tous les boutons qui déclenchent une action doivent avoir :

1. État loading : spinner/skeleton pendant l'action async
2. État désactivé : button disabled + opacity 0.6 pendant loading
3. Toast de confirmation (succès en vert, erreur en rouge)
   Utiliser sonner (déjà installé) avec position bottom-right
4. Animations :
   - Boutons : scale(0.97) au clic (active:scale-97)
   - Favoris : animation cœur qui pulse au toggle
   - Nouveau contenu : fade-in depuis le bas (motion)
   - Suppression : fade-out + collapse height

Toasts standards à utiliser :
- toast.success("Message") → vert avec icône ✓
- toast.error("Message") → rouge avec icône ✗  
- toast.info("Message") → bleu neutre
- toast("Message", { icon: "🎉" }) → avec emoji

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 15 — ÉTATS VIDES ET CHARGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Crée un composant EmptyState({ icon, title, description, ctaLabel, onCta }) :
- Grande illustration SVG simple centrée
- Titre et description
- Bouton CTA optionnel

Utiliser sur :
- SearchPage sans résultats → "Aucune annonce trouvée. 
  Essayez d'élargir vos filtres."
- FavoritesPage vide → "Pas encore de favoris. 
  Explorez les annonces !"
- MessagingPage sans conversations → "Aucun message. 
  Contactez un vendeur !"
- NotificationsPage vide → "Tout est lu !"
- DashboardPage/myListings vide → "Publiez votre 
  première annonce !"
- FeedPage vide → "Soyez le premier à poster !"

Crée ListingCardSkeleton et VetCardSkeleton :
- Même dimensions que les vraies cartes
- Animation shimmer (pulse gris clair)
- Afficher 6 skeletons pendant isLoading = true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 16 — RÈGLES TECHNIQUES IMPORTANTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Garder le design system existant intact : CSS variables 
  --pc-primary, --pc-accent, etc., dark mode, glassmorphism, 
  Sora + Inter fonts
- Ne pas casser l'i18n existant : utiliser useTranslation() 
  partout, ajouter les nouvelles clés dans fr.ts/en.ts/ar.ts
- Tous les formulaires : accessibilité label + input liés, 
  aria-invalid sur les champs en erreur
- Images : toujours loading="lazy" + onError fallback vers 
  picsum.photos
- Ne pas supprimer MobileBottomNav ni la structure des sections 
  de la landing page
- Maintenir la compatibilité RTL pour l'arabe : flex-direction 
  inversé, text-align, icônes retournées
- Performance : utiliser React.memo() sur les composants de 
  liste (ListingCard, VetCard, StoreCard)
- Pas de refresh de page : toute navigation via React Router 
  navigate(), jamais window.location.href =