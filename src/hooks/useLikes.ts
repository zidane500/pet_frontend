import { useMutation } from "@tanstack/react-query";
import { likesApi } from "../api/likes";

// ← Volontairement simple : pas de invalidation globale du feed (trop
// coûteux pour un simple like). C'est le composant appelant qui met à
// jour son état local de façon optimiste dans le callback onSuccess.
export function useToggleLike() {
  return useMutation({
    mutationFn: ({
      type,
      id,
    }: {
      type: "listing" | "comment" | "post";
      id: number;
    }) => likesApi.toggle(type, id),
  });
}
