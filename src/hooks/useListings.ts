import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsApi, type ListingFilters } from "../api/listings";

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () => listingsApi.getAll(filters),
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsApi.getOne(id),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: listingsApi.myListings,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      // Invalide TOUTES les queries listings
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
