import client from "./client";
import type { FollowSuggestion } from "../types";

export interface ToggleFollowResponse {
  following: boolean;
  followers_count: number;
}

export const followsApi = {
  toggle: async (userId: number): Promise<ToggleFollowResponse> => {
    const res = await client.post(`/users/${userId}/follow`);
    return res.data;
  },

  suggestions: async (): Promise<FollowSuggestion[]> => {
    const res = await client.get("/follow-suggestions");
    return res.data;
  },
};
