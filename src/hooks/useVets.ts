import { useQuery } from "@tanstack/react-query";
import { vetsApi } from "../api/vets";

export interface VetFilters {
  city?: string;
  region?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export function useVets(filters?: VetFilters) {
  return useQuery({
    queryKey: ["vets", filters],
    queryFn: () => vetsApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVet(id: number) {
  return useQuery({
    queryKey: ["vet", id],
    queryFn: () => vetsApi.getOne(id),
    enabled: !!id,
  });
}
