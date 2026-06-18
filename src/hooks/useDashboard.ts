import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import { listingsApi } from "../api/listings";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: userApi.getDashboard,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: listingsApi.myListings,
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      listingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
