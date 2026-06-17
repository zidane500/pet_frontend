import client from "./client";
import type { AuthResponse, User } from "../types";

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    phone?: string;
    city?: string;
  }): Promise<AuthResponse> => {
    const res = await client.post("/auth/register", data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await client.post("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await client.post("/auth/logout");
  },

  me: async (): Promise<User> => {
    const res = await client.get("/auth/me");
    return res.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await client.post("/auth/forgot-password", { email });
  },

  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    await client.post("/auth/reset-password", data);
  },
};
