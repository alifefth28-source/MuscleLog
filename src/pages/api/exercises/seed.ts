import type { APIRoute } from "astro";
import { adminDb } from "@/lib/firebase-admin";

const DEFAULT_EXERCISES = [
  { nama: "Bench Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Incline Bench Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Dumbbell Fly", targetOtot: "Chest", kategori: "Isolation", isDefault: true },
  { nama: "Cable Crossover", targetOtot: "Chest", kategori: "Isolation", isDefault: true },
  { nama: "Dumbbell Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Deadlift", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Barbell Row", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Lat Pulldown", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Seated Cable Row", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Pull Up", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Squat", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Leg Press", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Romanian Deadlift", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Leg Extension", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Leg Curl", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Calf Raise", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Bulgarian Split Squat", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Overhead Press", targetOtot: "Shoulders", kategori: "Compound", isDefault: true },
  { nama: "Lateral Raise", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },
  { nama: "Face Pull", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },
  { nama: "Arnold Press", targetOtot: "Shoulders", kategori: "Compound", isDefault: true },
  { nama: "Bicep Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Hammer Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Tricep Pushdown", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Skull Crusher", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Tricep Dip", targetOtot: "Arms", kategori: "Compound", isDefault: true },
  { nama: "Plank", targetOtot: "Core", kategori: "Isometric", isDefault: true },
  { nama: "Cable Crunch", targetOtot: "Core", kategori: "Isolation", isDefault: true },
  { nama: "Hanging Leg Raise", targetOtot: "Core", kategori: "Compound", isDefault: true },
];

/**
 * POST /api/exercises/seed
 * Seed default exercises ke Firestore.
 * Jalankan sekali saja setelah setup Firebase.
 */
export const POST: APIRoute = async () => {
  try {
    const batch = adminDb.batch();
    const col = adminDb.collection("exercises");

    // Cek apakah sudah pernah di-seed
    const existing = await col.where("isDefault", "==", true).limit(1).get();
    if (!existing.empty) {
      return new Response(
        JSON.stringify({
          message: "Exercises sudah pernah di-seed. Gunakan ?force=true untuk override.",
          count: (await col.get()).size,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    for (const exercise of DEFAULT_EXERCISES) {
      const ref = col.doc();
      batch.set(ref, exercise);
    }

    await batch.commit();

    return new Response(
      JSON.stringify({
        success: true,
        message: `${DEFAULT_EXERCISES.length} gerakan berhasil ditambahkan.`,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
};
