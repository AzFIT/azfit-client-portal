import { Dumbbell, Layers, Clock } from 'lucide-react';
import type { Exercise } from '@/types';

interface Props {
  name: string;
  exercises: Exercise[];
  elapsedSeconds: number;
  unit?: string;
}

export default function WorkoutSummary({ name, exercises, elapsedSeconds, unit = 'kg' }: Props) {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.done !== 'empty').length,
    0
  );
  const totalVol = exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((sSum, s) => sSum + (parseFloat(s.load) || 0) * (parseFloat(s.reps) || 0), 0);
  }, 0);
  const targetVol = exercises.reduce((sum, ex) => {
    const pLoad = parseFloat(ex.target) || 0;
    const pReps = parseInt(ex.scheme.split('×')[1]) || 0;
    return sum + pLoad * pReps * ex.sets.length;
  }, 0);

  const pct = targetVol > 0 ? Math.round((totalVol / targetVol) * 100) : 0;

  const em = Math.floor(elapsedSeconds / 60);
  const es = elapsedSeconds % 60;
  const timeStr = `${em}:${es.toString().padStart(2, '0')}`;

  return (
    <div
      className="rounded-xl border border-[#00AEEF]/15 px-5 py-4 mb-4 pb-card-gradient"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(0,174,239,0.08), 0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {/* Workout name */}
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-[#00AEEF]" />
          <span className="text-[#F0F0F0] font-semibold text-[15px]">{name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1.5 text-[13px] text-[#A0A0A0]">
          <Layers size={14} className="text-[#6B6B6B]" />
          <span>{exercises.length} exercises</span>
          <span className="text-[#4B5563]">|</span>
          <span>{completedSets}/{totalSets} sets</span>
        </div>

        <div className="flex items-center gap-1.5 text-[13px] text-[#A0A0A0]">
          <span className="text-[#6B6B6B]">💪</span>
          <span>{totalVol.toLocaleString()} {unit}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[13px] text-[#A0A0A0]">
          <Clock size={14} className="text-[#6B6B6B]" />
          <span className="tabular-nums">{timeStr}</span>
        </div>

        {/* Progress bar (right side) */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px] ml-auto">
          <div className="flex-1 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00AEEF] to-[#A855F7] transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-[12px] font-semibold text-[#00AEEF] tabular-nowrap">{pct}%</span>
          <span className="text-[11px] text-[#6B6B6B] tabular-nowrap">({totalVol.toLocaleString()} / {targetVol.toLocaleString()} {unit})</span>
        </div>
      </div>
    </div>
  );
}
