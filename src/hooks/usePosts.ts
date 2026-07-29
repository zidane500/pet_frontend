import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postsApi,
  type PostFilters,
  type CreatePostPayload,
} from "../api/posts";

export function usePosts(filters?: PostFilters) {
  return useQuery({
    queryKey: ["posts", filters],
    queryFn: () => postsApi.getAll(filters),
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostPayload) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
