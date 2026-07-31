import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  postsApi,
  type PostFilters,
  type CreatePostPayload,
} from "../api/posts";

export function usePosts(filters?: PostFilters) {
  return useQuery({
    queryKey: ["posts", filters],
    queryFn: () => postsApi.getAll(filters),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

// ← Pagination infinie du feed. On délègue tout le suivi des pages à
// react-query (data.pages, hasNextPage, fetchNextPage...) au lieu de le
// recopier à la main dans un state local : c'est ce recopiage manuel qui
// causait le feed vide (l'effet de recopie pouvait ne jamais se
// redéclencher, ou se faire doubler par le scroll infini). Ici il n'y a
// plus qu'une seule source de vérité : le cache react-query.
export function useInfinitePosts(filters?: Omit<PostFilters, "page">) {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite", filters],
    queryFn: ({ pageParam }) =>
      postsApi.getAll({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
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
