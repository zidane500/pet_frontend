import { useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../i18n";
import { useAuth } from "../hooks/useAuth";
import { useAuthInit } from "../hooks/useAuthInit";
import { useRealtimeUserChannel } from "../hooks/useRealtimeUserChannel";
import { useAuthStore } from "../store/authStore";
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

function pageToPath(page: string, params?: Record<string, string>): string {
  switch (page) {
    case "home":
      return "/";
    case "search":
      return params?.q
        ? `/search?q=${encodeURIComponent(params.q)}${params.type ? `&type=${params.type}` : ""}`
        : `/search${params?.type ? `?type=${params.type}` : ""}`;
    case "feed":
      return "/feed";
    case "dashboard":
      return "/dashboard";
    case "messages":
      return params?.userId ? `/messages/${params.userId}` : "/messages";
    case "create-listing":
      return "/create-listing";
    case "pet-detail":
      return `/listings/${params?.id ?? ""}`;
    case "profile":
      return params?.id ? `/profile/${params.id}` : "/profile";
    case "notifications":
      return "/notifications";
    case "favorites":
      return "/favorites";
    case "premium":
      return "/premium";
    case "settings":
      return "/settings";
    case "vet-profile":
      return `/vets/${params?.id ?? ""}`;
    case "shop-profile":
      return `/stores/${params?.id ?? ""}`;
    case "shelter-profile":
      return `/shelters/${params?.id ?? ""}`;
    case "boutique":
      return "/boutique";
    case "cart":
      return "/panier";
    case "faq":
      return "/faq";
    case "contact":
      return "/contact";
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "profile-setup":
      return "/profile-setup";
    default:
      return "/";
  }
}

export default function App() {
  // ← Initialisation auth (une seule fois après hydratation)
  useAuthInit();

  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const storeLogout = useAuthStore((state) => state.logout);

  const isHomePage = location.pathname === "/";

  // ← WebSocket : se connecte seulement quand user.id change
  useRealtimeUserChannel(isLoggedIn ? (user?.id ?? null) : null);

  // ← Ref pour connaître le chemin actuel sans re-créer l'écouteur ci-dessous
  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // ← Écoute l'événement émis par api/client.ts quand une requête renvoie
  // 401 (session expirée / token invalide). On déconnecte proprement côté
  // store puis on navigue en SPA vers /login — SANS recharger la page.
  // C'est ce qui remplace l'ancien `window.location.href = "/login"` qui
  // provoquait la boucle de rechargement infinie.
  useEffect(() => {
    const handleSessionExpired = () => {
      storeLogout();

      const current = pathnameRef.current;
      if (current !== "/login" && current !== "/register") {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [navigate, storeLogout]);

  // ← Thème : exécuté une seule fois
  useEffect(() => {
    const saved = localStorage.getItem("petconnect-theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  // ← Direction RTL/LTR : ne change que si la langue change réellement
  useEffect(() => {
    const currentLang = i18n.language || "fr";
    const currentDir = document.documentElement.getAttribute("dir");
    const targetDir = currentLang === "ar" ? "rtl" : "ltr";

    // Ne change que si nécessaire
    if (currentDir === targetDir) return;

    document.documentElement.setAttribute("dir", targetDir);
    document.documentElement.setAttribute("lang", currentLang);
    document.body.style.fontFamily =
      currentLang === "ar"
        ? "'Cairo', 'Inter', system-ui, sans-serif"
        : "'Inter', system-ui, sans-serif";
  }, [i18n.language]);

  const handleNavigate = useCallback(
    (page: string, params?: Record<string, string>) => {
      navigate(pageToPath(page, params));
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  if (isHomePage) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#060C12] overflow-x-hidden">
        <Navbar
          onNavigate={handleNavigate}
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
            <HeroSection onNavigate={handleNavigate} />
          </div>
          <div className="relative z-10 mt-[100vh] bg-white dark:bg-[#060C12]">
            <StatsBar />
            <RecentListings onNavigate={handleNavigate} />
            <AdoptionSpotlight onNavigate={handleNavigate} />
            <LostFound onNavigate={handleNavigate} />
            <HowItWorks onNavigate={handleNavigate} />
            <VetDirectory onNavigate={handleNavigate} />
            <PetStores onNavigate={handleNavigate} />
            <CommunityFeed onOpenFeed={() => navigate("/feed")} />
            <PremiumSection />
            <TrustSafety />
            <AppDownload />
          </div>
        </main>
        <Footer />
        <MobileBottomNav onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
      </div>
    );
  }

  return <Outlet />;
}
