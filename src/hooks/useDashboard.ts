import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/user";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: userApi.getDashboard,
  });
}
