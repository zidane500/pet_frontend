import client from "./client";
import type { ConversationSummary, Message } from "../types";

export interface SendMessagePayload {
  receiver_id: number;
  content: string;
  listing_id?: number | null;
}

export const messagesApi = {
  getConversations: async (): Promise<ConversationSummary[]> => {
    const res = await client.get("/conversations");
    return res.data;
  },

  getConversation: async (userId: number): Promise<Message[]> => {
    const res = await client.get(
      `/conversations/${encodeURIComponent(String(userId))}`,
    );
    return res.data;
  },

  send: async (data: SendMessagePayload): Promise<Message> => {
    const res = await client.post("/messages", {
      ...data,
      content: data.content.trim(),
    });
    return res.data;
  },
};
