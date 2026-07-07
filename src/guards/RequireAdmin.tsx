import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * RequireAdmin — protège la route /admin
 * - Non connecté → redirige vers /login (en sauvegardant l'URL)
 * - Connecté mais pas admin → redirige vers /dashboard avec message
 * - Admin → affiche la page
 */
export function RequireAdmin() {
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" state={{ adminDenied: true }} replace />;
  }

  return <Outlet />;
}
