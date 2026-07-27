import client from "./client";
import type {
  Appointment,
  AppointmentStatus,
  PaginatedResponse,
} from "../types";

export interface CreateAppointmentPayload {
  vet_id: number;
  animal_id?: number;
  service?: string;
  appointment_date: string; // format YYYY-MM-DD
  appointment_time: string;
  notes?: string;
}

export const appointmentsApi = {
  // ← Le propriétaire demande un créneau
  create: async (payload: CreateAppointmentPayload): Promise<Appointment> => {
    const res = await client.post("/appointments", payload);
    return res.data;
  },

  // ← Mes RDV en tant que propriétaire (patient)
  mine: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Appointment>> => {
    const res = await client.get("/appointments/mine", { params });
    return res.data;
  },

  // ← Le propriétaire annule sa propre demande
  cancel: async (
    id: number,
  ): Promise<{ message: string; appointment: Appointment }> => {
    const res = await client.patch(`/appointments/${id}/cancel`);
    return res.data;
  },

  // ← RDV reçus par mon cabinet (je suis le vétérinaire connecté)
  vetAppointments: async (params?: {
    status?: AppointmentStatus;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Appointment>> => {
    const res = await client.get("/vet/appointments", { params });
    return res.data;
  },

  // ← Le vétérinaire confirme/refuse/termine
  updateStatus: async (
    id: number,
    payload: {
      status: "confirmed" | "declined" | "completed";
      vet_notes?: string;
    },
  ): Promise<{ message: string; appointment: Appointment }> => {
    const res = await client.patch(`/appointments/${id}/status`, payload);
    return res.data;
  },
};
