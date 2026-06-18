import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: userApi.getNotifications,
    refetchInterval: 15_000, // rafraîchit toutes les 15 secondes
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  const notifications = data?.data ?? [];
  return notifications.filter((n: any) => !n.read_at).length;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
