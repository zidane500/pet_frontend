import client from "./client";
import type { User, DashboardData } from "../types";

export const userApi = {
  getProfile: async (id: number): Promise<User> => {
    const res = await client.get(`/users/${id}`);
    return res.data;
  },

  updateProfile: async (
    data: Partial<User> & { password?: string; password_confirmation?: string },
  ): Promise<User> => {
    const res = await client.put("/profile", data);
    return res.data;
  },

  getDashboard: async (): Promise<DashboardData> => {
    const res = await client.get("/dashboard");
    return res.data;
  },

  getNotifications: async () => {
    const res = await client.get("/notifications");
    return res.data;
  },

  markNotificationRead: async (id: string) => {
    await client.patch(`/notifications/${id}/read`);
  },

  markAllNotificationsRead: async () => {
    await client.patch("/notifications/read-all");
  },
};
