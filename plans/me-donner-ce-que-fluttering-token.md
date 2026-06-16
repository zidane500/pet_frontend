# Plan — PetConnect Tunisia Landing Page

## Context

The user wants a full production-ready landing page for **PetConnect Tunisia**, a pet ecosystem platform, as specified in `src/imports/Prompt_Figma_Make_PetConnect.md`. This is a 14-section landing page with dark/light mode, animations, and multiple reusable components. The app currently has an empty `App.tsx`.

---

## Implementation Approach

### Phase 0 — Fonts & CSS Variables

**`src/styles/fonts.css`** — add Google Fonts imports:
```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Inter:wght@400;500;600&family=Cairo:wght@400;600&display=swap');
```

**`src/styles/theme.css`** — prepend PetConnect CSS custom properties (light + dark) using the brand palette. Override the existing variables to match the brand.

### Phase 1 — Core Components

Create in `src/app/components/`:

| File | Component | Description |
|------|-----------|-------------|
| `badge.tsx` (new, not overwriting ui/badge) → use `PetBadge.tsx` | `<PetBadge />` | pill badge with color variants (vente/adoption/perdu/trouvé) |
| `ThemeToggle.tsx` | `<ThemeToggle />` | sun/moon toggle with localStorage + html.dark class |
| `CategoryChip.tsx` | `<CategoryChip />` | icon + label chip with active state |
| `StatCounter.tsx` | `<StatCounter />` | animated count-up with IntersectionObserver |
| `ListingCard.tsx` | `<ListingCard />` | listing card with type variant (sale/adoption/lost/found) |
| `VetCard.tsx` | `<VetCard />` | vet card with specialty badge and star rating |
| `StoreCard.tsx` | `<StoreCard />` | pet store card |
| `SearchBar.tsx` | `<SearchBar />` | 3 dropdowns + search button |
| `PricingCard.tsx` | `<PricingCard />` | free and premium variants |
| `CommunityPostCard.tsx` | `<CommunityPostCard />` | social post card for masonry grid |

### Phase 2 — Page Sections (all in `src/app/components/sections/`)

| File | Section |
|------|---------|
| `Navbar.tsx` | Sticky navbar — logo, nav links, dark mode toggle, CTA, mobile drawer |
| `HeroSection.tsx` | Full-height hero — headline, search bar, category chips, floating cards |
| `StatsBar.tsx` | 4 animated counters |
| `RecentListings.tsx` | Horizontal scroll row of ListingCards |
| `AdoptionSpotlight.tsx` | Featured adoption section |
| `LostFound.tsx` | Split lost/found cards + map placeholder |
| `HowItWorks.tsx` | 3-step process |
| `VetDirectory.tsx` | Filter chips + vet card grid |
| `PetStores.tsx` | Pet store card grid |
| `CommunityFeed.tsx` | Masonry post grid (react-responsive-masonry) |
| `PremiumSection.tsx` | 2 pricing cards |
| `TrustSafety.tsx` | 3 trust pillars |
| `AppDownload.tsx` | Dark CTA section with email input |
| `Footer.tsx` | Multi-column footer + bottom bar |
| `MobileBottomNav.tsx` | Mobile-only bottom navigation bar |

### Phase 3 — App Assembly

**`src/app/App.tsx`** — wrap everything in a ThemeProvider (using `next-themes` with `attribute="class"`, `defaultTheme="light"`), import and compose all sections in order.

---

## Key Technical Decisions

- **Dark mode**: `next-themes` with `attribute="class"` sets `class="dark"` on `<html>`. CSS vars in `theme.css` switch via `.dark` selector.
- **Animations**: `motion/react` for scroll-reveal (using `whileInView` + `initial`/`animate`). `IntersectionObserver` for stat counters.
- **Floating cards**: CSS `@keyframes float` via Tailwind arbitrary values.
- **Mobile drawer**: shadcn/ui `Sheet` component (already installed).
- **Masonry**: `react-responsive-masonry` for community feed.
- **Icons**: `lucide-react` throughout.
- **No @make-kits**: Not installed, skip design system check.
- **Fonts**: Sora for headings, Inter for body (applied globally via `theme.css` or `fonts.css`).

---

## Mock Data

All sections use realistic Tunisian data:
- Animal listings with names, breeds, Tunisian cities (Tunis, Sfax, Sousse, Monastir, Bizerte…)
- Vet profiles with specialties, Tunisian names
- Store names with Tunisian references
- Community posts with French captions

---

## File Modification Summary

- `src/styles/fonts.css` — add font imports
- `src/styles/theme.css` — update CSS vars to PetConnect palette
- `src/app/App.tsx` — compose full page
- `src/app/components/ThemeToggle.tsx` — new
- `src/app/components/CategoryChip.tsx` — new
- `src/app/components/StatCounter.tsx` — new
- `src/app/components/ListingCard.tsx` — new
- `src/app/components/VetCard.tsx` — new
- `src/app/components/StoreCard.tsx` — new
- `src/app/components/SearchBar.tsx` — new
- `src/app/components/PricingCard.tsx` — new
- `src/app/components/CommunityPostCard.tsx` — new
- `src/app/components/PetBadge.tsx` — new
- `src/app/components/sections/Navbar.tsx` — new
- `src/app/components/sections/HeroSection.tsx` — new
- `src/app/components/sections/StatsBar.tsx` — new
- `src/app/components/sections/RecentListings.tsx` — new
- `src/app/components/sections/AdoptionSpotlight.tsx` — new
- `src/app/components/sections/LostFound.tsx` — new
- `src/app/components/sections/HowItWorks.tsx` — new
- `src/app/components/sections/VetDirectory.tsx` — new
- `src/app/components/sections/PetStores.tsx` — new
- `src/app/components/sections/CommunityFeed.tsx` — new
- `src/app/components/sections/PremiumSection.tsx` — new
- `src/app/components/sections/TrustSafety.tsx` — new
- `src/app/components/sections/AppDownload.tsx` — new
- `src/app/components/sections/Footer.tsx` — new
- `src/app/components/sections/MobileBottomNav.tsx` — new

---

## Verification

- Visual check in the preview pane: all 14 sections visible
- Toggle dark/light mode — colors switch seamlessly
- Resize to mobile (<640px) — hamburger menu, bottom nav bar, horizontal scroll cards
- Stat counters animate on scroll into view
- Hero floating cards have float animation
- Premium card has pulsing glow
