import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type CreateOrderPayload } from "../api/orders";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clear);

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      // ← Le panier n'est vidé QU'EN CAS DE SUCCÈS. Si la commande
      // échoue (ex : stock insuffisant détecté côté serveur), le
      // panier reste intact pour que le client ne perde pas sa
      // sélection.
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

export function useMyOrders(page = 1) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return useQuery({
    queryKey: ["my-orders", page],
    queryFn: () => ordersApi.myOrders(page),
    enabled: isLoggedIn,
  });
}

export function useOrder(id?: number | null) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOne(Number(id)),
    enabled: isLoggedIn && !!id,
  });
}
