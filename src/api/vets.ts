import client from "./client";
import type { Vet, PaginatedResponse } from "../types";

export const vetsApi = {
  getAll: async (filters?: {
    city?: string;
    region?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<Vet>> => {
    const res = await client.get("/vets", { params: filters });
    return res.data;
  },

  getOne: async (id: number): Promise<Vet> => {
    const res = await client.get(`/vets/${id}`);
    return res.data;
  },
};
