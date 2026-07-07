import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * RequireGuest — bloque les routes guest (login/register)
 * Si l'utilisateur est déjà connecté → redirige vers /dashboard
 */
export function RequireGuest() {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
