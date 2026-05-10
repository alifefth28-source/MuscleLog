import { useState, useEffect } from "react";

const IconBrain = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44A2.5 2.5 0 015 17.5a2.5 2.5 0 01-.52-4.94A2.5 2.5 0 017 10a2.5 2.5 0 012.5-2.5V2z"/><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44A2.5 2.5 0 0019 17.5a2.5 2.5 0 00.52-4.94A2.5 2.5 0 0017 10a2.5 2.5 0 00-2.5-2.5V2z"/></svg>);
const IconSparkle = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707M17.657 17.657l.707.707"/><circle cx="12" cy="12" r="4"/></svg>);

export default function AISummary({ sessionId }: { sessionId: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAI, setIsAI] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateSummary = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setSummary(data.summary || ""); setIsAI(data.isAI || false); setGenerated(true); }
    } catch (err) { setError("Gagal menghasilkan analisis. Coba lagi."); }
    setLoading(false);
  };

  if (!generated) {
    return (
      <div className="rounded-2xl p-4 mt-4" style={{ background: "rgba(59,130,246,0.04)", border: "0.5px solid rgba(59,130,246,0.12)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#3B82F6]"><IconBrain /></span>
          <h3 className="text-sm font-bold text-[#60A5FA]">MuscleLog AI</h3>
        </div>
        <p className="text-xs text-[#8892A6] mb-3">Dapatkan analisis personal dari AI berdasarkan data sesi latihanmu — termasuk ringkasan performa, area perbaikan, dan rekomendasi untuk sesi berikutnya.</p>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="w-full bg-[#3B82F6] text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 transition-all"
          style={{ boxShadow: "0 0 20px rgba(59,130,246,0.25)" }}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menganalisis data...</>
          ) : (
            <><IconSparkle /> Analisis dengan AI</>
          )}
        </button>
        {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 mt-4" style={{ background: "rgba(59,130,246,0.04)", border: "0.5px solid rgba(59,130,246,0.12)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#3B82F6]"><IconBrain /></span>
          <h3 className="text-sm font-bold text-[#60A5FA]">MuscleLog AI</h3>
          {isAI && <span className="text-[9px] px-2 py-0.5 rounded-full text-[#3B82F6] font-semibold" style={{ background: "rgba(59,130,246,0.12)" }}>AI-Generated</span>}
        </div>
        <button onClick={generateSummary} disabled={loading} className="text-[10px] text-[#8892A6] hover:text-[#60A5FA]">
          {loading ? "..." : "Regenerate"}
        </button>
      </div>
      <div className="text-[12px] text-[#B0BAD0] leading-relaxed whitespace-pre-line">
        {summary}
      </div>
    </div>
  );
}
