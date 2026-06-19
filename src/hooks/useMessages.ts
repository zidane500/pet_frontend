import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi, type SendMessagePayload } from "../api/messages";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: messagesApi.getConversations,
    refetchInterval: 15_000,
    staleTime: 5_000,
  });
}

export function useConversation(userId?: number | null) {
  return useQuery({
    queryKey: ["conversation", userId],
    queryFn: () => messagesApi.getConversation(Number(userId)),
    enabled: Number.isFinite(userId) && Number(userId) > 0,
    refetchInterval: 10_000,
    staleTime: 3_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => messagesApi.send(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.receiver_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
