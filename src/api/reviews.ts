import client from "./client";
import type { Review } from "../types";

export interface CreateReviewPayload {
  type: "vet" | "pet_store";
  id: number;
  rating: number;
  comment?: string;
}

// ← Le backend fait un `updateOrCreate` sur (user_id, reviewable_type,
// reviewable_id) : poster un 2e avis sur la même fiche met simplement à
// jour le précédent au lieu d'en créer un nouveau.
export const reviewsApi = {
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const res = await client.post("/reviews", payload);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/reviews/${id}`);
  },
};
