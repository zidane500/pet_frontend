import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesApi, type FavoriteType } from "../api/favorites";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: favoritesApi.getAll,
    staleTime: 30_000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: FavoriteType; id: number }) =>
      favoritesApi.toggle(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
}
