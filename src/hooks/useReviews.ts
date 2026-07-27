import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, type CreateReviewPayload } from "../api/reviews";

// ← Clé de cache à invalider selon le type de fiche notée, pour que la
// note moyenne / le nombre d'avis / la liste se rafraîchissent après
// création ou suppression d'un avis.
function targetQueryKey(type: "vet" | "pet_store", id: number) {
  return type === "vet" ? ["vet", id] : ["pet-store", id];
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.create(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: targetQueryKey(variables.type, variables.id),
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: number;
      type: "vet" | "pet_store";
      targetId: number;
    }) => reviewsApi.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: targetQueryKey(variables.type, variables.targetId),
      });
    },
  });
}
