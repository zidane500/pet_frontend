import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: userApi.getNotifications,
    refetchInterval: 30_000,
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
