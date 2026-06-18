import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "../api/messages";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: messagesApi.getConversations,
    refetchInterval: 10_000, // rafraîchit toutes les 10 secondes
  });
}

export function useConversation(userId: number) {
  return useQuery({
    queryKey: ["conversation", userId],
    queryFn: () => messagesApi.getConversation(userId),
    enabled: !!userId,
    refetchInterval: 5_000, // rafraîchit toutes les 5 secondes
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.send,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.receiver_id],
      });
    },
  });
}
