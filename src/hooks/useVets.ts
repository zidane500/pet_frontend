import { useQuery } from "@tanstack/react-query";
import { vetsApi } from "../api/vets";

export function useVets(filters?: {
  city?: string;
  region?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["vets", filters],
    queryFn: () => vetsApi.getAll(filters),
  });
}

export function useVet(id: number) {
  return useQuery({
    queryKey: ["vet", id],
    queryFn: () => vetsApi.getOne(id),
    enabled: !!id,
  });
}
