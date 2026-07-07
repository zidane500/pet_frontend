import client from "./client";
import type { User, Listing, PaginatedResponse } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    by_role: Record<string, number>;
  };
  listings: {
    total: number;
    active: number;
  };
  messages: number;
  lost_found: number;
  charts: {
    users_per_day: { day: string; count: number }[];
    listings_per_day: { day: string; count: number }[];
  };
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  status?: "active" | "banned";
  page?: number;
  per_page?: number;
}

export interface AdminListingFilters {
  search?: string;
  type?: string;
  status?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  city?: string;
  plan?: string;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
  city?: string;
  region?: string;
  bio?: string;
  plan?: string;
  is_verified?: boolean;
  is_active?: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const res = await client.get("/admin/stats");
    return res.data;
  },

  // Users
  getUsers: async (
    filters?: AdminUserFilters,
  ): Promise<PaginatedResponse<User>> => {
    const res = await client.get("/admin/users", { params: filters });
    return res.data;
  },

  getUser: async (id: number): Promise<User> => {
    const res = await client.get(`/admin/users/${id}`);
    return res.data;
  },

  createUser: async (
    payload: CreateUserPayload,
  ): Promise<{ message: string; user: User }> => {
    const res = await client.post("/admin/users", payload);
    return res.data;
  },

  updateUser: async (
    id: number,
    payload: UpdateUserPayload,
  ): Promise<{ message: string; user: User }> => {
    const res = await client.put(`/admin/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const res = await client.delete(`/admin/users/${id}`);
    return res.data;
  },

  banUser: async (id: number): Promise<{ message: string }> => {
    const res = await client.post(`/admin/users/${id}/ban`);
    return res.data;
  },

  unbanUser: async (id: number): Promise<{ message: string }> => {
    const res = await client.post(`/admin/users/${id}/unban`);
    return res.data;
  },

  verifyUser: async (id: number): Promise<{ message: string }> => {
    const res = await client.post(`/admin/users/${id}/verify`);
    return res.data;
  },

  // Listings
  getListings: async (
    filters?: AdminListingFilters,
  ): Promise<PaginatedResponse<Listing>> => {
    const res = await client.get("/admin/listings", { params: filters });
    return res.data;
  },

  deleteListing: async (id: number): Promise<{ message: string }> => {
    const res = await client.delete(`/admin/listings/${id}`);
    return res.data;
  },

  toggleListing: async (
    id: number,
  ): Promise<{ message: string; is_active: boolean }> => {
    const res = await client.patch(`/admin/listings/${id}/toggle`);
    return res.data;
  },
};
