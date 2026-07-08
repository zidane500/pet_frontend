import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isHydrated: boolean; // ← Nouveau : évite les re-renders pendant l'hydratation
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  setHydrated: () => void;
}

// Nettoyage anciens localStorage
if (typeof window !== "undefined") {
  localStorage.removeItem("petconnect_token");
  localStorage.removeItem("petconnect_user");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isHydrated: false, // ← Commence à false

      setAuth: (user, token) => {
        set({ user, token, isLoggedIn: true });
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: "petconnect_user",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        // ← Appelé après l'hydratation complète
        state?.setHydrated();
      },
    },
  ),
);
