import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setAuth: (user, token) => {
        localStorage.setItem("petconnect_token", token);
        set({ user, token, isLoggedIn: true });
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        localStorage.removeItem("petconnect_token");
        localStorage.removeItem("petconnect_user");
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: "petconnect_user",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
