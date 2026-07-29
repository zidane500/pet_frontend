import client from "./client";

export interface ToggleLikeResponse {
  liked: boolean;
  likes_count: number;
}

export const likesApi = {
  toggle: async (
    type: "listing" | "comment" | "post",
    id: number,
  ): Promise<ToggleLikeResponse> => {
    const res = await client.post("/likes", { type, id });
    return res.data;
  },
};
