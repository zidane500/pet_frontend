import {
  createBrowserRouter,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import App from "./app/App";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireGuest } from "./guards/RequireGuest";
import { useAuth } from "./hooks/useAuth";
import { useAuthStore } from "./store/authStore";

// ── Pages ──────────────────────────────────────────────────────
import { AuthPage } from "./app/pages/AuthPage";
import { DashboardPage } from "./app/pages/DashboardPage";
import { MessagingPage } from "./app/pages/MessagingPage";
import { NotificationsPage } from "./app/pages/NotificationsPage";
import { FavoritesPage } from "./app/pages/FavoritesPage";
import { SettingsPage } from "./app/pages/SettingsPage";
import { CreateListingPage } from "./app/pages/CreateListingPage";
import { ProfileSetupPage } from "./app/pages/ProfileSetupPage";
import { SearchPage } from "./app/pages/SearchPage";
import { PetDetailPage } from "./app/pages/PetDetailPage";
import { VetProfilePage } from "./app/pages/VetProfilePage";
import { PetShopProfilePage } from "./app/pages/PetShopProfilePage";
import { ShelterProfilePage } from "./app/pages/ShelterProfilePage";
import { ProfilePage } from "./app/pages/ProfilePage";
import { FeedPage } from "./app/pages/FeedPage";
import { PremiumPage } from "./app/pages/PremiumPage";
import { FAQPage } from "./app/pages/FAQPage";
import { ContactPage } from "./app/pages/ContactPage";
import { NotFoundPage } from "./app/pages/NotFoundPage";
import { RequireAdmin } from "./guards/RequireAdmin";
import { AdminPage } from "./app/pages/AdminPage";

// ─── Convertisseur page → URL ─────────────────────────────────

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

// ─── Hook utilitaire pour les pages ──────────────────────────────────────────
// Fournit goBack et navigate compatibles avec l'ancien système de props

function usePageNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const onNavigate = (page: string, params?: Record<string, string>) => {
    navigate(pageToPath(page, params));
  };

  return { goBack, onNavigate, location };
}

// ─── Wrappers — injectent les props sans modifier les pages ───────────────────

function SearchPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  const [searchParams] = [new URLSearchParams(useLocation().search)];
  return (
    <SearchPage
      onBack={goBack}
      onNavigate={onNavigate}
      initialQuery={searchParams.get("q") ?? undefined}
      initialType={searchParams.get("type") ?? undefined}
    />
  );
}

function PetDetailPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  const { id } = useParams<{ id: string }>();
  return (
    <PetDetailPage onBack={goBack} onNavigate={onNavigate} listingId={id} />
  );
}

function VetProfilePageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  const { id } = useParams<{ id: string }>();
  return <VetProfilePage onBack={goBack} onNavigate={onNavigate} vetId={id} />;
}

function PetShopProfilePageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  const { id } = useParams<{ id: string }>();
  return (
    <PetShopProfilePage onBack={goBack} onNavigate={onNavigate} shopId={id} />
  );
}

function ShelterProfilePageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  const { id } = useParams<{ id: string }>();
  return (
    <ShelterProfilePage
      onBack={goBack}
      onNavigate={onNavigate}
      shelterId={id}
    />
  );
}

function ProfilePageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  const { id } = useParams<{ id: string }>();
  return <ProfilePage onBack={goBack} onNavigate={onNavigate} userId={id} />;
}

function FeedPageWrapper() {
  const { goBack } = usePageNav();
  return <FeedPage onBack={goBack} />;
}

function DashboardPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  return <DashboardPage onBack={goBack} onNavigate={onNavigate} />;
}

function MessagingPageWrapper() {
  const { goBack } = usePageNav();
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = [new URLSearchParams(useLocation().search)];
  return (
    <MessagingPage
      onBack={goBack}
      initialUserId={userId ?? searchParams.get("userId") ?? undefined}
      initialPartnerName={searchParams.get("partnerName") ?? undefined}
      initialListingId={searchParams.get("listingId") ?? undefined}
    />
  );
}

function NotificationsPageWrapper() {
  const { goBack } = usePageNav();
  return <NotificationsPage onBack={goBack} />;
}

function FavoritesPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  return <FavoritesPage onBack={goBack} onNavigate={onNavigate} />;
}

function SettingsPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  return <SettingsPage onBack={goBack} onNavigate={onNavigate} />;
}

function PremiumPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  return <PremiumPage onBack={goBack} onNavigate={onNavigate} />;
}

function FAQPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  return <FAQPage onBack={goBack} onNavigate={onNavigate} />;
}

function ContactPageWrapper() {
  const { goBack, onNavigate } = usePageNav();
  return <ContactPage onBack={goBack} onNavigate={onNavigate} />;
}

function NotFoundPageWrapper() {
  const { onNavigate } = usePageNav();
  return <NotFoundPage onNavigate={onNavigate} />;
}

function CreateListingPageWrapper() {
  const navigate = useNavigate();
  const { goBack } = usePageNav();
  return (
    <CreateListingPage
      onBack={goBack}
      onSuccess={() => navigate("/dashboard")}
    />
  );
}

function AuthPageWrapper() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
  const initialView = location.pathname === "/register" ? "register" : "login";

  const handleSuccess = (userData: { name: string; role: string }) => {
    if (userData.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (userData.role !== "owner") {
      navigate("/profile-setup");
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthPage
      initialView={initialView}
      onSuccess={handleSuccess}
      onNavigate={(page) => navigate(pageToPath(page))}
      onLogin={login}
      onRegister={register}
    />
  );
}

function ProfileSetupPageWrapper() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return (
    <ProfileSetupPage
      role={(user?.role as any) ?? "owner"}
      onComplete={() => navigate("/dashboard")}
      onSkip={() => navigate("/")}
    />
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // ── Page d'accueil ──────────────────────────────────────
      { index: true, element: null },

      // ── Routes publiques ────────────────────────────────────
      { path: "search", element: <SearchPageWrapper /> },
      { path: "feed", element: <FeedPageWrapper /> },
      { path: "premium", element: <PremiumPageWrapper /> },
      { path: "faq", element: <FAQPageWrapper /> },
      { path: "contact", element: <ContactPageWrapper /> },
      { path: "listings/:id", element: <PetDetailPageWrapper /> },
      { path: "vets/:id", element: <VetProfilePageWrapper /> },
      { path: "stores/:id", element: <PetShopProfilePageWrapper /> },
      { path: "shelters/:id", element: <ShelterProfilePageWrapper /> },
      { path: "profile/:id", element: <ProfilePageWrapper /> },
      { path: "profile", element: <ProfilePageWrapper /> },

      // ── Routes Guest (non connecté seulement) ───────────────
      {
        element: <RequireGuest />,
        children: [
          { path: "login", element: <AuthPageWrapper /> },
          { path: "register", element: <AuthPageWrapper /> },
        ],
      },

      // ── Routes protégées (connecté obligatoire) ─────────────
      {
        element: <RequireAuth />,
        children: [
          { path: "dashboard", element: <DashboardPageWrapper /> },
          { path: "messages", element: <MessagingPageWrapper /> },
          { path: "messages/:userId", element: <MessagingPageWrapper /> },
          { path: "notifications", element: <NotificationsPageWrapper /> },
          { path: "favorites", element: <FavoritesPageWrapper /> },
          { path: "settings", element: <SettingsPageWrapper /> },
          { path: "create-listing", element: <CreateListingPageWrapper /> },
          { path: "profile-setup", element: <ProfileSetupPageWrapper /> },
        ],
      },

      {
        element: <RequireAdmin />,
        children: [{ path: "admin", element: <AdminPage /> }],
      },

      // ── 404 ─────────────────────────────────────────────────
      { path: "*", element: <NotFoundPageWrapper /> },
    ],
  },
]);
