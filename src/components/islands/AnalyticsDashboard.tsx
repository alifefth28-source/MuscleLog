import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

const IconTrendUp = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const IconTrendDown = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>);
const IconTarget = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const IconAlertTri = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const IconBarChart = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
const IconInfo = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>);
const IconChevDown = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);
const IconChevUp = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(15,20,30,0.95)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ color: "#8892A6", marginBottom: 2 }}>{label}</p>
      {payload.map((p: any, i: number) => (<p key={i} style={{ color: p.color || "#3B82F6", fontWeight: 700 }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>))}
    </div>
  );
};

export default function AnalyticsDashboard({ userId }: { userId: string }) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [vlData, setVlData] = useState<any[]>([]);
  const [stagnation, setStagnation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"volume" | "strength">("volume");
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => { fetch("/api/exercises").then(r=>r.json()).then(d=>{if(d.exercises?.length){setExercises(d.exercises);setSelectedExercise(d.exercises[0].id)}}).catch(()=>{}); }, []);

  useEffect(() => {
    if (!selectedExercise) return; setLoading(true);
    fetch(`/api/stagnation?exerciseId=${selectedExercise}`).then(r=>r.json()).then(d=>{
      if (d.history && d.result) {
        setStagnation(d.result);
        const data = [...d.history].reverse().map((h: any, i: number) => {
          let dateLabel = `Sesi ${i+1}`;
          try { const ts = h.tanggal; if (ts?._seconds) dateLabel = new Date(ts._seconds * 1000).toLocaleDateString("id-ID",{day:"numeric",month:"short"}); else if (ts?.seconds) dateLabel = new Date(ts.seconds * 1000).toLocaleDateString("id-ID",{day:"numeric",month:"short"}); } catch {}
          return { name: dateLabel, vl: Math.round(h.totalVolumeLoad), isStagnant: d.result.isStagnant && i >= d.history.length - 3 };
        });
        setVlData(data);
      } else { setVlData([]); setStagnation(null); }
    }).catch(()=>{setVlData([]);setStagnation(null)}).finally(()=>setLoading(false));
  }, [selectedExercise]);

  const exerciseName = exercises.find(e => e.id === selectedExercise)?.nama || "—";
  const latestVL = vlData.length > 0 ? vlData[vlData.length-1].vl : 0;
  const prevVL = vlData.length > 1 ? vlData[vlData.length-2].vl : 0;
  const vlChange = prevVL > 0 ? ((latestVL-prevVL)/prevVL*100) : 0;
  const maxVL = vlData.length > 0 ? Math.max(...vlData.map(d=>d.vl)) : 0;

  return (
    <div className="mt-2 space-y-4">

      {/* === BEGINNER GUIDE PANEL === */}
      {showGuide && (
        <div className="rounded-2xl p-4" style={{background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)"}}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#3B82F6]"><IconInfo /></span>
              <h3 className="text-sm font-bold text-[#60A5FA]">Panduan Membaca Grafik</h3>
            </div>
            <button onClick={()=>setShowGuide(false)} className="text-[#8892A6] text-xs">Tutup</button>
          </div>
          <div className="space-y-3 text-[11px] text-[#60A5FA]/80 leading-relaxed">
            <div className="rounded-xl p-3" style={{background:"rgba(59,130,246,0.06)"}}>
              <p className="font-bold text-[#60A5FA] mb-1">Volume Load — Apa yang harus diperhatikan?</p>
              <p>Grafik bar menunjukkan total beban kerja otot per sesi. <strong>Yang ideal: grafik naik dari kiri ke kanan</strong> — artinya otot kamu berkembang. Jika bar-nya datar atau turun selama 3 sesi, sistem akan menandai sebagai <span className="text-[#F59E0B]">Plateau (stagnasi)</span>.</p>
            </div>
            <div className="rounded-xl p-3" style={{background:"rgba(59,130,246,0.06)"}}>
              <p className="font-bold text-[#60A5FA] mb-1">Estimasi 1RM — Seberapa kuat kamu?</p>
              <p><strong>1RM (One Rep Max)</strong> adalah prediksi beban maksimal yang bisa kamu angkat 1 kali. Dihitung otomatis dari data latihanmu. <strong>Grafik naik = kekuatanmu bertambah.</strong> Kamu tidak perlu test 1RM langsung (berisiko cedera).</p>
            </div>
            <div className="rounded-xl p-3" style={{background:"rgba(16,185,129,0.06)"}}>
              <p className="font-bold text-[#10B981] mb-1">Anjuran untuk Pembentukan Otot (Hipertrofi)</p>
              <p className="mb-1">Targetkan untuk setiap gerakan per sesi:</p>
              <p>- Total 3-5 set inti (working sets)</p>
              <p>- RPE 7-8 (berat tapi masih bisa 2-3 rep lagi)</p>
              <p>- Volume Load naik minimal 2-5% setiap minggu</p>
              <p className="mt-1">Jika VL tidak naik selama 3 sesi, lakukan <strong>Deload</strong> (turunkan beban 40% selama 1 minggu) lalu mulai lagi.</p>
            </div>
          </div>
        </div>
      )}

      {!showGuide && (
        <button onClick={()=>setShowGuide(true)} className="flex items-center gap-1.5 text-xs text-[#3B82F6] mb-2">
          <IconInfo /> Tampilkan panduan membaca grafik
        </button>
      )}

      {/* Exercise Selector */}
      <div className="relative">
        <select value={selectedExercise} onChange={e=>setSelectedExercise(e.target.value)} className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none appearance-none pr-10" style={{background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.08)"}}>
          {exercises.map(ex => (<option key={ex.id} value={ex.id} style={{background:"#0F1420"}}>{ex.nama}</option>))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8892A6]"><IconChevDown /></div>
      </div>

      {/* Quick Stats */}
      {vlData.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl p-3 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
            <p className="text-[9px] text-[#8892A6] uppercase tracking-wider mb-1">Volume Terkini</p>
            <p className="text-xl font-extrabold text-[#3B82F6]">{latestVL.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
            <p className="text-[9px] text-[#8892A6] uppercase tracking-wider mb-1">Perubahan</p>
            <div className="flex items-center justify-center gap-1">
              <span className={vlChange>=0?"text-[#10B981]":"text-[#EF4444]"}>{vlChange>=0?<IconTrendUp/>:<IconTrendDown/>}</span>
              <p className={`text-xl font-extrabold ${vlChange>=0?"text-[#10B981]":"text-[#EF4444]"}`}>{vlChange>=0?"+":""}{vlChange.toFixed(1)}%</p>
            </div>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
            <p className="text-[9px] text-[#8892A6] uppercase tracking-wider mb-1">Rekor VL</p>
            <p className="text-xl font-extrabold text-white">{maxVL.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Stagnation Banner */}
      {stagnation?.isStagnant && (
        <div className="rounded-2xl p-3 flex items-start gap-3" style={{background: stagnation.severity==="alert"?"rgba(239,68,68,0.06)":"rgba(245,158,11,0.06)", border:`0.5px solid ${stagnation.severity==="alert"?"rgba(239,68,68,0.2)":"rgba(245,158,11,0.2)"}`}}>
          <span className={`mt-0.5 ${stagnation.severity==="alert"?"text-[#EF4444]":"text-[#F59E0B]"}`}><IconAlertTri/></span>
          <div>
            <p className={`text-xs font-bold ${stagnation.severity==="alert"?"text-[#EF4444]":"text-[#F59E0B]"}`}>{stagnation.severity==="alert"?"Regresi Terdeteksi":"Plateau Terdeteksi"}</p>
            <p className="text-[11px] text-[#8892A6] mt-0.5">{exerciseName} — perubahan {Math.abs(stagnation.percentageChange).toFixed(1)}% dalam {stagnation.sessionsCompared} sesi</p>
          </div>
        </div>
      )}

      {/* Tab Switch */}
      <div className="flex rounded-xl p-1 gap-1" style={{background:"rgba(255,255,255,0.03)"}}>
        <button onClick={()=>setTab("volume")} className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${tab==="volume"?"bg-[#3B82F6] text-white":"text-[#8892A6]"}`} style={tab==="volume"?{boxShadow:"0 0 12px rgba(59,130,246,0.3)"}:{}}><IconBarChart/> Volume Load</button>
        <button onClick={()=>setTab("strength")} className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${tab==="strength"?"bg-[#3B82F6] text-white":"text-[#8892A6]"}`} style={tab==="strength"?{boxShadow:"0 0 12px rgba(59,130,246,0.3)"}:{}}><IconTarget/> Estimasi 1RM</button>
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.06)"}}>
        <h3 className="text-xs font-semibold text-[#E8ECF4] mb-1">{tab==="volume"?"Volume Load per Sesi":"Estimasi 1RM per Sesi"}</h3>
        <p className="text-[10px] text-[#8892A6] mb-4">{exerciseName}</p>

        {loading ? (
          <div className="h-48 flex flex-col items-center justify-center"><div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-2"></div><p className="text-xs text-[#8892A6]">Memuat data...</p></div>
        ) : vlData.length===0 ? (
          <div className="h-48 flex flex-col items-center justify-center"><span className="text-[#4A5568] mb-2"><IconBarChart/></span><p className="text-sm text-[#8892A6]">Belum ada data untuk gerakan ini</p><p className="text-[10px] text-[#4A5568] mt-1">Latih gerakan ini minimal 1 sesi</p></div>
        ) : tab==="volume" ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vlData} barSize={Math.min(40,280/vlData.length)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#8892A6"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#4A5568"}} axisLine={false} tickLine={false} width={45} tickFormatter={(v:number)=>v>=1000?`${(v/1000).toFixed(1)}k`:String(v)}/>
              <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(59,130,246,0.05)"}}/>
              <Bar dataKey="vl" name="Volume Load" radius={[8,8,0,0]}>
                {vlData.map((entry,i)=>(<Cell key={i} fill={entry.isStagnant?"#F59E0B":"#3B82F6"} fillOpacity={0.4+(i/vlData.length)*0.6}/>))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={vlData}>
              <defs><linearGradient id="grad1rm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#8892A6"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#4A5568"}} axisLine={false} tickLine={false} width={45}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="vl" name="Volume Load" stroke="#3B82F6" strokeWidth={2} fill="url(#grad1rm)" dot={{fill:"#3B82F6",strokeWidth:0,r:4}} activeDot={{r:6,fill:"#3B82F6"}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {vlData.length>0 && tab==="volume" && (
        <div className="flex items-center justify-center gap-6 text-[10px] text-[#8892A6]">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#3B82F6]"></div> Progresif</div>
          {stagnation?.isStagnant && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#F59E0B]"></div> Plateau</div>}
        </div>
      )}
    </div>
  );
}
