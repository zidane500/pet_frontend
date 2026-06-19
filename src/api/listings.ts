import client from "./client";
import type { Listing, PaginatedResponse } from "../types";

export interface ListingFilters {
  type?: string;
  species?: string;
  city?: string;
  region?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  is_vaccinated?: boolean;
  adoptable?: boolean;
  sort?: "newest" | "oldest" | "priceAsc" | "priceDesc";
  page?: number;
  per_page?: number;
}

export const listingsApi = {
  getAll: async (
    filters?: ListingFilters,
  ): Promise<PaginatedResponse<Listing>> => {
    const res = await client.get("/listings", { params: filters });
    return res.data;
  },

  getOne: async (id: number): Promise<Listing> => {
    const res = await client.get(`/listings/${id}`);
    return res.data;
  },

  create: async (data: Partial<Listing>): Promise<Listing> => {
    const res = await client.post("/listings", data);
    return res.data;
  },

  update: async (id: number, data: Partial<Listing>): Promise<Listing> => {
    const res = await client.put(`/listings/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/listings/${id}`);
  },

  myListings: async (): Promise<PaginatedResponse<Listing>> => {
    const res = await client.get("/my-listings");
    return res.data;
  },
};
