import { useEffect, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import "../i18n";
import { NavigationProvider, useNav } from "./context/NavigationContext";
import { useAuth } from "../hooks/useAuth";
import { useRealtimeUserChannel } from "../hooks/useRealtimeUserChannel";
import {
  ErrorBoundary,
  SectionErrorBoundary,
} from "./components/ErrorBoundary";

// ── Sections homepage ──────────────────────────────────────────
import { Navbar } from "./components/sections/Navbar";
import { HeroSection } from "./components/sections/HeroSection";
import { StatsBar } from "./components/sections/StatsBar";
import { RecentListings } from "./components/sections/RecentListings";
import { AdoptionSpotlight } from "./components/sections/AdoptionSpotlight";
import { LostFound } from "./components/sections/LostFound";
import { HowItWorks } from "./components/sections/HowItWorks";
import { VetDirectory } from "./components/sections/VetDirectory";
import { PetStores } from "./components/sections/PetStores";
import { CommunityFeed } from "./components/sections/CommunityFeed";
import { PremiumSection } from "./components/sections/PremiumSection";
import { TrustSafety } from "./components/sections/TrustSafety";
import { AppDownload } from "./components/sections/AppDownload";
import { Footer } from "./components/sections/Footer";
import { MobileBottomNav } from "./components/sections/MobileBottomNav";

// ── Pages ──────────────────────────────────────────────────────
import { FeedPage } from "./pages/FeedPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MessagingPage } from "./pages/MessagingPage";
import { CreateListingPage } from "./pages/CreateListingPage";
import { PetDetailPage } from "./pages/PetDetailPage";
import { SearchPage } from "./pages/SearchPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AuthPage } from "./pages/AuthPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { PremiumPage } from "./pages/PremiumPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VetProfilePage } from "./pages/VetProfilePage";
import { PetShopProfilePage } from "./pages/PetShopProfilePage";
import { ShelterProfilePage } from "./pages/ShelterProfilePage";
import { BreederProfilePage } from "./pages/BreederProfilePage";
import { FAQPage } from "./pages/FAQPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// ── Inner app ──────────────────────────────────────────────────

function AppInner() {
  const { i18n } = useTranslation();
  const { nav, navigate, goBack } = useNav();
  const { user, isLoggedIn, login, register, logout } = useAuth();

  // WebSocket temps-réel
  useRealtimeUserChannel(isLoggedIn ? (user?.id ?? null) : null);

  // Thème
  useEffect(() => {
    const saved = localStorage.getItem("petconnect-theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  // Direction RTL / LTR
  useEffect(() => {
    const isAr = i18n.language === "ar";
    document.documentElement.setAttribute("dir", isAr ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", i18n.language);
    document.body.style.fontFamily = isAr
      ? "'Cairo', 'Inter', system-ui, sans-serif"
      : "'Inter', system-ui, sans-serif";
  }, [i18n.language]);

  // ── Handlers ────────────────────────────────────────────────

  const handleLoginSuccess = async (userData: {
    name: string;
    role: string;
  }) => {
    if (userData.role !== "owner") {
      navigate("profile-setup" as any);
    } else {
      navigate("home");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("home");
  };

  // ── Pages auth (pas de navbar) ───────────────────────────────

  if (
    ["login", "register", "forgot-password", "reset-password"].includes(
      nav.page,
    )
  ) {
    return (
      <ErrorBoundary>
        <AuthPage
          initialView={nav.page === "register" ? "register" : "login"}
          onSuccess={handleLoginSuccess}
          onNavigate={navigate}
          onLogin={login}
          onRegister={register}
        />
      </ErrorBoundary>
    );
  }

  // ── Table de routage ─────────────────────────────────────────

  const PAGES: Partial<Record<string, ReactElement>> = {
    feed: (
      <SectionErrorBoundary>
        <FeedPage onBack={goBack} />
      </SectionErrorBoundary>
    ),

    dashboard: (
      <SectionErrorBoundary>
        <DashboardPage onBack={goBack} onNavigate={navigate} />
      </SectionErrorBoundary>
    ),

    messages: (
      <SectionErrorBoundary>
        <MessagingPage onBack={goBack} initialUserId={nav.params?.userId} />
      </SectionErrorBoundary>
    ),
    "create-listing": (
      <SectionErrorBoundary>
        <CreateListingPage
          onBack={goBack}
          onSuccess={() => navigate("dashboard")}
        />
      </SectionErrorBoundary>
    ),

    "pet-detail": (
      <SectionErrorBoundary>
        <PetDetailPage
          onBack={goBack}
          onNavigate={navigate}
          listingId={nav.params?.id}
        />
      </SectionErrorBoundary>
    ),

    search: (
      <SectionErrorBoundary>
        <SearchPage
          onBack={goBack}
          onNavigate={navigate}
          initialQuery={nav.params?.q}
          initialType={nav.params?.type}
        />
      </SectionErrorBoundary>
    ),

    profile: (
      <SectionErrorBoundary>
        <ProfilePage
          onBack={goBack}
          onNavigate={navigate}
          userId={nav.params?.id}
        />
      </SectionErrorBoundary>
    ),

    notifications: (
      <SectionErrorBoundary>
        <NotificationsPage onBack={goBack} />
      </SectionErrorBoundary>
    ),

    favorites: (
      <SectionErrorBoundary>
        <FavoritesPage onBack={goBack} onNavigate={navigate} />
      </SectionErrorBoundary>
    ),

    premium: (
      <SectionErrorBoundary>
        <PremiumPage onBack={goBack} onNavigate={navigate} />
      </SectionErrorBoundary>
    ),

    settings: (
      <SectionErrorBoundary>
        <SettingsPage onBack={goBack} onNavigate={navigate} />
      </SectionErrorBoundary>
    ),

    // ── Profils métier ─────────────────────────────────────────

    "vet-profile": (
      <SectionErrorBoundary>
        <VetProfilePage
          onBack={goBack}
          onNavigate={navigate}
          vetId={nav.params?.id}
        />
      </SectionErrorBoundary>
    ),

    "shop-profile": (
      <SectionErrorBoundary>
        <PetShopProfilePage
          onBack={goBack}
          onNavigate={navigate}
          shopId={nav.params?.id}
        />
      </SectionErrorBoundary>
    ),

    "shelter-profile": (
      <SectionErrorBoundary>
        <ShelterProfilePage
          onBack={goBack}
          onNavigate={navigate}
          shelterId={nav.params?.id}
        />
      </SectionErrorBoundary>
    ),

    "breeder-profile": (
      <SectionErrorBoundary>
        <BreederProfilePage
          onBack={goBack}
          onNavigate={navigate}
          breederId={nav.params?.id}
        />
      </SectionErrorBoundary>
    ),

    // ── Pages statiques ────────────────────────────────────────

    faq: <FAQPage onBack={goBack} onNavigate={navigate} />,
    contact: <ContactPage onBack={goBack} onNavigate={navigate} />,
    "not-found": <NotFoundPage onNavigate={navigate} />,

    // ── Setup profil post-inscription ──────────────────────────

    "profile-setup": (
      <ErrorBoundary>
        <ProfileSetupPage
          role={(user?.role as any) ?? "owner"}
          onComplete={() => navigate("dashboard")}
          onSkip={() => navigate("home")}
        />
      </ErrorBoundary>
    ),
  };

  // ── Rendu page interne ───────────────────────────────────────

  if (nav.page !== "home") {
    const page = PAGES[nav.page];
    if (page) return page;
    return <NotFoundPage onNavigate={navigate} />;
  }

  // ── Homepage ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white dark:bg-[#060C12] overflow-x-hidden">
      <Navbar
        onNavigate={navigate}
        isLoggedIn={isLoggedIn}
        currentUser={
          user
            ? { name: user.name, role: user.role, avatar: user.avatar }
            : null
        }
        onLogout={handleLogout}
      />
      <main>
        <div className="fixed top-0 left-0 right-0 z-0">
          <HeroSection onNavigate={navigate} />
        </div>
        <div className="relative z-10 mt-[100vh] bg-white dark:bg-[#060C12]">
          <SectionErrorBoundary>
            <StatsBar />
          </SectionErrorBoundary>
          <SectionErrorBoundary>
            <RecentListings onNavigate={navigate} />
          </SectionErrorBoundary>
          <SectionErrorBoundary>
            <AdoptionSpotlight onNavigate={navigate} />
          </SectionErrorBoundary>
          <SectionErrorBoundary>
            <LostFound onNavigate={navigate} />
          </SectionErrorBoundary>
          <HowItWorks onNavigate={navigate} />
          <SectionErrorBoundary>
            <VetDirectory onNavigate={navigate} />
          </SectionErrorBoundary>
          <SectionErrorBoundary>
            <PetStores onNavigate={navigate} />
          </SectionErrorBoundary>
          <CommunityFeed onOpenFeed={() => navigate("feed")} />
          <PremiumSection />
          <TrustSafety />
          <AppDownload />
        </div>
      </main>
      <Footer />
      <MobileBottomNav onNavigate={navigate} isLoggedIn={isLoggedIn} />
    </div>
  );
}

// ── Export principal ───────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationProvider>
        <AppInner />
      </NavigationProvider>
    </ErrorBoundary>
  );
}
