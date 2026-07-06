import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

// ── Types ──────────────────────────────────────────────────────

export interface Shelter {
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
  is_nonprofit: boolean;
  capacity: number;
  current_animals: number;
  volunteers_count: number;
  animals_helped_total: number;
  rating: number;
  reviews_count: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShelterFilters {
  search?: string;
  city?: string;
  verified?: boolean;
  sort?: "rating" | "name" | "created_at" | "current_animals";
  page?: number;
}

export interface PaginatedShelters {
  data: Shelter[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ── API calls ──────────────────────────────────────────────────

const shelterApi = {
  getAll: async (filters: ShelterFilters = {}): Promise<PaginatedShelters> => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.city) params.append("city", filters.city);
    if (filters.verified) params.append("verified", "true");
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.page) params.append("page", String(filters.page));

    const { data } = await client.get(`/shelters?${params.toString()}`);
    return data;
  },

  getOne: async (id: number): Promise<Shelter> => {
    const { data } = await client.get(`/shelters/${id}`);
    return data.data;
  },
};

// ── Hooks ──────────────────────────────────────────────────────

export function useShelters(filters: ShelterFilters = {}) {
  return useQuery({
    queryKey: ["shelters", filters],
    queryFn: () => shelterApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useShelter(id: number) {
  return useQuery({
    queryKey: ["shelter", id],
    queryFn: () => shelterApi.getOne(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5,
  });
}
