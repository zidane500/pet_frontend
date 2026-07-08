import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth";

export function useAuthInit() {
  const hasRun = useRef(false);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // Attendre que zustand/persist ait fini l'hydratation
    if (!isHydrated) return;

    // Ne s'exécute qu'une seule fois
    if (hasRun.current) return;
    hasRun.current = true;

    const checkAuth = async () => {
      // Si pas de token en sessionStorage, pas la peine d'appeler l'API
      const raw = sessionStorage.getItem("petconnect_user");
      if (!raw) {
        logout();
        return;
      }

      try {
        const user = await authApi.me();
        // Récupère le token depuis le store (déjà hydraté par persist)
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token || "";
        setAuth(user, token);
      } catch (err: any) {
        // 401 = token invalide ou expiré
        if (err.response?.status === 401) {
          logout();
        }
      }
    };

    checkAuth();
  }, [isHydrated, setAuth, logout]); // ← Dépend de isHydrated, pas du store entier
}
