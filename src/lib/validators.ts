import { z } from "zod";

export const registerSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").max(50),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export const createSessionSchema = z.object({
  namaSesi: z.string().min(1, "Nama sesi tidak boleh kosong").max(100),
  catatan: z.string().max(500).optional(),
});

export const addLogSchema = z.object({
  sessionId: z.string().min(1),
  exerciseId: z.string().min(1),
  setKe: z.number().int().min(1).max(20),
  bebanKg: z.number().min(0).max(500),
  repetisi: z.number().int().min(1).max(100),
  skorRpe: z.number().min(1).max(10),
  skorRir: z.number().int().min(0).max(10),
});

export const closeSessionSchema = z.object({
  sessionId: z.string().min(1),
  durasiMenit: z.number().int().min(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type AddLogInput = z.infer<typeof addLogSchema>;
export type CloseSessionInput = z.infer<typeof closeSessionSchema>;
