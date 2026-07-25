import client from "./client";
import type { Comment, PaginatedResponse } from "../types";

export const commentsApi = {
  getAll: async (
    listingId: number,
    page = 1,
  ): Promise<PaginatedResponse<Comment>> => {
    const res = await client.get(`/listings/${listingId}/comments`, {
      params: { page },
    });
    return res.data;
  },

  create: async (
    listingId: number,
    body: string,
    parentId?: number,
  ): Promise<Comment> => {
    const res = await client.post(`/listings/${listingId}/comments`, {
      body,
      parent_id: parentId,
    });
    return res.data;
  },

  delete: async (commentId: number): Promise<void> => {
    await client.delete(`/comments/${commentId}`);
  },
};
