import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Flame,
  Zap,
  Wind,
  HeartPulse,
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Calendar,
  BarChart3,
  Search,
  X,
  Plus,
  Trash2,
  GripVertical,
  RefreshCw,
  AlertTriangle,
  Save,
  UserPlus,
  FileText,
  Target,
  Copy,
} from 'lucide-react'
import { cn } from '../lib/utils'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface TrainingMethod {
  Name: string
  Goal: string
  Duration: string
  Frequency: string
  TargetAudience: string
  Equipment: string
  Structure: string
  Progression: string
  NutritionNotes: string
  TrackingMetrics: string
  SafetyNotes: string
  MediaAssets?: string
  Category: string
}

interface Exercise {
  ExerciseID: string
  Name: string
  MuscleGroup: string
  Equipment: string
  Difficulty: string
  Type: string
  VideoURL: string
  Description: string
}

interface Phase {
  id: string
  name: string
  durationWeeks: number
  focus: string
  intensityMin: number
  intensityMax: number
  volume: string
  repRange: string
}

interface DayExercise {
  id: string
  exerciseId: string
  name: string
  muscleGroup: string
  sets: number
  reps: string
  rest: string
  rpe: number
  notes: string
  supersetWith?: string
}

interface DaySession {
  day: string
  focus: string
  exercises: DayExercise[]
  isRest: boolean
}

interface WizardState {
  currentStep: number
  selectedGoal: string
  selectedMethod: TrainingMethod | null
  clientContext: {
    clientId: string
    experience: string
    availableDays: string[]
    sessionDuration: string
    limitations: string[]
    equipment: string[]
  }
  phases: Phase[]
  weeklySplit: DaySession[]
  programName: string
  description: string
  tags: string[]
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const STEP_NAMES = ['Goal', 'Method', 'Context', 'Phases', 'Split', 'Exercises', 'Preview', 'Save']

const GOAL_CARDS = [
  {
    id: 'muscle',
    label: 'Muscle Gain',
    description: 'Build lean muscle mass with hypertrophy-focused programming',
    icon: Dumbbell,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    methods: ['Upper/Lower', 'PPL', 'Bro Split', 'GVT'],
  },
  {
    id: 'fat-loss',
    label: 'Fat Loss',
    description: 'Maximize calorie burn while preserving muscle',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    methods: ['Circuit Training', 'HIIT', 'GBC', 'Full Body'],
  },
  {
    id: 'strength',
    label: 'Strength',
    description: 'Build maximal strength with low-rep, high-intensity work',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #00AEEF, #0077B6)',
    methods: ['5x5', '5/3/1', 'Westside', 'Upper/Lower'],
  },
  {
    id: 'endurance',
    label: 'Endurance',
    description: 'Improve cardiovascular and muscular endurance',
    icon: Wind,
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    methods: ['HIIT', 'Circuit', 'Conditioning'],
  },
  {
    id: 'rehab',
    label: 'Rehabilitation',
    description: 'Recovery-focused programming for injury rehab',
    icon: HeartPulse,
    gradient: 'linear-gradient(135deg, #EAB308, #CA8A04)',
    methods: ['Isolation Work', 'Low Impact', 'Mobility'],
  },
  {
    id: 'general',
    label: 'General Fitness',
    description: 'Balanced fitness for overall health and wellness',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #C0C0C0, #9CA3AF)',
    methods: ['Full Body', 'Circuit', 'Mixed'],
  },
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

const SESSION_DURATIONS = ['30 min', '45 min', '60 min', '90 min']

const LIMITATION_OPTIONS = ['Lower Back', 'Shoulder', 'Knee', 'Hip', 'Wrist', 'Neck', 'None']

const EQUIPMENT_OPTIONS = ['Full Gym', 'Dumbbells Only', 'Bodyweight', 'Home Gym', 'Cable Machines']

const PHASE_FOCUSES = ['Volume', 'Intensity', 'Technique', 'Deload', 'Peak']

const VOLUME_OPTIONS = ['Low', 'Moderate', 'High', 'Very High']

const DAY_FOCUS_OPTIONS = [
  'Upper Body',
  'Lower Body',
  'Push (Chest/Shoulders/Triceps)',
  'Pull (Back/Biceps)',
  'Legs (Quads/Hams/Glutes)',
  'Full Body',
  'HIIT / Cardio',
  'Rest',
  'Arms',
  'Shoulders',
  'Back',
  'Chest',
]

const FOCUS_MUSCLE_MAP: Record<string, string[]> = {
  'Upper Body': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Chest/Triceps', 'Back/Biceps'],
  'Lower Body': ['Quads', 'Hamstrings', 'Glutes', 'Quads/Glutes', 'Hamstrings/Glutes', 'Calves', 'Legs'],
  'Push (Chest/Shoulders/Triceps)': ['Chest', 'Shoulders', 'Triceps', 'Chest/Triceps'],
  'Pull (Back/Biceps)': ['Back', 'Biceps', 'Back/Biceps'],
  'Legs (Quads/Hams/Glutes)': ['Quads', 'Hamstrings', 'Glutes', 'Quads/Glutes', 'Hamstrings/Glutes', 'Calves'],
  'Full Body': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes'],
  'Arms': ['Biceps', 'Triceps'],
  'Shoulders': ['Shoulders'],
  'Back': ['Back', 'Back/Biceps'],
  'Chest': ['Chest', 'Chest/Triceps'],
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function normalizeGoal(goal: string): string {
  const g = goal.toLowerCase()
  if (g.includes('fat') || g.includes('loss')) return 'fat-loss'
  if (g.includes('muscle') || g.includes('hypertrophy')) return 'muscle'
  if (g.includes('strength')) return 'strength'
  if (g.includes('endurance')) return 'endurance'
  if (g.includes('rehab')) return 'rehab'
  return 'general'
}

function goalMatches(goalId: string, methodGoal: string): boolean {
  const mg = methodGoal.toLowerCase()
  switch (goalId) {
    case 'muscle': return mg.includes('muscle') || mg.includes('hypertrophy')
    case 'fat-loss': return mg.includes('fat') || mg.includes('loss')
    case 'strength': return mg.includes('strength')
    case 'endurance': return mg.includes('endurance')
    case 'rehab': return mg.includes('rehab')
    case 'general': return true
    default: return false
  }
}

function generateId() {
  return `id-${Math.random().toString(36).slice(2, 9)}`
}

function getDefaultPhases(goal: string): Phase[] {
  const base: Phase[] = [
    { id: generateId(), name: 'Foundation', durationWeeks: 4, focus: 'Volume', intensityMin: 60, intensityMax: 70, volume: 'Moderate', repRange: '10-12' },
    { id: generateId(), name: 'Progression', durationWeeks: 4, focus: 'Intensity', intensityMin: 70, intensityMax: 82, volume: 'High', repRange: '6-10' },
    { id: generateId(), name: 'Peak', durationWeeks: 3, focus: 'Peak', intensityMin: 82, intensityMax: 92, volume: 'Moderate', repRange: '3-6' },
  ]
  if (goal === 'fat-loss') {
    return [
      { id: generateId(), name: 'Adaptation', durationWeeks: 2, focus: 'Volume', intensityMin: 55, intensityMax: 65, volume: 'Moderate', repRange: '12-15' },
      { id: generateId(), name: 'Intensification', durationWeeks: 4, focus: 'Intensity', intensityMin: 65, intensityMax: 78, volume: 'High', repRange: '10-12' },
    ]
  }
  if (goal === 'rehab') {
    return [
      { id: generateId(), name: 'Movement Prep', durationWeeks: 3, focus: 'Technique', intensityMin: 40, intensityMax: 55, volume: 'Low', repRange: '12-15' },
      { id: generateId(), name: 'Loading', durationWeeks: 4, focus: 'Volume', intensityMin: 55, intensityMax: 70, volume: 'Moderate', repRange: '8-12' },
    ]
  }
  return base
}

function getDefaultWeeklySplit(_goal: string, method: TrainingMethod, availableDays: string[]): DaySession[] {
  const methodGoal = normalizeGoal(method.Goal)
  const freq = Math.min(parseInt(method.Frequency) || 4, availableDays.length)
  const sortedDays = DAYS_OF_WEEK.filter(d => availableDays.includes(d))
  const trainingDays = sortedDays.slice(0, freq)

  let focuses: string[] = []
  if (methodGoal === 'muscle' || method.Name.toLowerCase().includes('upper')) {
    focuses = ['Upper Body', 'Lower Body', 'Rest', 'Upper Body', 'Lower Body', 'Rest', 'Rest']
  } else if (method.Name.toLowerCase().includes('push')) {
    focuses = ['Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs (Quads/Hams/Glutes)', 'Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs (Quads/Hams/Glutes)', 'Rest']
  } else if (methodGoal === 'strength') {
    focuses = ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest']
  } else if (methodGoal === 'fat-loss') {
    focuses = ['Full Body', 'HIIT / Cardio', 'Rest', 'Full Body', 'HIIT / Cardio', 'Rest', 'Rest']
  } else {
    focuses = ['Upper Body', 'Lower Body', 'Rest', 'Full Body', 'Rest', 'Rest', 'Rest']
  }

  return DAYS_OF_WEEK.map((day, i) => ({
    day,
    focus: trainingDays.includes(day) ? focuses[i] : 'Rest',
    isRest: !trainingDays.includes(day),
    exercises: [],
  }))
}

function autoPopulateExercises(
  focus: string,
  exercises: Exercise[],
  equipment: string[],
  count: number = 6
): DayExercise[] {
  const targetMuscles = FOCUS_MUSCLE_MAP[focus] || []
  let filtered = exercises

  // Filter by equipment
  if (equipment.length > 0 && !equipment.includes('Full Gym')) {
    const eqMap: Record<string, string[]> = {
      'Dumbbells Only': ['Dumbbell'],
      'Bodyweight': ['Bodyweight', 'Pull-Up Bar'],
      'Home Gym': ['Dumbbell', 'Bodyweight', 'Pull-Up Bar', 'Resistance Band'],
      'Cable Machines': ['Cable', 'Machine'],
    }
    const allowed = equipment.flatMap(e => eqMap[e] || [e])
    filtered = filtered.filter(ex => allowed.some(a => ex.Equipment.toLowerCase().includes(a.toLowerCase())))
  }

  // Prioritize target muscle exercises
  const muscleMatches = filtered.filter(ex =>
    targetMuscles.some(m => ex.MuscleGroup.toLowerCase().includes(m.toLowerCase()))
  )
  const others = filtered.filter(ex =>
    !targetMuscles.some(m => ex.MuscleGroup.toLowerCase().includes(m.toLowerCase()))
  )

  const selected = [...muscleMatches, ...others].slice(0, count)

  return selected.map((ex, i) => ({
    id: generateId(),
    exerciseId: ex.ExerciseID,
    name: ex.Name,
    muscleGroup: ex.MuscleGroup,
    sets: i < 2 ? 4 : 3,
    reps: focus === 'HIIT / Cardio' ? '30s' : '8-12',
    rest: focus === 'HIIT / Cardio' ? '30s' : '90s',
    rpe: 8,
    notes: '',
  }))
}

// ═══════════════════════════════════════════════════════════
// STEP 1: Goal Selection
// ═══════════════════════════════════════════════════════════

function Step1Goal({
  selectedGoal,
  onSelect,
}: {
  selectedGoal: string
  onSelect: (goal: string) => void
}) {
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="text-center mb-10">
        <h2
          className="text-[#F0F0F0] text-3xl md:text-4xl font-semibold mb-3 tracking-tight"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          What&apos;s the primary goal?
        </h2>
        <p className="text-[#A0A0A0] text-sm md:text-base">
          This determines exercise selection, volume, and progression strategy.
        </p>
      </div>

      {/* Quick select */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="text-[#6B6B6B] text-sm">Quick select:</span>
        <select
          value={selectedGoal}
          onChange={(e) => onSelect(e.target.value)}
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F0F0F0] text-sm px-4 py-2 rounded-lg focus:border-[#00AEEF] outline-none"
        >
          <option value="">Choose a goal...</option>
          {GOAL_CARDS.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GOAL_CARDS.map((goal, i) => {
          const Icon = goal.icon
          const selected = selectedGoal === goal.id
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              onClick={() => onSelect(goal.id)}
              className={cn(
                'relative text-left bg-[#141414] border-2 rounded-2xl p-8 min-h-[180px] transition-all duration-200',
                selected
                  ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.08)] shadow-[0_0_20px_rgba(0,174,239,0.15)]'
                  : 'border-[#2A2A2A] hover:border-[rgba(0,174,239,0.3)] hover:-translate-y-0.5'
              )}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-[#00AEEF] rounded-full flex items-center justify-center"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: `${goal.gradient}20` }}
              >
                <Icon size={28} style={{ color: goal.gradient.includes('8B5CF6') ? '#8B5CF6' : goal.gradient.includes('F97316') ? '#F97316' : goal.gradient.includes('00AEEF') ? '#00AEEF' : goal.gradient.includes('22C55E') ? '#22C55E' : goal.gradient.includes('EAB308') ? '#EAB308' : '#C0C0C0' }} />
              </div>
              <h3 className="text-[#F0F0F0] font-semibold text-lg mb-1">{goal.label}</h3>
              <p className="text-[#A0A0A0] text-xs mb-3">{goal.description}</p>
              <div className="flex flex-wrap gap-1">
                {goal.methods.slice(0, 3).map((m) => (
                  <span key={m} className="text-[10px] text-[#6B6B6B] bg-[#1A1A1A] px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 2: Method Selection
// ═══════════════════════════════════════════════════════════

function Step2Method({
  methods,
  selectedGoal,
  selectedMethod,
  onSelect,
}: {
  methods: TrainingMethod[]
  selectedGoal: string
  selectedMethod: TrainingMethod | null
  onSelect: (method: TrainingMethod) => void
}) {
  const [filterExp, setFilterExp] = useState('')
  const [filterEquip, setFilterEquip] = useState('')
  const [sortMode, setSortMode] = useState<'match' | 'popular' | 'newest'>('match')

  const filtered = useMemo(() => {
    let result = methods.filter((m) => goalMatches(selectedGoal, m.Goal))
    if (filterExp) {
      result = result.filter((m) => m.TargetAudience.toLowerCase().includes(filterExp.toLowerCase()))
    }
    if (filterEquip) {
      result = result.filter((m) => m.Equipment.toLowerCase().includes(filterEquip.toLowerCase()))
    }

    if (sortMode === 'match') {
      // Already filtered by goal match
    } else if (sortMode === 'popular') {
      result = [...result].sort((a, b) => a.Name.localeCompare(b.Name))
    }

    return result
  }, [methods, selectedGoal, filterExp, filterEquip, sortMode])

  const bestMatch = filtered[0]

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[#F0F0F0] text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Choose a training method
        </h2>
        <p className="text-[#A0A0A0] text-sm">
          Based on {GOAL_CARDS.find(g => g.id === selectedGoal)?.label || 'your'} goal — {filtered.length} methods available
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setSortMode('match')}
          className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors', sortMode === 'match' ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.1)] text-[#00AEEF]' : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#3A3A3A]')}
        >
          Recommended
        </button>
        <button
          onClick={() => setSortMode('popular')}
          className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors', sortMode === 'popular' ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.1)] text-[#00AEEF]' : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#3A3A3A]')}
        >
          A-Z
        </button>
        <div className="w-px h-4 bg-[#2A2A2A] mx-1" />
        <select
          value={filterExp}
          onChange={(e) => setFilterExp(e.target.value)}
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] text-xs px-3 py-1.5 rounded-full outline-none focus:border-[#00AEEF]"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select
          value={filterEquip}
          onChange={(e) => setFilterEquip(e.target.value)}
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] text-xs px-3 py-1.5 rounded-full outline-none focus:border-[#00AEEF]"
        >
          <option value="">All Equipment</option>
          <option value="Barbell">Barbell</option>
          <option value="Dumbbell">Dumbbell</option>
          <option value="Bodyweight">Bodyweight</option>
          <option value="Machine">Machine</option>
        </select>
      </div>

      {/* Method Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((method, i) => {
          const selected = selectedMethod?.Name === method.Name
          const isBest = sortMode === 'match' && bestMatch?.Name === method.Name
          const goalNorm = normalizeGoal(method.Goal)

          return (
            <motion.button
              key={method.Name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5), ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              onClick={() => onSelect(method)}
              className={cn(
                'relative text-left bg-[#141414] border rounded-xl p-6 transition-all duration-200 w-full',
                selected
                  ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.05)] shadow-[0_0_16px_rgba(0,174,239,0.1)]'
                  : 'border-[#2A2A2A] hover:border-[rgba(0,174,239,0.3)]'
              )}
            >
              {isBest && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00AEEF] to-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Star size={10} />
                  Best Match
                </div>
              )}
              {selected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#00AEEF] rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#F0F0F0] font-semibold text-base mb-1">{method.Name}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: goalNorm === 'muscle' ? 'rgba(139,92,246,0.15)' : goalNorm === 'fat-loss' ? 'rgba(34,197,94,0.15)' : goalNorm === 'strength' ? 'rgba(0,174,239,0.15)' : 'rgba(192,192,192,0.15)', color: '#F0F0F0' }}
                    >
                      {method.Goal}
                    </span>
                    <span className="text-[10px] text-[#6B6B6B] bg-[#1A1A1A] px-2 py-0.5 rounded-full">{method.Category}</span>
                  </div>
                  <p className="text-[#A0A0A0] text-xs leading-relaxed mb-3 line-clamp-2">{method.Structure}</p>
                  <div className="flex flex-wrap gap-1">
                    {method.Equipment.split(',').slice(0, 3).map((eq) => (
                      <span key={eq} className="text-[10px] text-[#6B6B6B] border border-[#2A2A2A] px-1.5 py-0.5 rounded">{eq.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 space-y-2 text-right">
                  <div className="flex items-center gap-1.5 text-[#A0A0A0] justify-end">
                    <Clock size={12} />
                    <span className="text-xs font-medium">{method.Duration} wk</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A0A0A0] justify-end">
                    <Calendar size={12} />
                    <span className="text-xs font-medium">{method.Frequency}x/wk</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A0A0A0] justify-end">
                    <BarChart3 size={12} />
                    <span className="text-xs font-medium">{method.TargetAudience}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 3: Client Context
// ═══════════════════════════════════════════════════════════

function Step3Context({
  context,
  onChange,
}: {
  context: WizardState['clientContext']
  onChange: (ctx: WizardState['clientContext']) => void
}) {
  const [hasClient, setHasClient] = useState(!!context.clientId)

  const toggleDay = (day: string) => {
    onChange({
      ...context,
      availableDays: context.availableDays.includes(day)
        ? context.availableDays.filter(d => d !== day)
        : [...context.availableDays, day],
    })
  }

  const toggleLimitation = (lim: string) => {
    onChange({
      ...context,
      limitations: context.limitations.includes(lim)
        ? context.limitations.filter(l => l !== lim)
        : [...context.limitations, lim],
    })
  }

  const toggleEquipment = (eq: string) => {
    onChange({
      ...context,
      equipment: context.equipment.includes(eq)
        ? context.equipment.filter(e => e !== eq)
        : [...context.equipment, eq],
    })
  }

  const allFields = [
    { label: 'Assign to Client', content: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasClient(!hasClient)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200',
              hasClient ? 'bg-[#00AEEF]' : 'bg-[#2A2A2A]'
            )}
          >
            <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200', hasClient ? 'translate-x-[22px]' : 'translate-x-0.5')} />
          </button>
          <span className="text-[#A0A0A0] text-sm">{hasClient ? 'Assigning to client' : 'Create as template'}</span>
        </div>
        {hasClient && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <input
              type="text"
              placeholder="Search client..."
              value={context.clientId}
              onChange={(e) => onChange({ ...context, clientId: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-4 py-2.5 rounded-xl outline-none transition-colors"
            />
          </motion.div>
        )}
      </div>
    )},
    { label: 'Training Experience', content: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {EXPERIENCE_LEVELS.map((exp) => (
          <button
            key={exp}
            onClick={() => onChange({ ...context, experience: exp })}
            className={cn(
              'text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all duration-200',
              context.experience === exp
                ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.1)] text-[#00AEEF]'
                : 'border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] hover:border-[#3A3A3A]'
            )}
          >
            {exp}
          </button>
        ))}
      </div>
    )},
    { label: 'Available Days', content: (
      <div>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={cn(
                'text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200 min-w-[72px]',
                context.availableDays.includes(day)
                  ? 'border-[#00AEEF] bg-[#00AEEF] text-white'
                  : 'border-[#2A2A2A] bg-[#141414] text-[#6B6B6B] hover:border-[#3A3A3A]'
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        {context.availableDays.length < 2 && (
          <p className="text-[#EF4444] text-xs mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Select at least 2 training days
          </p>
        )}
      </div>
    )},
    { label: 'Session Duration', content: (
      <div className="flex flex-wrap gap-2">
        {SESSION_DURATIONS.map((dur) => (
          <button
            key={dur}
            onClick={() => onChange({ ...context, sessionDuration: dur })}
            className={cn(
              'text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all duration-200',
              context.sessionDuration === dur
                ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.1)] text-[#00AEEF]'
                : 'border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] hover:border-[#3A3A3A]'
            )}
          >
            {dur}
          </button>
        ))}
      </div>
    )},
    { label: 'Limitations / Injuries', content: (
      <div className="flex flex-wrap gap-2">
        {LIMITATION_OPTIONS.map((lim) => (
          <button
            key={lim}
            onClick={() => toggleLimitation(lim)}
            className={cn(
              'text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200',
              context.limitations.includes(lim)
                ? lim === 'None'
                  ? 'border-[#22C55E] bg-[rgba(34,197,94,0.1)] text-[#22C55E]'
                  : 'border-[#EAB308] bg-[rgba(234,179,8,0.1)] text-[#EAB308]'
                : 'border-[#2A2A2A] bg-[#141414] text-[#6B6B6B] hover:border-[#3A3A3A]'
            )}
          >
            {lim}
          </button>
        ))}
      </div>
    )},
    { label: 'Equipment Access', content: (
      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_OPTIONS.map((eq) => (
          <button
            key={eq}
            onClick={() => toggleEquipment(eq)}
            className={cn(
              'text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200',
              context.equipment.includes(eq)
                ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.1)] text-[#00AEEF]'
                : 'border-[#2A2A2A] bg-[#141414] text-[#6B6B6B] hover:border-[#3A3A3A]'
            )}
          >
            {eq}
          </button>
        ))}
      </div>
    )},
  ]

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[#F0F0F0] text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Set the context
        </h2>
        <p className="text-[#A0A0A0] text-sm">Tailor the program to your client&apos;s needs</p>
      </div>

      <div className="space-y-6">
        {allFields.map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <label className="block text-[#F0F0F0] text-sm font-semibold mb-2">{field.label}</label>
            {field.content}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 4: Phase Configuration
// ═══════════════════════════════════════════════════════════

function Step4Phases({
  phases,
  onChange,
}: {
  phases: Phase[]
  onChange: (phases: Phase[]) => void
}) {
  const totalWeeks = phases.reduce((s, p) => s + p.durationWeeks, 0)

  const addPhase = () => {
    if (phases.length >= 6) return
    onChange([...phases, {
      id: generateId(),
      name: `Phase ${phases.length + 1}`,
      durationWeeks: 4,
      focus: 'Volume',
      intensityMin: 65,
      intensityMax: 75,
      volume: 'Moderate',
      repRange: '8-12',
    }])
  }

  const removePhase = (id: string) => {
    if (phases.length <= 1) return
    onChange(phases.filter(p => p.id !== id))
  }

  const duplicatePhase = (phase: Phase) => {
    if (phases.length >= 6) return
    onChange([...phases, { ...phase, id: generateId(), name: `${phase.name} (Copy)` }])
  }

  const updatePhase = (id: string, updates: Partial<Phase>) => {
    onChange(phases.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const colors = ['#00AEEF', '#8B5CF6', '#22C55E', '#F97316', '#EC4899', '#EAB308']

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[#F0F0F0] text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Configure phases
        </h2>
        <p className="text-[#A0A0A0] text-sm">{phases.length} phases — {totalWeeks} weeks total</p>
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <div className="h-10 flex rounded-xl overflow-hidden">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.id}
              layout
              className="flex items-center justify-center text-xs font-bold text-white relative"
              style={{
                backgroundColor: colors[i % colors.length],
                width: `${(phase.durationWeeks / totalWeeks) * 100}%`,
              }}
            >
              {phase.name}
              <span className="absolute bottom-0.5 text-[9px] font-normal opacity-75">{phase.durationWeeks}w</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {phases.map((phase, i) => (
            <motion.div
              key={phase.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
              className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 relative"
              style={{ borderLeftWidth: 4, borderLeftColor: colors[i % colors.length] }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#6B6B6B] text-xs mb-1">Phase Name</label>
                  <input
                    value={phase.name}
                    onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#6B6B6B] text-xs mb-1">Duration (weeks)</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={phase.durationWeeks}
                    onChange={(e) => updatePhase(phase.id, { durationWeeks: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#6B6B6B] text-xs mb-1">Focus</label>
                  <select
                    value={phase.focus}
                    onChange={(e) => updatePhase(phase.id, { focus: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none"
                  >
                    {PHASE_FOCUSES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B6B6B] text-xs mb-1">Intensity Range (% 1RM)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={30}
                      max={100}
                      value={phase.intensityMin}
                      onChange={(e) => updatePhase(phase.id, { intensityMin: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-2 py-2 rounded-lg outline-none text-center"
                    />
                    <span className="text-[#6B6B6B]">—</span>
                    <input
                      type="number"
                      min={30}
                      max={100}
                      value={phase.intensityMax}
                      onChange={(e) => updatePhase(phase.id, { intensityMax: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-2 py-2 rounded-lg outline-none text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#6B6B6B] text-xs mb-1">Volume</label>
                  <select
                    value={phase.volume}
                    onChange={(e) => updatePhase(phase.id, { volume: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none"
                  >
                    {VOLUME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B6B6B] text-xs mb-1">Rep Range</label>
                  <input
                    value={phase.repRange}
                    onChange={(e) => updatePhase(phase.id, { repRange: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1F1F1F]">
                <button
                  onClick={() => duplicatePhase(phase)}
                  disabled={phases.length >= 6}
                  className="text-[#A0A0A0] hover:text-[#F0F0F0] text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[#242424] transition-colors disabled:opacity-30"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <button
                  onClick={() => removePhase(phase.id)}
                  disabled={phases.length <= 1}
                  className="text-[#EF4444] hover:text-[#DC2626] text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[rgba(239,68,68,0.1)] transition-colors disabled:opacity-30"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Phase */}
      {phases.length < 6 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={addPhase}
          className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2A2A2A] hover:border-[#00AEEF] text-[#6B6B6B] hover:text-[#00AEEF] text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          <Plus size={16} /> Add Phase
        </motion.button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 5: Weekly Split
// ═══════════════════════════════════════════════════════════

function Step5Split({
  weeklySplit,
  onChange,
  availableDays: _availableDays,
}: {
  weeklySplit: DaySession[]
  onChange: (split: DaySession[]) => void
  availableDays: string[]
}) {
  void _availableDays
  const [selectedDay, setSelectedDay] = useState(0)

  const currentDay = weeklySplit[selectedDay]

  const toggleRest = (index: number) => {
    const updated = [...weeklySplit]
    updated[index] = {
      ...updated[index],
      isRest: !updated[index].isRest,
      focus: updated[index].isRest ? 'Upper Body' : 'Rest',
      exercises: updated[index].isRest ? [] : updated[index].exercises,
    }
    onChange(updated)
  }

  const updateFocus = (focus: string) => {
    const updated = [...weeklySplit]
    updated[selectedDay] = { ...updated[selectedDay], focus, isRest: focus === 'Rest' }
    onChange(updated)
  }

  const addExercise = () => {
    const updated = [...weeklySplit]
    updated[selectedDay] = {
      ...updated[selectedDay],
      exercises: [...updated[selectedDay].exercises, {
        id: generateId(),
        exerciseId: '',
        name: '',
        muscleGroup: '',
        sets: 3,
        reps: '8-12',
        rest: '90s',
        rpe: 8,
        notes: '',
      }],
    }
    onChange(updated)
  }

  const updateExercise = (exId: string, updates: Partial<DayExercise>) => {
    const updated = [...weeklySplit]
    updated[selectedDay] = {
      ...updated[selectedDay],
      exercises: updated[selectedDay].exercises.map(ex => ex.id === exId ? { ...ex, ...updates } : ex),
    }
    onChange(updated)
  }

  const removeExercise = (exId: string) => {
    const updated = [...weeklySplit]
    updated[selectedDay] = {
      ...updated[selectedDay],
      exercises: updated[selectedDay].exercises.filter(ex => ex.id !== exId),
    }
    onChange(updated)
  }

  const estimatedMinutes = currentDay?.exercises.length
    ? currentDay.exercises.reduce((s, ex) => s + (ex.sets * 3 * 60 + parseInt(ex.rest) * ex.sets), 0) / 60 + 10
    : 0

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[#F0F0F0] text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Design your weekly split
        </h2>
        <p className="text-[#A0A0A0] text-sm">
          {weeklySplit.filter(d => !d.isRest).length} training days configured
        </p>
      </div>

      {/* Week Overview */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weeklySplit.map((day, i) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(i)}
            className={cn(
              'relative rounded-xl p-3 text-center transition-all duration-200 border',
              selectedDay === i
                ? day.isRest
                  ? 'border-[#2A2A2A] bg-[#1A1A1A]'
                  : 'border-[#00AEEF] bg-[rgba(0,174,239,0.08)]'
                : day.isRest
                  ? 'border-dashed border-[#2A2A2A] bg-[#0A0A0A]'
                  : 'border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A]'
            )}
          >
            <p className={cn('text-xs font-semibold mb-1', day.isRest ? 'text-[#6B6B6B]' : 'text-[#F0F0F0]')}>
              {day.day.slice(0, 3)}
            </p>
            <p className={cn('text-[10px]', day.isRest ? 'text-[#6B6B6B]' : 'text-[#00AEEF]')}>
              {day.isRest ? 'Rest' : (day.focus.length > 12 ? day.focus.slice(0, 10) + '...' : day.focus)}
            </p>
            {!day.isRest && (
              <p className="text-[9px] text-[#6B6B6B] mt-0.5">{day.exercises.length} ex</p>
            )}
            {selectedDay === i && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#00AEEF] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Day Detail */}
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6"
        >
          {/* Day Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#F0F0F0] font-semibold text-lg">
                {currentDay.day} — {currentDay.isRest ? 'Rest Day' : currentDay.focus}
              </h3>
              {!currentDay.isRest && (
                <p className="text-[#6B6B6B] text-xs mt-0.5">
                  {currentDay.exercises.length} exercises{estimatedMinutes > 0 ? `, ~${Math.round(estimatedMinutes)} min estimated` : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!currentDay.isRest && (
                <select
                  value={currentDay.focus}
                  onChange={(e) => updateFocus(e.target.value)}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] text-xs px-3 py-2 rounded-lg outline-none focus:border-[#00AEEF]"
                >
                  {DAY_FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              )}
              <button
                onClick={() => toggleRest(selectedDay)}
                className={cn(
                  'text-xs font-semibold px-3 py-2 rounded-lg border transition-colors',
                  currentDay.isRest
                    ? 'border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)]'
                    : 'border-[#2A2A2A] text-[#6B6B6B] hover:border-[#3A3A3A]'
                )}
              >
                {currentDay.isRest ? 'Make Active' : 'Make Rest'}
              </button>
            </div>
          </div>

          {/* Exercise List */}
          {!currentDay.isRest && (
            <div className="space-y-3">
              {currentDay.exercises.length === 0 ? (
                <div className="text-center py-8 text-[#6B6B6B] text-sm">
                  <Dumbbell size={24} className="mx-auto mb-2 opacity-50" />
                  No exercises yet. Add exercises or use auto-populate.
                </div>
              ) : (
                currentDay.exercises.map((ex, idx) => (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-3"
                  >
                    <div className="text-[#6B6B6B] text-xs font-mono w-6 text-center">{idx + 1}</div>
                    <GripVertical size={14} className="text-[#2A2A2A] flex-shrink-0" />
                    <input
                      placeholder="Exercise name"
                      value={ex.name}
                      onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                      className="flex-1 min-w-0 bg-transparent text-[#F0F0F0] text-sm placeholder-[#6B6B6B] outline-none"
                    />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[#6B6B6B] text-[10px]">Sets</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={ex.sets}
                          onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 1 })}
                          className="w-10 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F0F0F0] text-xs px-1 py-1 rounded text-center outline-none focus:border-[#00AEEF]"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#6B6B6B] text-[10px]">Reps</span>
                        <input
                          value={ex.reps}
                          onChange={(e) => updateExercise(ex.id, { reps: e.target.value })}
                          className="w-14 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F0F0F0] text-xs px-1 py-1 rounded text-center outline-none focus:border-[#00AEEF]"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#6B6B6B] text-[10px]">Rest</span>
                        <select
                          value={ex.rest}
                          onChange={(e) => updateExercise(ex.id, { rest: e.target.value })}
                          className="w-16 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F0F0F0] text-xs px-1 py-1 rounded outline-none"
                        >
                          {['30s', '60s', '90s', '120s', '180s'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={() => removeExercise(ex.id)}
                        className="text-[#6B6B6B] hover:text-[#EF4444] p-1 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Add Exercise */}
              <button
                onClick={addExercise}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-[#2A2A2A] hover:border-[#00AEEF] text-[#6B6B6B] hover:text-[#00AEEF] text-xs font-semibold py-2.5 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Exercise
              </button>
            </div>
          )}
        </motion.div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// STEP 6: Exercise Review
// ═══════════════════════════════════════════════════════════

function Step6Review({
  weeklySplit,
  exercises,
  onChange,
}: {
  weeklySplit: DaySession[]
  exercises: Exercise[]
  onChange: (split: DaySession[]) => void
}) {
  const [swapModal, setSwapModal] = useState<{ dayIndex: number; exId: string; currentName: string } | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]))

  const activeDays = weeklySplit.filter(d => !d.isRest)

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>()
    exercises.forEach(e => groups.add(e.MuscleGroup))
    return Array.from(groups).sort()
  }, [exercises])

  const toggleDay = (idx: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const filteredExercises = useMemo(() => {
    let result = exercises
    if (searchFilter) {
      const q = searchFilter.toLowerCase()
      result = result.filter(e => e.Name.toLowerCase().includes(q) || e.MuscleGroup.toLowerCase().includes(q))
    }
    if (muscleFilter) {
      result = result.filter(e => e.MuscleGroup === muscleFilter)
    }
    return result
  }, [exercises, searchFilter, muscleFilter])

  const handleSwap = (dayIndex: number, exId: string, newEx: Exercise) => {
    const updated = [...weeklySplit]
    updated[dayIndex] = {
      ...updated[dayIndex],
      exercises: updated[dayIndex].exercises.map(ex =>
        ex.id === exId
          ? { ...ex, exerciseId: newEx.ExerciseID, name: newEx.Name, muscleGroup: newEx.MuscleGroup }
          : ex
      ),
    }
    onChange(updated)
    setSwapModal(null)
  }

  // Summary stats
  const totalExercises = activeDays.reduce((s, d) => s + d.exercises.length, 0)
  const totalSets = activeDays.reduce((s, d) => s + d.exercises.reduce((es, ex) => es + ex.sets, 0), 0)

  // Muscle distribution
  const muscleDist = useMemo(() => {
    const dist: Record<string, number> = {}
    activeDays.forEach(d => d.exercises.forEach(ex => {
      const mg = ex.muscleGroup || 'Other'
      dist[mg] = (dist[mg] || 0) + ex.sets
    }))
    return Object.entries(dist).sort((a, b) => b[1] - a[1])
  }, [activeDays])

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[#F0F0F0] text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Review exercises
        </h2>
        <p className="text-[#A0A0A0] text-sm">
          {totalExercises} exercises across {activeDays.length} training days — {totalSets} total sets/week
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {weeklySplit.map((day, dayIdx) => {
            if (day.isRest) return null
            const expanded = expandedDays.has(dayIdx)
            const daySets = day.exercises.reduce((s, ex) => s + ex.sets, 0)

            return (
              <div key={day.day} className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleDay(dayIdx)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1A1A1A] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-[#F0F0F0] font-semibold text-base">{day.day} — {day.focus}</h3>
                    <span className="text-[#6B6B6B] text-xs">{day.exercises.length} exercises</span>
                    <span className="text-[#6B6B6B] text-xs">{daySets} sets</span>
                  </div>
                  <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={16} className="text-[#6B6B6B] rotate-90" />
                  </motion.div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4">
                        {day.exercises.length === 0 ? (
                          <p className="text-[#6B6B6B] text-sm py-4 text-center">No exercises for this day</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-[#1F1F1F]">
                                  {['#', 'Exercise', 'Muscle', 'Sets', 'Reps', 'Rest', 'RPE', ''].map(h => (
                                    <th key={h} className="text-left text-[#6B6B6B] text-[10px] font-semibold uppercase tracking-wider px-2 py-2">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {day.exercises.map((ex, i) => (
                                  <motion.tr
                                    key={ex.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-[#1F1F1F] last:border-b-0 hover:bg-[#1A1A1A] transition-colors"
                                  >
                                    <td className="px-2 py-2.5 text-[#6B6B6B] text-xs font-mono">{i + 1}</td>
                                    <td className="px-2 py-2.5">
                                      <div>
                                        <p className="text-[#F0F0F0] text-xs font-medium">{ex.name || '—'}</p>
                                        {ex.muscleGroup && (
                                          <p className="text-[#6B6B6B] text-[10px]">{ex.muscleGroup}</p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-2 py-2.5 text-[#A0A0A0] text-xs">{ex.muscleGroup || '—'}</td>
                                    <td className="px-2 py-2.5 text-[#A0A0A0] text-xs font-mono">{ex.sets}</td>
                                    <td className="px-2 py-2.5 text-[#A0A0A0] text-xs font-mono">{ex.reps}</td>
                                    <td className="px-2 py-2.5 text-[#A0A0A0] text-xs font-mono">{ex.rest}</td>
                                    <td className="px-2 py-2.5">
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-[#00AEEF]">
                                        {ex.rpe}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2.5">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => setSwapModal({ dayIndex: dayIdx, exId: ex.id, currentName: ex.name })}
                                          className="text-[#6B6B6B] hover:text-[#00AEEF] p-1 rounded transition-colors"
                                          title="Swap exercise"
                                        >
                                          <RefreshCw size={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
            <h4 className="text-[#F0F0F0] font-semibold text-sm mb-4">Program Summary</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B6B] text-xs">Total Exercises</span>
                <span className="text-[#F0F0F0] text-sm font-semibold font-mono">{totalExercises}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B6B] text-xs">Sets / Week</span>
                <span className="text-[#F0F0F0] text-sm font-semibold font-mono">{totalSets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B6B] text-xs">Training Days</span>
                <span className="text-[#F0F0F0] text-sm font-semibold font-mono">{activeDays.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
            <h4 className="text-[#F0F0F0] font-semibold text-sm mb-3">Muscle Distribution</h4>
            <div className="space-y-2">
              {muscleDist.slice(0, 8).map(([muscle, sets]) => {
                const pct = totalSets > 0 ? (sets / totalSets) * 100 : 0
                return (
                  <div key={muscle}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-[#A0A0A0] truncate">{muscle}</span>
                      <span className="text-[#F0F0F0] font-mono">{sets}</span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full bg-[#00AEEF] rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
              {muscleDist.length === 0 && <p className="text-[#6B6B6B] text-xs">No exercises added</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      <AnimatePresence>
        {swapModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
              onClick={() => setSwapModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] md:max-w-[90vw] max-h-[80vh] bg-[#141414] border border-[#2A2A2A] rounded-2xl z-[201] flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A] flex-shrink-0">
                <div>
                  <h3 className="text-[#F0F0F0] font-semibold text-base">Swap Exercise</h3>
                  <p className="text-[#6B6B6B] text-xs">Current: {swapModal.currentName || '—'}</p>
                </div>
                <button onClick={() => setSwapModal(null)} className="text-[#6B6B6B] hover:text-[#F0F0F0] p-1 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-3 border-b border-[#1F1F1F] flex items-center gap-2 flex-shrink-0">
                <div className="flex-1 flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3">
                  <Search size={14} className="text-[#6B6B6B] flex-shrink-0" />
                  <input
                    placeholder="Search exercises..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-transparent text-[#F0F0F0] text-sm placeholder-[#6B6B6B] px-2 py-2 w-full outline-none"
                    autoFocus
                  />
                </div>
                <select
                  value={muscleFilter}
                  onChange={(e) => setMuscleFilter(e.target.value)}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] text-xs px-2 py-2 rounded-lg outline-none"
                >
                  <option value="">All Muscles</option>
                  {muscleGroups.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                </select>
              </div>

              {/* Exercise List */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1 min-h-0">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.ExerciseID}
                    onClick={() => handleSwap(swapModal.dayIndex, swapModal.exId, ex)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1A1A1A] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F0F0F0] text-sm font-medium truncate">{ex.Name}</p>
                      <p className="text-[#6B6B6B] text-[10px]">{ex.MuscleGroup} — {ex.Equipment} — {ex.Difficulty}</p>
                    </div>
                    <span className="text-[#6B6B6B] text-[10px] flex-shrink-0">{ex.Type}</span>
                  </button>
                ))}
                {filteredExercises.length === 0 && (
                  <p className="text-center text-[#6B6B6B] text-sm py-8">No exercises match your filters</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 7: Program Preview
// ═══════════════════════════════════════════════════════════

function Step7Preview({
  state,
  onNameChange,
  onDescChange,
}: {
  state: WizardState
  onNameChange: (name: string) => void
  onDescChange: (desc: string) => void
}) {
  const [weekView, setWeekView] = useState(false)

  const activeDays = state.weeklySplit.filter(d => !d.isRest)
  const totalExercises = activeDays.reduce((s, d) => s + d.exercises.length, 0)
  const totalSets = activeDays.reduce((s, d) => s + d.exercises.reduce((es, ex) => es + ex.sets, 0), 0)
  const totalWeeks = state.phases.reduce((s, p) => s + p.durationWeeks, 0)
  const totalSessions = activeDays.length * totalWeeks

  const muscleDist = useMemo(() => {
    const dist: Record<string, number> = {}
    activeDays.forEach(d => d.exercises.forEach(ex => {
      const mg = ex.muscleGroup || 'Other'
      dist[mg] = (dist[mg] || 0) + ex.sets
    }))
    return Object.entries(dist).sort((a, b) => b[1] - a[1])
  }, [activeDays])

  const colors = ['#00AEEF', '#8B5CF6', '#22C55E', '#F97316', '#EC4899', '#EAB308', '#C0C0C0']

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[#F0F0F0] text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Program Preview
        </h2>
      </div>

      {/* Program Name */}
      <div className="max-w-lg mx-auto mb-8">
        <label className="block text-[#6B6B6B] text-xs mb-2 font-semibold uppercase tracking-wider">Program Name</label>
        <input
          value={state.programName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Hypertrophy Phase 1"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-lg px-4 py-3 rounded-xl outline-none transition-colors"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Duration', value: `${totalWeeks} weeks`, sub: `${state.phases.length} phases`, icon: Clock },
          { label: 'Frequency', value: `${activeDays.length} days/wk`, sub: `${DAYS_OF_WEEK.filter(d => activeDays.some(ad => ad.day === d)).length} day split`, icon: Calendar },
          { label: 'Total Exercises', value: `${totalExercises} unique`, sub: `${totalSets} sets/wk`, icon: Dumbbell },
          { label: 'Est. Session Time', value: '60-75 min', sub: `${totalSessions} total sessions`, icon: Target },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className="text-[#00AEEF]" />
              <span className="text-[#6B6B6B] text-xs">{card.label}</span>
            </div>
            <p className="text-[#F0F0F0] text-xl font-semibold font-mono">{card.value}</p>
            <p className="text-[#6B6B6B] text-[10px] mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Schedule Preview */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#F0F0F0] font-semibold text-base">Weekly Schedule</h3>
          <button
            onClick={() => setWeekView(!weekView)}
            className="text-xs text-[#00AEEF] hover:underline"
          >
            {weekView ? 'Show summary' : 'Show details'}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {state.weeklySplit.map((day) => (
            <div
              key={day.day}
              className={cn(
                'rounded-lg p-2 min-h-[80px] border',
                day.isRest
                  ? 'bg-[#0A0A0A] border-dashed border-[#1F1F1F]'
                  : 'bg-[#1A1A1A] border-[#2A2A2A]'
              )}
            >
              <p className={cn('text-[10px] font-semibold mb-1', day.isRest ? 'text-[#6B6B6B]' : 'text-[#00AEEF]')}>
                {day.day.slice(0, 3)}
              </p>
              {!day.isRest && (
                <div>
                  <p className="text-[#F0F0F0] text-[10px] font-medium leading-tight truncate">{day.focus}</p>
                  {weekView && day.exercises.slice(0, 3).map((ex, i) => (
                    <p key={ex.id} className="text-[#6B6B6B] text-[9px] truncate mt-0.5">{i + 1}. {ex.name}</p>
                  ))}
                  {weekView && day.exercises.length > 3 && (
                    <p className="text-[#00AEEF] text-[9px]">+{day.exercises.length - 3} more</p>
                  )}
                  {!weekView && <p className="text-[#6B6B6B] text-[9px]">{day.exercises.length} exercises</p>}
                </div>
              )}
              {day.isRest && <p className="text-[#6B6B6B] text-[9px]">Rest</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 mb-8">
        <h3 className="text-[#F0F0F0] font-semibold text-base mb-4">Phase Timeline</h3>
        <div className="h-12 flex rounded-xl overflow-hidden">
          {state.phases.map((phase, i) => (
            <div
              key={phase.id}
              className="flex flex-col items-center justify-center text-white relative group cursor-default"
              style={{
                backgroundColor: colors[i % colors.length],
                width: `${(phase.durationWeeks / totalWeeks) * 100}%`,
              }}
            >
              <span className="text-xs font-bold">{phase.name}</span>
              <span className="text-[9px] opacity-75">{phase.durationWeeks}w</span>
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-lg">
                <p className="text-[#F0F0F0] text-xs font-semibold">{phase.name}</p>
                <p className="text-[#A0A0A0] text-[10px]">{phase.focus} — {phase.intensityMin}-{phase.intensityMax}% 1RM</p>
                <p className="text-[#6B6B6B] text-[10px]">{phase.repRange} reps — {phase.volume} volume</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muscle Distribution */}
      {muscleDist.length > 0 && (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 mb-8">
          <h3 className="text-[#F0F0F0] font-semibold text-base mb-4">Muscle Group Distribution</h3>
          <div className="flex flex-wrap gap-3">
            {muscleDist.map(([muscle, sets], i) => (
              <div
                key={muscle}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: colors[i % colors.length],
                  backgroundColor: `${colors[i % colors.length]}15`,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-[#F0F0F0] font-medium">{muscle}</span>
                <span className="text-[#6B6B6B] font-mono">{sets}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
        <label className="block text-[#6B6B6B] text-xs mb-2 font-semibold uppercase tracking-wider">Notes / Description</label>
        <textarea
          value={state.description}
          onChange={(e) => onDescChange(e.target.value)}
          placeholder="Add any notes about this program..."
          rows={4}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm placeholder-[#6B6B6B] px-4 py-3 rounded-xl outline-none resize-none transition-colors"
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 8: Save & Assign
// ═══════════════════════════════════════════════════════════

function Step8Save({
  state,
  onNameChange,
  onDescChange,
  onFinish,
}: {
  state: WizardState
  onNameChange: (name: string) => void
  onDescChange: (desc: string) => void
  onFinish: () => void
}) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const handleSave = () => {
    setShowSuccess(true)
    setTimeout(() => onFinish(), 2000)
  }

  const activeDays = state.weeklySplit.filter(d => !d.isRest)
  const totalWeeks = state.phases.reduce((s, p) => s + p.durationWeeks, 0)

  if (showSuccess) {
    return (
      <div className="max-w-[600px] mx-auto flex flex-col items-center justify-center py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-[#00AEEF] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,174,239,0.4)]"
        >
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#F0F0F0] text-2xl font-semibold mb-2"
        >
          Program Created!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[#A0A0A0] text-sm"
        >
          Redirecting to program library...
        </motion.p>
      </div>
    )
  }

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[#F0F0F0] text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Save &amp; Assign
        </h2>
        <p className="text-[#A0A0A0] text-sm">Finalize your program</p>
      </div>

      {/* Program Info */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 mb-6">
        <label className="block text-[#6B6B6B] text-xs mb-2 font-semibold uppercase tracking-wider">Program Name</label>
        <input
          value={state.programName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-base px-4 py-2.5 rounded-xl outline-none mb-4 transition-colors"
        />

        <label className="block text-[#6B6B6B] text-xs mb-2 font-semibold uppercase tracking-wider">Tags</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            GOAL_CARDS.find(g => g.id === state.selectedGoal)?.label,
            state.selectedMethod?.Category,
            state.clientContext.experience || 'Intermediate',
          ].filter(Boolean).map((tag) => (
            <span key={tag} className="text-xs text-[#00AEEF] bg-[rgba(0,174,239,0.1)] border border-[rgba(0,174,239,0.2)] px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <label className="block text-[#6B6B6B] text-xs mb-2 font-semibold uppercase tracking-wider">Description</label>
        <textarea
          value={state.description}
          onChange={(e) => onDescChange(e.target.value)}
          rows={3}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm placeholder-[#6B6B6B] px-4 py-2.5 rounded-xl outline-none resize-none transition-colors"
        />
      </div>

      {/* Action Cards */}
      <div className="space-y-3">
        {/* Assign to Client */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setAssignOpen(!assignOpen)}
          className="w-full bg-[#141414] border border-[#2A2A2A] hover:border-[#00AEEF] rounded-xl p-5 flex items-center gap-4 transition-colors text-left"
        >
          <div className="w-12 h-12 bg-[rgba(0,174,239,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
            <UserPlus size={22} className="text-[#00AEEF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#F0F0F0] font-semibold text-sm">Assign to Client</h4>
            <p className="text-[#6B6B6B] text-xs">Assign this program to a client immediately</p>
          </div>
          <ChevronRight size={16} className={cn('text-[#6B6B6B] transition-transform', assignOpen && 'rotate-90')} />
        </motion.button>

        <AnimatePresence>
          {assignOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 space-y-3 mx-2">
                <div>
                  <label className="block text-[#6B6B6B] text-xs mb-1">Select Client</label>
                  <input
                    placeholder="Search client..."
                    className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#6B6B6B] text-xs mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#6B6B6B] text-xs mb-1">Starting Phase</label>
                    <select className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#00AEEF] text-[#F0F0F0] text-sm px-3 py-2 rounded-lg outline-none">
                      {state.phases.map((p, i) => <option key={p.id} value={i}>Phase {i + 1}: {p.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save to Library */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSave}
          className="w-full bg-[#141414] border border-[#2A2A2A] hover:border-[#22C55E] rounded-xl p-5 flex items-center gap-4 transition-colors text-left"
        >
          <div className="w-12 h-12 bg-[rgba(34,197,94,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Save size={22} className="text-[#22C55E]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#F0F0F0] font-semibold text-sm">Save to Library</h4>
            <p className="text-[#6B6B6B] text-xs">Store as a template for future use</p>
          </div>
          <ChevronRight size={16} className="text-[#6B6B6B]" />
        </motion.button>

        {/* Export PDF */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => alert('PDF export coming soon!')}
          className="w-full bg-[#141414] border border-[#2A2A2A] hover:border-[#F97316] rounded-xl p-5 flex items-center gap-4 transition-colors text-left"
        >
          <div className="w-12 h-12 bg-[rgba(249,115,22,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-[#F97316]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#F0F0F0] font-semibold text-sm">Export PDF</h4>
            <p className="text-[#6B6B6B] text-xs">Download a printable program sheet</p>
          </div>
          <ChevronRight size={16} className="text-[#6B6B6B]" />
        </motion.button>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
        <h4 className="text-[#F0F0F0] font-semibold text-sm mb-3">Program Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Goal:</span> <span className="text-[#A0A0A0]">{GOAL_CARDS.find(g => g.id === state.selectedGoal)?.label}</span></div>
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Method:</span> <span className="text-[#A0A0A0]">{state.selectedMethod?.Name}</span></div>
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Duration:</span> <span className="text-[#A0A0A0]">{totalWeeks} weeks</span></div>
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Frequency:</span> <span className="text-[#A0A0A0]">{activeDays.length}x/week</span></div>
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Phases:</span> <span className="text-[#A0A0A0]">{state.phases.length}</span></div>
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Exercises:</span> <span className="text-[#A0A0A0]">{activeDays.reduce((s, d) => s + d.exercises.length, 0)}</span></div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP INDICATOR
// ═══════════════════════════════════════════════════════════

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number
  onStepClick: (step: number) => void
}) {
  return (
    <div className="bg-[#141414] border-b border-[#2A2A2A] px-4 md:px-8 py-5 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px] max-w-[900px] mx-auto">
        {STEP_NAMES.map((name, i) => {
          const stepNum = i + 1
          const completed = stepNum < currentStep
          const current = stepNum === currentStep
          const upcoming = stepNum > currentStep

          return (
            <div key={name} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => completed && onStepClick(stepNum)}
                disabled={upcoming}
                className="flex flex-col items-center gap-1.5 group"
              >
                <motion.div
                  animate={
                    current
                      ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(0,174,239,0.3)', '0 0 12px 3px rgba(0,174,239,0.3)', '0 0 0 0 rgba(0,174,239,0.3)'] }
                      : {}
                  }
                  transition={current ? { duration: 2, repeat: Infinity } : {}}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2',
                    completed
                      ? 'bg-[#00AEEF] border-[#00AEEF] text-white'
                      : current
                        ? 'bg-[#00AEEF] border-[#00AEEF] text-white shadow-[0_0_12px_rgba(0,174,239,0.3)]'
                        : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#6B6B6B]'
                  )}
                >
                  {completed ? <Check size={16} /> : stepNum}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors hidden md:block',
                    completed ? 'text-[#00AEEF]' : current ? 'text-[#F0F0F0]' : 'text-[#6B6B6B]'
                  )}
                >
                  {name}
                </span>
              </button>

              {/* Connector */}
              {i < STEP_NAMES.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 md:mx-4 rounded-full overflow-hidden bg-[#2A2A2A]">
                  <motion.div
                    className="h-full bg-[#00AEEF]"
                    initial={{ width: '0%' }}
                    animate={{ width: stepNum < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN WIZARD PAGE
// ═══════════════════════════════════════════════════════════

const DRAFT_KEY = 'azfit_wizard_draft'

export default function ProgramWizardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientParam = searchParams.get('client')

  const [currentStep, setCurrentStep] = useState(1)
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false)

  // Data
  const [methods, setMethods] = useState<TrainingMethod[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Wizard state
  const [selectedGoal, setSelectedGoal] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<TrainingMethod | null>(null)
  const [clientContext, setClientContext] = useState<WizardState['clientContext']>({
    clientId: clientParam || '',
    experience: 'Intermediate',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    sessionDuration: '60 min',
    limitations: [],
    equipment: ['Full Gym'],
  })
  const [phases, setPhases] = useState<Phase[]>([])
  const [weeklySplit, setWeeklySplit] = useState<DaySession[]>([])
  const [programName, setProgramName] = useState('')
  const [description, setDescription] = useState('')

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch('/training_methods.json').then(r => r.json()).catch(() => []),
      fetch('/exercises_db.json').then(r => r.json()).catch(() => []),
    ]).then(([mData, eData]) => {
      setMethods(Array.isArray(mData) ? mData : [])
      setExercises(Array.isArray(eData) ? eData : [])
      setDataLoaded(true)
    })
  }, [])

  // Check for draft on mount
  useEffect(() => {
    const draftRaw = localStorage.getItem(DRAFT_KEY)
    if (draftRaw) {
      try {
        const draft = JSON.parse(draftRaw)
        if (draft.selectedGoal || draft.selectedMethod) {
          setShowDraftDialog(true)
        }
      } catch { /* ignore */ }
    }
  }, [])

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const draft: Partial<WizardState> = {
        currentStep,
        selectedGoal,
        selectedMethod,
        clientContext,
        phases,
        weeklySplit,
        programName,
        description,
        tags: [],
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setAutoSaveIndicator(true)
      setTimeout(() => setAutoSaveIndicator(false), 2000)
    }, 30000)
    return () => clearInterval(interval)
  }, [currentStep, selectedGoal, selectedMethod, clientContext, phases, weeklySplit, programName, description])

  // Auto-populate when entering step 5
  useEffect(() => {
    if (currentStep === 5 && weeklySplit.length > 0 && exercises.length > 0) {
      const updated = weeklySplit.map(day => {
        if (day.isRest || day.exercises.length > 0) return day
        const autoExercises = autoPopulateExercises(day.focus, exercises, clientContext.equipment, 6)
        return { ...day, exercises: autoExercises }
      })
      setWeeklySplit(updated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Auto-generate program name
  useEffect(() => {
    if (selectedGoal && selectedMethod && !programName) {
      const goalLabel = GOAL_CARDS.find(g => g.id === selectedGoal)?.label || selectedGoal
      setProgramName(`${goalLabel} — ${selectedMethod.Name}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGoal, selectedMethod])

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal)
    setPhases(getDefaultPhases(goal))
  }

  const handleMethodSelect = (method: TrainingMethod) => {
    setSelectedMethod(method)
  }

  const handleContinue = () => {
    if (currentStep === 1 && selectedGoal) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedMethod) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Generate split when moving to step 5
      if (selectedMethod && weeklySplit.length === 0) {
        const split = getDefaultWeeklySplit(selectedGoal, selectedMethod, clientContext.availableDays)
        setWeeklySplit(split)
      }
      setCurrentStep(4)
    } else if (currentStep === 4) {
      setCurrentStep(5)
    } else if (currentStep === 5) {
      setCurrentStep(6)
    } else if (currentStep === 6) {
      setCurrentStep(7)
    } else if (currentStep === 7) {
      setCurrentStep(8)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleStepClick = (step: number) => {
    if (step < currentStep) setCurrentStep(step)
  }

  const handleSaveDraft = () => {
    const draft: Partial<WizardState> = {
      currentStep,
      selectedGoal,
      selectedMethod,
      clientContext,
      phases,
      weeklySplit,
      programName,
      description,
      tags: [],
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setAutoSaveIndicator(true)
    setTimeout(() => setAutoSaveIndicator(false), 2000)
  }

  const handleLoadDraft = () => {
    const draftRaw = localStorage.getItem(DRAFT_KEY)
    if (draftRaw) {
      try {
        const draft = JSON.parse(draftRaw)
        if (draft.currentStep) setCurrentStep(draft.currentStep)
        if (draft.selectedGoal) setSelectedGoal(draft.selectedGoal)
        if (draft.selectedMethod) setSelectedMethod(draft.selectedMethod)
        if (draft.clientContext) setClientContext(draft.clientContext)
        if (draft.phases) setPhases(draft.phases)
        if (draft.weeklySplit) setWeeklySplit(draft.weeklySplit)
        if (draft.programName) setProgramName(draft.programName)
        if (draft.description) setDescription(draft.description)
      } catch { /* ignore */ }
    }
    setShowDraftDialog(false)
  }

  const handleFinish = () => {
    localStorage.removeItem(DRAFT_KEY)
    navigate('/programs')
  }

  // Validation per step
  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 1: return !!selectedGoal
      case 2: return !!selectedMethod
      case 3: return clientContext.availableDays.length >= 2
      case 4: return phases.length > 0
      case 5: return weeklySplit.some(d => !d.isRest)
      case 6: return true
      case 7: return !!programName.trim()
      case 8: return true
      default: return false
    }
  }, [currentStep, selectedGoal, selectedMethod, clientContext, phases, weeklySplit, programName])

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto -mt-6 -mx-4 sm:-mx-6 lg:-mx-8"
    >
      {/* Draft Dialog */}
      <AnimatePresence>
        {showDraftDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
              onClick={() => setShowDraftDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-[#141414] border border-[#2A2A2A] rounded-2xl z-[201] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-[#F0F0F0] font-semibold text-lg mb-2">Resume Draft?</h3>
              <p className="text-[#A0A0A0] text-sm mb-6">A saved draft was found. Would you like to resume where you left off?</p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setShowDraftDialog(false); localStorage.removeItem(DRAFT_KEY) }}
                  className="text-[#A0A0A0] hover:text-[#F0F0F0] text-sm px-4 py-2 rounded-lg hover:bg-[#242424] transition-colors"
                >
                  Start Fresh
                </button>
                <button
                  onClick={handleLoadDraft}
                  className="bg-[#00AEEF] hover:bg-[#009BD6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Resume Draft
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />

      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-[#A0A0A0] hover:text-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[#242424] transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <button
            onClick={handleSaveDraft}
            className="text-[#A0A0A0] hover:text-[#00AEEF] text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[#242424] transition-colors"
          >
            <Save size={12} /> Save Draft
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6B6B6B] text-xs">Step {currentStep} of 8</span>
          {autoSaveIndicator && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#22C55E] text-xs"
            >
              Auto-saved
            </motion.span>
          )}
        </div>
        <button
          onClick={() => navigate('/programs')}
          className="text-[#A0A0A0] hover:text-[#EF4444] text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors"
        >
          <X size={12} /> Exit
        </button>
      </div>

      {/* Step Content */}
      <div className="px-4 md:px-8 py-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {currentStep === 1 && (
              <Step1Goal selectedGoal={selectedGoal} onSelect={handleGoalSelect} />
            )}
            {currentStep === 2 && (
              <Step2Method
                methods={methods}
                selectedGoal={selectedGoal}
                selectedMethod={selectedMethod}
                onSelect={handleMethodSelect}
              />
            )}
            {currentStep === 3 && (
              <Step3Context context={clientContext} onChange={setClientContext} />
            )}
            {currentStep === 4 && (
              <Step4Phases phases={phases} onChange={setPhases} />
            )}
            {currentStep === 5 && (
              <Step5Split
                weeklySplit={weeklySplit}
                onChange={setWeeklySplit}
                availableDays={clientContext.availableDays}
              />
            )}
            {currentStep === 6 && (
              <Step6Review
                weeklySplit={weeklySplit}
                exercises={exercises}
                onChange={setWeeklySplit}
              />
            )}
            {currentStep === 7 && (
              <Step7Preview
                state={{
                  currentStep,
                  selectedGoal,
                  selectedMethod,
                  clientContext,
                  phases,
                  weeklySplit,
                  programName,
                  description,
                  tags: [],
                }}
                onNameChange={setProgramName}
                onDescChange={setDescription}
              />
            )}
            {currentStep === 8 && (
              <Step8Save
                state={{
                  currentStep,
                  selectedGoal,
                  selectedMethod,
                  clientContext,
                  phases,
                  weeklySplit,
                  programName,
                  description,
                  tags: [],
                }}
                onNameChange={setProgramName}
                onDescChange={setDescription}
                onFinish={handleFinish}
              />
            )}
          </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-[#141414]/95 backdrop-blur-sm border-t border-[#2A2A2A] px-4 md:px-8 py-4 z-10">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="text-[#A0A0A0] hover:text-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-[#242424] transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleSaveDraft}
              className="hidden sm:flex text-[#00AEEF] hover:text-[#009BD6] text-sm items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)] transition-colors"
            >
              <Save size={14} /> Save Draft
            </button>
          </div>

          <span className="text-[#6B6B6B] text-xs hidden sm:block">
            Step {currentStep} of 8
          </span>

          {currentStep < 8 ? (
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={cn(
                'bg-[#00AEEF] text-white font-semibold text-sm flex items-center gap-1.5 px-6 py-2.5 rounded-xl transition-all duration-200',
                canContinue
                  ? 'hover:bg-[#009BD6] hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,174,239,0.3)]'
                  : 'opacity-40 cursor-not-allowed'
              )}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                // Trigger save from Step8Save
                const saveBtn = document.querySelector('[data-save-trigger]') as HTMLButtonElement
                saveBtn?.click()
              }}
              className="bg-gradient-to-r from-[#00AEEF] to-[#8B5CF6] text-white font-semibold text-sm flex items-center gap-1.5 px-6 py-2.5 rounded-xl hover:scale-[1.02] transition-all duration-200 shadow-[0_4px_20px_rgba(0,174,239,0.3)]"
            >
              <Check size={16} /> Finish &amp; Save
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
