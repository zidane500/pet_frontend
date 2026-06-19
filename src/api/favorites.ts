import client from "./client";
import type { Favorite } from "../types";

export type FavoriteType = "listing" | "vet" | "pet_store";

export const favoritesApi = {
  getAll: async (): Promise<Favorite[]> => {
    const res = await client.get("/favorites");
    return res.data;
  },

  toggle: async (
    type: FavoriteType,
    id: number,
  ): Promise<{ favorited: boolean }> => {
    const res = await client.post("/favorites", { type, id });
    return res.data;
  },
};
