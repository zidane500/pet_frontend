import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lostFoundApi } from "../api/lostFound";

export function useLostFound(filters?: {
  type?: "lost" | "found";
  species?: string;
  city?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["lost-found", filters],
    queryFn: () => lostFoundApi.getAll(filters),
  });
}

export function useCreateLostFound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lostFoundApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lost-found"] });
    },
  });
}

export function useResolveLostFound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lostFoundApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lost-found"] });
    },
  });
}

export function useDeleteLostFound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lostFoundApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lost-found"] });
    },
  });
}
