import { useMutation } from "@tanstack/react-query";
import { reportsApi, type CreateReportPayload } from "../api/reports";

// ← Pas de useQuery ici : un utilisateur ne consulte jamais la liste de ses
// propres signalements dans l'app, donc pas de cache à invalider côté
// utilisateur (seule la file d'attente admin, gérée dans useAdmin.ts, en
// a besoin).
export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportsApi.create(payload),
  });
}
