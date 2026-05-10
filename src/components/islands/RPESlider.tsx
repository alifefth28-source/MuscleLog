import { useState } from "react";

interface Props {
  value?: number;
  onChange?: (rpe: number, rir: number) => void;
}

export default function RPESlider({ value = 7, onChange }: Props) {
  const [rpe, setRpe] = useState(value);
  const rir = 10 - rpe;

  const handleChange = (newRpe: number) => {
    setRpe(newRpe);
    onChange?.(newRpe, 10 - newRpe);
  };

  const getIntensityLabel = (rpe: number): string => {
    if (rpe <= 3) return "Sangat ringan";
    if (rpe <= 5) return "Ringan";
    if (rpe <= 7) return "Moderat";
    if (rpe <= 8) return "Berat";
    if (rpe <= 9) return "Sangat berat";
    return "Gagal total (failure)";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-[#555] uppercase tracking-wide">RPE</span>
        <span className="text-sm text-[#60A5FA] font-bold">{rpe}</span>
      </div>

      {/* Visual dots */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
          <button
            key={val}
            onClick={() => handleChange(val)}
            className={`flex-1 h-3.5 rounded-sm transition-all ${
              val <= rpe ? "bg-[#3B82F6]" : "bg-[#1E1E1E]"
            }`}
          />
        ))}
      </div>

      {/* RIR & label */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#555]">RIR</span>
          <span className="text-sm text-[#60A5FA] font-bold">{rir}</span>
          <span className="text-[10px] text-[#444]">sisa repetisi</span>
        </div>
        <span className="text-[10px] text-[#666] italic">{getIntensityLabel(rpe)}</span>
      </div>
    </div>
  );
}
