import { useQuery, useMutation } from "@tanstack/react-query";
import { followsApi } from "../api/follows";
import { useAuthStore } from "../store/authStore";

export function useToggleFollow() {
  return useMutation({
    mutationFn: (userId: number) => followsApi.toggle(userId),
  });
}

export function useFollowSuggestions() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return useQuery({
    queryKey: ["follow-suggestions"],
    queryFn: () => followsApi.suggestions(),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });
}
