/**
 * Seed Script — Jalankan sekali untuk mengisi koleksi exercises
 * dengan data gerakan default.
 *
 * Cara pakai:
 * 1. Pastikan .env sudah terisi dengan Firebase Admin credentials
 * 2. Jalankan: npm run seed
 *
 * CATATAN: Script ini menggunakan Firebase Admin SDK.
 * Untuk menjalankan secara lokal, set environment variables dulu.
 */

const DEFAULT_EXERCISES = [
  // === CHEST ===
  { nama: "Bench Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Incline Bench Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },
  { nama: "Dumbbell Fly", targetOtot: "Chest", kategori: "Isolation", isDefault: true },
  { nama: "Cable Crossover", targetOtot: "Chest", kategori: "Isolation", isDefault: true },
  { nama: "Dumbbell Press", targetOtot: "Chest", kategori: "Compound", isDefault: true },

  // === BACK ===
  { nama: "Deadlift", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Barbell Row", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Lat Pulldown", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Seated Cable Row", targetOtot: "Back", kategori: "Compound", isDefault: true },
  { nama: "Pull Up", targetOtot: "Back", kategori: "Compound", isDefault: true },

  // === LEGS ===
  { nama: "Squat", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Leg Press", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Romanian Deadlift", targetOtot: "Legs", kategori: "Compound", isDefault: true },
  { nama: "Leg Extension", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Leg Curl", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Calf Raise", targetOtot: "Legs", kategori: "Isolation", isDefault: true },
  { nama: "Bulgarian Split Squat", targetOtot: "Legs", kategori: "Compound", isDefault: true },

  // === SHOULDERS ===
  { nama: "Overhead Press", targetOtot: "Shoulders", kategori: "Compound", isDefault: true },
  { nama: "Lateral Raise", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },
  { nama: "Face Pull", targetOtot: "Shoulders", kategori: "Isolation", isDefault: true },
  { nama: "Arnold Press", targetOtot: "Shoulders", kategori: "Compound", isDefault: true },

  // === ARMS ===
  { nama: "Bicep Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Hammer Curl", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Tricep Pushdown", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Skull Crusher", targetOtot: "Arms", kategori: "Isolation", isDefault: true },
  { nama: "Tricep Dip", targetOtot: "Arms", kategori: "Compound", isDefault: true },

  // === CORE ===
  { nama: "Plank", targetOtot: "Core", kategori: "Isometric", isDefault: true },
  { nama: "Cable Crunch", targetOtot: "Core", kategori: "Isolation", isDefault: true },
  { nama: "Hanging Leg Raise", targetOtot: "Core", kategori: "Compound", isDefault: true },
];

console.log("=== MuscleLog — Seed Script ===");
console.log(`Total gerakan default: ${DEFAULT_EXERCISES.length}`);
console.log("Jalankan script ini dengan Firebase Admin SDK yang sudah di-setup.");
console.log("\nData exercises:");
DEFAULT_EXERCISES.forEach((ex, i) => {
  console.log(`  ${i + 1}. ${ex.nama} (${ex.targetOtot} - ${ex.kategori})`);
});

export { DEFAULT_EXERCISES };
