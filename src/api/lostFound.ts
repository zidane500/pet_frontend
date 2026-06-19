import client from "./client";
import type { LostFound, PaginatedResponse } from "../types";

export const lostFoundApi = {
  getAll: async (filters?: {
    type?: "lost" | "found";
    species?: string;
    city?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<LostFound>> => {
    const res = await client.get("/lost-found", { params: filters });
    return res.data;
  },

  create: async (data: Partial<LostFound>): Promise<LostFound> => {
    const res = await client.post("/lost-found", data);
    return res.data;
  },

  resolve: async (id: number): Promise<void> => {
    await client.patch(`/lost-found/${id}/resolve`);
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/lost-found/${id}`);
  },
};
