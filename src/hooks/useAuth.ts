import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth";

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const storeLogout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.token);
      return data.user;
    },
    [setAuth],
  );

  const register = useCallback(
    async (formData: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      role: string;
      phone?: string;
      city?: string;
    }) => {
      const data = await authApi.register(formData);
      setAuth(data.user, data.token);
      return data.user;
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  return { user, isLoggedIn, login, register, logout, updateUser };
}
