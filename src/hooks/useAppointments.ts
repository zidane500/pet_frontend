import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appointmentsApi,
  type CreateAppointmentPayload,
} from "../api/appointments";
import type { AppointmentStatus } from "../types";

// ─── Côté propriétaire (patient) ────────────────────────────────────────────

export function useMyAppointments(params?: {
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ["appointments", "mine", params],
    queryFn: () => appointmentsApi.mine(params),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      appointmentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "mine"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "mine"] });
    },
  });
}

// ─── Côté vétérinaire (mon cabinet) ─────────────────────────────────────────

export function useVetAppointments(filters?: {
  status?: AppointmentStatus;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ["appointments", "vet", filters],
    queryFn: () => appointmentsApi.vetAppointments(filters),
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      vet_notes,
    }: {
      id: number;
      status: "confirmed" | "declined" | "completed";
      vet_notes?: string;
    }) => appointmentsApi.updateStatus(id, { status, vet_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "vet"] });
    },
  });
}
