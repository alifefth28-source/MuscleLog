import type { APIRoute } from "astro";
import { adminDb } from "@/lib/firebase-admin";

const DEFAULT_EXERCISES = [
  { nama: "Bench Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Incline Bench Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Decline Bench Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Dumbbell Fly", targetOtot: "Chest", kategori: "Isolation", isDefault: true },
  { nama: "Cable Crossover", targetOtot: "Chest", kategori: "Isolation", isDefault: true },
  { nama: "Dumbbell Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Push Up", targetOtot: "Chest", kategori: "Compound", isDefault: true },

  { nama: "Deadlift", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Barbell Row", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Lat Pulldown", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Seated Cable Row", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Pull Up", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "T-Bar Row", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Dumbbell Row", targetOtot: "Back", kategori: "Compound", isDefault: true },

  { nama: "Squat", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Leg Press", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Romanian Deadlift", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Leg Extension", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Leg Curl", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Calf Raise", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Bulgarian Split Squat", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Hip Thrust", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Hack Squat", targetOtot: "Legs", kategori: "Compound", isDefault: true },

  { nama: "Overhead Press", targetOtot: "Shoulders", kategori: "Compound", isDefault: true },
  { nama: "Lateral Raise", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },
  { nama: "Face Pull", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },
  { nama: "Arnold Press", targetOtot: "Shoulders", kategori: "Compound", isDefault: true },
  { nama: "Rear Delt Fly", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },
  { nama: "Front Raise", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },

  { nama: "Bicep Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Hammer Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Preacher Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Tricep Pushdown", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Skull Crusher", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Tricep Dip", targetOtot: "Arms", kategori: "Compound", isDefault: true },
  { nama: "Overhead Tricep Extension", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Concentration Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },

  { nama: "Plank", targetOtot: "Core", kategori: "Isometric", isDefault: true },
  { nama: "Cable Crunch", targetOtot: "Core", kategori: "Isolation", isDefault: true },
  { nama: "Hanging Leg Raise", targetOtot: "Core", kategori: "Compound", isDefault: true },
  { nama: "Russian Twist", targetOtot: "Core", kategori: "Isolation", isDefault: true },
  { nama: "Ab Rollout", targetOtot: "Core", kategori: "Compound", isDefault: true },
];

/**
 * GET /api/exercises
 * Ambil semua gerakan. Auto-seed jika collection kosong.
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const col = adminDb.collection("exercises");
    let snap = await col.get();

    // AUTO-SEED: Jika collection kosong, isi dengan data default
    if (snap.empty) {
      console.log("[MuscleLog] Collection exercises kosong, auto-seeding...");
      const batch = adminDb.batch();
      for (const exercise of DEFAULT_EXERCISES) {
        const ref = col.doc();
        batch.set(ref, exercise);
      }
      await batch.commit();
      console.log(`[MuscleLog] ${DEFAULT_EXERCISES.length} gerakan berhasil di-seed.`);

      // Re-fetch setelah seed
      snap = await col.get();
    }

    const exercises = snap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        if (a.targetOtot < b.targetOtot) return -1;
        if (a.targetOtot > b.targetOtot) return 1;
        if (a.nama < b.nama) return -1;
        if (a.nama > b.nama) return 1;
        return 0;
      });

    return new Response(JSON.stringify({ exercises }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[MuscleLog] Exercises API error:", err);
    return new Response(
      JSON.stringify({ error: err.message, exercises: [] }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
