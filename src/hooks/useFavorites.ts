import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesApi, type FavoriteType } from "../api/favorites";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.getAll(),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: FavoriteType; id: number }) =>
      favoritesApi.toggle(type, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      if (variables.type === "post") {
        queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      }
    },
  });
}
