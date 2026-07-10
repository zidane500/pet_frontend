import client from "./client";
import type { Product, ProductCategory, PaginatedResponse } from "../types";

export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort?: "newest" | "priceAsc" | "priceDesc";
  page?: number;
  per_page?: number;
}

export const productsApi = {
  getAll: async (
    filters?: ProductFilters,
  ): Promise<PaginatedResponse<Product>> => {
    const res = await client.get("/products", { params: filters });
    return res.data;
  },

  getOne: async (id: number): Promise<Product> => {
    const res = await client.get(`/products/${id}`);
    return res.data;
  },
};
