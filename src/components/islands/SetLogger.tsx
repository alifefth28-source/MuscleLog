import { useState, useEffect, useRef } from "react";

// === SVG Icons ===
const IconBack = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>);
const IconCheck = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const IconDumbbell = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M6 2L6 22"/><path d="M18 2L18 22"/><path d="M3 6h3"/><path d="M3 18h3"/><path d="M18 6h3"/><path d="M18 18h3"/><path d="M12 2v20"/></svg>);
const IconArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>);
const IconSearch = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const IconFlame = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>);
const IconTarget = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const IconTrash = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>);
const IconX = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const IconCalendar = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const IconBrain = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44A2.5 2.5 0 015 17.5a2.5 2.5 0 01-.52-4.94A2.5 2.5 0 017 10a2.5 2.5 0 012.5-2.5V2z"/><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44A2.5 2.5 0 0019 17.5a2.5 2.5 0 00.52-4.94A2.5 2.5 0 0017 10a2.5 2.5 0 00-2.5-2.5V2z"/></svg>);
const IconInfo = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>);
const IconChevDown = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);
const IconChevUp = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>);

// === Collapsible Info Panel Component ===
function InfoPanel({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const bgMap: Record<string, string> = { blue: "rgba(59,130,246,0.06)", amber: "rgba(245,158,11,0.06)", green: "rgba(16,185,129,0.06)" };
  const borderMap: Record<string, string> = { blue: "rgba(59,130,246,0.15)", amber: "rgba(245,158,11,0.15)", green: "rgba(16,185,129,0.15)" };
  const textMap: Record<string, string> = { blue: "#60A5FA", amber: "#F59E0B", green: "#10B981" };
  return (
    <div className="rounded-2xl mb-3 overflow-hidden" style={{ background: bgMap[color], border: `0.5px solid ${borderMap[color]}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
        <span style={{ color: textMap[color] }}>{icon}</span>
        <span className="text-xs font-semibold flex-1" style={{ color: textMap[color] }}>{title}</span>
        <span style={{ color: textMap[color] }}>{open ? <IconChevUp /> : <IconChevDown />}</span>
      </button>
      {open && <div className="px-3 pb-3 text-[11px] leading-relaxed" style={{ color: textMap[color], opacity: 0.85 }}>{children}</div>}
    </div>
  );
}

// === Types ===
interface Exercise { id: string; nama: string; targetOtot: string; kategori: string; }
type SetCategory = "warmup" | "working";
interface SetEntry { id: string; setKe: number; bebanKg: number; repetisi: number; skorRpe: number; skorRir: number; volumeLoad: number; estimasi1rm: number; category: SetCategory; saved: boolean; }
interface SelectedExercise extends Exercise { sets: SetEntry[]; isCompleted: boolean; }
interface Props { userId: string; userName: string; }

const RPE_LABELS: Record<number, string> = {
  1: "Sangat ringan", 2: "Ringan", 3: "Ringan", 4: "Sedang-ringan", 5: "Sedang",
  6: "Sedang-berat", 7: "Berat", 8: "Sangat berat", 9: "Hampir gagal", 10: "Gagal total"
};

export default function SetLogger({ userId, userName }: Props) {
  const [step, setStep] = useState<"name" | "selectExercises" | "logging">("name");
  const [sessionName, setSessionName] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionId, setSessionId] = useState("");
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [currentSet, setCurrentSet] = useState({ bebanKg: 0, repetisi: 0, skorRpe: 7, category: "working" as SetCategory });
  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [exercisesError, setExercisesError] = useState("");
  const [elapsed, setElapsed] = useState("00:00");

  // Timer starts ONLY when entering logging step
  const loggingStartRef = useRef<number>(0);

  useEffect(() => {
    if (step !== "logging") return;
    if (loggingStartRef.current === 0) loggingStartRef.current = Date.now();
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - loggingStartRef.current) / 1000);
      const hrs = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      setElapsed(hrs > 0 ? `${hrs}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}` : `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const fetchExercises = async () => {
    setExercisesLoading(true); setExercisesError("");
    try { const res = await fetch("/api/exercises"); const data = await res.json(); if (data.exercises?.length) setAllExercises(data.exercises); else setExercisesError("Tidak ada gerakan ditemukan."); } catch { setExercisesError("Gagal memuat daftar gerakan."); }
    setExercisesLoading(false);
  };
  useEffect(() => { fetchExercises(); }, []);

  const calcVL = (b: number, r: number) => Math.round(b * r * 100) / 100;
  const calc1RM = (b: number, r: number) => { if (r <= 0 || b <= 0) return 0; if (r === 1) return b; if (r >= 37) return b; return Math.round((b * (36 / (37 - r))) * 10) / 10; };
  const activeExercise = selectedExercises[activeExerciseIndex] || null;
  const totalSetsAllExercises = selectedExercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return; setLoading(true);
    try { const res = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ namaSesi: sessionName }) }); const data = await res.json(); if (data.session) { setSessionId(data.session.id); setStep("selectExercises"); } } catch (e) { console.error(e); }
    setLoading(false);
  };
  const toggleExercise = (ex: Exercise) => { setSelectedExercises(prev => { const exists = prev.find(s => s.id === ex.id); if (exists) return prev.filter(s => s.id !== ex.id); return [...prev, { ...ex, sets: [], isCompleted: false }]; }); };
  const isSelected = (exId: string) => selectedExercises.some(s => s.id === exId);
  const handleStartLogging = () => { if (selectedExercises.length === 0) return; setActiveExerciseIndex(0); setCurrentSet({ bebanKg: 0, repetisi: 0, skorRpe: 7, category: "working" }); loggingStartRef.current = Date.now(); setStep("logging"); };

  const handleSaveSet = async () => {
    if (!currentSet.bebanKg || !currentSet.repetisi || !activeExercise) return; setLoading(true);
    const vl = calcVL(currentSet.bebanKg, currentSet.repetisi); const est = calc1RM(currentSet.bebanKg, currentSet.repetisi); const rir = 10 - currentSet.skorRpe;
    const warmups = activeExercise.sets.filter(s => s.category === "warmup"); const works = activeExercise.sets.filter(s => s.category === "working");
    const setKe = currentSet.category === "warmup" ? warmups.length + 1 : works.length + 1;
    try {
      const res = await fetch("/api/logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, exerciseId: activeExercise.id, setKe: activeExercise.sets.length + 1, bebanKg: currentSet.bebanKg, repetisi: currentSet.repetisi, skorRpe: currentSet.skorRpe, skorRir: rir }) });
      const data = await res.json();
      const newSet: SetEntry = { id: data.log?.id || `local-${Date.now()}`, setKe, bebanKg: currentSet.bebanKg, repetisi: currentSet.repetisi, skorRpe: currentSet.skorRpe, skorRir: rir, volumeLoad: vl, estimasi1rm: est, category: currentSet.category, saved: true };
      setSelectedExercises(prev => prev.map((ex, i) => i === activeExerciseIndex ? { ...ex, sets: [...ex.sets, newSet] } : ex));
      setCurrentSet(p => ({ ...p, repetisi: 0 }));
    } catch (e) { console.error(e); } setLoading(false);
  };

  const handleDeleteSet = async (setIndex: number) => { const set = activeExercise?.sets[setIndex]; if (!set) return; try { if (set.id && !set.id.startsWith("local-")) await fetch(`/api/logs?logId=${set.id}`, { method: "DELETE" }); } catch {} setSelectedExercises(prev => prev.map((ex, i) => i === activeExerciseIndex ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) } : ex)); };
  const handleCompleteExercise = () => { setSelectedExercises(prev => prev.map((ex, i) => i === activeExerciseIndex ? { ...ex, isCompleted: true } : ex)); const nextIndex = selectedExercises.findIndex((ex, i) => i > activeExerciseIndex && !ex.isCompleted); if (nextIndex !== -1) { setActiveExerciseIndex(nextIndex); setCurrentSet({ bebanKg: 0, repetisi: 0, skorRpe: 7, category: "working" }); } };
  const handleFinishSession = async () => { const durasiMenit = Math.max(1, Math.round((Date.now() - loggingStartRef.current) / 60000)); try { await fetch("/api/sessions?action=close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, durasiMenit }) }); } catch {} window.location.href = `/session/${sessionId}`; };
  const handleCancelSession = async () => { if (totalSetsAllExercises === 0 && sessionId) { try { await fetch("/api/sessions?action=close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, durasiMenit: 0 }) }); } catch {} } window.location.href = "/"; };

  const filteredExercises = allExercises.filter(ex => ex.nama.toLowerCase().includes(exerciseSearch.toLowerCase()) || ex.targetOtot.toLowerCase().includes(exerciseSearch.toLowerCase()));

  const getAiCoachTip = (): string | null => {
    if (!activeExercise || activeExercise.sets.length < 2) return null;
    const workSets = activeExercise.sets.filter(s => s.category === "working"); if (workSets.length < 2) return null;
    const last = workSets[workSets.length - 1]; const prev = workSets[workSets.length - 2];
    if (last.skorRpe >= 9 && last.repetisi <= prev.repetisi) return "RPE tinggi dan repetisi menurun. Pertimbangkan turunkan beban 5-10% untuk set berikutnya agar volume tetap terjaga.";
    if (last.skorRpe <= 6 && last.bebanKg <= prev.bebanKg) return "RPE masih rendah. Coba tambah beban 2.5-5 kg untuk memaksimalkan stimulus hipertrofi.";
    if (workSets.length >= 4 && workSets.slice(-2).every(s => s.skorRpe >= 9)) return "Dua set terakhir sangat berat (RPE 9+). Pertimbangkan akhiri gerakan ini untuk menghindari junk volume.";
    return null;
  };

  // ======== STEP 1: Nama Sesi ========
  if (step === "name") {
    return (
      <div className="pt-8 pb-4">
        <a href="/" className="inline-flex items-center gap-1.5 text-xs text-[#8892A6] hover:text-[#bbb]"><IconBack /> Kembali</a>
        <h1 className="text-2xl font-extrabold mt-4 text-white">Sesi Baru</h1>
        <p className="text-sm text-[#8892A6] mt-1">Halo {userName}, beri nama dan tanggal sesi latihanmu.</p>
        <div className="mt-6"><label className="text-[10px] text-[#8892A6] uppercase tracking-wide block mb-1.5 flex items-center gap-1"><IconCalendar /> Tanggal Sesi</label><input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className="w-full" /></div>
        <div className="mt-4"><label className="text-[10px] text-[#8892A6] uppercase tracking-wide block mb-1.5">Nama Sesi</label><input type="text" placeholder="Contoh: Push Day A, Leg Day" value={sessionName} onChange={e => setSessionName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreateSession()} className="w-full" autoFocus /></div>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Push Day","Pull Day","Leg Day","Upper Body","Lower Body","Full Body","Chest & Triceps","Back & Biceps"].map(name => (
            <button key={name} onClick={() => setSessionName(name)} className={`px-3 py-1.5 text-xs rounded-lg border active:scale-95 transition-all ${sessionName === name ? "bg-[#3B82F6]/10 border-[#3B82F6]/40 text-[#60A5FA]" : "bg-white/[0.04] border-white/[0.08] text-[#8892A6]"}`}>{name}</button>
          ))}
        </div>
        <button onClick={handleCreateSession} disabled={!sessionName.trim() || loading} className="w-full mt-6 bg-[#3B82F6] text-white font-bold rounded-xl px-6 py-3.5 text-sm active:scale-[0.97] disabled:opacity-40 transition-all flex items-center justify-center gap-2" style={{boxShadow:"0 0 20px rgba(59,130,246,0.3)"}}>
          {loading ? "Membuat..." : <><span>Lanjut Pilih Gerakan</span> <IconArrowRight /></>}
        </button>
      </div>
    );
  }

  // ======== STEP 2: Pilih Gerakan ========
  if (step === "selectExercises") {
    const groupedByTarget = filteredExercises.reduce((acc, ex) => { if (!acc[ex.targetOtot]) acc[ex.targetOtot] = []; acc[ex.targetOtot].push(ex); return acc; }, {} as Record<string, Exercise[]>);
    return (
      <div className="pt-6 pb-24">
        <a href="/" className="inline-flex items-center gap-1.5 text-xs text-[#8892A6] hover:text-[#bbb] mb-2"><IconBack /> Kembali ke Home</a>
        <h2 className="text-lg font-extrabold text-white">{sessionName}</h2>
        <div className="flex items-center gap-2 mt-0.5"><span className="text-[#8892A6]"><IconCalendar /></span><p className="text-xs text-[#8892A6]">{new Date(sessionDate).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p></div>
        {selectedExercises.length > 0 && (
          <div className="flex items-center gap-2 mt-3 mb-4 rounded-xl px-3 py-2" style={{background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)"}}>
            <span className="text-[#3B82F6]"><IconDumbbell /></span>
            <span className="text-sm text-[#60A5FA] font-semibold">{selectedExercises.length} gerakan dipilih</span>
          </div>
        )}
        <div className="relative mb-4"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892A6]"><IconSearch /></div><input type="text" placeholder="Cari gerakan..." value={exerciseSearch} onChange={e => setExerciseSearch(e.target.value)} className="w-full pl-10" /></div>

        {exercisesLoading && (<div className="text-center py-16"><div className="inline-block w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-3"></div><p className="text-sm text-[#8892A6]">Memuat daftar gerakan...</p></div>)}
        {!exercisesLoading && exercisesError && (<div className="text-center py-12"><p className="text-sm text-red-400">{exercisesError}</p><button onClick={fetchExercises} className="mt-4 px-4 py-2 bg-[#3B82F6] text-white text-xs font-semibold rounded-lg">Coba Lagi</button></div>)}

        {!exercisesLoading && !exercisesError && Object.entries(groupedByTarget).map(([target, exList]) => (
          <div key={target} className="mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#8892A6] mb-2">{target}</h3>
            <div className="space-y-1.5">
              {exList.map(ex => {
                const selected = isSelected(ex.id);
                return (
                  <button key={ex.id} onClick={() => toggleExercise(ex)} className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 active:scale-[0.98] transition-all ${selected ? "border border-[#3B82F6]/30" : "border border-white/[0.06]"}`} style={{ background: selected ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.04)" }}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? "bg-[#3B82F6] border-[#3B82F6]" : "border-[#4A5568]"}`}>{selected && <IconCheck />}</div>
                    <div className="text-left flex-1"><p className={`text-sm font-semibold ${selected ? "text-[#60A5FA]" : "text-[#E8ECF4]"}`}>{ex.nama}</p><p className="text-[10px] text-[#8892A6]">{ex.kategori}</p></div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="fixed bottom-0 left-0 right-0 pb-4 pt-3 px-4" style={{background:"linear-gradient(to top, #060B14 60%, transparent)"}}>
          <div className="max-w-lg mx-auto"><button onClick={handleStartLogging} disabled={selectedExercises.length===0} className="w-full bg-[#3B82F6] text-white font-bold rounded-xl px-6 py-3.5 text-sm active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-2" style={{boxShadow:"0 0 20px rgba(59,130,246,0.3)"}}><IconDumbbell /> Mulai Latihan ({selectedExercises.length} gerakan)</button></div>
        </div>
      </div>
    );
  }

  // ======== STEP 3: Logging Sets ========
  if (!activeExercise) return null;
  const warmupSets = activeExercise.sets.filter(s => s.category === "warmup");
  const workingSets = activeExercise.sets.filter(s => s.category === "working");
  const totalVL = workingSets.reduce((s, set) => s + set.volumeLoad, 0);
  const best1RM = workingSets.length > 0 ? Math.max(...workingSets.map(s => s.estimasi1rm)) : 0;
  const completedCount = selectedExercises.filter(e => e.isCompleted).length;
  const coachTip = getAiCoachTip();
  const currentRir = 10 - currentSet.skorRpe;

  return (
    <div className="pt-4 pb-4">
      {/* Timer bar */}
      <div className="flex items-center justify-center gap-2 mb-3 py-2 rounded-xl" style={{background:"rgba(255,255,255,0.04)"}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span className="text-sm font-mono font-bold text-[#3B82F6]">{elapsed}</span>
        <span className="text-[10px] text-[#8892A6]">durasi latihan</span>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setShowCancelConfirm(true)} className="text-xs text-[#8892A6] px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{background:"rgba(255,255,255,0.06)"}}><IconBack /> Kembali</button>
        <div className="text-center flex-1"><h2 className="text-sm font-extrabold text-white">{sessionName}</h2><p className="text-[10px] text-[#8892A6]">{completedCount}/{selectedExercises.length} selesai</p></div>
        <button onClick={handleFinishSession} className="text-xs text-[#3B82F6] font-semibold px-3 py-1.5 border border-[#3B82F6]/30 rounded-lg inline-flex items-center gap-1"><IconCheck /> Selesai</button>
      </div>

      {/* Cancel modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="rounded-2xl p-5 max-w-sm w-full" style={{background:"rgba(20,25,35,0.95)",backdropFilter:"blur(20px)",border:"0.5px solid rgba(255,255,255,0.1)"}}>
            <h3 className="text-base font-bold text-white mb-2">Hentikan Sesi?</h3>
            <p className="text-sm text-[#8892A6] mb-1">{totalSetsAllExercises === 0 ? "Belum ada data yang diinput. Sesi ini akan dihapus." : `Kamu sudah input ${totalSetsAllExercises} set. Sesi akan disimpan.`}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 text-white font-semibold rounded-xl py-2.5 text-sm" style={{background:"rgba(255,255,255,0.08)"}}>Lanjut Latihan</button>
              <button onClick={totalSetsAllExercises > 0 ? handleFinishSession : handleCancelSession} className="flex-1 bg-[#EF4444] text-white font-semibold rounded-xl py-2.5 text-sm">{totalSetsAllExercises > 0 ? "Simpan & Keluar" : "Hapus Sesi"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{scrollbarWidth:"none"}}>
        {selectedExercises.map((ex, i) => (
          <button key={ex.id} onClick={() => { setActiveExerciseIndex(i); setCurrentSet({bebanKg:0,repetisi:0,skorRpe:7,category:"working"}); }} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${i === activeExerciseIndex ? "bg-[#3B82F6] text-white" : ex.isCompleted ? "text-[#10B981] border border-[#10B981]/30" : "text-[#8892A6] border border-white/[0.08]"}`} style={i !== activeExerciseIndex && !ex.isCompleted ? {background:"rgba(255,255,255,0.04)"} : i !== activeExerciseIndex && ex.isCompleted ? {background:"rgba(16,185,129,0.06)"} : {}}>
            {ex.isCompleted && <span className="mr-1 inline-flex align-middle"><IconCheck /></span>}{ex.nama}
          </button>
        ))}
      </div>

      {/* Exercise info card */}
      <div className="rounded-2xl p-4 mb-3" style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)"}}>
        <div className="flex items-center justify-between">
          <div><h3 className="text-base font-extrabold text-white">{activeExercise.nama}</h3><p className="text-xs text-[#8892A6] mt-0.5">{activeExercise.targetOtot} · {activeExercise.kategori}</p></div>
          <span className="text-[10px] text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-full font-semibold">Gerakan {activeExerciseIndex + 1}/{selectedExercises.length}</span>
        </div>
      </div>

      {/* === INFO PANELS FOR BEGINNERS === */}
      <InfoPanel title="Apa itu Volume Load?" icon={<IconInfo />} color="blue">
        <p className="mb-1.5"><strong>Volume Load = Beban (kg) x Repetisi</strong></p>
        <p className="mb-1.5">Volume Load mengukur total kerja otot dalam satu set. Semakin tinggi Volume Load dari sesi ke sesi, artinya ototmu sedang berkembang.</p>
        <p><strong>Contoh:</strong> Bench Press 60kg x 10 reps = 600 Volume Load. Jika minggu depan naik ke 65kg x 10 = 650, berarti ada progres.</p>
      </InfoPanel>

      <InfoPanel title="Apa itu RPE? (Tingkat Usaha)" icon={<IconInfo />} color="amber">
        <p className="mb-1.5"><strong>RPE (Rate of Perceived Exertion)</strong> adalah skala 1-10 yang menunjukkan seberapa berat usaha kamu di setiap set.</p>
        <p className="mb-1">RPE 6-7 = Masih bisa 3-4 rep lagi (cocok untuk pemanasan)</p>
        <p className="mb-1">RPE 8 = Bisa 2 rep lagi (ideal untuk set inti/hipertrofi)</p>
        <p className="mb-1">RPE 9 = Bisa 1 rep lagi (berat, hati-hati)</p>
        <p className="mb-1.5">RPE 10 = Tidak bisa lagi sama sekali</p>
        <p><strong>Anjuran untuk pemula:</strong> Targetkan RPE 7-8 di set inti. Jangan sering RPE 10 karena risiko cedera tinggi.</p>
      </InfoPanel>

      <InfoPanel title="Apa itu RIR? (Sisa Repetisi)" icon={<IconInfo />} color="green">
        <p className="mb-1.5"><strong>RIR (Reps in Reserve)</strong> = berapa repetisi lagi yang bisa kamu lakukan sebelum gagal total. Dihitung otomatis dari RPE.</p>
        <p className="mb-1">RPE 7 = RIR 3 (masih bisa 3 rep lagi)</p>
        <p className="mb-1">RPE 8 = RIR 2 (masih bisa 2 rep lagi)</p>
        <p className="mb-1.5">RPE 10 = RIR 0 (gagal total)</p>
        <p><strong>Tips:</strong> Untuk pembesaran otot (hipertrofi), latih di RIR 1-3. Jangan selalu RIR 0 karena butuh pemulihan lebih lama.</p>
      </InfoPanel>

      {/* AI Coach */}
      {coachTip && (
        <div className="rounded-2xl p-3 mb-3 flex items-start gap-2.5" style={{background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)"}}>
          <span className="text-[#60A5FA] mt-0.5"><IconBrain /></span>
          <div><p className="text-[10px] font-bold text-[#60A5FA] uppercase tracking-wider mb-1">AI Coach</p><p className="text-[11px] text-[#60A5FA]/80 leading-relaxed">{coachTip}</p></div>
        </div>
      )}

      {/* Warmup Sets */}
      {warmupSets.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2"><span className="text-[#F59E0B]"><IconFlame /></span><span className="text-[11px] font-semibold uppercase tracking-wider text-[#F59E0B]">Pemanasan — {warmupSets.length} set</span></div>
          <div className="grid grid-cols-6 text-[10px] text-[#8892A6] uppercase tracking-wide mb-1 px-2"><span>Set</span><span className="text-center">Beban</span><span className="text-center">Reps</span><span className="text-center">RPE</span><span className="text-center">VL</span><span></span></div>
          {warmupSets.map((s, i) => (
            <div key={s.id} className="grid grid-cols-6 items-center py-2 px-2 rounded-lg mb-1 text-sm" style={{background:"rgba(245,158,11,0.04)"}}>
              <span className="text-[#8892A6]">W{i+1}</span><span className="text-center font-semibold text-[#F59E0B]">{s.bebanKg}kg</span><span className="text-center text-[#E8ECF4]">{s.repetisi}</span><span className="text-center text-[#8892A6]">{s.skorRpe}</span><span className="text-center text-[#8892A6]">{Math.round(s.volumeLoad)}</span>
              <button onClick={() => handleDeleteSet(activeExercise.sets.indexOf(s))} className="text-[#8892A6] hover:text-red-400 ml-auto"><IconTrash /></button>
            </div>
          ))}
        </div>
      )}

      {/* Working Sets */}
      {workingSets.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2"><span className="text-[#3B82F6]"><IconTarget /></span><span className="text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6]">Set Inti — {workingSets.length} set</span></div>
          <div className="grid grid-cols-6 text-[10px] text-[#8892A6] uppercase tracking-wide mb-1 px-2"><span>Set</span><span className="text-center">Beban</span><span className="text-center">Reps</span><span className="text-center">RPE</span><span className="text-center">VL</span><span></span></div>
          {workingSets.map((s, i) => (
            <div key={s.id} className="grid grid-cols-6 items-center py-2 px-2 rounded-lg mb-1 text-sm" style={{background:"rgba(255,255,255,0.04)"}}>
              <span className="text-[#8892A6]">{i+1}</span><span className="text-center font-semibold text-white">{s.bebanKg}kg</span><span className="text-center text-[#E8ECF4]">{s.repetisi}</span><span className="text-center text-[#60A5FA]">{s.skorRpe}</span><span className="text-center text-[#3B82F6] font-semibold">{Math.round(s.volumeLoad)}</span>
              <button onClick={() => handleDeleteSet(activeExercise.sets.indexOf(s))} className="text-[#8892A6] hover:text-red-400 ml-auto"><IconTrash /></button>
            </div>
          ))}
        </div>
      )}

      {/* Input new set */}
      {!activeExercise.isCompleted && (
        <div className="rounded-2xl p-4 mb-4" style={{background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.12)"}}>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setCurrentSet(p => ({...p,category:"warmup"}))} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${currentSet.category==="warmup"?"text-[#F59E0B] border border-[#F59E0B]/30":"text-[#8892A6] border border-transparent"}`} style={{background:currentSet.category==="warmup"?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)"}}><IconFlame /> Pemanasan</button>
            <button onClick={() => setCurrentSet(p => ({...p,category:"working"}))} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${currentSet.category==="working"?"text-[#3B82F6] border border-[#3B82F6]/30":"text-[#8892A6] border border-transparent"}`} style={{background:currentSet.category==="working"?"rgba(59,130,246,0.08)":"rgba(255,255,255,0.04)"}}><IconTarget /> Set Inti</button>
          </div>
          <p className="text-[10px] text-[#3B82F6] font-semibold uppercase tracking-wide mb-3">{currentSet.category==="warmup"?`Pemanasan ${warmupSets.length+1}`:`Set Inti ${workingSets.length+1}`}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="text-[10px] text-[#8892A6] block mb-1">Beban (kg)</label><input type="number" inputMode="decimal" step="0.5" value={currentSet.bebanKg||""} onChange={e=>setCurrentSet(p=>({...p,bebanKg:parseFloat(e.target.value)||0}))} className="w-full text-center text-lg font-bold" placeholder="0" /></div>
            <div><label className="text-[10px] text-[#8892A6] block mb-1">Repetisi</label><input type="number" inputMode="numeric" value={currentSet.repetisi||""} onChange={e=>setCurrentSet(p=>({...p,repetisi:parseInt(e.target.value)||0}))} className="w-full text-center text-lg font-bold" placeholder="0" /></div>
          </div>

          {/* RPE */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-[#8892A6] uppercase tracking-wide">RPE (Tingkat Usaha)</span><span className="text-base text-[#60A5FA] font-extrabold">{currentSet.skorRpe}</span></div>
            <div className="grid grid-cols-10 gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10].map(val => (
                <button key={val} type="button" onClick={() => setCurrentSet(p=>({...p,skorRpe:val}))} className={`h-10 rounded-lg text-xs font-bold transition-all active:scale-90 ${val<=currentSet.skorRpe ? val>=9?"bg-[#EF4444] text-white":val>=7?"bg-[#3B82F6] text-white":"bg-[#3B82F6]/50 text-white" : "text-[#4A5568]"}`} style={val>currentSet.skorRpe?{background:"rgba(255,255,255,0.06)"}:{}}>{val}</button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#8892A6] italic">{RPE_LABELS[currentSet.skorRpe]||""}</span>
              <div className="flex items-center gap-1.5"><span className="text-[10px] text-[#8892A6]">RIR:</span><span className={`text-sm font-extrabold ${currentRir<=1?"text-[#EF4444]":currentRir<=3?"text-[#F59E0B]":"text-[#10B981]"}`}>{currentRir}</span><span className="text-[10px] text-[#8892A6]">sisa rep</span></div>
            </div>
          </div>

          {/* Live calc */}
          {currentSet.bebanKg>0 && currentSet.repetisi>0 && (
            <div className="flex gap-2 mb-4 text-[11px]">
              <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}><span className="text-[#8892A6]">VL: </span><span className="text-[#60A5FA] font-bold text-sm">{calcVL(currentSet.bebanKg,currentSet.repetisi)}</span></div>
              <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}><span className="text-[#8892A6]">Est. 1RM: </span><span className="text-[#60A5FA] font-bold text-sm">{calc1RM(currentSet.bebanKg,currentSet.repetisi)} kg</span></div>
            </div>
          )}

          <button onClick={handleSaveSet} disabled={!currentSet.bebanKg||!currentSet.repetisi||loading} className="w-full bg-[#3B82F6] text-white font-bold rounded-xl py-3.5 text-sm active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-2" style={{boxShadow:"0 0 20px rgba(59,130,246,0.3)"}}>{loading?"Menyimpan...":<><IconCheck /> Simpan Set</>}</button>
        </div>
      )}

      {/* Summary */}
      {activeExercise.sets.length > 0 && (
        <div className="flex gap-3 text-center mb-4">
          <div className="flex-1 rounded-xl px-2 py-3" style={{background:"rgba(255,255,255,0.04)"}}><p className="text-[9px] text-[#8892A6] uppercase">Total VL</p><p className="text-lg font-extrabold text-[#3B82F6]">{Math.round(totalVL).toLocaleString()}</p></div>
          <div className="flex-1 rounded-xl px-2 py-3" style={{background:"rgba(255,255,255,0.04)"}}><p className="text-[9px] text-[#8892A6] uppercase">Best 1RM</p><p className="text-lg font-extrabold text-white">{best1RM>0?`${Math.round(best1RM)} kg`:"—"}</p></div>
          <div className="flex-1 rounded-xl px-2 py-3" style={{background:"rgba(255,255,255,0.04)"}}><p className="text-[9px] text-[#8892A6] uppercase">Working</p><p className="text-lg font-extrabold text-white">{workingSets.length} set</p></div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!activeExercise.isCompleted && activeExercise.sets.length > 0 && (
          <button onClick={handleCompleteExercise} className="flex-1 border border-[#10B981]/30 text-[#10B981] font-semibold rounded-xl py-3 text-sm active:scale-[0.97] flex items-center justify-center gap-2" style={{background:"rgba(16,185,129,0.06)"}}><IconCheck /> Selesai Gerakan</button>
        )}
        <button onClick={() => setShowCancelConfirm(true)} className="flex-1 border border-white/[0.08] text-white font-semibold rounded-xl py-3 text-sm active:scale-[0.97] flex items-center justify-center gap-2" style={{background:"rgba(255,255,255,0.04)"}}><IconX /> Hentikan Sesi</button>
      </div>
    </div>
  );
}
