import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * RequireAuth — garde les routes protégées
 * Si l'utilisateur n'est pas connecté → redirige vers /login
 * Sauvegarde l'URL demandée dans `state.from` pour y revenir après login
 */
export function RequireAuth() {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
