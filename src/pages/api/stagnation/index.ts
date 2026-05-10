import type { APIRoute } from "astro";
import { getExerciseHistory, getExerciseById, getUserSessions, getSessionLogs } from "@/lib/db";
import { detectStagnation } from "@/lib/algorithms";
import type { StagnationResult } from "@/lib/algorithms";

/**
 * GET /api/stagnation?exerciseId=xxx
 * Cek stagnasi untuk satu gerakan spesifik.
 *
 * GET /api/stagnation?all=true
 * Cek stagnasi untuk SEMUA gerakan yang pernah dilatih user.
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const { getSession } = await import("@/lib/auth");
    const user = getSession(request);

    if (!user) {
      return new Response(
        JSON.stringify({ stagnations: [], error: "Not authenticated" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const exerciseId = url.searchParams.get("exerciseId");
    const checkAll = url.searchParams.get("all") === "true";

    // === CEK SATU GERAKAN ===
    if (exerciseId && !checkAll) {
      const history = await getExerciseHistory(user.userId, exerciseId, 5);
      const exercise = await getExerciseById(exerciseId);

      if (!exercise) {
        return new Response(
          JSON.stringify({ error: "Gerakan tidak ditemukan" }),
          { status: 404 }
        );
      }

      const volumeLoadHistory = history.map((h) => h.totalVolumeLoad);
      const result = detectStagnation(volumeLoadHistory, exerciseId, exercise.nama);

      return new Response(
        JSON.stringify({
          result,
          history: history.map((h) => ({
            sessionId: h.sessionId,
            tanggal: h.tanggal,
            totalVolumeLoad: h.totalVolumeLoad,
          })),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // === CEK SEMUA GERAKAN (untuk dashboard) ===
    if (checkAll) {
      const sessions = await getUserSessions(user.userId, 10);

      // Kumpulkan semua exerciseId unik
      const exerciseIds = new Set<string>();
      for (const session of sessions) {
        const logs = await getSessionLogs(session.id);
        logs.forEach((l) => exerciseIds.add(l.exerciseId));
      }

      // Cek stagnasi per gerakan
      const results: StagnationResult[] = [];
      for (const exId of exerciseIds) {
        const history = await getExerciseHistory(user.userId, exId, 5);
        const exercise = await getExerciseById(exId);
        if (!exercise || history.length < 3) continue;

        const vlHistory = history.map((h) => h.totalVolumeLoad);
        const result = detectStagnation(vlHistory, exId, exercise.nama);
        if (result.isStagnant) {
          results.push(result);
        }
      }

      return new Response(
        JSON.stringify({ stagnations: results }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Berikan parameter exerciseId atau all=true" }),
      { status: 400 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
