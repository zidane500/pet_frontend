# Prompt Figma Make — PetConnect Tunisia
> Copie-colle ce prompt en entier dans Figma Make (ou v0.dev / Lovable)

---

## PROMPT

Design and build a complete, production-ready landing page for **PetConnect Tunisia** — the first all-in-one digital platform for the pet ecosystem in Tunisia (buy/sell animals, adoption, lost & found, vet directory, pet store directory, real-time chat, and a social community for pet lovers).

---

### INSPIRATION & STYLE REFERENCE

The overall layout and UX structure should be inspired by **khayli.ma** (a Moroccan horse marketplace): rich sectioned homepage, sticky top navbar, category icon grid, listing cards in horizontal scroll rows, mega-footer with organized link columns. Adapt this pattern for a modern pet platform targeting a young Tunisian mobile-first audience.

---

### DESIGN SYSTEM

**Color Palette — Light Mode (default)**
- Primary: `#1D7D5F` (deep emerald green — nature, trust, animals)
- Primary Light: `#E8F5F0` (soft mint — backgrounds, chips)
- Accent: `#F4A732` (warm amber — CTAs, badges, highlights)
- Surface: `#FFFFFF`
- Surface Alt: `#F7F8FA` (off-white sections)
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Border: `#E5E7EB`
- Danger: `#EF4444`
- Success: `#10B981`

**Color Palette — Dark Mode**
- Background: `#0D1117`
- Surface: `#161B22`
- Surface Alt: `#1C2128`
- Primary: `#2EA87A`
- Primary Light: `#1A3D2F`
- Accent: `#F4A732`
- Text Primary: `#F0F6FC`
- Text Secondary: `#8B949E`
- Border: `#30363D`

**Typography**
- Display / Hero: **Sora** (Bold 700–800) — modern, rounded, tech-forward
- Body: **Inter** (Regular 400, Medium 500) — clean and readable at small sizes
- Labels / Badges: **Inter** (SemiBold 600, uppercase, letter-spacing: 0.05em)
- Arabic fallback: **Cairo** — for any bilingual labels (FR/AR/EN toggle)

**Border Radius**
- Cards: `16px`
- Buttons: `12px`
- Chips/Badges: `999px` (pill)
- Input fields: `10px`

**Shadows**
- Card default: `0 2px 12px rgba(0,0,0,0.07)`
- Card hover: `0 8px 30px rgba(0,0,0,0.13)`
- Navbar: `0 1px 0 rgba(0,0,0,0.06)` + backdrop blur

---

### DARK MODE / LIGHT MODE TOGGLE

- Sticky toggle button in the top navbar (right side), using a sun/moon icon with smooth transition animation (`transition: all 0.3s ease`)
- All colors, backgrounds, shadows, and card surfaces must switch seamlessly
- Use CSS custom properties (`var(--color-...)`) so the entire theme switches with a single class toggle on `<html>` (`class="dark"`)
- Remember user preference using `localStorage`

---

### PAGE STRUCTURE (scroll from top to bottom)

#### 1. STICKY NAVBAR
- Left: Logo (paw icon + "PetConnect" wordmark + ".tn" tag in accent color)
- Center: Navigation links — Annonces | Adoption | Perdus & Trouvés | Vétérinaires | Animaleries | Communauté
- Right: Dark/Light toggle icon + "Publier une annonce" CTA button (accent color) + Avatar/Login button
- On mobile: hamburger menu → full-screen slide-in drawer with all links
- Background: blur backdrop (`backdrop-filter: blur(12px)`) with subtle border-bottom
- Behavior: transparent on hero, becomes solid white/dark on scroll (smooth transition)

---

#### 2. HERO SECTION — Full viewport height

**Layout:**
- Left side (60%): headline + subtext + search bar + category quick-access chips
- Right side (40%): animated floating cards collage (3–4 overlapping pet listing cards rotating softly)

**Headline:**
```
La première plateforme
animalière de Tunisie 🐾
```
Display font, size 56px desktop / 36px mobile, bold, gradient text (primary → accent)

**Subtext:**
```
Achetez, adoptez, retrouvez vos animaux perdus.
Trouvez vétérinaires et animaleries près de vous.
```

**Unified Search Bar:**
A large, rounded search bar (pill shape, shadow, white background) with:
- Dropdown: "Espèce" (Chien, Chat, Lapin, Oiseau, Reptile, Autre)
- Dropdown: "Gouvernorat" (all 24 Tunisian governorates)
- Dropdown: "Type" (Vente, Adoption, Perdu, Trouvé)
- Search button in accent color with search icon

**Category Quick-Access Grid (below search bar):**
Horizontal scrollable row of icon+label chips:
🐕 Chiens | 🐈 Chats | 🐇 Lapins | 🦜 Oiseaux | 🐠 Poissons | 🦎 Reptiles | 🐹 Rongeurs | 🐾 Autres

**Hero Background:**
Soft abstract gradient mesh (greens + warm tones), no stock photo. Optional subtle animated floating paw print particles (CSS only, lightweight).

**Floating cards on the right (animated):**
3 small listing preview cards floating with a gentle `animation: float 4s ease-in-out infinite` (different delays for each card), showing sample listings (dog for adoption, lost cat alert, vet directory card).

---

#### 3. STATS BAR — Full width, accent background
Horizontal bar with 4 animated counters (count up on scroll into view):
- 🐾 +2,400 Annonces actives
- 👥 +8,000 Membres
- 📍 +150 Vétérinaires référencés
- 💚 +320 Adoptions réussies

Numbers animate from 0 to final value when section enters viewport.

---

#### 4. ANNONCES RÉCENTES — "Les dernières annonces"
Section title + "Voir tout →" link on the right.

Horizontal scrollable row of listing cards (6 cards visible on desktop, 1.5 on mobile to hint at scroll):

**Listing Card:**
- Photo (aspect ratio 4:3, `object-fit: cover`, rounded top corners)
- Badge top-left: pill badge with type (🟢 Vente / 🔵 Adoption / 🟡 Perdu / 🔴 Trouvé)
- Verified seller badge top-right: ✓ icon if verified
- Body: Animal name, breed, age, price or "Gratuit" or "Adoption"
- Footer: location pin + governorate | time ago | heart icon (favorites)
- Hover: card lifts with shadow + subtle scale(1.02) transition

---

#### 5. ADOPTION SPOTLIGHT — "Ils attendent une famille" 💚
Emotionally charged section with warmer styling.

- Section background: `#E8F5F0` (light) / `#1A3D2F` (dark)
- Large heading: "Adoptez, ne les abandonnez pas."
- Grid of 3 featured adoption cards with larger photos
- Each card: soft rounded photo, name, "Je veux l'adopter →" button
- Right side or below: small text block — "Chaque adoption change une vie. Rejoignez notre communauté de familles adoptantes."

---

#### 6. LOST & FOUND — "Perdus & Trouvés" 🔍
Split layout: left = "Animaux perdus" (red tint), right = "Animaux trouvés" (green tint).

- Each side: 2–3 compact cards with photo, species, date, location
- Center: a small interactive map preview placeholder (OpenStreetMap styled, showing pin clusters across Tunisia)
- CTA buttons: "Signaler un animal perdu" | "J'ai trouvé un animal"
- Alert banner: "🔔 Activez les alertes de votre zone — soyez notifié si un animal est signalé près de chez vous"

---

#### 7. HOW IT WORKS — "Comment ça marche ?"
3-step horizontal process (desktop) / vertical (mobile):

**Step 1:** Créez votre compte gratuitement
**Step 2:** Publiez ou recherchez une annonce
**Step 3:** Contactez et finalisez en toute sécurité

Each step: large number (Sora font, primary color, 80px), icon, title, description.
Connecting arrows/dotted line between steps on desktop.

---

#### 8. VETERINARIANS DIRECTORY — "Vétérinaires près de vous 📍"
- Section intro: "Trouvez un vétérinaire de confiance dans votre gouvernorat."
- Filter chips: Tunis | Sfax | Sousse | Monastir | + all governorates (horizontally scrollable)
- Grid of 4 vet cards:
  - Photo/avatar
  - Name + specialty badge (NAC, Chirurgie, Urgences 24h)
  - Star rating + review count
  - Location + phone
  - "Prendre RDV →" button in primary color
- CTA: "Voir tous les vétérinaires →"

---

#### 9. PET STORES DIRECTORY — "Animaleries partenaires 🏪"
Similar layout to vets section but with store cards:
- Store photo / logo
- Name, city
- "Ouvert maintenant" / "Fermé" live badge
- Products highlight: "Nourriture · Accessoires · Soins"
- Star rating
- "Voir la boutique →" button

---

#### 10. COMMUNITY FEED PREVIEW — "La communauté PetConnect"
Social-media-style preview section:
- Section title: "Partagez les moments de vos animaux 🐾"
- Masonry grid of 6 community post cards (photo + caption + likes + comments count + author avatar)
- Posts have a slight rotation variation (-1deg / +1deg) for organic feel
- Hover: straightens to 0deg with scale(1.03)
- CTA: "Rejoindre la communauté →" button

---

#### 11. PREMIUM / MONETIZATION — "Passez à PetConnect Premium ⭐"
Pricing section with 2 cards side by side (centered):

**Gratuit:**
- 3 annonces actives
- Messagerie de base
- Accès à toutes les annonces
- Border: dashed, muted

**Premium (highlighted, accent border + glow):**
- Annonces illimitées
- Badge Premium visible
- Annonces mises en avant
- Alertes SMS animaux perdus
- Statistiques de vues
- "Commencer Premium →" CTA in accent color
- "Le plus populaire" ribbon badge

Subtle pulsing glow animation on the Premium card border.

---

#### 12. TRUST & SAFETY — "Une plateforme de confiance 🔒"
3 horizontal trust pillars:
- 🛡️ Comptes vérifiés — "Chaque éleveur et vendeur est vérifié manuellement"
- 💬 Chat sécurisé — "Communiquez sans jamais partager votre numéro"
- ⭐ Système de réputation — "Notes et avis vérifiés après chaque transaction"

Clean, minimal, icon + title + description layout. Light background.

---

#### 13. DOWNLOAD APP CTA — "Bientôt sur mobile 📱"
- Dark background section
- Large heading: "L'application arrive bientôt"
- Subtext: "Android & iOS — Soyez les premiers notifiés"
- Email input + "Me notifier" button
- Two placeholder app store badges (App Store + Google Play — coming soon style, slightly greyed out)
- Decorative: subtle phone mockup silhouette on the right side

---

#### 14. FOOTER — Rich multi-column footer

**Top row:** Logo + tagline + social icons (Facebook, Instagram, TikTok, WhatsApp Channel)

**4 link columns:**
1. **Annonces** — Vente · Adoption · Demandes · Animaux perdus
2. **Annuaires** — Vétérinaires · Animaleries · Éleveurs certifiés
3. **Communauté** — Feed · Profil animal · QR Code · Carnet santé
4. **Plateforme** — À propos · Premium · Publicité · Contact · CGU · Confidentialité

**Bottom bar:**
- Left: "© 2026 PetConnect Tunisia. Tous droits réservés."
- Right: Language toggle — 🇫🇷 FR | 🇸🇦 AR | 🇬🇧 EN
- Small: "Made with 🐾 in Tunisia"

---

### ANIMATIONS & MICRO-INTERACTIONS

All animations must respect `prefers-reduced-motion: reduce` — disable or simplify if user has that setting enabled.

- **Navbar:** fade-in + slide-down on page load (200ms delay)
- **Hero headline:** word-by-word fade-up on load (staggered, 80ms between words)
- **Hero floating cards:** `@keyframes float` — translateY(-8px) up and down, infinite, each card offset by 1.5s delay
- **Stats counters:** count up from 0 using `IntersectionObserver` when section enters viewport
- **Listing cards:** fade-up + scale from 0.97 to 1 on scroll reveal (staggered per card, 60ms apart)
- **Search bar:** subtle focus ring expansion + shadow deepening on focus
- **CTA buttons:** scale(1.04) on hover + shadow deepening + 200ms ease
- **Theme toggle:** rotate + fade transition on the sun/moon icon swap (300ms)
- **Mobile drawer:** slide-in from left with backdrop fade
- **Category chips:** horizontal scroll snap with touch momentum on mobile
- **Premium card glow:** `@keyframes pulse-glow` — box-shadow breathing animation, 2s infinite
- **Adoption cards:** on hover, a subtle green overlay with "Adopter →" text fades in

---

### RESPONSIVE BREAKPOINTS

- **Mobile (< 640px):** Single column, large touch targets (min 48px), bottom sticky "Publier une annonce" floating button, hamburger nav, horizontal scroll sections
- **Tablet (640–1024px):** 2-column grids, condensed navbar
- **Desktop (> 1024px):** Full layout as described above

**Mobile-specific UX:**
- Listing cards: horizontal scroll snap (one card takes 85% width, next card peeks at 15%)
- Search bar: stacked dropdowns with tap-friendly height
- Bottom nav bar (mobile only): 5 icons — 🏠 Accueil | 🔍 Recherche | ➕ Publier | 💬 Messages | 👤 Profil
- Floating "Publier" button (+) in bottom center (accent color, circular, with shadow)
- All tap targets minimum 44×44px

---

### COMPONENT REQUIREMENTS

Build all these as reusable components:
- `<ListingCard />` — with variant props: type (sale/adoption/lost/found)
- `<VetCard />` — with specialty badge
- `<SearchBar />` — with all 3 dropdowns
- `<CategoryChip />` — icon + label, active/inactive state
- `<PricingCard />` — free and premium variants
- `<StatCounter />` — with animation
- `<ThemeToggle />` — sun/moon icon switch
- `<Badge />` — pill badge with color variants

---

### TECH STACK

- **React + TypeScript**
- **TailwindCSS** (with dark mode via `class` strategy)
- **Framer Motion** for all scroll-reveal and entrance animations
- **Lucide React** for all icons
- No external UI component libraries — build everything from scratch with Tailwind

---

### CONTENT LANGUAGE

All visible copy in **French** (primary). Key labels also shown in Arabic in smaller text below (bilingual labels for navigation items). English in meta/code comments.

---

### QUALITY BAR

This is a production-quality, investor-demo-ready landing page. No placeholder grey boxes — use realistic dummy data (animal names, breeds, Tunisian city names, real-looking vet profiles). Every section should feel finished and real, as if the platform is already live with users.
