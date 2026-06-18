import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { petStoresApi } from "../api/petStores";

export function usePetStores(filters?: {
  city?: string;
  region?: string;
  search?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["pet-stores", filters],
    queryFn: () => petStoresApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePetStore(id: number) {
  return useQuery({
    queryKey: ["pet-store", id],
    queryFn: () => petStoresApi.getOne(id),
    enabled: !!id,
  });
}

export function useTogglePetStoreFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      import("../api/favorites").then((m) =>
        m.favoritesApi.toggle("pet_store", id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
