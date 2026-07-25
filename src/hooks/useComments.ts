import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../api/comments";

export function useComments(listingId: number, enabled = true) {
  return useQuery({
    queryKey: ["comments", listingId],
    queryFn: () => commentsApi.getAll(listingId),
    enabled: enabled && !!listingId,
  });
}

export function useCreateComment(listingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId?: number }) =>
      commentsApi.create(listingId, body, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", listingId] });
    },
  });
}

export function useDeleteComment(listingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => commentsApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", listingId] });
    },
  });
}
