import { adminDb } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { volumeLoad as calcVolumeLoad, estimasi1rm as calcEstimasi1rm } from "./algorithms";

// ============================================================
// TYPES
// ============================================================

export interface User {
  id: string;
  nama: string;
  email: string;
  createdAt: Timestamp;
}

export interface Exercise {
  id: string;
  nama: string;
  targetOtot: string;
  kategori: string;
  isDefault: boolean;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  tanggal: Timestamp;
  namaSesi: string;
  durasiMenit: number;
  catatan: string;
  isClosed: boolean;
  createdAt: Timestamp;
}

export interface WorkoutLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  userId: string;
  setKe: number;
  bebanKg: number;
  repetisi: number;
  skorRpe: number;
  skorRir: number;
  volumeLoad: number;
  estimasi1rm: number;
  createdAt: Timestamp;
}

// ============================================================
// COLLECTIONS
// ============================================================

const usersCol = () => adminDb.collection("users");
const exercisesCol = () => adminDb.collection("exercises");
const sessionsCol = () => adminDb.collection("workout_sessions");
const logsCol = () => adminDb.collection("workout_logs");

// ============================================================
// USER OPERATIONS
// ============================================================

export async function createUser(data: {
  id: string;
  nama: string;
  email: string;
}): Promise<User> {
  const user: Omit<User, "id"> = {
    nama: data.nama,
    email: data.email,
    createdAt: Timestamp.now(),
  };
  await usersCol().doc(data.id).set(user);
  return { id: data.id, ...user };
}

export async function getUserById(id: string): Promise<User | null> {
  const doc = await usersCol().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snap = await usersCol().where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

// ============================================================
// EXERCISE OPERATIONS
// ============================================================

export async function getAllExercises(): Promise<Exercise[]> {
  const snap = await exercisesCol().get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Exercise)
    .sort((a, b) => a.kategori.localeCompare(b.kategori) || a.nama.localeCompare(b.nama));
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const doc = await exercisesCol().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Exercise;
}

export async function createExercise(data: Omit<Exercise, "id">): Promise<Exercise> {
  const ref = await exercisesCol().add(data);
  return { id: ref.id, ...data };
}

// ============================================================
// WORKOUT SESSION OPERATIONS
// ============================================================

export async function createSession(data: {
  userId: string;
  namaSesi: string;
  catatan?: string;
}): Promise<WorkoutSession> {
  const session = {
    userId: data.userId,
    tanggal: Timestamp.now(),
    namaSesi: data.namaSesi,
    durasiMenit: 0,
    catatan: data.catatan || "",
    isClosed: false,
    createdAt: Timestamp.now(),
  };
  const ref = await sessionsCol().add(session);
  return { id: ref.id, ...session } as WorkoutSession;
}

export async function getSessionById(id: string): Promise<WorkoutSession | null> {
  const doc = await sessionsCol().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as WorkoutSession;
}

export async function getUserSessions(
  userId: string,
  limitCount = 20
): Promise<WorkoutSession[]> {
  const snap = await sessionsCol()
    .where("userId", "==", userId)
    .get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as WorkoutSession)
    .sort((a, b) => {
      const ta = a.tanggal?.toMillis?.() || 0;
      const tb = b.tanggal?.toMillis?.() || 0;
      return tb - ta;
    })
    .slice(0, limitCount);
}

export async function closeSession(
  sessionId: string,
  durasiMenit: number
): Promise<void> {
  await sessionsCol().doc(sessionId).update({
    isClosed: true,
    durasiMenit,
  });
}

// ============================================================
// WORKOUT LOG OPERATIONS
// ============================================================

export async function addWorkoutLog(data: {
  sessionId: string;
  exerciseId: string;
  userId: string;
  setKe: number;
  bebanKg: number;
  repetisi: number;
  skorRpe: number;
  skorRir: number;
}): Promise<WorkoutLog> {
  const vl = calcVolumeLoad(data.bebanKg, data.repetisi);
  const est1rm = calcEstimasi1rm(data.bebanKg, data.repetisi);

  const log = {
    ...data,
    volumeLoad: vl,
    estimasi1rm: est1rm,
    createdAt: Timestamp.now(),
  };
  const ref = await logsCol().add(log);
  return { id: ref.id, ...log } as WorkoutLog;
}

export async function getSessionLogs(sessionId: string): Promise<WorkoutLog[]> {
  const snap = await logsCol()
    .where("sessionId", "==", sessionId)
    .get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as WorkoutLog)
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return ta - tb;
    });
}

export async function deleteLog(logId: string): Promise<void> {
  await logsCol().doc(logId).delete();
}

/**
 * Ambil riwayat workout_logs untuk gerakan tertentu milik user,
 * dikelompokkan per sesi, diurutkan terbaru dulu.
 * Dipakai oleh algoritma stagnation detector.
 */
export async function getExerciseHistory(
  userId: string,
  exerciseId: string,
  sessionLimit = 5
): Promise<
  { sessionId: string; tanggal: Timestamp; totalVolumeLoad: number; logs: WorkoutLog[] }[]
> {
  // Ambil sesi user terbaru
  const sessions = await getUserSessions(userId, sessionLimit * 2);
  const results: {
    sessionId: string;
    tanggal: Timestamp;
    totalVolumeLoad: number;
    logs: WorkoutLog[];
  }[] = [];

  for (const session of sessions) {
    const snap = await logsCol()
      .where("sessionId", "==", session.id)
      .where("exerciseId", "==", exerciseId)
      .get();

    if (snap.empty) continue;

    const logs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as WorkoutLog)
      .sort((a, b) => (a.setKe || 0) - (b.setKe || 0));
    const totalVolumeLoad = logs.reduce((sum, l) => sum + l.volumeLoad, 0);

    results.push({
      sessionId: session.id,
      tanggal: session.tanggal,
      totalVolumeLoad,
      logs,
    });

    if (results.length >= sessionLimit) break;
  }

  return results;
}

/**
 * Ambil ringkasan semua gerakan di sesi terakhir user
 * untuk ditampilkan di dashboard
 */
export async function getLatestSessionSummary(
  userId: string
): Promise<
  { exerciseId: string; exerciseName: string; totalVolumeLoad: number }[] | null
> {
  const sessions = await getUserSessions(userId, 1);
  if (sessions.length === 0) return null;

  const latestSession = sessions[0];
  const logs = await getSessionLogs(latestSession.id);
  if (logs.length === 0) return null;

  // Group by exercise
  const grouped = new Map<string, { totalVl: number; exerciseId: string }>();
  for (const log of logs) {
    const existing = grouped.get(log.exerciseId);
    if (existing) {
      existing.totalVl += log.volumeLoad;
    } else {
      grouped.set(log.exerciseId, { totalVl: log.volumeLoad, exerciseId: log.exerciseId });
    }
  }

  // Resolve exercise names
  const result = [];
  for (const [exId, data] of grouped) {
    const exercise = await getExerciseById(exId);
    result.push({
      exerciseId: exId,
      exerciseName: exercise?.nama || "Unknown",
      totalVolumeLoad: Math.round(data.totalVl),
    });
  }

  return result;
}

/**
 * Hitung RPE rata-rata dari sesi terakhir user
 */
export async function getLatestRpeAvg(userId: string): Promise<number | null> {
  const sessions = await getUserSessions(userId, 1);
  if (sessions.length === 0) return null;

  const logs = await getSessionLogs(sessions[0].id);
  if (logs.length === 0) return null;

  const rpeValues = logs.filter(l => l.skorRpe > 0).map(l => l.skorRpe);
  if (rpeValues.length === 0) return null;

  const avg = rpeValues.reduce((sum, v) => sum + v, 0) / rpeValues.length;
  return Math.round(avg * 10) / 10;
}
