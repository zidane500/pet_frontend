import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi, type CommentableType } from "../api/comments";

export function useComments(type: CommentableType, id: number, enabled = true) {
  return useQuery({
    queryKey: ["comments", type, id],
    queryFn: () => commentsApi.getAll(type, id),
    enabled: enabled && !!id,
  });
}

export function useCreateComment(type: CommentableType, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId?: number }) =>
      commentsApi.create(type, id, body, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", type, id] });
    },
  });
}

export function useDeleteComment(type: CommentableType, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => commentsApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", type, id] });
    },
  });
}
