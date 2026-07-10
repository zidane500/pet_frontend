import client from "./client";
import type { Order, PaginatedResponse } from "../types";

export interface CreateOrderItemPayload {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  notes?: string;
}

export const ordersApi = {
  // ← Nécessite d'être connecté (protégé côté backend par auth:sanctum)
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await client.post("/orders", payload);
    return res.data;
  },

  myOrders: async (page = 1): Promise<PaginatedResponse<Order>> => {
    const res = await client.get("/my-orders", { params: { page } });
    return res.data;
  },

  getOne: async (id: number): Promise<Order> => {
    const res = await client.get(`/orders/${id}`);
    return res.data;
  },
};
