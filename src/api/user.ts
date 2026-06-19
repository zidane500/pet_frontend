import client from "./client";
import type {
  AppNotification,
  DashboardData,
  PaginatedResponse,
  User,
} from "../types";

export const userApi = {
  getProfile: async (id: number): Promise<User> => {
    const res = await client.get(`/users/${encodeURIComponent(String(id))}`);
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

  getNotifications: async (): Promise<PaginatedResponse<AppNotification>> => {
    const res = await client.get("/notifications");
    return res.data;
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await client.patch(`/notifications/${encodeURIComponent(id)}/read`);
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await client.patch("/notifications/read-all");
  },

  deleteNotifications: async (): Promise<void> => {
    await client.delete("/notifications");
  },
};
