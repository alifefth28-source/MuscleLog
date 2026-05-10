import { useState, useEffect } from "react";

const IconAlertTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const IconAlertCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
const IconChevron = ({ up }: { up: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
);

interface StagnationData {
  isStagnant: boolean;
  exerciseName: string;
  exerciseId: string;
  severity: "warning" | "alert";
  percentageChange: number;
  recommendation: string;
  volumeLoadHistory: number[];
}

export default function StagnationAlert({ userId }: { userId: string }) {
  const [stagnations, setStagnations] = useState<StagnationData[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/stagnation?all=true")
      .then(r => r.json())
      .then(d => { if (d.stagnations?.length) setStagnations(d.stagnations); })
      .catch(err => console.error("Stagnation error:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const visible = stagnations.filter(s => !dismissed.has(s.exerciseId));
  if (loading || visible.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      {visible.map(stag => {
        const isAlert = stag.severity === "alert";
        const isOpen = expanded === stag.exerciseId;
        return (
          <div key={stag.exerciseId} className={`rounded-2xl p-3.5 border ${isAlert ? "bg-red-900/10 border-red-800/30" : "bg-[#FFBA00]/5 border-[#FFBA00]/20"}`}>
            <div className="flex items-start gap-2 cursor-pointer" onClick={() => setExpanded(isOpen ? null : stag.exerciseId)}>
              <span className={`mt-0.5 ${isAlert ? "text-red-400" : "text-[#FFBA00]"}`}>{isAlert ? <IconAlertCircle /> : <IconAlertTriangle />}</span>
              <div className="flex-1">
                <p className={`text-xs font-bold ${isAlert ? "text-red-400" : "text-[#FFBA00]"}`}>{isAlert ? "Regresi Terdeteksi" : "Plateau Terdeteksi"}</p>
                <p className="text-[11px] text-[#888] mt-0.5">{stag.exerciseName} — {Math.abs(stag.percentageChange)}% {stag.percentageChange < 0 ? "menurun" : "stagnan"} dalam 3 sesi</p>
              </div>
              <span className="text-[#555]"><IconChevron up={isOpen} /></span>
            </div>
            {isOpen && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex gap-2 mb-3">
                  {stag.volumeLoadHistory.slice(0, 3).map((vl, i) => (
                    <div key={i} className={`flex-1 rounded-lg py-2 text-center ${i === 0 ? "bg-[#FFBA00]/10 border border-[#FFBA00]/30" : "bg-[#1A1A1A]"}`}>
                      <p className="text-[9px] text-[#555]">{i === 0 ? "Terbaru" : `Sesi -${i + 1}`}</p>
                      <p className={`text-sm font-bold ${i === 0 ? "text-[#FFBA00]" : "text-white"}`}>{Math.round(vl).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-3 text-[11px] text-[#60A5FA] leading-relaxed whitespace-pre-line">{stag.recommendation}</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={e => { e.stopPropagation(); setDismissed(prev => new Set([...prev, stag.exerciseId])); }} className="flex-1 bg-[#1E1E1E] rounded-lg py-2 text-xs text-[#666]">Abaikan</button>
                  <a href="/analytics" className="flex-[2] bg-[#3B82F6] rounded-lg py-2 text-xs text-white font-bold text-center active:scale-[0.97]">Lihat Analitik</a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
