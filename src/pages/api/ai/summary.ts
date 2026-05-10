import type { APIRoute } from "astro";
import { getSessionById, getSessionLogs, getExerciseById, getExerciseHistory } from "@/lib/db";

/**
 * POST /api/ai/summary
 * Body: { sessionId: string }
 * 
 * Generates AI-powered workout summary using Claude API.
 * Analyzes: total volume, RPE patterns, 1RM changes, stagnation risk.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { getSession } = await import("@/lib/auth");
    const user = getSession(request);
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId required" }), { status: 400 });
    }

    // Fetch session data
    const session = await getSessionById(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
    }

    const logs = await getSessionLogs(sessionId);
    if (logs.length === 0) {
      return new Response(JSON.stringify({ summary: "Tidak ada data latihan di sesi ini." }), { status: 200 });
    }

    // Group logs by exercise and build context
    const exerciseData: {
      name: string;
      targetOtot: string;
      sets: { bebanKg: number; repetisi: number; skorRpe: number; volumeLoad: number; estimasi1rm: number }[];
      totalVL: number;
      best1RM: number;
      avgRpe: number;
    }[] = [];

    const exerciseIds = [...new Set(logs.map(l => l.exerciseId))];

    for (const exId of exerciseIds) {
      const exercise = await getExerciseById(exId);
      const exLogs = logs.filter(l => l.exerciseId === exId);
      const totalVL = exLogs.reduce((s, l) => s + l.volumeLoad, 0);
      const best1RM = Math.max(...exLogs.map(l => l.estimasi1rm));
      const avgRpe = exLogs.reduce((s, l) => s + l.skorRpe, 0) / exLogs.length;

      exerciseData.push({
        name: exercise?.nama || "Unknown",
        targetOtot: exercise?.targetOtot || "",
        sets: exLogs.map(l => ({
          bebanKg: l.bebanKg,
          repetisi: l.repetisi,
          skorRpe: l.skorRpe,
          volumeLoad: l.volumeLoad,
          estimasi1rm: l.estimasi1rm,
        })),
        totalVL: Math.round(totalVL),
        best1RM: Math.round(best1RM),
        avgRpe: Math.round(avgRpe * 10) / 10,
      });
    }

    // Check stagnation history for each exercise
    const stagnationInfo: string[] = [];
    for (const exId of exerciseIds) {
      try {
        const history = await getExerciseHistory(user.userId, exId, 4);
        if (history.length >= 3) {
          const vlHistory = history.map(h => h.totalVolumeLoad);
          const [latest, prev1, prev2] = vlHistory;
          const change = ((latest - prev2) / prev2) * 100;
          if (Math.abs(change) <= 2) {
            const ex = await getExerciseById(exId);
            stagnationInfo.push(`${ex?.nama}: Volume Load stagnan (perubahan ${change.toFixed(1)}% dalam 3 sesi)`);
          } else if (change < -2) {
            const ex = await getExerciseById(exId);
            stagnationInfo.push(`${ex?.nama}: Volume Load MENURUN ${Math.abs(change).toFixed(1)}% dalam 3 sesi`);
          }
        }
      } catch {}
    }

    const totalSessionVL = exerciseData.reduce((s, e) => s + e.totalVL, 0);
    const totalSets = logs.length;
    const overallAvgRpe = logs.reduce((s, l) => s + l.skorRpe, 0) / logs.length;

    // Build prompt for Claude
    const prompt = `Kamu adalah AI fitness coach bernama MuscleLog AI. Analisis data sesi latihan beban berikut dan berikan ringkasan serta saran yang personal, informatif, dan mudah dipahami oleh pemula gym.

DATA SESI LATIHAN:
- Nama sesi: ${session.namaSesi}
- Durasi: ${session.durasiMenit} menit
- Total set: ${totalSets}
- Total Volume Load sesi: ${totalSessionVL.toLocaleString()}
- RPE rata-rata: ${(Math.round(overallAvgRpe * 10) / 10)}

DETAIL PER GERAKAN:
${exerciseData.map(e => `${e.name} (${e.targetOtot}):
  - ${e.sets.length} set, Total VL: ${e.totalVL}, Best 1RM: ${e.best1RM} kg, RPE avg: ${e.avgRpe}
  - Detail set: ${e.sets.map((s, i) => `Set ${i + 1}: ${s.bebanKg}kg x ${s.repetisi} reps (RPE ${s.skorRpe})`).join(", ")}`).join("\n")}

${stagnationInfo.length > 0 ? `\nPERINGATAN STAGNASI:\n${stagnationInfo.join("\n")}` : ""}

INSTRUKSI:
Berikan analisis dalam format berikut (gunakan bahasa Indonesia yang mudah dipahami pemula):

1. RINGKASAN SESI (2-3 kalimat: apa yang dilakukan, total beban kerja, durasi)
2. HAL POSITIF (1-2 poin yang bagus dari sesi ini)
3. AREA PERBAIKAN (1-2 saran spesifik berdasarkan data, misal RPE terlalu tinggi/rendah, volume kurang)
4. REKOMENDASI SESI BERIKUTNYA (1-2 saran konkret: tambah beban berapa kg, atau perlu deload, dll)

Jangan terlalu panjang. Maksimal 200 kata. Gunakan angka dari data, bukan generalisasi.`;

    // Call Gemini API
    const geminiApiKey = import.meta.env.GEMINI_API_KEY || "";
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
        }
      }),
    });

    if (!aiResponse.ok) {
      // Fallback: generate basic summary without AI
      const fallback = generateFallbackSummary(session, exerciseData, totalSessionVL, totalSets, overallAvgRpe, stagnationInfo);
      return new Response(JSON.stringify({ summary: fallback, isAI: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    // Struktur response objek dari Gemini berbeda dengan Claude
    const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ summary: aiText, isAI: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("AI Summary error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

/**
 * Fallback summary when AI API is unavailable
 */
function generateFallbackSummary(
  session: any,
  exercises: any[],
  totalVL: number,
  totalSets: number,
  avgRpe: number,
  stagnation: string[]
): string {
  const rpeRounded = Math.round(avgRpe * 10) / 10;
  const rir = Math.round((10 - avgRpe) * 10) / 10;
  
  let summary = `RINGKASAN SESI\n`;
  summary += `Sesi "${session.namaSesi}" selesai dalam ${session.durasiMenit} menit dengan ${totalSets} set pada ${exercises.length} gerakan. Total Volume Load sesi ini adalah ${totalVL.toLocaleString()}.\n\n`;

  summary += `PERFORMA\n`;
  exercises.forEach(e => {
    summary += `- ${e.name}: ${e.sets.length} set, VL ${e.totalVL.toLocaleString()}, Est. 1RM ${e.best1RM} kg\n`;
  });

  summary += `\nINTENSITAS\n`;
  summary += `RPE rata-rata: ${rpeRounded} (RIR: ${rir}). `;
  if (rpeRounded >= 9) {
    summary += `Intensitas sangat tinggi. Pastikan pemulihan cukup sebelum sesi berikutnya.\n`;
  } else if (rpeRounded >= 7) {
    summary += `Intensitas di zona optimal untuk hipertrofi.\n`;
  } else {
    summary += `Intensitas masih bisa ditingkatkan. Coba tambah beban 2.5-5 kg di sesi berikutnya.\n`;
  }

  if (stagnation.length > 0) {
    summary += `\nPERHATIAN\n`;
    stagnation.forEach(s => { summary += `- ${s}\n`; });
    summary += `Pertimbangkan variasi gerakan atau fase deload 1 minggu.\n`;
  }

  return summary;
}
