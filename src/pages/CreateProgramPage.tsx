import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  X,
  ChevronDown,
  GripVertical,
  Dumbbell,
  Clock,
  Calendar,
  Layers,
  Save,
  Check,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  PROGRAM_TEMPLATES,
  CATEGORY_COLORS,
  LEVEL_COLORS,
  SPLIT_OPTIONS,
  DAY_NAMES,
  DEFAULT_PHASES,
} from '@/data/programTemplates'
import type { ProgramTemplate, PhaseConfig } from '@/data/programTemplates'
import { getClients, getCurrentCoach } from '@/lib/auth'
import { saveProgram } from '@/lib/db'
import type { ProgramData } from '@/types'

// ═══════════════════════════════════════════════════════════
// INLINE TYPES
// ═══════════════════════════════════════════════════════════

interface ExerciseFromDB {
  ExerciseID: string
  Name: string
  MuscleGroup: string
  Equipment: string
  Difficulty: string
  Type: string
  VideoURL: string
  Description: string
}

interface DayExerciseEntry {
  exerciseId: string
  name: string
  muscleGroup: string
  sets: number
  reps: string
  restSeconds: number
  phase: string
  notes: string
}

interface WizardState {
  step: number
  clientId: string
  clientName: string
  clientGoal: string
  clientLevel: string
  clientEquipment: string
  selectedTemplate: ProgramTemplate | null
  programName: string
  split: string
  trainingDays: string[]
  dayNames: Record<string, string>
  phases: PhaseConfig[]
  dayExercises: Record<string, DayExerciseEntry[]>
  exercises: ExerciseFromDB[]
  searchQuery: string
  activeCategory: string
  activeMuscle: string
  activeEquipment: string
  activeDay: string
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const MUSCLE_OPTIONS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
const EQUIPMENT_OPTIONS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Bodyweight', 'Machine']
const CATEGORY_OPTIONS = [
  'All',
  'Strength',
  'Hypertrophy',
  'Fat Loss',
  'Endurance',
  'Performance',
  'Recovery',
  'Powerlifting',
  'Bodybuilding',
]

const STEP_LABELS = ['Templates', 'Split', 'Phases', 'Exercises', 'Review']

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

// Programs are now saved via Supabase — see saveProgram() in @/lib/db

function getMuscleCategory(muscleGroup: string): string {
  const m = muscleGroup.toLowerCase()
  if (m.includes('chest') || m.includes('serratus')) return 'Chest'
  if (
    m.includes('back') ||
    m.includes('posterior chain') ||
    m.includes('trap') ||
    m.includes('rear delt') ||
    m.includes('lat')
  )
    return 'Back'
  if (
    m.includes('quad') ||
    m.includes('glute') ||
    m.includes('hamstring') ||
    m.includes('calf') ||
    m.includes('leg') ||
    m.includes('adductor') ||
    m.includes('shin')
  )
    return 'Legs'
  if (m.includes('shoulder') || m.includes('rotator cuff')) return 'Shoulders'
  if (m.includes('bicep') || m.includes('tricep') || m.includes('forearm') || m.includes('grip') || m.includes('arm'))
    return 'Arms'
  if (
    m.includes('core') ||
    m.includes('ab') ||
    m.includes('oblique') ||
    m.includes('spinal') ||
    m.includes('spine') ||
    m.includes('lower back')
  )
    return 'Core'
  return 'Other'
}

function getEquipmentCategory(equipment: string): string {
  const e = equipment.toLowerCase()
  if (e.includes('barbell') || e.includes('ez') || e.includes('trap bar') || e.includes('axle') || e.includes('log'))
    return 'Barbell'
  if (e.includes('dumbbell')) return 'Dumbbell'
  if (e.includes('cable')) return 'Cable'
  if (e.includes('bodyweight') || e.includes('sissy')) return 'Bodyweight'
  if (
    e.includes('machine') ||
    e.includes('leg press') ||
    e.includes('leg curl') ||
    e.includes('leg extension') ||
    e.includes('hack squat') ||
    e.includes('belt squat')
  )
    return 'Machine'
  return 'Other'
}

function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner':
      return '#22C55E'
    case 'Intermediate':
      return '#F59E0B'
    case 'Advanced':
      return '#EF4444'
    default:
      return '#9CA3AF'
  }
}

function getDefaultDaysFromTemplate(template: ProgramTemplate | null): { trainingDays: string[]; dayNames: Record<string, string> } {
  if (!template) {
    return {
      trainingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
      dayNames: {
        Mon: 'Upper Body',
        Tue: 'Lower Body',
        Wed: 'Rest',
        Thu: 'Upper Body',
        Fri: 'Lower Body',
        Sat: 'Rest',
        Sun: 'Rest',
      },
    }
  }
  const freq = template.frequency
  const days: string[] = []
  if (freq >= 1) days.push('Mon')
  if (freq >= 2) days.push('Tue')
  if (freq >= 3) days.push('Wed')
  if (freq >= 4) days.push('Thu')
  if (freq >= 5) days.push('Fri')
  if (freq >= 6) days.push('Sat')
  if (freq >= 7) days.push('Sun')
  const dayNames: Record<string, string> = {}
  DAY_NAMES.forEach((d) => {
    dayNames[d] = days.includes(d) ? `${template.split} — ${d}` : 'Rest'
  })
  return { trainingDays: days, dayNames }
}

function buildProgramData(state: WizardState): ProgramData {
  const totalExercises = Object.values(state.dayExercises).reduce((sum, arr) => sum + arr.length, 0)
  return {
    id: `prog_${Date.now()}`,
    goal: state.clientGoal || state.selectedTemplate?.focus || 'Strength',
    method: state.selectedTemplate?.category || 'Custom',
    clientContext: {
      ageRange: '25-35',
      experience: state.clientLevel || 'Intermediate',
      bodyType: 'Mesomorph',
      availability: `${state.trainingDays.length} days/week`,
      limitations: [],
      otherLimitation: '',
    },
    phases: state.phases.map((p, i) => ({
      id: `phase_${i}`,
      name: p.name,
      weeks: p.weeks,
      focus: p.intensity,
      color: p.color,
      active: true,
    })),
    weeklyHours: state.trainingDays.length * 1.25,
    split: DAY_NAMES.map((d) => ({
      day: d,
      active: state.trainingDays.includes(d),
      workout: state.dayNames[d] || (state.trainingDays.includes(d) ? 'Training' : 'Rest'),
    })),
    exercises: [],
    programName: state.programName,
    description: state.selectedTemplate?.description || 'Custom program',
    tags: [state.split, state.clientGoal].filter(Boolean),
    isPublic: false,
    assignedClient: state.clientId,
    template: state.selectedTemplate?.id || 'custom',
    clientProfile: {
      experience: state.clientLevel,
      equipment: state.clientEquipment,
      timePerSession: 60,
    },
    totalSets: totalExercises,
    days: Object.entries(state.dayExercises)
      .filter(([day]) => state.trainingDays.includes(day))
      .sort(([a], [b]) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b))
      .map(([day, exs], idx) => ({
        day,
        dayNumber: idx + 1,
        method: state.split,
        exercises: exs.map((e, i) => ({
          code: `${String.fromCharCode(65 + i)}1`,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          pct1RM: 'N/A',
          tempo: state.phases.find((p) => p.name === e.phase)?.tempo || '2-0-1-0',
          rest: `${e.restSeconds}s`,
        })),
      })),
  }
}

// ═══════════════════════════════════════════════════════════
// STEP 1: TEMPLATE SELECTION
// ═══════════════════════════════════════════════════════════

function Step1TemplateSelection({
  state,
  updateState,
}: {
  state: WizardState
  updateState: (partial: Partial<WizardState>) => void
}) {
  const [previewTemplate, setPreviewTemplate] = useState<ProgramTemplate | null>(null)
  const allClients = useMemo(() => getClients(), [])

  const filteredTemplates = useMemo(() => {
    let result = [...PROGRAM_TEMPLATES]
    if (state.activeCategory !== 'All') {
      result = result.filter((t) => t.category === state.activeCategory)
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase()
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      )
    }
    if (state.clientGoal || state.clientLevel || state.clientEquipment) {
      result.sort((a, b) => {
        let scoreA = 0
        let scoreB = 0
        if (state.clientGoal) {
          const g = state.clientGoal.toLowerCase()
          if (a.focus.toLowerCase().includes(g) || a.category.toLowerCase().includes(g)) scoreA += 3
          if (b.focus.toLowerCase().includes(g) || b.category.toLowerCase().includes(g)) scoreB += 3
        }
        if (state.clientLevel) {
          const l = state.clientLevel.toLowerCase()
          if (a.level.toLowerCase() === l) scoreA += 2
          if (b.level.toLowerCase() === l) scoreB += 2
        }
        if (state.clientEquipment) {
          const eq = state.clientEquipment.toLowerCase()
          if (a.equipment.toLowerCase().includes(eq)) scoreA += 1
          if (b.equipment.toLowerCase().includes(eq)) scoreB += 1
        }
        return scoreB - scoreA
      })
    }
    return result
  }, [state.activeCategory, state.searchQuery, state.clientGoal, state.clientLevel, state.clientEquipment])

  const handleSelectTemplate = useCallback(
    (template: ProgramTemplate) => {
      const defaults = getDefaultDaysFromTemplate(template)
      updateState({
        selectedTemplate: template,
        programName: template.name,
        split: SPLIT_OPTIONS.includes(template.split) ? template.split : 'Custom',
        trainingDays: defaults.trainingDays,
        dayNames: defaults.dayNames,
        phases: DEFAULT_PHASES.map((p) => ({ ...p })),
        activeDay: defaults.trainingDays[0] || 'Mon',
        step: 2,
      })
    },
    [updateState]
  )

  const handleStartFromScratch = useCallback(() => {
    const defaults = getDefaultDaysFromTemplate(null)
    updateState({
      selectedTemplate: null,
      programName: 'Custom Program',
      split: 'Upper/Lower',
      trainingDays: defaults.trainingDays,
      dayNames: defaults.dayNames,
      phases: DEFAULT_PHASES.map((p) => ({ ...p })),
      activeDay: defaults.trainingDays[0] || 'Mon',
      step: 2,
    })
  }, [updateState])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            Create Program {state.clientName ? `for ${state.clientName}` : ''}
          </h2>
          {state.clientGoal && (
            <Badge className="mt-2 bg-[#00AEEF]/10 text-[#00AEEF] border-[#00AEEF]/30">
              {state.clientGoal}
            </Badge>
          )}
        </div>
      </div>

      {/* Client selector */}
      {!state.clientId && (
        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-4">
          <label className="text-sm text-[#9CA3AF] mb-1.5 block font-medium">Select Client</label>
          <select
            className="w-full max-w-sm bg-[#0B1120] border border-gray-200 dark:border-[#2A3A50] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00AEEF]"
            value={state.clientId}
            onChange={(e) => {
              const cid = e.target.value
              if (!cid) {
                updateState({
                  clientId: '',
                  clientName: '',
                  clientGoal: '',
                  clientLevel: '',
                  clientEquipment: '',
                })
                return
              }
              const client = allClients.find((c) => c.id === cid)
              if (client) {
                updateState({
                  clientId: cid,
                  clientName: client.personal.fullName,
                  clientGoal: client.goals.primary || '',
                  clientLevel: client.goals.experienceLevel || '',
                  clientEquipment: client.goals.equipment?.[0] || '',
                })
              }
            }}
          >
            <option value="">— Select a client —</option>
            {allClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.personal.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Auto-filter pills */}
      {(state.clientGoal || state.clientLevel || state.clientEquipment) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#9CA3AF]">Showing templates matching:</span>
          {state.clientGoal && (
            <Badge variant="outline" className="text-xs border-gray-200 dark:border-[#2A3A50] text-[#00AEEF] bg-[#00AEEF]/5">
              {state.clientGoal}
            </Badge>
          )}
          {state.clientLevel && (
            <Badge variant="outline" className="text-xs border-gray-200 dark:border-[#2A3A50] text-[#F59E0B] bg-[#F59E0B]/5">
              {state.clientLevel}
            </Badge>
          )}
          {state.clientEquipment && (
            <Badge variant="outline" className="text-xs border-gray-200 dark:border-[#2A3A50] text-[#22C55E] bg-[#22C55E]/5">
              {state.clientEquipment}
            </Badge>
          )}
        </div>
      )}

      {/* Search + Category filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input
            placeholder="Search templates..."
            value={state.searchQuery}
            onChange={(e) => updateState({ searchQuery: e.target.value })}
            className="pl-10 bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] text-white placeholder:text-[#6B7280]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => updateState({ activeCategory: cat })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                state.activeCategory === cat
                  ? 'bg-[#00AEEF] border-[#00AEEF] text-white'
                  : 'bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:border-[#3A4A60]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-4 flex flex-col gap-3 hover:border-[#3A4A60] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2 flex-wrap">
                <Badge
                  className="text-[10px] border-0"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[template.category] || '#00AEEF'}20`,
                    color: CATEGORY_COLORS[template.category] || '#00AEEF',
                  }}
                >
                  {template.category}
                </Badge>
                <Badge
                  className="text-[10px] border-0"
                  style={{
                    backgroundColor: `${LEVEL_COLORS[template.level] || '#9CA3AF'}20`,
                    color: LEVEL_COLORS[template.level] || '#9CA3AF',
                  }}
                >
                  {template.level}
                </Badge>
              </div>
            </div>
            <h3 className="text-white font-semibold text-sm">{template.name}</h3>
            <p className="text-[#9CA3AF] text-xs leading-relaxed line-clamp-2">{template.description}</p>
            <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-[#9CA3AF]">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#6B7280]" />
                {template.durationWeeks} weeks
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#6B7280]" />
                {template.frequency}x/week
              </div>
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#6B7280]" />
                {template.split}
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3 text-[#6B7280]" />
                {template.equipment}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#6B7280]">Sets:</span>
                {template.sets}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#6B7280]">Reps:</span>
                {template.reps}
              </div>
            </div>
            <div className="flex gap-2 mt-auto pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:bg-[#1A2535] text-xs"
                onClick={() => setPreviewTemplate(template)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-[#00AEEF] hover:bg-[#0095CC] text-white text-xs"
                onClick={() => handleSelectTemplate(template)}
              >
                <Check className="w-3 h-3 mr-1" />
                Select
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-[#9CA3AF]">
          <Search className="w-8 h-8 mx-auto mb-3 text-[#4B5563]" />
          <p className="text-sm">No templates match your filters.</p>
        </div>
      )}

      {/* Start from scratch */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#2A3A50]">
        <Button
          variant="outline"
          className="w-full border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:bg-[#1A2535] hover:text-white"
          onClick={handleStartFromScratch}
        >
          <Plus className="w-4 h-4 mr-2" />
          Start from Scratch
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{previewTemplate?.name}</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              {previewTemplate?.category} • {previewTemplate?.level}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-900 dark:text-[#F0F0F0]">
            <p>{previewTemplate?.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#9CA3AF]">
              <div>Duration: {previewTemplate?.durationWeeks} weeks</div>
              <div>Frequency: {previewTemplate?.frequency}x/week</div>
              <div>Split: {previewTemplate?.split}</div>
              <div>Equipment: {previewTemplate?.equipment}</div>
              <div>Sets: {previewTemplate?.sets}</div>
              <div>Reps: {previewTemplate?.reps}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF]" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            {previewTemplate && (
              <Button size="sm" className="bg-[#00AEEF] hover:bg-[#0095CC] text-white" onClick={() => { handleSelectTemplate(previewTemplate); setPreviewTemplate(null); }}>
                Select Template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 2: TRAINING SPLIT CONFIGURATION
// ═══════════════════════════════════════════════════════════

function Step2SplitConfig({
  state,
  updateState,
}: {
  state: WizardState
  updateState: (partial: Partial<WizardState>) => void
}) {
  const handleSelectSplit = useCallback(
    (split: string) => {
      updateState({ split })
    },
    [updateState]
  )

  const toggleDay = useCallback(
    (day: string) => {
      const isActive = state.trainingDays.includes(day)
      const newTrainingDays = isActive
        ? state.trainingDays.filter((d) => d !== day)
        : [...state.trainingDays, day]
      const sorted = newTrainingDays.sort((a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b))
      updateState({
        trainingDays: sorted,
        activeDay: sorted.includes(state.activeDay) ? state.activeDay : sorted[0] || '',
      })
    },
    [state.trainingDays, state.activeDay, updateState]
  )

  const updateDayName = useCallback(
    (day: string, value: string) => {
      updateState({
        dayNames: { ...state.dayNames, [day]: value },
      })
    },
    [state.dayNames, updateState]
  )

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-[#9CA3AF] mb-1.5 block font-medium">Program Name</label>
        <Input
          value={state.programName}
          onChange={(e) => updateState({ programName: e.target.value })}
          className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] text-white"
        />
        {state.selectedTemplate && (
          <p className="text-xs text-[#6B7280] mt-1">Based on: {state.selectedTemplate.name}</p>
        )}
      </div>

      {/* Split type selector */}
      <div>
        <label className="text-sm text-[#9CA3AF] mb-2 block font-medium">Split Type</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SPLIT_OPTIONS.map((split) => (
            <button
              key={split}
              onClick={() => handleSelectSplit(split)}
              className={cn(
                'shrink-0 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                state.split === split
                  ? 'bg-[#00AEEF] border-[#00AEEF] text-white shadow-lg shadow-[#00AEEF]/20'
                  : 'bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:border-[#3A4A60]'
              )}
            >
              {split}
            </button>
          ))}
        </div>
      </div>

      {/* Day selector */}
      <div>
        <label className="text-sm text-[#9CA3AF] mb-2 block font-medium">Training Days</label>
        <div className="grid grid-cols-7 gap-2">
          {DAY_NAMES.map((day) => {
            const isActive = state.trainingDays.includes(day)
            return (
              <div
                key={day}
                className={cn(
                  'rounded-xl border p-2 transition-all',
                  isActive
                    ? 'border-[#00AEEF] bg-[#00AEEF]/5'
                    : 'border-gray-200 dark:border-[#2A3A50] bg-white dark:bg-[#151D2E] opacity-60'
                )}
              >
                <button
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'w-full text-center text-sm font-bold mb-2 transition-colors',
                    isActive ? 'text-[#00AEEF]' : 'text-[#6B7280]'
                  )}
                >
                  {day}
                </button>
                {isActive ? (
                  <Input
                    value={state.dayNames[day] || ''}
                    onChange={(e) => updateDayName(day, e.target.value)}
                    className="h-7 text-[11px] bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white text-center px-1"
                    placeholder="Workout name"
                  />
                ) : (
                  <div className="h-7 flex items-center justify-center text-[11px] text-[#4B5563]">Rest</div>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-sm text-[#9CA3AF] mt-3">
          <span className="text-[#00AEEF] font-bold">{state.trainingDays.length}</span> training days selected
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 3: PHASE CONFIGURATION
// ═══════════════════════════════════════════════════════════

function Step3PhaseConfig({
  state,
  updateState,
}: {
  state: WizardState
  updateState: (partial: Partial<WizardState>) => void
}) {
  const updatePhase = useCallback(
    (idx: number, field: keyof PhaseConfig, value: string | number) => {
      const newPhases = state.phases.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
      updateState({ phases: newPhases })
    },
    [state.phases, updateState]
  )

  const addPhase = useCallback(() => {
    const last = state.phases[state.phases.length - 1]
    const newPhase: PhaseConfig = last
      ? { ...last, name: `${last.name} (Copy)` }
      : { name: 'New Phase', weeks: 3, sets: '3', reps: '8-10', intensity: '75% 1RM', restSeconds: 90, tempo: '2-0-1-0', color: '#00AEEF' }
    updateState({ phases: [...state.phases, newPhase] })
  }, [state.phases, updateState])

  const removePhase = useCallback(
    (idx: number) => {
      if (state.phases.length <= 1) {
        toast.error('You must have at least one phase.')
        return
      }
      const newPhases = state.phases.filter((_, i) => i !== idx)
      updateState({ phases: newPhases })
    },
    [state.phases, updateState]
  )

  const totalWeeks = useMemo(() => state.phases.reduce((sum, p) => sum + p.weeks, 0), [state.phases])

  return (
    <div className="space-y-6">
      {/* Phase cards */}
      <div className="space-y-4">
        {state.phases.map((phase, idx) => (
          <Card key={idx} className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] p-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
              <Input
                value={phase.name}
                onChange={(e) => updatePhase(idx, 'name', e.target.value)}
                className="h-8 text-sm bg-transparent border-none text-white font-semibold px-0 max-w-[200px]"
              />
              <button
                onClick={() => removePhase(idx)}
                className="ml-auto p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-[#6B7280] hover:text-[#EF4444] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase font-medium block mb-1">Weeks</label>
                <Input
                  type="number"
                  value={phase.weeks}
                  onChange={(e) => updatePhase(idx, 'weeks', Number(e.target.value))}
                  className="h-8 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase font-medium block mb-1">Sets</label>
                <Input
                  value={phase.sets}
                  onChange={(e) => updatePhase(idx, 'sets', e.target.value)}
                  className="h-8 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase font-medium block mb-1">Reps</label>
                <Input
                  value={phase.reps}
                  onChange={(e) => updatePhase(idx, 'reps', e.target.value)}
                  className="h-8 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase font-medium block mb-1">Intensity</label>
                <Input
                  value={phase.intensity}
                  onChange={(e) => updatePhase(idx, 'intensity', e.target.value)}
                  className="h-8 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase font-medium block mb-1">Rest (s)</label>
                <Input
                  type="number"
                  value={phase.restSeconds}
                  onChange={(e) => updatePhase(idx, 'restSeconds', Number(e.target.value))}
                  className="h-8 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase font-medium block mb-1">Tempo</label>
                <Input
                  value={phase.tempo}
                  onChange={(e) => updatePhase(idx, 'tempo', e.target.value)}
                  className="h-8 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Phase timeline */}
      <div>
        <label className="text-sm text-[#9CA3AF] mb-2 block font-medium">
          Phase Timeline ({totalWeeks} weeks)
        </label>
        <div className="flex h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A3A50]">
          {state.phases.map((phase, i) => {
            const pct = totalWeeks > 0 ? (phase.weeks / totalWeeks) * 100 : 0
            return (
              <motion.div
                key={i}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
                className="h-full flex items-center justify-center text-xs font-bold text-white truncate px-1"
                style={{ backgroundColor: phase.color }}
              >
                {pct > 15 ? `${phase.name} (${phase.weeks}w)` : `${phase.weeks}w`}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:bg-[#1A2535]"
          onClick={addPhase}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Phase
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 4: EXERCISE SELECTION
// ═══════════════════════════════════════════════════════════

const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#EF4444',
  Back: '#3B82F6',
  Legs: '#22C55E',
  Shoulders: '#F59E0B',
  Arms: '#8B5CF6',
  Core: '#06B6D4',
  Other: '#6B7280',
}

function Step4ExerciseSelection({
  state,
  updateState,
}: {
  state: WizardState
  updateState: (partial: Partial<WizardState>) => void
}) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [duplicateTarget, setDuplicateTarget] = useState('')

  const filteredExercises = useMemo(() => {
    let result = [...state.exercises]
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase()
      result = result.filter((e) => e.Name.toLowerCase().includes(q))
    }
    if (state.activeMuscle !== 'All') {
      result = result.filter((e) => getMuscleCategory(e.MuscleGroup) === state.activeMuscle)
    }
    if (state.activeEquipment !== 'All') {
      result = result.filter((e) => getEquipmentCategory(e.Equipment) === state.activeEquipment)
    }
    return result
  }, [state.exercises, state.searchQuery, state.activeMuscle, state.activeEquipment])

  const currentExercises = useMemo(() => state.dayExercises[state.activeDay] || [], [state.dayExercises, state.activeDay])

  const addExercise = useCallback(
    (ex: ExerciseFromDB) => {
      const entry: DayExerciseEntry = {
        exerciseId: ex.ExerciseID,
        name: ex.Name,
        muscleGroup: ex.MuscleGroup,
        sets: 3,
        reps: '10',
        restSeconds: state.phases[0]?.restSeconds || 90,
        phase: state.phases[0]?.name || 'Accumulation',
        notes: ex.Description,
      }
      updateState({
        dayExercises: {
          ...state.dayExercises,
          [state.activeDay]: [...currentExercises, entry],
        },
      })
    },
    [currentExercises, state.phases, state.activeDay, state.dayExercises, updateState]
  )

  const updateExerciseField = useCallback(
    (idx: number, field: keyof DayExerciseEntry, value: string | number) => {
      const updated = [...currentExercises]
      updated[idx] = { ...updated[idx], [field]: value }
      updateState({
        dayExercises: { ...state.dayExercises, [state.activeDay]: updated },
      })
    },
    [currentExercises, state.dayExercises, state.activeDay, updateState]
  )

  const removeExercise = useCallback(
    (idx: number) => {
      const updated = currentExercises.filter((_, i) => i !== idx)
      updateState({
        dayExercises: { ...state.dayExercises, [state.activeDay]: updated },
      })
    },
    [currentExercises, state.dayExercises, state.activeDay, updateState]
  )

  const clearDay = useCallback(() => {
    updateState({
      dayExercises: { ...state.dayExercises, [state.activeDay]: [] },
    })
  }, [state.dayExercises, state.activeDay, updateState])

  const handleDuplicate = useCallback(() => {
    if (!duplicateTarget || duplicateTarget === state.activeDay) return
    const source = state.dayExercises[state.activeDay] || []
    updateState({
      dayExercises: {
        ...state.dayExercises,
        [duplicateTarget]: source.map((e) => ({ ...e })),
      },
    })
    setShowDuplicate(false)
    setDuplicateTarget('')
    toast.success(`Copied to ${duplicateTarget}`)
  }, [duplicateTarget, state.activeDay, state.dayExercises, updateState])

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left panel */}
      <div className="lg:w-[40%] flex flex-col gap-3 bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input
            placeholder="Search exercises..."
            value={state.searchQuery}
            onChange={(e) => updateState({ searchQuery: e.target.value })}
            className="pl-10 bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white placeholder:text-[#6B7280]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MUSCLE_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => updateState({ activeMuscle: m })}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border',
                state.activeMuscle === m
                  ? 'bg-[#00AEEF] border-[#00AEEF] text-white'
                  : 'bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF]'
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button
              key={eq}
              onClick={() => updateState({ activeEquipment: eq })}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border',
                state.activeEquipment === eq
                  ? 'bg-[#00AEEF] border-[#00AEEF] text-white'
                  : 'bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF]'
              )}
            >
              {eq}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredExercises.map((ex) => (
            <div
              key={ex.ExerciseID}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0B1120] border border-gray-200 dark:border-[#2A3A50] hover:border-[#3A4A60] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#4B5563] font-mono">{ex.ExerciseID}</span>
                  <span className="text-sm font-semibold text-white truncate">{ex.Name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    className="text-[10px] border-0"
                    style={{
                      backgroundColor: `${MUSCLE_COLORS[getMuscleCategory(ex.MuscleGroup)] || '#6B7280'}20`,
                      color: MUSCLE_COLORS[getMuscleCategory(ex.MuscleGroup)] || '#6B7280',
                    }}
                  >
                    {getMuscleCategory(ex.MuscleGroup)}
                  </Badge>
                  <span className="text-[10px] text-[#6B7280]">{ex.Equipment}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: difficultyColor(ex.Difficulty) }}
                    title={ex.Difficulty}
                  />
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-200 dark:border-[#2A3A50] text-[#00AEEF] hover:bg-[#00AEEF]/10 h-7 w-7 p-0"
                onClick={() => addExercise(ex)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {filteredExercises.length === 0 && (
            <div className="text-center py-8 text-[#6B7280] text-sm">No exercises found.</div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="lg:w-[60%] flex flex-col gap-3 bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-4">
        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {state.trainingDays.map((day) => (
            <button
              key={day}
              onClick={() => updateState({ activeDay: day })}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 border',
                state.activeDay === day
                  ? 'bg-[#00AEEF] border-[#00AEEF] text-white'
                  : 'bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF]'
              )}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Current day label */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">{state.activeDay}</h3>
            <p className="text-xs text-[#9CA3AF]">{state.dayNames[state.activeDay] || 'Rest'}</p>
          </div>
          <span className="text-xs text-[#9CA3AF]">{currentExercises.length} exercises</span>
        </div>

        {/* Exercise table */}
        <div className="flex-1 overflow-y-auto">
          {currentExercises.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#6B7280] gap-2">
              <Dumbbell className="w-8 h-8" />
              <p className="text-sm">No exercises added yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9CA3AF] text-xs border-b border-gray-200 dark:border-[#2A3A50]">
                  <th className="pb-2 w-6"></th>
                  <th className="pb-2">Exercise</th>
                  <th className="pb-2 w-14">Sets</th>
                  <th className="pb-2 w-16">Reps</th>
                  <th className="pb-2 w-16">Rest</th>
                  <th className="pb-2 w-20">Phase</th>
                  <th className="pb-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {currentExercises.map((ex, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-[#2A3A50]/40 group">
                    <td className="py-2">
                      <GripVertical className="w-3 h-3 text-[#4B5563]" />
                    </td>
                    <td className="py-2">
                      <div className="font-medium text-white text-xs">{ex.name}</div>
                      <AnimatePresence>
                        {expandedRows[i] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[11px] text-[#9CA3AF] mt-1">{ex.notes}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateExerciseField(i, 'sets', Number(e.target.value))}
                        className="h-7 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white px-1"
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        value={ex.reps}
                        onChange={(e) => updateExerciseField(i, 'reps', e.target.value)}
                        className="h-7 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white px-1"
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={ex.restSeconds}
                        onChange={(e) => updateExerciseField(i, 'restSeconds', Number(e.target.value))}
                        className="h-7 text-xs bg-[#0B1120] border-gray-200 dark:border-[#2A3A50] text-white px-1"
                      />
                    </td>
                    <td className="py-2">
                      <select
                        value={ex.phase}
                        onChange={(e) => updateExerciseField(i, 'phase', e.target.value)}
                        className="w-full h-7 text-[10px] bg-[#0B1120] border border-gray-200 dark:border-[#2A3A50] text-white rounded px-1"
                      >
                        {state.phases.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setExpandedRows((prev) => ({ ...prev, [i]: !prev[i] }))}
                          className="p-1 rounded hover:bg-[#2A3A50] transition-colors"
                        >
                          <ChevronDown
                            className={cn(
                              'w-3 h-3 text-[#6B7280] transition-transform',
                              expandedRows[i] && 'rotate-180'
                            )}
                          />
                        </button>
                        <button
                          onClick={() => removeExercise(i)}
                          className="p-1 rounded hover:bg-[#EF4444]/10 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-[#2A3A50]">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:bg-[#1A2535] text-xs"
            onClick={() => updateState({ searchQuery: '' })}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Exercise
          </Button>
          {!showDuplicate ? (
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:bg-[#1A2535] text-xs"
              onClick={() => setShowDuplicate(true)}
            >
              Duplicate Day
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={duplicateTarget}
                onChange={(e) => setDuplicateTarget(e.target.value)}
                className="h-7 text-xs bg-[#0B1120] border border-gray-200 dark:border-[#2A3A50] text-white rounded px-2"
              >
                <option value="">To day...</option>
                {state.trainingDays
                  .filter((d) => d !== state.activeDay)
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
              <Button
                size="sm"
                className="h-7 bg-[#00AEEF] hover:bg-[#0095CC] text-white text-xs px-2"
                onClick={handleDuplicate}
                disabled={!duplicateTarget}
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] text-xs px-2"
                onClick={() => {
                  setShowDuplicate(false)
                  setDuplicateTarget('')
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 text-xs ml-auto"
            onClick={clearDay}
          >
            <X className="w-3 h-3 mr-1" />
            Clear Day
          </Button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 5: REVIEW & SAVE
// ═══════════════════════════════════════════════════════════

function Step5ReviewSave({
  state,
  updateState,
  onSave,
}: {
  state: WizardState
  updateState: (partial: Partial<WizardState>) => void
  onSave: () => void
}) {
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({})
  const totalExercises = Object.values(state.dayExercises).reduce((sum, arr) => sum + arr.length, 0)
  const totalWeeks = state.phases.reduce((sum, p) => sum + p.weeks, 0)

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-[#9CA3AF] mb-1.5 block font-medium">Program Name</label>
        <Input
          value={state.programName}
          onChange={(e) => updateState({ programName: e.target.value })}
          className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] text-white"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] p-4 gap-2">
          <Clock className="w-4 h-4 text-[#00AEEF]" />
          <div className="text-2xl font-bold text-white">{totalWeeks}</div>
          <div className="text-xs text-[#9CA3AF]">Weeks</div>
        </Card>
        <Card className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] p-4 gap-2">
          <Calendar className="w-4 h-4 text-[#00AEEF]" />
          <div className="text-2xl font-bold text-white">{state.trainingDays.length}</div>
          <div className="text-xs text-[#9CA3AF]">Days/Week</div>
        </Card>
        <Card className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] p-4 gap-2">
          <Layers className="w-4 h-4 text-[#00AEEF]" />
          <div className="text-lg font-bold text-white truncate">{state.split}</div>
          <div className="text-xs text-[#9CA3AF]">Split</div>
        </Card>
        <Card className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] p-4 gap-2">
          <Dumbbell className="w-4 h-4 text-[#00AEEF]" />
          <div className="text-2xl font-bold text-white">{totalExercises}</div>
          <div className="text-xs text-[#9CA3AF]">Total Exercises</div>
        </Card>
        <Card className="bg-white dark:bg-[#151D2E] border-gray-200 dark:border-[#2A3A50] p-4 gap-2">
          <Clock className="w-4 h-4 text-[#00AEEF]" />
          <div className="text-2xl font-bold text-white">~{Math.round(state.trainingDays.length * 1.25 * 60)}</div>
          <div className="text-xs text-[#9CA3AF]">Est. Min/Week</div>
        </Card>
      </div>

      {/* Phase breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Phase Breakdown</h3>
        <div className="flex h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A3A50]">
          {state.phases.map((phase, i) => {
            const pct = totalWeeks > 0 ? (phase.weeks / totalWeeks) * 100 : 0
            return (
              <div
                key={i}
                className="h-full flex items-center justify-center text-xs font-bold text-white truncate px-2"
                style={{ width: `${pct}%`, backgroundColor: phase.color }}
              >
                {pct > 12 ? `${phase.name} (${phase.weeks}w)` : `${phase.weeks}w`}
              </div>
            )
          })}
        </div>
      </div>

      {/* Day-by-day summary */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white mb-2">Day-by-Day Summary</h3>
        {state.trainingDays.map((day) => {
          const exs = state.dayExercises[day] || []
          const open = openDays[day]
          return (
            <div key={day} className="border border-gray-200 dark:border-[#2A3A50] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenDays((prev) => ({ ...prev, [day]: !prev[day] }))}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#151D2E] hover:bg-[#1A2535] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{day}</span>
                  <span className="text-xs text-[#9CA3AF]">{state.dayNames[day]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF]">
                    {exs.length} exercises
                  </Badge>
                  <ChevronDown
                    className={cn('w-4 h-4 text-[#9CA3AF] transition-transform', open && 'rotate-180')}
                  />
                </div>
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2 bg-[#0B1120]">
                      {exs.length === 0 ? (
                        <p className="text-xs text-[#6B7280]">No exercises.</p>
                      ) : (
                        exs.map((e, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-white">{e.name}</span>
                            <span className="text-[#9CA3AF]">
                              {e.sets} x {e.reps} • {e.restSeconds}s
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Save */}
      <Button
        className="w-full bg-[#00AEEF] hover:bg-[#0095CC] text-white font-semibold py-3 h-auto"
        onClick={onSave}
      >
        <Save className="w-4 h-4 mr-2" />
        Save Program
      </Button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function CreateProgramPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [state, setState] = useState<WizardState>({
    step: 1,
    clientId: '',
    clientName: '',
    clientGoal: '',
    clientLevel: '',
    clientEquipment: '',
    selectedTemplate: null,
    programName: '',
    split: SPLIT_OPTIONS[0],
    trainingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    dayNames: {
      Mon: 'Upper Body',
      Tue: 'Lower Body',
      Wed: 'Rest',
      Thu: 'Upper Body',
      Fri: 'Lower Body',
      Sat: 'Rest',
      Sun: 'Rest',
    },
    phases: DEFAULT_PHASES.map((p) => ({ ...p })),
    dayExercises: {},
    exercises: [],
    searchQuery: '',
    activeCategory: 'All',
    activeMuscle: 'All',
    activeEquipment: 'All',
    activeDay: 'Mon',
  })

  // Load exercises
  useEffect(() => {
    fetch('/exercises_db.json')
      .then((r) => r.json())
      .then((data: ExerciseFromDB[]) => setState((p) => ({ ...p, exercises: data })))
      .catch(() => toast.error('Failed to load exercise database'))
  }, [])

  // Load client from URL
  useEffect(() => {
    const cid = searchParams.get('clientId')
    if (cid) {
      const clients = getClients()
      const client = clients.find((c) => c.id === cid)
      if (client) {
        queueMicrotask(() => {
          setState((p) => ({
            ...p,
            clientId: cid,
            clientName: client.personal.fullName,
            clientGoal: client.goals.primary || '',
            clientLevel: client.goals.experienceLevel || '',
            clientEquipment: client.goals.equipment?.[0] || '',
          }))
        })
      }
    }
  }, [searchParams])

  const updateState = useCallback((partial: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleSave = useCallback(async () => {
    const programData = buildProgramData(state)
    await saveProgram({
      coachId: getCurrentCoach()?.id || '',
      clientId: state.clientId || null,
      name: programData.programName || 'Untitled Program',
      description: programData.description || '',
      data: programData,
    })
    toast.success('Program saved successfully!')
    navigate('/programs')
  }, [state, navigate])

  const goNext = useCallback(() => {
    setState((p) => ({ ...p, step: Math.min(p.step + 1, 5) }))
  }, [])

  const goBack = useCallback(() => {
    setState((p) => ({ ...p, step: Math.max(p.step - 1, 1) }))
  }, [])

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1
            const isActive = state.step === stepNum
            const isComplete = state.step > stepNum
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                      isActive
                        ? 'bg-[#00AEEF] text-white'
                        : isComplete
                          ? 'bg-[#22C55E] text-white'
                          : 'bg-white dark:bg-[#151D2E] text-[#6B7280] border border-gray-200 dark:border-[#2A3A50]'
                    )}
                  >
                    {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium hidden sm:block',
                      isActive ? 'text-[#00AEEF]' : 'text-[#6B7280]'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-colors',
                      state.step > stepNum ? 'bg-[#22C55E]' : 'bg-[#2A3A50]'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {state.step === 1 && <Step1TemplateSelection state={state} updateState={updateState} />}
            {state.step === 2 && <Step2SplitConfig state={state} updateState={updateState} />}
            {state.step === 3 && <Step3PhaseConfig state={state} updateState={updateState} />}
            {state.step === 4 && <Step4ExerciseSelection state={state} updateState={updateState} />}
            {state.step === 5 && <Step5ReviewSave state={state} updateState={updateState} onSave={handleSave} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {state.step > 1 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-[#2A3A50]">
            <Button
              variant="outline"
              className="border-gray-200 dark:border-[#2A3A50] text-[#9CA3AF] hover:bg-[#1A2535]"
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back: {STEP_LABELS[state.step - 2]}
            </Button>
            {state.step < 5 && (
              <Button className="bg-[#00AEEF] hover:bg-[#0095CC] text-white" onClick={goNext}>
                Next: {STEP_LABELS[state.step]}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
