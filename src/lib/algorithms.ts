// ============================================================
// ALGORITMA INTI — MuscleLog
// ============================================================

/**
 * Menghitung Volume Load per set.
 * Formula: Beban (kg) × Repetisi
 *
 * Catatan: Volume Load per sesi = SUM dari semua set
 * pada gerakan yang sama.
 */
export function volumeLoad(bebanKg: number, repetisi: number): number {
  return Math.round(bebanKg * repetisi * 100) / 100;
}

/**
 * Estimasi One Repetition Maximum (1RM) menggunakan rumus Brzycki.
 * Formula: 1RM = Beban × (36 / (37 - Repetisi))
 *
 * Berlaku untuk repetisi 1-12. Di atas 12 rep, akurasi menurun.
 * Referensi: Brzycki, M. (1993)
 */
export function estimasi1rm(bebanKg: number, repetisi: number): number {
  if (repetisi <= 0 || bebanKg <= 0) return 0;
  if (repetisi === 1) return bebanKg;
  if (repetisi >= 37) return bebanKg; // Batas formula

  const result = bebanKg * (36 / (37 - repetisi));
  return Math.round(result * 10) / 10;
}

/**
 * Estimasi 1RM menggunakan rumus Epley (alternatif).
 * Formula: 1RM = Beban × (1 + Repetisi / 30)
 */
export function estimasi1rmEpley(bebanKg: number, repetisi: number): number {
  if (repetisi <= 0 || bebanKg <= 0) return 0;
  if (repetisi === 1) return bebanKg;

  const result = bebanKg * (1 + repetisi / 30);
  return Math.round(result * 10) / 10;
}

/**
 * Konversi RPE ke RIR.
 * RPE 10 = RIR 0 (gagal total)
 * RPE 9  = RIR 1
 * RPE 8  = RIR 2
 * dst.
 */
export function rpeToRir(rpe: number): number {
  return Math.max(0, 10 - rpe);
}

/**
 * Konversi RIR ke RPE.
 */
export function rirToRpe(rir: number): number {
  return Math.max(0, 10 - rir);
}

// ============================================================
// STAGNATION DETECTOR
// ============================================================

export interface StagnationResult {
  isStagnant: boolean;
  exerciseId: string;
  exerciseName: string;
  sessionsCompared: number;
  volumeLoadHistory: number[];
  percentageChange: number;
  recommendation: string;
  severity: "none" | "warning" | "alert";
}

/**
 * Mendeteksi stagnasi berdasarkan perbandingan Volume Load
 * dari 3 sesi terakhir pada gerakan yang sama.
 *
 * Kriteria stagnasi:
 * - Tidak ada peningkatan VL > 2% selama 3 sesi berturut-turut
 * - Atau VL menurun selama 3 sesi berturut-turut
 *
 * @param history - Array Volume Load total per sesi, urut terbaru dulu
 * @param exerciseId - ID gerakan
 * @param exerciseName - Nama gerakan
 * @returns StagnationResult
 */
export function detectStagnation(
  history: number[],
  exerciseId: string,
  exerciseName: string
): StagnationResult {
  const base: StagnationResult = {
    isStagnant: false,
    exerciseId,
    exerciseName,
    sessionsCompared: history.length,
    volumeLoadHistory: history,
    percentageChange: 0,
    recommendation: "",
    severity: "none",
  };

  // Butuh minimal 3 sesi untuk deteksi
  if (history.length < 3) {
    base.recommendation =
      "Data belum cukup. Lanjutkan latihan minimal 3 sesi pada gerakan ini.";
    return base;
  }

  // Ambil 3 sesi terakhir (urut terbaru dulu)
  const [latest, prev1, prev2] = history;

  // Hitung perubahan dari sesi terlama ke terbaru
  const overallChange = ((latest - prev2) / prev2) * 100;
  base.percentageChange = Math.round(overallChange * 10) / 10;

  // Cek perubahan antar sesi
  const change1 = ((prev1 - prev2) / prev2) * 100; // sesi -2 vs sesi -3
  const change2 = ((latest - prev1) / prev1) * 100; // sesi -1 vs sesi -2

  const threshold = 2; // Minimal 2% untuk dianggap progresif

  // REGRESI: Overall volume turun lebih dari threshold
  if (overallChange < -threshold) {
    base.isStagnant = true;
    base.severity = "alert";
    base.recommendation = generateRecommendation("regression", exerciseName, overallChange);
    return base;
  }

  // STAGNASI: Volume Load tidak naik signifikan (flat atau naik turun kecil)
  if (Math.abs(overallChange) <= threshold) {
    base.isStagnant = true;
    base.severity = "warning";
    base.recommendation = generateRecommendation("plateau", exerciseName, overallChange);
    return base;
  }

  // PROGRESIF: Ada peningkatan > threshold
  base.recommendation = `Performa ${exerciseName} masih progresif. Pertahankan intensitas latihan!`;
  return base;
}

/**
 * Generate rekomendasi berdasarkan tipe stagnasi.
 */
function generateRecommendation(
  type: "plateau" | "regression",
  exerciseName: string,
  percentChange: number
): string {
  if (type === "regression") {
    return (
      `[PERINGATAN] Volume Load ${exerciseName} menurun ${Math.abs(percentChange).toFixed(1)}% ` +
      `selama 3 sesi terakhir. Sangat direkomendasikan untuk memulai fase DELOAD ` +
      `selama 1 minggu — turunkan beban sebesar 40-50% dari beban terakhir. ` +
      `Fokus pada teknik gerakan dan pemulihan saraf motorik. ` +
      `Evaluasi kualitas tidur dan asupan protein harian Anda.`
    );
  }

  return (
    `Volume Load ${exerciseName} tidak menunjukkan peningkatan signifikan ` +
    `selama 3 sesi terakhir (perubahan hanya ${Math.abs(percentChange).toFixed(1)}%). ` +
    `Pertimbangkan salah satu strategi berikut:\n` +
    `- Tingkatkan beban sebesar 2.5-5 kg pada sesi berikutnya\n` +
    `- Tambah 1-2 repetisi per set dengan beban yang sama\n` +
    `- Lakukan fase DELOAD selama 1 minggu jika tubuh terasa lelah\n` +
    `- Ganti variasi gerakan (misalnya: Incline atau Dumbbell)`
  );
}

/**
 * Menghitung ringkasan statistik untuk dashboard.
 */
export interface DashboardStats {
  totalSessions: number;
  totalVolumeLoad: number;
  bestEstimated1rm: number;
  best1rmExercise: string;
  avgRpe: number;
  streakDays: number;
}

export function calculateDashboardStats(
  sessions: { tanggal: Date; logs: { volumeLoad: number; estimasi1rm: number; skorRpe: number; exerciseName: string }[] }[]
): DashboardStats {
  let totalVl = 0;
  let best1rm = 0;
  let best1rmEx = "";
  let totalRpe = 0;
  let rpeCount = 0;

  for (const session of sessions) {
    for (const log of session.logs) {
      totalVl += log.volumeLoad;
      if (log.estimasi1rm > best1rm) {
        best1rm = log.estimasi1rm;
        best1rmEx = log.exerciseName;
      }
      if (log.skorRpe > 0) {
        totalRpe += log.skorRpe;
        rpeCount++;
      }
    }
  }

  // Hitung streak (hari berturut-turut latihan)
  let streak = 0;
  if (sessions.length > 0) {
    const sorted = sessions
      .map((s) => s.tanggal)
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    for (const sessionDate of sorted) {
      const sDate = new Date(sessionDate);
      sDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (checkDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 1) {
        streak++;
        checkDate = sDate;
      } else {
        break;
      }
    }
  }

  return {
    totalSessions: sessions.length,
    totalVolumeLoad: Math.round(totalVl),
    bestEstimated1rm: best1rm,
    best1rmExercise: best1rmEx || "-",
    avgRpe: rpeCount > 0 ? Math.round((totalRpe / rpeCount) * 10) / 10 : 0,
    streakDays: streak,
  };
}
