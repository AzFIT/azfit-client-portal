import { Dumbbell, Layers, Clock } from 'lucide-react';
import type { Exercise } from '@/types';

interface Props {
  name: string;
  exercises: Exercise[];
  elapsedSeconds: number;
}

export default function WorkoutSummary({ name, exercises, elapsedSeconds }: Props) {
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
      className="rounded-xl border border-[var(--cyan)]/15 px-5 py-4 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(0,174,239,0.06) 0%, rgba(139,92,246,0.03) 100%), var(--black-card, #141414)',
        boxShadow: 'inset 0 1px 0 rgba(0,174,239,0.08), 0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {/* Workout name */}
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-[var(--cyan)]" />
          <span className="text-[var(--white)] font-semibold text-[15px]">{name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1.5 text-[13px] text-[var(--gray-400)]">
          <Layers size={14} className="text-[var(--gray-500)]" />
          <span>{exercises.length} exercises</span>
          <span className="text-[var(--gray-600)]">|</span>
          <span>{completedSets}/{totalSets} sets</span>
        </div>

        <div className="flex items-center gap-1.5 text-[13px] text-[var(--gray-400)]">
          <span className="text-[var(--gray-500)]">💪</span>
          <span>{totalVol.toLocaleString()} kg</span>
        </div>

        <div className="flex items-center gap-1.5 text-[13px] text-[var(--gray-400)]">
          <Clock size={14} className="text-[var(--gray-500)]" />
          <span className="tabular-nums">{timeStr}</span>
        </div>

        {/* Progress bar (right side) */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px] ml-auto">
          <div className="flex-1 h-1.5 bg-[var(--gray-800)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--admin-accent)] transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-[12px] font-semibold text-[var(--cyan)] tabular-nowrap">{pct}%</span>
          <span className="text-[11px] text-[var(--gray-500)] tabular-nowrap">({totalVol.toLocaleString()} / {targetVol.toLocaleString()} kg)</span>
        </div>
      </div>
    </div>
  );
}
