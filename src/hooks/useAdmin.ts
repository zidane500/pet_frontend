import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type AdminUserFilters,
  type AdminListingFilters,
  type AdminProductFilters,
  type AdminOrderFilters,
  type CreateUserPayload,
  type UpdateUserPayload,
  type ProductPayload,
} from "../api/admin";
import type { OrderStatus } from "../types";

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
    staleTime: 1000 * 30, // 30 secondes
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => adminApi.getUsers(filters),
    staleTime: 1000 * 30,
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  });
}

export function useAdminCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => adminApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      adminApi.updateUser(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.banUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminVerifyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.verifyUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export function useAdminListings(filters?: AdminListingFilters) {
  return useQuery({
    queryKey: ["admin", "listings", filters],
    queryFn: () => adminApi.getListings(filters),
    staleTime: 1000 * 30,
  });
}

export function useAdminDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useAdminToggleListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.toggleListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// ─── Produits (boutique) ────────────────────────────────────────────────────

export function useAdminProducts(filters?: AdminProductFilters) {
  return useQuery({
    queryKey: ["admin", "products", filters],
    queryFn: () => adminApi.getProducts(filters),
    staleTime: 1000 * 30,
  });
}

export function useAdminCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => adminApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      // ← Le catalogue public doit aussi voir le nouveau produit
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ProductPayload>;
    }) => adminApi.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminToggleProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.toggleProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Commandes ───────────────────────────────────────────────────────────────

export function useAdminOrders(filters?: AdminOrderFilters) {
  return useQuery({
    queryKey: ["admin", "orders", filters],
    queryFn: () => adminApi.getOrders(filters),
    staleTime: 1000 * 30,
  });
}

export function useAdminUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      admin_notes,
    }: {
      id: number;
      status: OrderStatus;
      admin_notes?: string;
    }) => adminApi.updateOrderStatus(id, { status, admin_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}
