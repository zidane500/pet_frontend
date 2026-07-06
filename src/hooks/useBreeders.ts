import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

// ── Types ──────────────────────────────────────────────────────

export interface Breeder {
  id: number;
  user_id: number;
  name: string;
  tagline: string | null;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  website: string | null;
  logo: string | null;
  logo_url: string | null;
  cover_image: string | null;
  cover_image_url: string | null;
  verified: boolean;
  is_certified: boolean;
  speciality: string | null;
  years_experience: number;
  animals_sold_total: number;
  rating: number;
  reviews_count: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BreederFilters {
  search?: string;
  city?: string;
  speciality?: string;
  verified?: boolean;
  certified?: boolean;
  sort?: "rating" | "name" | "created_at" | "years_experience";
  page?: number;
}

export interface PaginatedBreeders {
  data: Breeder[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ── API calls ──────────────────────────────────────────────────

const breederApi = {
  getAll: async (filters: BreederFilters = {}): Promise<PaginatedBreeders> => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.city) params.append("city", filters.city);
    if (filters.speciality) params.append("speciality", filters.speciality);
    if (filters.verified) params.append("verified", "true");
    if (filters.certified) params.append("certified", "true");
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.page) params.append("page", String(filters.page));

    const { data } = await client.get(`/breeders?${params.toString()}`);
    return data;
  },

  getOne: async (id: number): Promise<Breeder> => {
    const { data } = await client.get(`/breeders/${id}`);
    return data.data;
  },
};

// ── Hooks ──────────────────────────────────────────────────────

export function useBreeders(filters: BreederFilters = {}) {
  return useQuery({
    queryKey: ["breeders", filters],
    queryFn: () => breederApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBreeder(id: number) {
  return useQuery({
    queryKey: ["breeder", id],
    queryFn: () => breederApi.getOne(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5,
  });
}
