import client from "./client";
import type { Comment, PaginatedResponse } from "../types";

export type CommentableType = "listing" | "post";

export const commentsApi = {
  getAll: async (
    type: CommentableType,
    id: number,
    page = 1,
  ): Promise<PaginatedResponse<Comment>> => {
    const res = await client.get(`/${type}s/${id}/comments`, {
      params: { page },
    });
    return res.data;
  },

  create: async (
    type: CommentableType,
    id: number,
    body: string,
    parentId?: number,
  ): Promise<Comment> => {
    const res = await client.post(`/${type}s/${id}/comments`, {
      body,
      parent_id: parentId,
    });
    return res.data;
  },

  delete: async (commentId: number): Promise<void> => {
    await client.delete(`/comments/${commentId}`);
  },
};
