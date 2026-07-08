import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

// ── Nettoyage des anciens tokens localStorage (sécurité migration) ──
// Supprime les anciennes clés si elles existent encore sur le navigateur
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

      setAuth: (user, token) => {
        set({ user, token, isLoggedIn: true });
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: "petconnect_user",
      storage: createJSONStorage(() => sessionStorage), // ← sessionStorage ici
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
