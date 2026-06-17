import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "../api/favorites";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: favoritesApi.getAll,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      id,
    }: {
      type: "listing" | "vet" | "pet_store";
      id: number;
    }) => favoritesApi.toggle(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
