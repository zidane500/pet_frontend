import client from "./client";
import type { Report } from "../types";

export interface CreateReportPayload {
  type: "listing" | "post" | "profile" | "comment";
  id: number;
  reason: string;
  details?: string;
}

export const reportsApi = {
  // ← Idempotent côté backend : signaler deux fois le même contenu ne crée
  // pas de doublon, l'API renvoie le signalement existant.
  create: async (payload: CreateReportPayload): Promise<Report> => {
    const res = await client.post("/reports", payload);
    return res.data;
  },
};
