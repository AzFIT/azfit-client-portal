import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dumbbell,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  ChevronRight,
  Layers,
  Zap,
  Flame,
  Trophy,
  Circle,
  Columns,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

function sanitizeExercises(exercises: Exercise[]): Exercise[] {
  return exercises.map(ex => ({
    ...ex,
    sets: ex.sets.map(s => ({
      ...s,
      done: (s as any).done === 'warning' ? 'empty' : s.done,
    })),
  }));
}
import ExerciseCard from '@/components/ProgramBuilder/ExerciseCard';
import WorkoutSummary from '@/components/ProgramBuilder/WorkoutSummary';
import LiftRecordModal from '@/components/ProgramBuilder/LiftRecordModal';
import EditExerciseModal from '@/components/ProgramBuilder/EditExerciseModal';
import { useRestTimer } from '@/hooks/useRestTimer';
import type { Exercise, LiftRecord, SavedProgram, ProgramData, DayData, DayExercise } from '@/types';

// ── Template Icons ──────────────────────────────────────────────
const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  GVT: <Layers size={14} />,
  GBC: <Flame size={14} />,
  HIIT: <Zap size={14} />,
  PPL: <Columns size={14} />,
  'Full Body': <Circle size={14} />,
  Strength: <Trophy size={14} />,
  Custom: <Settings size={14} />,
};

// ── Data Converters ─────────────────────────────────────────────

interface CreatorExercise {
  code: string;
  name: string;
  sets: number;
  reps: string;
  pct1RM: string;
  tempo: string;
  rest: string;
}

function parseRestToSeconds(rest: string): number {
  if (rest.includes(':')) {
    const [m, s] = rest.split(':').map(Number);
    return (m || 0) * 60 + (s || 0);
  }
  return parseInt(rest) || 180;
}

function extractNumericTarget(pct1RM: string): string {
  const match = pct1RM.match(/[\d.]+/);
  return match ? match[0] : '';
}

function convertDayExercises(
  dayExercises: DayExercise[],
  dayIndex: number,
  dayMethod: string,
  muscleMap: Record<string, string>
): Exercise[] {
  return dayExercises.map((ex, idx) => {
    const scheme = `${ex.sets}×${ex.reps}`;
    const target = extractNumericTarget(ex.pct1RM) || ex.pct1RM;
    const restSeconds = parseRestToSeconds(ex.rest);
    const muscleGroup = muscleMap[ex.name.toLowerCase()] || 'General';

    const sets = Array.from({ length: ex.sets }, (_, i) => ({
      set: i + 1,
      prescribed: `${scheme} @ ${ex.pct1RM} (tempo ${ex.tempo})`,
      clientLoad: '',
      load: '',
      reps: ex.reps,
      rpe: '',
      rest: String(restSeconds),
      type: 'Normal' as const,
      done: 'empty' as const,
      note: `Tempo: ${ex.tempo}`,
    }));

    return {
      id: ex.code || `D${dayIndex + 1}E${idx + 1}`,
      name: ex.name,
      scheme,
      target,
      unit: 'kg',
      muscleGroup,
      sets,
      _expanded: idx === 0,
      _dayIndex: dayIndex,
      _method: dayMethod,
    };
  });
}

function convertCreatorToBuilder(
  creatorExercises: CreatorExercise[],
  muscleMap: Record<string, string>
): Exercise[] {
  return creatorExercises.map((ex, idx) => {
    const scheme = `${ex.sets}×${ex.reps}`;
    const target = extractNumericTarget(ex.pct1RM) || ex.pct1RM;
    const restSeconds = parseRestToSeconds(ex.rest);
    const muscleGroup = muscleMap[ex.name.toLowerCase()] || 'General';

    const sets = Array.from({ length: ex.sets }, (_, i) => ({
      set: i + 1,
      prescribed: `${scheme} @ ${ex.pct1RM} (tempo ${ex.tempo})`,
      clientLoad: '',
      load: '',
      reps: ex.reps,
      rpe: '',
      rest: String(restSeconds),
      type: 'Normal' as const,
      done: 'empty' as const,
      note: `Tempo: ${ex.tempo}`,
    }));

    return {
      id: ex.code || `E${idx + 1}`,
      name: ex.name,
      scheme,
      target,
      unit: 'kg',
      muscleGroup,
      sets,
      _expanded: idx === 0,
    };
  });
}

function convertDaysToBuilder(
  days: DayData[],
  muscleMap: Record<string, string>
): Exercise[] {
  const exercises: Exercise[] = [];
  days.forEach((day, dayIdx) => {
    exercises.push(...convertDayExercises(day.exercises, dayIdx, day.method, muscleMap));
  });
  return exercises;
}

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
      { set: 3, prescribed: '4×6 @ 120 kg', clientLoad: '115', load: '115', reps: '5', rpe: '9', rest: '180', type: 'Drop Set', done: 'empty' },
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
      { set: 2, prescribed: '3×12 @ 40 kg', clientLoad: '40', load: '40', reps: '11', rpe: '8', rest: '120', type: 'Normal', done: 'empty' },
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

const PROGRAMS_KEY = 'azfit-programs';
const SESSION_KEY = (id: string) => `azfit-session-${id}`;

function getSavedProgram(id: string): SavedProgram | undefined {
  try {
    const raw = localStorage.getItem(PROGRAMS_KEY);
    if (!raw) return undefined;
    const programs: SavedProgram[] = JSON.parse(raw);
    return programs.find(p => p.id === id);
  } catch {
    return undefined;
  }
}

function loadSession(id: string): { exercises: Exercise[]; liftRecords: Record<string, Record<string, LiftRecord>>; elapsed: number; activeDay?: number } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY(id));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(
  id: string,
  data: { exercises: Exercise[]; liftRecords: Record<string, Record<string, LiftRecord>>; elapsed: number; activeDay?: number }
) {
  localStorage.setItem(SESSION_KEY(id), JSON.stringify(data));
}

// ── Day Tab Component ───────────────────────────────────────────
function DayTab({
  day,
  dayNumber,
  method,
  exerciseCount,
  isActive,
  onClick,
  isCompleted,
}: {
  day: string;
  dayNumber: number;
  method: string;
  exerciseCount: number;
  isActive: boolean;
  onClick: () => void;
  isCompleted?: boolean;
}) {
  const methodColors: Record<string, string> = {
    'Straight Sets': 'text-[#22C55E]',
    'Superset': 'text-[#F59E0B]',
    'Triset': 'text-[#EF4444]',
    'Circuit': 'text-[#8B5CF6]',
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex-shrink-0 min-w-[140px] rounded-lg border p-3 text-left transition-all ${
        isActive
          ? 'bg-[#1A1A1A] border-[#00AEEF]/50 ring-1 ring-[#00AEEF]/20'
          : 'bg-[#141414] border-[#2A2A2A] hover:border-[#3A3A3A]'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${isActive ? 'text-[#00AEEF]' : 'text-[#A0A0A0]'}`}>
          Day {dayNumber}
        </span>
        {isCompleted && (
          <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
        )}
      </div>
      <div className="text-[#F0F0F0] text-sm font-medium truncate">{day}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-[10px] font-medium ${methodColors[method] || 'text-[#6B7280]'}`}>
          {method}
        </span>
        <span className="text-[#555] text-[10px]">· {exerciseCount} exercises</span>
      </div>
    </button>
  );
}

// ── Client Profile Bar ──────────────────────────────────────────
function ClientProfileBar({ profile, template, method }: { profile?: ProgramData['clientProfile']; template?: string; method?: string }) {
  if (!profile && !template && !method) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A]/50">
      {template && (
        <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
          {TEMPLATE_ICONS[template] || <Settings size={12} />}
          <span className="text-[#F0F0F0] font-medium">{template}</span>
        </div>
      )}
      {method && (
        <>
          <div className="w-px h-3 bg-[#2A2A2A]" />
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <Layers size={12} />
            <span className="text-[#F0F0F0] font-medium">{method}</span>
          </div>
        </>
      )}
      {profile && (
        <>
          <div className="w-px h-3 bg-[#2A2A2A]" />
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <User size={12} />
            <span>{profile.experience}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <Dumbbell size={12} />
            <span>{profile.equipment}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <Clock size={12} />
            <span>{profile.timePerSession} min/session</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Phase Progress ──────────────────────────────────────────────
function PhaseProgress({ phases }: { phases: ProgramData['phases'] }) {
  const activePhases = phases.filter(p => p.active);
  if (activePhases.length === 0) return null;

  const totalWeeks = activePhases.reduce((s, p) => s + p.weeks, 0);

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A]/50">
      <Calendar size={14} className="text-[#6B7280]" />
      <div className="flex items-center gap-1.5 flex-wrap">
        {activePhases.map((phase, idx) => (
          <div key={phase.id} className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
            >
              {phase.name}
            </span>
            <span className="text-[#555] text-[10px]">{phase.weeks}w</span>
            {idx < activePhases.length - 1 && (
              <ChevronRight size={10} className="text-[#3A3A3A]" />
            )}
          </div>
        ))}
      </div>
      <div className="ml-auto text-[10px] text-[#555]">Total: {totalWeeks}w</div>
    </div>
  );
}

// ── Method Badge ────────────────────────────────────────────────
function MethodBadge({ method }: { method?: string }) {
  if (!method) return null;

  const styles: Record<string, string> = {
    'Straight Sets': 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
    'Superset': 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
    'Triset': 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
    'Circuit': 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${styles[method] || 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/30'}`}>
      {method}
    </span>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function ProgramBuilderPage() {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();

  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [liftRecords, setLiftRecords] = useState(INITIAL_LIFT_RECORDS);
  const [elapsed, setElapsed] = useState(1920);
  const [liftModalOpen, setLiftModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [workoutName, setWorkoutName] = useState('Lower Body Day');
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  // Day-aware state
  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [hasDays, setHasDays] = useState(false);

  const { timers, startTimer, skipTimer, addTime } = useRestTimer();

  // Load program data on mount
  useEffect(() => {
    if (!programId) {
      setNotFound(true);
      setLoaded(true);
      return;
    }

    const saved = getSavedProgram(programId);
    if (!saved) {
      setNotFound(true);
      setLoaded(true);
      return;
    }

    setProgramData(saved.data);
    setWorkoutName(saved.data.programName || 'Workout Session');

    // Check for existing session
    const session = loadSession(programId);

    fetch('./exercises_db.json')
      .then((res) => res.json())
      .then((db: Array<{ Name: string; MuscleGroup: string }>) => {
        const muscleMap: Record<string, string> = {};
        db.forEach((ex) => {
          muscleMap[ex.Name.toLowerCase()] = ex.MuscleGroup.replace('/', ', ');
        });

        if (session) {
          setExercises(sanitizeExercises(session.exercises));
          setLiftRecords(session.liftRecords);
          setElapsed(session.elapsed);
          setActiveDay(session.activeDay ?? 0);
          setSourceLabel('Resumed Session');
          setHasDays(session.exercises.some(e => e._dayIndex !== undefined));
          setLoaded(true);
          return;
        }

        // Fresh session — use days if available
        if (saved.data.days && saved.data.days.length > 0) {
          const converted = convertDaysToBuilder(saved.data.days, muscleMap);
          setExercises(converted.map((ex, i) => ({ ...ex, _expanded: i === 0 })));
          setActiveDay(0);
          setHasDays(true);
        } else {
          const converted = convertCreatorToBuilder(saved.data.exercises, muscleMap);
          setExercises(converted.map((ex, i) => ({ ...ex, _expanded: i === 0 })));
          setHasDays(false);
        }
        setSourceLabel('From Program Creator');
        setLoaded(true);
      })
      .catch(() => {
        if (session) {
          setExercises(sanitizeExercises(session.exercises));
          setLiftRecords(session.liftRecords);
          setElapsed(session.elapsed);
          setActiveDay(session.activeDay ?? 0);
          setSourceLabel('Resumed Session');
          setHasDays(session.exercises.some(e => e._dayIndex !== undefined));
          setLoaded(true);
          return;
        }

        if (saved.data.days && saved.data.days.length > 0) {
          const converted = convertDaysToBuilder(saved.data.days, {});
          setExercises(converted.map((ex, i) => ({ ...ex, _expanded: i === 0 })));
          setActiveDay(0);
          setHasDays(true);
        } else {
          const converted = convertCreatorToBuilder(saved.data.exercises, {});
          setExercises(converted.map((ex, i) => ({ ...ex, _expanded: i === 0 })));
          setHasDays(false);
        }
        setSourceLabel('From Program Creator');
        setLoaded(true);
      });
  }, [programId]);

  // Persist session whenever data changes
  useEffect(() => {
    if (!loaded || notFound || !programId) return;
    saveSession(programId, { exercises, liftRecords, elapsed, activeDay });
  }, [exercises, liftRecords, elapsed, activeDay, loaded, notFound, programId]);

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

  const handleResetDemo = () => {
    setExercises(INITIAL_EXERCISES.map((ex, i) => ({ ...ex, _expanded: i === 0 })));
    setLiftRecords(INITIAL_LIFT_RECORDS);
    setElapsed(1920);
    setWorkoutName('Lower Body Day');
    setSourceLabel(null);
    setUnit('kg');
    setActiveDay(0);
    setHasDays(false);
    setProgramData(null);
    localStorage.setItem('azfit-weight-unit', 'kg');
    if (programId) {
      localStorage.removeItem(SESSION_KEY(programId));
    }
  };

  // Filter exercises by active day
  const visibleExercises = useMemo(() => {
    if (!hasDays) return exercises;
    return exercises.filter(ex => ex._dayIndex === activeDay);
  }, [exercises, activeDay, hasDays]);

  // Get current day's info
  const currentDayInfo = useMemo(() => {
    if (!programData?.days || !hasDays) return null;
    return programData.days[activeDay] || null;
  }, [programData, activeDay, hasDays]);

  // Check if a day is completed
  const isDayCompleted = useCallback((dayIndex: number) => {
    const dayExercises = exercises.filter(ex => ex._dayIndex === dayIndex);
    if (dayExercises.length === 0) return false;
    return dayExercises.every(ex => ex.sets.every(s => s.done !== 'empty'));
  }, [exercises]);

  // Count exercises per day
  const dayExerciseCounts = useMemo(() => {
    if (!programData?.days) return {};
    const counts: Record<number, number> = {};
    programData.days.forEach((day, idx) => {
      counts[idx] = day.exercises.length;
    });
    return counts;
  }, [programData]);

  if (notFound) {
    return (
      <div className="w-full max-w-[1440px] mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-[var(--gray-800)] flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-[var(--warning)]" />
        </div>
        <h2 className="text-foreground font-semibold text-lg mb-1">Program Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">The program you are looking for does not exist or was deleted.</p>
        <Button
          onClick={() => navigate('/programs')}
          className="bg-gradient-to-r from-[var(--cyan)] to-[var(--admin-accent)] text-white font-semibold px-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Programs
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--cyan)] to-[var(--admin-accent)] flex items-center justify-center shadow-[0_4px_14px_rgba(0,174,239,0.3)]">
          <Dumbbell size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-foreground text-xl font-semibold">Program Builder</h1>
          <p className="text-muted-foreground text-sm">
            {sourceLabel ? (
              <span className="flex items-center gap-2">
                <span className="text-[var(--cyan)]">{sourceLabel}</span>
                <span className="text-[var(--gray-600)]">|</span>
                <span>Log your workout sets, track volume, and monitor progress</span>
              </span>
            ) : (
              'Log your workout sets, track volume, and monitor progress'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/programs')}
            className="h-9 px-4 border-[var(--gray-700)] text-[var(--gray-400)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] bg-transparent text-xs"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Back to Programs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemo}
            className="h-9 px-4 border-[var(--gray-700)] text-[var(--gray-400)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] bg-transparent text-xs"
          >
            <RotateCcw size={14} className="mr-1.5" />
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Client Profile & Phase Info */}
      {programData && (
        <div className="flex flex-col gap-2 mb-4">
          <ClientProfileBar
            profile={programData.clientProfile}
            template={programData.template}
            method={currentDayInfo?.method || programData.trainingMethod}
          />
          <PhaseProgress phases={programData.phases} />
        </div>
      )}

      {/* Day Selector Tabs */}
      {hasDays && programData?.days && programData.days.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#2A2A2A] scrollbar-track-transparent">
            {programData.days.map((day, idx) => (
              <DayTab
                key={idx}
                day={day.day}
                dayNumber={day.dayNumber}
                method={day.method}
                exerciseCount={dayExerciseCounts[idx] || day.exercises.length}
                isActive={activeDay === idx}
                onClick={() => setActiveDay(idx)}
                isCompleted={isDayCompleted(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Day Method Banner */}
      {currentDayInfo && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1A1A1A] to-[#141414] border border-[#2A2A2A]/50">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#00AEEF]" />
            <span className="text-[#F0F0F0] text-sm font-medium">
              Day {currentDayInfo.dayNumber}: {currentDayInfo.day}
            </span>
          </div>
          <div className="w-px h-4 bg-[#2A2A2A]" />
          <MethodBadge method={currentDayInfo.method} />
          <div className="ml-auto text-[10px] text-[#555]">
            {currentDayInfo.exercises.length} exercises · {currentDayInfo.exercises.reduce((s, e) => s + e.sets, 0)} sets
          </div>
        </div>
      )}

      {/* Workout Summary */}
      <WorkoutSummary
        name={workoutName}
        exercises={exercises}
        elapsedSeconds={elapsed}
        unit={unit}
      />

      {/* Exercise Cards */}
      <div className="space-y-3">
        {visibleExercises.map((ex, idx) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            index={idx}
            isExpanded={ex._expanded || false}
            onToggle={() => handleToggle(exercises.indexOf(ex))}
            onUpdate={handleUpdateExercise}
            onOpenLiftRecord={handleOpenLiftRecord}
            onOpenEdit={handleOpenEdit}
            liftRecords={liftRecords[ex.id] || {}}
            restTimer={timers[ex.id]}
            onStartRest={startTimer}
            onSkipRest={skipTimer}
            onAddRest={addTime}
            unit={unit}
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
