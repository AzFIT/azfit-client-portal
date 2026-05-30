import { useState, useRef, useCallback } from 'react';
import { ChevronDown, CheckCircle, Square, Plus, Minus, Pencil, StickyNote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Exercise, ExerciseSet, SetType, LiftRecord } from '@/types';

interface Props {
  exercise: Exercise;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updated: Exercise) => void;
  onOpenLiftRecord: (exercise: Exercise) => void;
  onOpenEdit: (exercise: Exercise) => void;
  liftRecords: Record<string, LiftRecord>;
  restTimer: { remaining: number; active: boolean; setIndex: number } | undefined;
  onStartRest: (exerciseId: string, setIndex: number, seconds: number) => void;
  onSkipRest: (exerciseId: string) => void;
  onAddRest: (exerciseId: string, seconds: number) => void;
  unit: 'kg' | 'lbs';
  _onUnitChange?: (unit: 'kg' | 'lbs') => void;
}

const SET_TYPES: SetType[] = ['Normal', 'Warm-up', 'Drop Set', 'To Failure', 'AMRAP'];
const REST_OPTIONS = [30, 45, 60, 90, 120, 150, 180, 210, 240, 300, 360];

// RPE-based 1RM chart
const RPE_1RM_MAP: Record<number, number> = {
  10: 1.000, 9.5: 0.978, 9: 0.955, 8.5: 0.939,
  8: 0.922, 7.5: 0.907, 7: 0.892, 6.5: 0.878,
  6: 0.863, 5.5: 0.849, 5: 0.835, 4.5: 0.822,
  4: 0.809, 3.5: 0.796, 3: 0.784, 2.5: 0.772,
  2: 0.760, 1.5: 0.749, 1: 0.738,
};

function get1RM(load: number, reps: number, rpe: number): number {
  const rpeKey = Math.round(rpe * 2) / 2;
  const pct = RPE_1RM_MAP[rpeKey] || RPE_1RM_MAP[10];
  const repAdjustment = 1 - (reps - 1) * 0.025;
  const adjustedPct = pct * repAdjustment;
  return load / adjustedPct;
}

export default function ExerciseCard({
  exercise,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onOpenLiftRecord,
  onOpenEdit,
  liftRecords,
  restTimer,
  onStartRest,
  onSkipRest,
  onAddRest,
  unit,
}: Props) {
  const [focusedSet, setFocusedSet] = useState<number | null>(null);
  const [noteSet, setNoteSet] = useState<number | null>(null);
  const [showPR, setShowPR] = useState<number | null>(null);
  const pillTargets = useRef<Record<string, number>>({});

  const allDone = exercise.sets.length > 0 && exercise.sets.every(s => s.done === 'done');

  const formatRest = (s: ExerciseSet) => {
    if (!restTimer || !restTimer.active) return `${s.rest}s`;
    const rt = restTimer;
    if (rt.remaining <= 0) return 'Done';
    const m = Math.floor(rt.remaining / 60);
    const sec = rt.remaining % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const calcVolume = () => {
    let vol = 0;
    let target = 0;
    let rpeSum = 0;
    let rpeCount = 0;
    let doneCount = 0;
    let best1rm = 0;

    exercise.sets.forEach((s) => {
      const load = parseFloat(s.load) || 0;
      const reps = parseFloat(s.reps) || 0;
      const pLoad = parseFloat(exercise.target) || 0;
      const pReps = parseInt(exercise.scheme.split('×')[1]) || 0;
      vol += load * reps;
      target += pLoad * pReps;
      if (s.rpe) { rpeSum += parseFloat(s.rpe); rpeCount++; }
      if (s.done !== 'empty') doneCount++;
      if (load > 0 && reps > 0 && s.rpe) {
        const est = get1RM(load, reps, parseFloat(s.rpe));
        if (est > best1rm) best1rm = est;
      }
    });

    const totalSets = exercise.sets.length;
    const setPct = totalSets > 0 ? Math.round((doneCount / totalSets) * 100) : 0;
    const pct = Math.min(setPct, 100);
    const avgRpe = rpeCount > 0 ? (rpeSum / rpeCount).toFixed(1) : '—';
    const est1rm = best1rm > 0 ? `~${Math.round(best1rm)}` : '—';
    return { vol, target, pct, avgRpe, est1rm, doneCount, totalSets };
  };

  const v = calcVolume();

  const updateSet = useCallback((setIdx: number, updates: Partial<ExerciseSet>) => {
    const newSets = [...exercise.sets];
    newSets[setIdx] = { ...newSets[setIdx], ...updates };
    onUpdate({ ...exercise, sets: newSets });
  }, [exercise, onUpdate]);

  const handleToggleDone = useCallback((setIdx: number) => {
    const s = exercise.sets[setIdx];

    if (s.done === 'done') {
      updateSet(setIdx, { done: 'empty' });
      if (restTimer?.active && restTimer?.setIndex === setIdx) {
        onSkipRest(exercise.id);
      }
      return;
    }

    // Mark done — auto-fill from prescribed if empty
    const pLoad = exercise.target;
    const pReps = exercise.scheme.split('×')[1] || '';
    const newLoad = s.clientLoad || pLoad;
    const newReps = s.reps || pReps;

    // Check for PR
    const repKey = String(parseInt(newReps) || 6);
    const existing = liftRecords[repKey];
    if (existing && parseFloat(newLoad) > parseFloat(existing.val)) {
      setShowPR(setIdx);
      setTimeout(() => setShowPR(null), 2500);
    }

    updateSet(setIdx, {
      clientLoad: newLoad,
      load: newLoad,
      reps: newReps,
      done: 'done',
    });

    // Start rest timer for this specific set
    onStartRest(exercise.id, setIdx, parseInt(s.rest) || 180);

    // Carry-over to next set
    const nextIdx = setIdx + 1;
    if (nextIdx < exercise.sets.length) {
      const next = exercise.sets[nextIdx];
      if (next.done === 'empty' && !next.clientLoad) {
        updateSet(nextIdx, { clientLoad: newLoad, load: newLoad, reps: newReps });
      }
    }
  }, [exercise, liftRecords, restTimer, updateSet, onStartRest, onSkipRest]);

  const handlePillClick = useCallback((delta: number) => {
    const targetSet = pillTargets.current[exercise.id];
    if (targetSet === undefined || targetSet >= exercise.sets.length) return;
    const s = exercise.sets[targetSet];
    const current = parseFloat(s.clientLoad) || parseFloat(s.load) || parseFloat(exercise.target) || 0;
    if (current <= 0) return;
    const newVal = String(current + delta);
    updateSet(targetSet, { clientLoad: newVal, load: newVal });
    setFocusedSet(targetSet);
  }, [exercise, updateSet]);

  const handleAddSet = useCallback(() => {
    const nextSet = exercise.sets.length + 1;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      set: nextSet,
      prescribed: `${exercise.scheme} @ ${exercise.target} ${exercise.unit}`,
      clientLoad: lastSet?.clientLoad || exercise.target,
      load: lastSet?.load || exercise.target,
      reps: lastSet?.reps || exercise.scheme.split('×')[1] || '',
      rpe: '',
      rest: lastSet?.rest || '180',
      type: 'Normal',
      done: 'empty',
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  }, [exercise, onUpdate]);

  const handleTargetChange = (newTarget: string) => {
    const newSets = exercise.sets.map(s => ({
      ...s,
      prescribed: `${exercise.scheme} @ ${newTarget} ${exercise.unit}`,
    }));
    onUpdate({ ...exercise, target: newTarget, sets: newSets });
  };

  const rowBg = (done: string) => {
    if (done === 'done') return 'bg-[#22C55E]/[0.22] border-l-[3px] border-l-[#22C55E]';
    return 'border-l-[3px] border-l-transparent';
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? 'pb-card-gradient border-[#00AEEF]/25 shadow-[0_0_20px_rgba(0,174,239,0.06)]'
          : 'bg-[#141414] border-[#2A2A2A]/30 hover:border-[#374151]/50'
      } ${allDone && isExpanded ? 'shadow-[0_0_20px_rgba(34,197,94,0.08)] border-[#22C55E]/20' : ''}`}
    >
      {/* ── Card Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none min-h-[52px]"
        onClick={onToggle}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onOpenLiftRecord(exercise); }}
          className="text-[#00AEEF] font-semibold text-[15px] hover:brightness-125 transition-all flex items-center gap-2"
        >
          <span className="text-[13px] px-1.5 py-0.5 rounded bg-[#00AEEF]/10 text-[#00AEEF] font-mono">
            {exercise.id}
          </span>
          {exercise.name}
        </button>

        {exercise._method && exercise._method !== 'Straight Sets' && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
            exercise._method === 'Superset'
              ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
              : exercise._method === 'Triset'
              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
              : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30'
          }`}>
            {exercise._method}
          </span>
        )}

        <span className="text-[#00AEEF] font-semibold text-sm tabular-nums ml-auto">
          {exercise.scheme}
        </span>

        {/* Target input */}
        <div className="flex items-center gap-1 text-sm">
          <Input
            type="text"
            value={exercise.target}
            onChange={(e) => handleTargetChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-14 h-7 px-1.5 text-center text-[13px] font-semibold bg-[#0A0A0A]/50 border-[#2A2A2A] text-[#F0F0F0] focus:border-[#00AEEF] py-0"
          />
          <span className="text-[#A0A0A0] text-[12px] font-medium">{unit}</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#00AEEF] transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <ChevronDown size={18} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onOpenEdit(exercise); }}
          className="w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#00AEEF] transition-colors"
          title="Edit exercise"
        >
          <Pencil size={15} />
        </button>
      </div>

      {/* ── Expanded Body ───────────────────────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 overflow-x-auto">
          {/* Table */}
          <table className="w-full min-w-[600px] text-[13px]">
            <thead>
              <tr className="text-left">
                {['Set', 'Prescribed', 'Client Load', 'Load', 'Reps', 'RPE', 'Rest', 'Type', 'Done'].map((h) => (
                  <th key={h} className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] px-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((s, si) => (
                <tr
                  key={si}
                  className={`transition-colors duration-300 border-b border-[#2A2A2A]/20 last:border-0 ${rowBg(s.done)} ${
                    focusedSet === si ? 'ring-1 ring-inset ring-[#00AEEF]/40' : ''
                  }`}
                  data-row-ex={index}
                  data-row-set={si}
                >
                  {/* Set */}
                  <td className="py-2 px-2 text-[#A0A0A0] tabular-nums">{s.set}</td>

                  {/* Prescribed */}
                  <td className="py-2 px-2 text-[#6B6B6B] text-[12px] whitespace-nowrap">
                    {s.prescribed}
                  </td>

                  {/* Client Load (editable) */}
                  <td className="py-2 px-2">
                    <Input
                      type="text"
                      value={s.clientLoad}
                      placeholder="—"
                      onFocus={() => {
                        setFocusedSet(si);
                        pillTargets.current[exercise.id] = si;
                      }}
                      onBlur={() => setTimeout(() => setFocusedSet(null), 300)}
                      onChange={(e) => updateSet(si, { clientLoad: e.target.value, load: e.target.value })}
                      className="w-16 h-8 px-1.5 text-center text-[13px] font-medium bg-[#0A0A0A]/50 border-[#2A2A2A] focus:border-[#00AEEF] focus:ring-[#00AEEF]/20 text-[#F0F0F0] placeholder:text-[#4B5563] tabular-nums"
                    />
                  </td>

                  {/* Load (display) */}
                  <td className="py-2 px-2 font-semibold text-[#F0F0F0] tabular-nums relative group">
                    {s.load || '—'}
                    {/* Last week tooltip */}
                    {s.lastWeekLoad && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#1A1A1A] border border-[#00AEEF]/30 rounded text-[11px] text-[#D1D5DB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {parseFloat(s.load || '0') > parseFloat(s.lastWeekLoad) ? '↑' : parseFloat(s.load || '0') < parseFloat(s.lastWeekLoad) ? '↓' : '→'}
                        {' '}{Math.abs(parseFloat(s.load || '0') - parseFloat(s.lastWeekLoad))}{exercise.unit}
                        {' '}(was {s.lastWeekLoad}×{s.lastWeekReps})
                      </span>
                    )}
                  </td>

                  {/* Reps */}
                  <td className="py-2 px-2 text-[#F0F0F0] tabular-nums">{s.reps || '—'}</td>

                  {/* RPE */}
                  <td className="py-2 px-2">
                    <Input
                      type="text"
                      value={s.rpe}
                      placeholder="—"
                      onChange={(e) => updateSet(si, { rpe: e.target.value })}
                      className="w-10 h-8 px-1 text-center text-[13px] bg-[#0A0A0A]/50 border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] placeholder:text-[#4B5563] tabular-nums"
                    />
                  </td>

                  {/* Rest — countdown only on the specific set that triggered the timer */}
                  <td className="py-2 px-2 tabular-nowrap">
                    {restTimer?.active && restTimer?.setIndex === si ? (
                      <div className="flex items-center gap-1">
                        <span className={`text-[13px] tabular-nums ${
                          restTimer.remaining < 15 ? 'text-[#EF4444] font-semibold' :
                          restTimer.remaining < 30 ? 'text-[#EAB308]' :
                          'text-[#00AEEF]'
                        }`}>
                          {formatRest(s)}
                        </span>
                        <button onClick={() => onSkipRest(exercise.id)} className="text-[10px] text-[#6B6B6B] hover:text-[#F0F0F0] ml-1">Skip</button>
                        <button onClick={() => onAddRest(exercise.id, 30)} className="text-[10px] text-[#6B6B6B] hover:text-[#F0F0F0]">+30</button>
                      </div>
                    ) : (
                      <Select
                        value={s.rest}
                        onValueChange={(v) => updateSet(si, { rest: v })}
                      >
                        <SelectTrigger className="w-[72px] h-7 text-[11px] bg-[#0A0A0A]/50 border-[#2A2A2A] text-[#F0F0F0] px-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                          {REST_OPTIONS.map((sec) => (
                            <SelectItem key={sec} value={String(sec)} className="text-[#F0F0F0] text-[11px] focus:bg-[#1F2937] focus:text-[#F0F0F0]">
                              {sec}s
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-2 px-2">
                    <Select
                      value={s.type}
                      onValueChange={(v) => updateSet(si, { type: v as SetType })}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-[12px] bg-[#0A0A0A]/50 border-[#2A2A2A] text-[#F0F0F0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                        {SET_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="text-[#F0F0F0] text-[12px] focus:bg-[#1F2937] focus:text-[#F0F0F0]">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Done */}
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDone(si);
                      }}
                      className="relative p-1 rounded-md hover:bg-[#22C55E]/10 transition-all active:scale-90"
                    >
                      {s.done === 'done' ? (
                        <CheckCircle size={20} className="text-[#22C55E]" />
                      ) : (
                        <Square size={20} className="text-[#4B5563] hover:text-[#A0A0A0]" />
                      )}
                      {/* PR flash */}
                      {showPR === si && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#EAB308] text-[#0A0A0A] text-[10px] font-bold rounded animate-bounce whitespace-nowrap">
                          NEW PR! ✨
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Quick Adjust Pills ──────────────────────────────── */}
          <div className="flex items-center gap-2 mt-2 mb-1">
            <span className="text-[12px] font-semibold text-[#00AEEF] min-w-[50px]">
              {focusedSet !== null ? `Set ${exercise.sets[focusedSet]?.set}:` : 'All sets:'}
            </span>
            <button
              onClick={() => handlePillClick(-2.5)}
              disabled={focusedSet === null}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-[#1F2937] text-[#A0A0A0] hover:bg-[#00AEEF] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={12} className="inline mr-0.5" />2.5{exercise.unit}
            </button>
            <button
              onClick={() => handlePillClick(2.5)}
              disabled={focusedSet === null}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-[#1F2937] text-[#A0A0A0] hover:bg-[#00AEEF] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={12} className="inline mr-0.5" />2.5{exercise.unit}
            </button>
            <span className="text-[11px] text-[#4B5563] ml-1">or type any value</span>

            {/* Note toggle (right-aligned) */}
            <button
              onClick={() => setNoteSet(noteSet === null ? 0 : null)}
              className="ml-auto w-7 h-7 flex items-center justify-center text-[#4B5563] hover:text-[#00AEEF] transition-colors"
              title="Toggle notes"
            >
              <StickyNote size={14} />
            </button>
          </div>

          {/* Per-set notes (inline) */}
          {noteSet !== null && (
            <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {exercise.sets.map((s, si) => (
                <div key={si} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#6B6B6B] w-8 text-right">Set {s.set}</span>
                  <Input
                    type="text"
                    value={s.note || ''}
                    placeholder="Add note..."
                    onChange={(e) => updateSet(si, { note: e.target.value })}
                    className="flex-1 h-7 text-[12px] bg-[#0A0A0A]/30 border-[#2A2A2A]/50 focus:border-[#00AEEF]/50 text-[#F0F0F0] placeholder:text-[#4B5563]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── Summary Bar ─────────────────────────────────────── */}
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]/30 flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* Volume Progress Bar */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="flex-1 h-2 bg-[#1F2937] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    allDone
                      ? 'bg-gradient-to-r from-[#22C55E] to-[#4ADE80]'
                      : 'bg-gradient-to-r from-[#00AEEF] to-[#A855F7]'
                  }`}
                  style={{ width: `${Math.min(v.pct, 100)}%` }}
                />
              </div>
              <span className={`text-[12px] font-semibold tabular-nowrap ${allDone ? 'text-[#22C55E]' : 'text-[#00AEEF]'}`}>
                {v.pct}%
              </span>
            </div>

            <span className="text-[12px] text-[#A0A0A0] tabular-nowrap">
              Vol: <span className="text-[#F0F0F0] font-medium">{v.vol.toLocaleString()}</span> / {v.target.toLocaleString()} {exercise.unit}
            </span>
            <span className="text-[12px] text-[#A0A0A0]">
              Avg RPE: <span className="text-[#00AEEF] font-semibold">{v.avgRpe}</span>
            </span>
            <span className="text-[12px] text-[#A0A0A0]">
              Est 1RM: <span className="text-[#A855F7] font-semibold">{v.est1rm}</span> {exercise.unit}
            </span>

            {allDone && (
              <span className="text-[11px] text-[#22C55E] font-semibold flex items-center gap-1">
                <CheckCircle size={12} />
                All Sets Complete
              </span>
            )}

            <button
              onClick={handleAddSet}
              className="ml-auto px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white hover:opacity-90 transition-opacity"
            >
              + Add Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
