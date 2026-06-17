import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth";

export function useAuth() {
  const {
    user,
    isLoggedIn,
    setAuth,
    logout: storeLogout,
    updateUser,
  } = useAuthStore();

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    setAuth(data.user, data.token);
    return data.user;
  };

  const register = async (formData: {
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
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore si token déjà invalide
    } finally {
      storeLogout();
    }
  };

  return { user, isLoggedIn, login, register, logout, updateUser };
}
