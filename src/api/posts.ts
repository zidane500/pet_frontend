import client from "./client";
import type { Post, PaginatedResponse } from "../types";

export interface PostFilters {
  search?: string;
  page?: number;
  per_page?: number;
  refreshKey?: number;
}

export interface CreatePostPayload {
  content?: string;
  photos?: string[];
}

export const postsApi = {
  getAll: async (filters?: PostFilters): Promise<PaginatedResponse<Post>> => {
    const { refreshKey, ...params } = filters ?? {};
    const res = await client.get("/posts", { params });
    return res.data;
  },

  getOne: async (id: number): Promise<Post> => {
    const res = await client.get(`/posts/${id}`);
    return res.data;
  },

  create: async (data: CreatePostPayload): Promise<Post> => {
    const res = await client.post("/posts", data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/posts/${id}`);
  },

  share: async (id: number): Promise<{ shares_count: number }> => {
    const res = await client.post(`/posts/${id}/share`);
    return res.data;
  },
};
