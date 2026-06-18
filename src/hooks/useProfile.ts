import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import { useAuthStore } from "../store/authStore";

export function useProfile(id: number) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => userApi.getProfile(id),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data: {
      name?: string;
      phone?: string;
      city?: string;
      region?: string;
      bio?: string;
      avatar?: string;
      locale?: string;
      password?: string;
      password_confirmation?: string;
    }) => userApi.updateProfile(data),

    onSuccess: (updatedUser) => {
      // Met à jour le store global (Navbar, etc.)
      updateUser(updatedUser);
      // Invalide le cache du profil affiché
      queryClient.invalidateQueries({ queryKey: ["profile", updatedUser.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
