import { useState, useEffect, useCallback } from 'react';
import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseCard from '@/components/ExerciseCard';
import WorkoutSummary from '@/components/WorkoutSummary';
import LiftRecordModal from '@/components/LiftRecordModal';
import EditExerciseModal from '@/components/EditExerciseModal';
import { useRestTimer } from '@/hooks/useRestTimer';
import type { Exercise, LiftRecord } from '@/types';

// ── Demo Data ────────────────────────────────────────────────────
const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'A1',
    name: 'Barbell Back Squat',
    scheme: '4×6',
    target: '120',
    unit: 'kg',
    muscleGroup: 'Quads, Glutes',
    sets: [
      { set: 1, prescribed: '4×6 @ 120 kg', clientLoad: '120', load: '120', reps: '6', rpe: '7', rest: '180', type: 'Normal', done: 'done', lastWeekLoad: '115', lastWeekReps: '6' },
      { set: 2, prescribed: '4×6 @ 120 kg', clientLoad: '120', load: '120', reps: '6', rpe: '8', rest: '180', type: 'Normal', done: 'done' },
      { set: 3, prescribed: '4×6 @ 120 kg', clientLoad: '115', load: '115', reps: '5', rpe: '9', rest: '180', type: 'Drop Set', done: 'warning' },
      { set: 4, prescribed: '4×6 @ 120 kg', clientLoad: '', load: '', reps: '', rpe: '', rest: '180', type: 'Normal', done: 'empty' },
    ],
  },
  {
    id: 'A2',
    name: 'Romanian Deadlift',
    scheme: '3×8',
    target: '100',
    unit: 'kg',
    muscleGroup: 'Hamstrings, Glutes',
    sets: [
      { set: 1, prescribed: '3×8 @ 100 kg', clientLoad: '100', load: '100', reps: '8', rpe: '7', rest: '150', type: 'Normal', done: 'done' },
      { set: 2, prescribed: '3×8 @ 100 kg', clientLoad: '100', load: '100', reps: '8', rpe: '7', rest: '150', type: 'Normal', done: 'done' },
      { set: 3, prescribed: '3×8 @ 100 kg', clientLoad: '100', load: '100', reps: '8', rpe: '8', rest: '150', type: 'Normal', done: 'done' },
    ],
  },
  {
    id: 'A3',
    name: 'Walking Lunges',
    scheme: '3×12',
    target: '40',
    unit: 'kg',
    muscleGroup: 'Quads',
    sets: [
      { set: 1, prescribed: '3×12 @ 40 kg', clientLoad: '40', load: '40', reps: '12', rpe: '7', rest: '120', type: 'Normal', done: 'done', lastWeekLoad: '40', lastWeekReps: '11' },
      { set: 2, prescribed: '3×12 @ 40 kg', clientLoad: '40', load: '40', reps: '11', rpe: '8', rest: '120', type: 'Normal', done: 'warning' },
      { set: 3, prescribed: '3×12 @ 40 kg', clientLoad: '', load: '', reps: '', rpe: '', rest: '120', type: 'Normal', done: 'empty' },
    ],
  },
  {
    id: 'A4',
    name: 'Leg Curl (Machine)',
    scheme: '3×10',
    target: '45',
    unit: 'kg',
    muscleGroup: 'Hamstrings',
    sets: [
      { set: 1, prescribed: '3×10 @ 45 kg', clientLoad: '45', load: '45', reps: '10', rpe: '7', rest: '90', type: 'Normal', done: 'done' },
      { set: 2, prescribed: '3×10 @ 45 kg', clientLoad: '45', load: '45', reps: '10', rpe: '7', rest: '90', type: 'Normal', done: 'done' },
      { set: 3, prescribed: '3×10 @ 45 kg', clientLoad: '', load: '', reps: '', rpe: '', rest: '90', type: 'Normal', done: 'empty' },
    ],
  },
];

// Demo lift records
const INITIAL_LIFT_RECORDS: Record<string, Record<string, LiftRecord>> = {
  'A1': {
    '1': { val: '120', date: 'May 15, 2024' },
    '2': { val: '120', date: 'May 15, 2024' },
    '3': { val: '120', date: 'May 15, 2024' },
    '4': { val: '140', date: 'Jun 10, 2024' },
    '5': { val: '130', date: 'Jul 1, 2024' },
  },
  'A2': {
    '1': { val: '100', date: 'May 20, 2024' },
    '3': { val: '105', date: 'Jun 1, 2024' },
    '8': { val: '95', date: 'Apr 12, 2024' },
  },
};

// ── Main Page ────────────────────────────────────────────────────
export default function ProgramBuilderPage() {
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    INITIAL_EXERCISES.map((ex, i) => ({ ...ex, _expanded: i === 0 }))
  );
  const [liftRecords, setLiftRecords] = useState(INITIAL_LIFT_RECORDS);
  const [elapsed, setElapsed] = useState(1920); // 32:00 demo time
  const [liftModalOpen, setLiftModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const { timers, startTimer, skipTimer, addTime, formatTime } = useRestTimer();

  // Elapsed timer
  useEffect(() => {
    const iv = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleToggle = useCallback((idx: number) => {
    setExercises(prev =>
      prev.map((ex, i) => ({ ...ex, _expanded: i === idx ? !ex._expanded : false }))
    );
  }, []);

  const handleUpdateExercise = useCallback((updated: Exercise) => {
    setExercises(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
  }, []);

  const handleOpenLiftRecord = useCallback((exercise: Exercise) => {
    setActiveExercise(exercise);
    setLiftModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((exercise: Exercise) => {
    setActiveExercise(exercise);
    setEditModalOpen(true);
  }, []);

  const handleSaveLiftRecords = useCallback((exId: string, records: Record<string, LiftRecord>) => {
    setLiftRecords(prev => ({ ...prev, [exId]: records }));
  }, []);

  const handleSaveEdit = useCallback((updates: Partial<Exercise>) => {
    if (!activeExercise) return;
    setExercises(prev =>
      prev.map(ex => ex.id === activeExercise.id ? { ...ex, ...updates } : ex)
    );
  }, [activeExercise]);

  const expandedIdx = exercises.findIndex(ex => ex._expanded);

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--cyan)] to-[var(--admin-accent)] flex items-center justify-center shadow-[0_4px_14px_rgba(0,174,239,0.3)]">
          <Dumbbell size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[var(--white)] text-xl font-semibold">Program Builder</h1>
          <p className="text-[var(--gray-500)] text-sm">Log your workout sets, track volume, and monitor progress</p>
        </div>
      </div>

      {/* Workout Summary */}
      <WorkoutSummary
        name="Lower Body Day"
        exercises={exercises}
        elapsedSeconds={elapsed}
      />

      {/* Exercise Cards */}
      <div className="space-y-3">
        {exercises.map((ex, idx) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            index={idx}
            isExpanded={ex._expanded || false}
            onToggle={() => handleToggle(idx)}
            onUpdate={handleUpdateExercise}
            onOpenLiftRecord={handleOpenLiftRecord}
            onOpenEdit={handleOpenEdit}
            liftRecords={liftRecords[ex.id] || {}}
            restTimer={timers[ex.id]}
            onStartRest={startTimer}
            onSkipRest={skipTimer}
            onAddRest={addTime}
          />
        ))}
      </div>

      {/* Empty state / Add exercise */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          className="h-10 px-6 border-dashed border-[var(--gray-600)] text-[var(--gray-400)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] bg-transparent"
        >
          + Add Exercise
        </Button>
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <LiftRecordModal
        open={liftModalOpen}
        onClose={() => { setLiftModalOpen(false); setActiveExercise(null); }}
        onSave={(records) => {
          if (activeExercise) handleSaveLiftRecords(activeExercise.id, records);
        }}
        exerciseName={activeExercise?.name || ''}
        exerciseId={activeExercise?.id || ''}
        existingRecords={activeExercise ? (liftRecords[activeExercise.id] || {}) : {}}
      />

      <EditExerciseModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setActiveExercise(null); }}
        onSave={handleSaveEdit}
        exercise={activeExercise}
      />
    </div>
  );
}
