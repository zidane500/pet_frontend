import client from "./client";
import type { Message } from "../types";

export const messagesApi = {
  getConversations: async (): Promise<Message[]> => {
    const res = await client.get("/conversations");
    return res.data;
  },

  getConversation: async (userId: number): Promise<Message[]> => {
    const res = await client.get(`/conversations/${userId}`);
    return res.data;
  },

  send: async (data: {
    receiver_id: number;
    content: string;
    listing_id?: number;
  }): Promise<Message> => {
    const res = await client.post("/messages", data);
    return res.data;
  },
};
