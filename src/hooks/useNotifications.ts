import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import { useAuthStore } from "../store/authStore";

export function useNotifications() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: userApi.getNotifications,
    // ← Ne s'exécute (et ne fait du polling) que si l'utilisateur est
    // connecté. Avant ce garde-fou, cette requête tournait même sans
    // connexion et renvoyait des 401 en boucle.
    enabled: isLoggedIn,
    refetchInterval: isLoggedIn ? 30_000 : false,
    staleTime: 10_000,
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return (
    data?.data?.filter((notification) => !notification.read_at).length ?? 0
  );
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
