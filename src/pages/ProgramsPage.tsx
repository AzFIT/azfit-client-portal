import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Play,
  Pencil,
  Copy,
  Trash2,
  Plus,
  Search,
  SlidersHorizontal,
  Zap,
  Layers,
  Flame,
  Columns,
  Circle,
  Settings,
  Trophy,
  Clock,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SavedProgram } from '@/types';
import SessionLauncher from '@/components/SessionLauncher';

// ── Template Definitions ────────────────────────────────────────
interface TemplateDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  gradient: string;
  focus: string;
  description: string;
}

const TEMPLATES: TemplateDef[] = [
  {
    key: 'GVT',
    label: 'GVT',
    icon: <Layers size={20} />,
    color: '#8B5CF6',
    bg: 'bg-[#8B5CF6]/10',
    border: 'border-[#8B5CF6]/30',
    gradient: 'from-[#8B5CF6] to-[#A78BFA]',
    focus: 'Hypertrophy',
    description: '10×10 high-volume German Volume Training',
  },
  {
    key: 'GBC',
    label: 'GBC',
    icon: <Flame size={20} />,
    color: '#F97316',
    bg: 'bg-[#F97316]/10',
    border: 'border-[#F97316]/30',
    gradient: 'from-[#F97316] to-[#FB923C]',
    focus: 'Fat Loss',
    description: 'Superset-driven German Body Composition',
  },
  {
    key: 'HIIT',
    label: 'HIIT',
    icon: <Zap size={20} />,
    color: '#EF4444',
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/30',
    gradient: 'from-[#EF4444] to-[#F87171]',
    focus: 'Conditioning',
    description: 'High-intensity interval metabolic training',
  },
  {
    key: 'PPL',
    label: 'PPL',
    icon: <Columns size={20} />,
    color: '#00AEEF',
    bg: 'bg-[#00AEEF]/10',
    border: 'border-[#00AEEF]/30',
    gradient: 'from-[#00AEEF] to-[#38BDF8]',
    focus: 'Hypertrophy',
    description: 'Push Pull Legs — 3 to 6 day split',
  },
  {
    key: 'Full Body',
    label: 'Full Body',
    icon: <Circle size={20} />,
    color: '#22C55E',
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/30',
    gradient: 'from-[#22C55E] to-[#4ADE80]',
    focus: 'Strength',
    description: 'Complete body training every session',
  },
  {
    key: 'Strength',
    label: 'Strength',
    icon: <Trophy size={20} />,
    color: '#EAB308',
    bg: 'bg-[#EAB308]/10',
    border: 'border-[#EAB308]/30',
    gradient: 'from-[#EAB308] to-[#FDE047]',
    focus: 'Power',
    description: 'Low-rep, high-load powerlifting style',
  },
  {
    key: 'Custom',
    label: 'Custom',
    icon: <Settings size={20} />,
    color: '#6B7280',
    bg: 'bg-[#6B7280]/10',
    border: 'border-[#6B7280]/30',
    gradient: 'from-[#6B7280] to-[#9CA3AF]',
    focus: 'Flexible',
    description: 'User-defined template — any configuration',
  },
];

const TEMPLATE_KEYS = TEMPLATES.map(t => t.key);

function getTemplateDef(key?: string): TemplateDef | undefined {
  return TEMPLATES.find(t => t.key === key) || TEMPLATES.find(t => t.key === 'Custom');
}

// ── Goal Colors ─────────────────────────────────────────────────
const GOAL_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  strength:    { bg: 'bg-[#00AEEF]/10', text: 'text-[#00AEEF]', gradient: 'from-[#00AEEF] to-[#008DC4]' },
  hypertrophy: { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', gradient: 'from-[#8B5CF6] to-[#7C4FE4]' },
  fatloss:     { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', gradient: 'from-[#22C55E] to-[#1EAD4E]' },
  endurance:   { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', gradient: 'from-[#F59E0B] to-[#D97706]' },
  rehab:       { bg: 'bg-[#6B7280]/10', text: 'text-[#6B7280]', gradient: 'from-[#6B7280] to-[#4B5563]' },
  power:       { bg: 'bg-[#EAB308]/10', text: 'text-[#EAB308]', gradient: 'from-[#EAB308] to-[#CA8A04]' },
};

const GOAL_LABELS: Record<string, string> = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  fatloss: 'Fat Loss',
  endurance: 'Endurance',
  rehab: 'Rehab',
  power: 'Power',
};

function getGoalColor(goal: string) {
  return GOAL_COLORS[goal] || GOAL_COLORS.strength;
}

function getGoalLabel(goal: string) {
  return GOAL_LABELS[goal] || goal;
}

// ── Local Storage Helpers ───────────────────────────────────────
const PROGRAMS_KEY = 'azfit-programs';
const SESSION_KEY = (id: string) => `azfit-session-${id}`;

function getPrograms(): SavedProgram[] {
  try {
    const raw = localStorage.getItem(PROGRAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePrograms(list: SavedProgram[]) {
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(list));
}

function getSessionProgress(programId: string): { completedSets: number; totalSets: number } {
  try {
    const raw = localStorage.getItem(SESSION_KEY(programId));
    if (!raw) return { completedSets: 0, totalSets: 0 };
    const session = JSON.parse(raw);
    const exercises = session.exercises || [];
    let completed = 0;
    let total = 0;
    exercises.forEach((ex: { sets: Array<{ done: string }> }) => {
      ex.sets.forEach((s: { done: string }) => {
        total++;
        if (s.done !== 'empty') completed++;
      });
    });
    return { completedSets: completed, totalSets: total };
  } catch {
    return { completedSets: 0, totalSets: 0 };
  }
}

// ── DB Programs Loader ──────────────────────────────────────────
async function loadDbPrograms(): Promise<SavedProgram[]> {
  try {
    const res = await fetch('./programs_db.json');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ── Template Feature Card ───────────────────────────────────────
function TemplateFeatureCard({
  template,
  isActive,
  onClick,
  count,
}: {
  template: TemplateDef;
  isActive: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex-shrink-0 w-[180px] rounded-xl border p-4 text-left transition-all ${
        isActive
          ? `${template.bg} ${template.border} ring-1 ring-[${template.color}]/40`
          : 'bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] hover:border-[#3A3A3A]'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${template.color}20`, color: template.color }}
        >
          {template.icon}
        </div>
        <span className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm">{template.label}</span>
      </div>
      <p className="text-[#6B7280] text-[11px] leading-relaxed mb-2">{template.description}</p>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: `${template.color}15`, color: template.color }}
        >
          {template.focus}
        </span>
        <span className="text-[#555] text-[10px] font-mono">{count} programs</span>
      </div>
      {isActive && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: template.color }}
        />
      )}
    </motion.button>
  );
}

// ── Program Card ────────────────────────────────────────────────
function ProgramCard({
  program,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  isReadOnly,
}: {
  program: SavedProgram;
  onStart: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}) {
  const d = program.data;
  const goal = getGoalColor(d.goal);
  const goalLabel = getGoalLabel(d.goal);
  const tmpl = getTemplateDef(d.template);
  const totalWeeks = d.phases.filter(p => p.active).reduce((s, p) => s + p.weeks, 0);
  const activeDays = d.split.filter(day => day.active).length;
  const totalExercises = d.exercises.length;
  const totalSets = d.totalSets || d.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const progress = getSessionProgress(program.id);
  const progressPct = progress.totalSets > 0
    ? Math.round((progress.completedSets / progress.totalSets) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -2 }}
      className="group relative rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414] overflow-hidden hover:border-[#3A3A3A] transition-colors"
    >
      {/* Color banner */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${goal.gradient}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm truncate">
              {d.programName || 'Untitled Program'}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${goal.bg} ${goal.text}`}>
                {goalLabel}
              </span>
              {tmpl && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: `${tmpl.color}15`, color: tmpl.color }}
                >
                  {tmpl.label}
                </span>
              )}
              {d.trainingMethod && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#A0A0A0] font-medium">
                  {d.trainingMethod}
                </span>
              )}
              {isReadOnly && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1A1A1A] text-[#6B7280] font-medium">
                  Built-in
                </span>
              )}
            </div>
          </div>
          {!isReadOnly && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#666] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Client Profile micro-bar */}
        {d.clientProfile && (
          <div className="flex items-center gap-3 mb-3 px-2 py-1.5 rounded-lg bg-[#0A0A0A]/60 border border-gray-200 dark:border-[#1F1F1F]">
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
              <User size={10} className="text-gray-500 dark:text-[#A0A0A0]" />
              <span className="text-gray-500 dark:text-[#A0A0A0]">{d.clientProfile.experience}</span>
            </div>
            <div className="w-px h-3 bg-[#2A2A2A]" />
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
              <Dumbbell size={10} className="text-gray-500 dark:text-[#A0A0A0]" />
              <span className="text-gray-500 dark:text-[#A0A0A0]">{d.clientProfile.equipment}</span>
            </div>
            <div className="w-px h-3 bg-[#2A2A2A]" />
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
              <Clock size={10} className="text-gray-500 dark:text-[#A0A0A0]" />
              <span className="text-gray-500 dark:text-[#A0A0A0]">{d.clientProfile.timePerSession}m</span>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-[#0A0A0A] rounded-lg p-2 text-center border border-gray-200 dark:border-[#1F1F1F]">
            <div className="text-gray-900 dark:text-[#F0F0F0] font-mono font-bold text-sm">{totalWeeks}w</div>
            <div className="text-[#666] text-[10px]">Duration</div>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-2 text-center border border-gray-200 dark:border-[#1F1F1F]">
            <div className="text-[#00AEEF] font-mono font-bold text-sm">{activeDays}<span className="text-[#555] text-[10px]">/wk</span></div>
            <div className="text-[#666] text-[10px]">Days</div>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-2 text-center border border-gray-200 dark:border-[#1F1F1F]">
            <div className="text-gray-900 dark:text-[#F0F0F0] font-mono font-bold text-sm">{totalExercises}</div>
            <div className="text-[#666] text-[10px]">Exercises</div>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-2 text-center border border-gray-200 dark:border-[#1F1F1F]">
            <div className="text-gray-900 dark:text-[#F0F0F0] font-mono font-bold text-sm">{totalSets}</div>
            <div className="text-[#666] text-[10px]">Sets</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-[#666]">Session Progress</span>
            <span className="text-gray-500 dark:text-[#A0A0A0] font-mono">{progress.completedSets}/{progress.totalSets} sets</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${goal.gradient} transition-all duration-500`}
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Phase pills */}
        {d.phases.filter(p => p.active).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {d.phases.filter(p => p.active).map((phase) => (
              <span
                key={phase.id}
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
              >
                {phase.name}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-[#1F1F1F]">
          <Button
            onClick={onStart}
            size="sm"
            className={`flex-1 h-8 text-xs font-semibold bg-gradient-to-r ${goal.gradient} text-white hover:opacity-90`}
          >
            <Play size={13} className="mr-1" />
            {progressPct > 0 ? 'Resume Session' : 'Start Session'}
          </Button>
          {!isReadOnly && (
            <>
              <button
                onClick={onEdit}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:text-[#00AEEF] hover:border-[#00AEEF]/30 transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDuplicate}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30 transition-colors"
                title="Duplicate"
              >
                <Copy size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ─────────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00AEEF]/20 to-[#A855F7]/10 flex items-center justify-center mb-4 border border-[#00AEEF]/20">
        <Dumbbell size={28} className="text-[#00AEEF]" />
      </div>
      <h3 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-lg mb-1">No Active Programs</h3>
      <p className="text-[#6B7280] text-sm max-w-sm mb-6">
        Create your first program using the All-in-One Program Creator and assign it to a client.
      </p>
      <Button
        onClick={onCreate}
        className="bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-semibold px-6"
      >
        <Zap size={16} className="mr-2" />
        Create New Program
      </Button>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function ProgramsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [dbPrograms, setDbPrograms] = useState<SavedProgram[]>([]);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'alpha'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load programs on mount
  useEffect(() => {
    const local = getPrograms();
    setPrograms(local);
    loadDbPrograms().then(db => {
      setDbPrograms(db);
      setLoaded(true);
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    const next = programs.filter(p => p.id !== id);
    setPrograms(next);
    savePrograms(next);
    localStorage.removeItem(SESSION_KEY(id));
  }, [programs]);

  const handleDuplicate = useCallback((program: SavedProgram) => {
    const dup: SavedProgram = {
      ...program,
      id: `prog_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        ...program.data,
        programName: `${program.data.programName || 'Untitled'} (Copy)`,
      },
    };
    const next = [...programs, dup];
    setPrograms(next);
    savePrograms(next);
  }, [programs]);

  const handleEdit = useCallback((program: SavedProgram) => {
    localStorage.setItem('azfit-creator-edit-id', program.id);
    navigate('/programs/create');
  }, [navigate]);

  const handleStart = useCallback((id: string, isDb?: boolean) => {
    if (isDb) {
      const dbProg = dbPrograms.find(p => p.id === id);
      if (dbProg) {
        const existing = getPrograms();
        if (!existing.find(p => p.id === id)) {
          savePrograms([...existing, dbProg]);
        }
      }
    }
    setLauncherOpen(true);
  }, [dbPrograms]);

  // Count programs per template
  const allPrograms = useMemo(() => [...programs, ...dbPrograms], [programs, dbPrograms]);
  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TEMPLATE_KEYS.forEach(k => counts[k] = 0);
    allPrograms.forEach(p => {
      const t = p.data.template || 'Custom';
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [allPrograms]);

  // Filtering & sorting
  const filtered = useMemo(() => {
    let list = [...allPrograms];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.data.programName || '').toLowerCase().includes(q) ||
        (p.data.assignedClient || '').toLowerCase().includes(q) ||
        (p.data.goal || '').toLowerCase().includes(q) ||
        (p.data.template || '').toLowerCase().includes(q)
      );
    }

    if (goalFilter !== 'all') {
      list = list.filter(p => p.data.goal === goalFilter);
    }

    if (templateFilter) {
      list = list.filter(p => (p.data.template || 'Custom') === templateFilter);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      list.sort((a, b) => (a.data.programName || '').localeCompare(b.data.programName || ''));
    }

    return list;
  }, [allPrograms, search, goalFilter, templateFilter, sortBy]);

  const dbIds = new Set(dbPrograms.map(p => p.id));

  const goalOptions = ['all', 'strength', 'hypertrophy', 'fatloss', 'endurance', 'rehab', 'power'];

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 dark:text-[#F0F0F0] text-xl font-semibold flex items-center gap-2">
            <Dumbbell size={22} className="text-[#00AEEF]" />
            Active Programs
          </h1>
          <p className="text-[#6B7280] text-sm mt-0.5">
            {programs.length} custom program{programs.length !== 1 ? 's' : ''} · {dbPrograms.length} built-in
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/programs/match')}
            size="sm"
            className="bg-gradient-to-r from-[#22C55E] to-[#00AEEF] text-white font-semibold mr-2"
          >
            <Sparkles size={16} className="mr-1.5" />
            Smart Match
          </Button>
          <Button
            onClick={() => navigate('/programs/create')}
            size="sm"
            className="bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-semibold"
          >
            <Plus size={16} className="mr-1.5" />
            New Program
          </Button>
        </div>
      </div>

      {/* Featured Templates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-500 dark:text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider">
            Program Templates
          </h2>
          {templateFilter && (
            <button
              onClick={() => setTemplateFilter(null)}
              className="text-[10px] text-[#6B7280] hover:text-gray-900 dark:text-[#F0F0F0] flex items-center gap-1 transition-colors"
            >
              <X size={10} />
              Clear filter
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#2A2A2A] scrollbar-track-transparent">
          {TEMPLATES.map((tmpl) => (
            <TemplateFeatureCard
              key={tmpl.key}
              template={tmpl}
              isActive={templateFilter === tmpl.key}
              onClick={() => setTemplateFilter(templateFilter === tmpl.key ? null : tmpl.key)}
              count={templateCounts[tmpl.key] || 0}
            />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs, clients, goals, templates..."
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A]/50 text-gray-900 dark:text-[#F0F0F0] text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[#00AEEF]/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-10 px-3 rounded-lg border text-sm flex items-center gap-2 transition-colors ${
            showFilters
              ? 'border-[#00AEEF] text-[#00AEEF] bg-[#00AEEF]/5'
              : 'border-gray-200 dark:border-[#2A2A2A]/50 text-gray-500 dark:text-[#A0A0A0] hover:border-[#374151]'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A]/30">
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] text-xs font-medium">Goal:</span>
                <div className="flex flex-wrap gap-1">
                  {goalOptions.map(g => (
                    <button
                      key={g}
                      onClick={() => setGoalFilter(g)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                        goalFilter === g
                          ? 'border-[#00AEEF] bg-[#00AEEF]/10 text-[#00AEEF]'
                          : 'border-gray-200 dark:border-[#2A2A2A]/50 text-[#6B7280] hover:border-[#374151]'
                      }`}
                    >
                      {g === 'all' ? 'All' : getGoalLabel(g)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-px h-6 bg-[#2A2A2A]/50 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] text-xs font-medium">Template:</span>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTemplateFilter(templateFilter === t.key ? null : t.key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                        templateFilter === t.key
                          ? 'border-[#00AEEF] bg-[#00AEEF]/10 text-[#00AEEF]'
                          : 'border-gray-200 dark:border-[#2A2A2A]/50 text-[#6B7280] hover:border-[#374151]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-px h-6 bg-[#2A2A2A]/50 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] text-xs font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'alpha')}
                  className="h-8 px-2 rounded-lg bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A]/50 text-gray-500 dark:text-[#A0A0A0] text-xs focus:outline-none focus:border-[#00AEEF]/50"
                >
                  <option value="newest">Newest First</option>
                  <option value="alpha">Alphabetical</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {!loaded ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280] text-sm">Loading programs...</p>
        </div>
      ) : allPrograms.length === 0 ? (
        <EmptyState onCreate={() => navigate('/programs/create')} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280] text-sm">No programs match your filters.</p>
          <button
            onClick={() => { setSearch(''); setGoalFilter('all'); setTemplateFilter(null); }}
            className="text-[#00AEEF] text-sm mt-2 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onStart={() => handleStart(program.id, dbIds.has(program.id))}
                onEdit={() => handleEdit(program)}
                onDuplicate={() => handleDuplicate(program)}
                onDelete={() => handleDelete(program.id)}
                isReadOnly={dbIds.has(program.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <SessionLauncher
        open={launcherOpen}
        onClose={() => setLauncherOpen(false)}
      />
    </div>
  );
}
