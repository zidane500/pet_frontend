import client from "./client";
import type { PetStore, PaginatedResponse } from "../types";

export const petStoresApi = {
  getAll: async (filters?: {
    city?: string;
    region?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<PetStore>> => {
    const res = await client.get("/pet-stores", { params: filters });
    return res.data;
  },

  getOne: async (id: number): Promise<PetStore> => {
    const res = await client.get(`/pet-stores/${id}`);
    return res.data;
  },
};
