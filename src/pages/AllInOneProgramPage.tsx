import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Bot,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Dumbbell,
  TrendingUp,
  Flame,
  Wind,
  HeartPulse,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Eye,
  BarChart3,
  Download,
  X,
  Search,
  Target,
  Award,
  Sparkles,
  AlertTriangle,
  Layers,
  Calendar,
  Users,
  Play,
} from 'lucide-react'
import { cn } from '../lib/utils'
import type { ProgramData, SavedProgram } from '@/types'

// ── shadcn/ui imports ──────────────────────────────────
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Slider } from '../components/ui/slider'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface StepProps {
  data: ProgramData
  updateData: (partial: Partial<ProgramData> | ((prev: ProgramData) => Partial<ProgramData>)) => void
  onSave?: () => void
  onSaveAndAssign?: () => void
}

// ═══════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════

const PROGRAMS_STORAGE_KEY = 'azfit-programs'

function getSavedPrograms(): SavedProgram[] {
  try {
    const raw = localStorage.getItem(PROGRAMS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProgram(data: ProgramData): SavedProgram {
  const programs = getSavedPrograms()
  const now = new Date().toISOString()
  const id = data.id || `prog_${Date.now()}`
  const updated: ProgramData = { ...data, id }

  const existingIndex = programs.findIndex(p => p.id === id)
  const saved: SavedProgram = {
    id,
    createdAt: existingIndex >= 0 ? programs[existingIndex].createdAt : now,
    updatedAt: now,
    data: updated,
  }

  if (existingIndex >= 0) {
    programs[existingIndex] = saved
  } else {
    programs.push(saved)
  }

  localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programs))
  return saved
}

// ═══════════════════════════════════════════════════════════
// DATA CONSTANTS
// ═══════════════════════════════════════════════════════════

const GOALS = [
  { id: 'strength', name: 'Strength', icon: Dumbbell, color: '#00AEEF', desc: 'Maximize force production and absolute strength' },
  { id: 'hypertrophy', name: 'Hypertrophy', icon: TrendingUp, color: '#8B5CF6', desc: 'Build muscle size and aesthetic proportions' },
  { id: 'fatloss', name: 'Fat Loss', icon: Flame, color: '#22C55E', desc: 'Reduce body fat while preserving lean mass' },
  { id: 'endurance', name: 'Endurance', icon: Wind, color: '#F59E0B', desc: 'Improve aerobic capacity and muscular endurance' },
  { id: 'rehab', name: 'Rehab', icon: HeartPulse, color: '#6B7280', desc: 'Recover from injury and rebuild movement patterns' },
  { id: 'power', name: 'Power', icon: Zap, color: '#EAB308', desc: 'Develop explosive speed and rate of force' },
]

const METHODS = [
  { id: 'german-volume', name: 'German Volume Training', category: 'Hypertrophy', desc: '10 sets of 10 reps for massive muscle growth', score: 95, structure: '10x10 @ 60% 1RM', progression: '+5% load/week', targetAudience: 'Intermediate+' },
  { id: '5x5', name: '5x5 Stronglifts', category: 'Strength', desc: 'Classic compound lift protocol for raw strength', score: 92, structure: '5x5 compounds', progression: 'Linear +2.5kg', targetAudience: 'Beginner-Advanced' },
  { id: 'hiit', name: 'HIIT Metabolic', category: 'Fat Loss', desc: 'High-intensity intervals for maximum calorie burn', score: 88, structure: 'Work:Rest intervals', progression: 'Reduce rest periods', targetAudience: 'All levels' },
  { id: 'conjugate', name: 'Conjugate Method', category: 'Strength', desc: 'Max Effort / Dynamic Effort wave periodization', score: 90, structure: 'ME/DE rotation', progression: '3-week waves', targetAudience: 'Advanced' },
  { id: 'triphasic', name: 'Triphasic Training', category: 'Power', desc: 'Eccentric-Isometric-Concentric focused blocks', score: 87, structure: 'Block periodization', progression: 'Phase transitions', targetAudience: 'Advanced' },
]

const PHASES_DEFAULT = [
  { id: 'p1', name: 'Accumulation', weeks: 4, focus: 'Build work capacity and aerobic base with higher volume', color: '#F59E0B', active: true },
  { id: 'p2', name: 'Intensification', weeks: 4, focus: 'Increase intensity with moderate volume reduction', color: '#EF4444', active: true },
  { id: 'p3', name: 'Realization', weeks: 4, focus: 'Peak intensity with sport-specific demands', color: '#22C55E', active: true },
]

const DEFAULT_EXERCISES = [
  { code: 'A1', name: 'Back Squat', sets: 5, reps: '5', pct1RM: '82.5%', tempo: '3-0-1-0', rest: '3:00' },
  { code: 'A2', name: 'Bench Press', sets: 5, reps: '5', pct1RM: '82.5%', tempo: '3-0-1-0', rest: '3:00' },
  { code: 'B1', name: 'Romanian Deadlift', sets: 4, reps: '8', pct1RM: '75%', tempo: '3-1-1-0', rest: '2:30' },
  { code: 'B2', name: 'Pull-Up', sets: 4, reps: '8', pct1RM: 'BW+10kg', tempo: '3-0-2-0', rest: '2:30' },
  { code: 'C1', name: 'Walking Lunge', sets: 3, reps: '10/leg', pct1RM: 'N/A', tempo: '2-0-1-0', rest: '2:00' },
  { code: 'C2', name: 'Overhead Press', sets: 3, reps: '10', pct1RM: '67.5%', tempo: '2-0-1-1', rest: '2:00' },
]

const SPLIT_DEFAULTS: Record<string, { day: string; active: boolean; workout: string }[]> = {
  'Upper/Lower': [
    { day: 'Mon', active: true, workout: 'Upper — Push Focus' },
    { day: 'Tue', active: true, workout: 'Lower — Squat Focus' },
    { day: 'Wed', active: false, workout: 'Rest Day' },
    { day: 'Thu', active: true, workout: 'Upper — Pull Focus' },
    { day: 'Fri', active: true, workout: 'Lower — Hinge Focus' },
    { day: 'Sat', active: false, workout: 'Rest Day' },
    { day: 'Sun', active: false, workout: 'Rest Day' },
  ],
  'Push/Pull/Legs': [
    { day: 'Mon', active: true, workout: 'Push — Chest/Shoulders/Tris' },
    { day: 'Tue', active: true, workout: 'Pull — Back/Biceps' },
    { day: 'Wed', active: true, workout: 'Legs — Quads/Hams/Calves' },
    { day: 'Thu', active: false, workout: 'Rest Day' },
    { day: 'Fri', active: true, workout: 'Push — Chest/Shoulders/Tris' },
    { day: 'Sat', active: true, workout: 'Pull — Back/Biceps' },
    { day: 'Sun', active: true, workout: 'Legs — Quads/Hams/Calves' },
  ],
  'Full Body': [
    { day: 'Mon', active: true, workout: 'Full Body A' },
    { day: 'Tue', active: false, workout: 'Rest Day' },
    { day: 'Wed', active: true, workout: 'Full Body B' },
    { day: 'Thu', active: false, workout: 'Rest Day' },
    { day: 'Fri', active: true, workout: 'Full Body C' },
    { day: 'Sat', active: false, workout: 'Rest Day' },
    { day: 'Sun', active: false, workout: 'Rest Day' },
  ],
  'Bro Split': [
    { day: 'Mon', active: true, workout: 'Chest Day' },
    { day: 'Tue', active: true, workout: 'Back Day' },
    { day: 'Wed', active: true, workout: 'Shoulders Day' },
    { day: 'Thu', active: true, workout: 'Legs Day' },
    { day: 'Fri', active: true, workout: 'Arms Day' },
    { day: 'Sat', active: false, workout: 'Rest Day' },
    { day: 'Sun', active: false, workout: 'Rest Day' },
  ],
  'Custom': [
    { day: 'Mon', active: true, workout: 'Workout A' },
    { day: 'Tue', active: false, workout: 'Rest Day' },
    { day: 'Wed', active: true, workout: 'Workout B' },
    { day: 'Thu', active: false, workout: 'Rest Day' },
    { day: 'Fri', active: true, workout: 'Workout C' },
    { day: 'Sat', active: false, workout: 'Rest Day' },
    { day: 'Sun', active: false, workout: 'Rest Day' },
  ],
}

const LIMITATIONS = [
  'None (healthy)',
  'Lower back issues',
  'Shoulder injury',
  'Knee/Hip limitations',
  'Wrist/Elbow pain',
  'Neck/Upper back',
  'Cardiovascular condition',
  'Other',
]

const TAGS = ['Strength', 'Hypertrophy', 'Fat Loss', 'Endurance', 'Power', 'Rehab', 'Beginner', 'Advanced']

const CLIENTS = ['— Unassigned —', 'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Davis', 'Alex Rodriguez']

// ═══════════════════════════════════════════════════════════
// HELPER: StepHeader
// ═══════════════════════════════════════════════════════════

function StepHeader({
  step,
  title,
  isOpen,
  isComplete,
  onToggle,
}: {
  step: number
  title: string
  isOpen: boolean
  isComplete: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-4 px-5 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl hover:border-[#3A3A3A] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono',
            isComplete
              ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
              : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#A0A0A0] border border-gray-200 dark:border-[#2A2A2A]'
          )}
        >
          {isComplete ? <Check className="w-4 h-4" /> : step}
        </div>
        <span className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-base">{title}</span>
        {isComplete && <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />}
      </div>
      {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500 dark:text-[#A0A0A0]" /> : <ChevronDown className="w-5 h-5 text-gray-500 dark:text-[#A0A0A0]" />}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 1: Goal Selection
// ═══════════════════════════════════════════════════════════

function Step1Goal({ data, updateData }: StepProps) {
  const [dropdownGoal, setDropdownGoal] = useState(data.goal || '')

  const selectGoal = useCallback(
    (goalId: string) => {
      updateData({ goal: goalId })
    },
    [updateData]
  )

  const handleRecommend = useCallback(() => {
    updateData({ goal: 'hypertrophy' })
  }, [updateData])

  return (
    <div className="space-y-4">
      {/* Goal cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {GOALS.map((goal) => {
          const Icon = goal.icon
          const isSelected = data.goal === goal.id
          return (
            <motion.button
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectGoal(goal.id)}
              className={cn(
                'relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left',
                isSelected
                  ? 'border-[#00AEEF] bg-[#00AEEF]/5 shadow-lg shadow-[#00AEEF]/10'
                  : 'border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414] hover:border-[#3A3A3A] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424]'
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${goal.color}20`, border: `1px solid ${goal.color}40` }}
                >
                  <Icon className="w-5 h-5" style={{ color: goal.color }} />
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                    isSelected ? 'bg-[#00AEEF] border-[#00AEEF]' : 'border-gray-200 dark:border-[#2A2A2A] bg-[#0A0A0A]'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <h4 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm mb-1">{goal.name}</h4>
              <p className="text-gray-500 dark:text-[#A0A0A0] text-xs leading-relaxed">{goal.desc}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Dropdown fallback */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-[#A0A0A0] text-sm">Or select from dropdown:</span>
          <select
            value={dropdownGoal}
            onChange={(e) => {
              setDropdownGoal(e.target.value)
              if (e.target.value) selectGoal(e.target.value)
            }}
            className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            <option value="">— Select Goal —</option>
            {GOALS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRecommend}
          className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs"
        >
          <Bot className="w-3.5 h-3.5 mr-1" />
          Recommend
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 2: Method Selection
// ═══════════════════════════════════════════════════════════

function Step2Method({ data, updateData }: StepProps) {
  const [experience, setExperience] = useState('Intermediate')
  const [equipment, setEquipment] = useState('Full Gym')
  const [budget, setBudget] = useState('Mid-range')

  const filteredMethods = useMemo(() => {
    // Simple filter: sort by relevance based on experience
    let sorted = [...METHODS]
    if (experience === 'Beginner') {
      sorted = sorted.sort((a, b) => (a.id === '5x5' ? -1 : b.id === '5x5' ? 1 : 0))
    } else if (experience === 'Advanced') {
      sorted = sorted.sort((a, b) => (a.id === 'conjugate' ? -1 : b.id === 'conjugate' ? 1 : 0))
    }
    return sorted
  }, [experience])

  const selectMethod = useCallback(
    (methodId: string) => {
      updateData({ method: methodId })
    },
    [updateData]
  )

  const handleRecommend = useCallback(() => {
    updateData({ method: 'german-volume' })
  }, [updateData])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Experience Level</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            {['Beginner', 'Intermediate', 'Advanced', 'Elite'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Equipment</label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            {['Full Gym', 'Dumbbells Only', 'Bodyweight', 'Minimal'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Budget</label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            {['Premium', 'Mid-range', 'Budget-friendly'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Best match */}
      <div className="bg-[#22C55E]/5 border border-[#22C55E]/30 rounded-xl p-3 flex items-center gap-3">
        <Award className="w-5 h-5 text-[#22C55E]" />
        <div>
          <span className="text-[#22C55E] text-xs font-semibold">Best Match</span>
          <span className="text-gray-900 dark:text-[#F0F0F0] text-sm ml-2">
            {filteredMethods[0]?.name} ({filteredMethods[0]?.score}%)
          </span>
        </div>
      </div>

      {/* Method cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMethods.map((method) => {
          const isSelected = data.method === method.id
          return (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectMethod(method.id)}
              className={cn(
                'flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left',
                isSelected
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 shadow-lg shadow-[#8B5CF6]/10'
                  : 'border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414] hover:border-[#3A3A3A]'
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0]"
                >
                  {method.category}
                </Badge>
                <div
                  className={cn(
                    'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                    isSelected ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-gray-200 dark:border-[#2A2A2A] bg-[#0A0A0A]'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <h4 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm mb-1">{method.name}</h4>
              <p className="text-gray-500 dark:text-[#A0A0A0] text-xs mb-3">{method.desc}</p>
              {/* Score bar */}
              <div className="w-full bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-2 mt-auto">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${method.score}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: method.score >= 90 ? '#22C55E' : method.score >= 80 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-[#A0A0A0] mt-1">{method.score}% match</span>
            </motion.button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRecommend}
        className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs"
      >
        <Bot className="w-3.5 h-3.5 mr-1" />
        Recommend Method
      </Button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 3: Client Context
// ═══════════════════════════════════════════════════════════

function Step3Context({ data, updateData }: StepProps) {
  const toggleLimitation = useCallback(
    (limitation: string) => {
      updateData((prev) => {
        const current = prev.clientContext.limitations
        const next = current.includes(limitation)
          ? current.filter((l) => l !== limitation)
          : [...current, limitation]
        return {
          clientContext: { ...prev.clientContext, limitations: next },
        }
      })
    },
    [updateData]
  )

  const updateContextField = useCallback(
    (field: string, value: string) => {
      updateData((prev) => ({
        clientContext: { ...prev.clientContext, [field]: value },
      }))
    },
    [updateData]
  )

  const handleRecommend = useCallback(() => {
    updateData({
      clientContext: {
        ageRange: '26-35',
        experience: '1-3 years',
        bodyType: 'Mesomorph',
        availability: '4 days',
        limitations: ['None (healthy)'],
        otherLimitation: '',
      },
    })
  }, [updateData])

  const aiRiskScore = useMemo(() => {
    const { limitations } = data.clientContext
    if (limitations.includes('None (healthy)')) return 2
    if (limitations.includes('Cardiovascular condition')) return 85
    if (limitations.includes('Other')) return 60
    return Math.min(limitations.length * 15, 75)
  }, [data.clientContext])

  return (
    <div className="space-y-5">
      {/* Dropdowns 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Age Range</label>
          <select
            value={data.clientContext.ageRange}
            onChange={(e) => updateContextField('ageRange', e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            {['', '18-25', '26-35', '36-45', '46-55', '55+'].map((o) => (
              <option key={o} value={o}>{o || '— Select —'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Training Experience</label>
          <select
            value={data.clientContext.experience}
            onChange={(e) => updateContextField('experience', e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            {['', '<1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map((o) => (
              <option key={o} value={o}>{o || '— Select —'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Body Type</label>
          <select
            value={data.clientContext.bodyType}
            onChange={(e) => updateContextField('bodyType', e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            {['', 'Ectomorph', 'Mesomorph', 'Endomorph', 'Mixed'].map((o) => (
              <option key={o} value={o}>{o || '— Select —'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Weekly Availability</label>
          <select
            value={data.clientContext.availability}
            onChange={(e) => updateContextField('availability', e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
          >
            {['', '2 days', '3 days', '4 days', '5 days', '6 days'].map((o) => (
              <option key={o} value={o}>{o || '— Select —'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Limitations */}
      <div>
        <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-2 block">Limitations & Considerations</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LIMITATIONS.map((limitation) => (
            <label
              key={limitation}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414] cursor-pointer hover:border-[#3A3A3A] transition-colors"
            >
              <input
                type="checkbox"
                checked={data.clientContext.limitations.includes(limitation)}
                onChange={() => toggleLimitation(limitation)}
                className="w-4 h-4 rounded border-gray-200 dark:border-[#2A2A2A] accent-[#00AEEF]"
              />
              <span className="text-gray-900 dark:text-[#F0F0F0] text-xs">{limitation}</span>
            </label>
          ))}
        </div>
        {data.clientContext.limitations.includes('Other') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2"
          >
            <Input
              placeholder="Describe other limitation..."
              value={data.clientContext.otherLimitation}
              onChange={(e) => updateContextField('otherLimitation', e.target.value)}
              className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm"
            />
          </motion.div>
        )}
      </div>

      {/* Context summary + AI Risk Score */}
      <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-4 space-y-3">
        <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-semibold">Context Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            Age: <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.ageRange || '—'}</span>
          </div>
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            Experience: <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.experience || '—'}</span>
          </div>
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            Body Type: <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.bodyType || '—'}</span>
          </div>
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            Availability: <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.availability || '—'}</span>
          </div>
        </div>
        {/* AI Risk Score */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-[#2A2A2A]">
          <AlertTriangle className={cn('w-4 h-4', aiRiskScore > 50 ? 'text-[#EF4444]' : 'text-[#22C55E]')} />
          <span className="text-gray-500 dark:text-[#A0A0A0] text-xs">AI Risk Score:</span>
          <div className="flex-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiRiskScore}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full"
              style={{
                backgroundColor: aiRiskScore > 50 ? '#EF4444' : aiRiskScore > 25 ? '#F59E0B' : '#22C55E',
              }}
            />
          </div>
          <span
            className="text-xs font-mono font-bold"
            style={{ color: aiRiskScore > 50 ? '#EF4444' : aiRiskScore > 25 ? '#F59E0B' : '#22C55E' }}
          >
            {aiRiskScore}%
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRecommend}
        className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs"
      >
        <Bot className="w-3.5 h-3.5 mr-1" />
        Recommend Context
      </Button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 4: Phase Configuration
// ═══════════════════════════════════════════════════════════

function Step4Phases({ data, updateData }: StepProps) {
  const togglePhase = useCallback(
    (phaseId: string) => {
      updateData((prev) => ({
        phases: prev.phases.map((p) => (p.id === phaseId ? { ...p, active: !p.active } : p)),
      }))
    },
    [updateData]
  )

  const removePhase = useCallback(
    (phaseId: string) => {
      updateData((prev) => ({
        phases: prev.phases.filter((p) => p.id !== phaseId),
      }))
    },
    [updateData]
  )

  const addPhase = useCallback(() => {
    updateData((prev) => ({
      phases: [
        ...prev.phases,
        {
          id: `p${Date.now()}`,
          name: 'New Phase',
          weeks: 3,
          focus: 'Custom focus',
          color: '#00AEEF',
          active: true,
        },
      ],
    }))
  }, [updateData])

  const handleRecommend = useCallback(() => {
    updateData({ phases: PHASES_DEFAULT.map((p) => ({ ...p })) })
  }, [updateData])

  const totalWeeks = useMemo(
    () => data.phases.filter((p) => p.active).reduce((sum, p) => sum + p.weeks, 0),
    [data.phases]
  )

  return (
    <div className="space-y-5">
      {/* Phase blocks */}
      <div className="space-y-3">
        {data.phases.map((phase) => (
          <motion.div
            key={phase.id}
            layout
            className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={phase.active}
                onChange={() => togglePhase(phase.id)}
                className="w-5 h-5 rounded accent-[#00AEEF]"
              />
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: phase.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn('text-sm font-semibold', phase.active ? 'text-gray-900 dark:text-[#F0F0F0]' : 'text-gray-500 dark:text-[#A0A0A0] line-through')}>
                    {phase.name}
                  </h4>
                  <Badge variant="outline" className="text-[10px] border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0]">
                    {phase.weeks} weeks
                  </Badge>
                </div>
                <p className={cn('text-xs mt-0.5', phase.active ? 'text-gray-500 dark:text-[#A0A0A0]' : 'text-[#666]')}>{phase.focus}</p>
              </div>
              <button
                onClick={() => removePhase(phase.id)}
                className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-gray-500 dark:text-[#A0A0A0] hover:text-[#EF4444] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly hours slider */}
      <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-gray-900 dark:text-[#F0F0F0] text-sm font-semibold">Weekly Training Hours</label>
          <span className="text-[#00AEEF] font-mono text-sm font-bold">{data.weeklyHours}h</span>
        </div>
        <Slider
          value={[data.weeklyHours]}
          onValueChange={([v]) => updateData({ weeklyHours: v })}
          min={2}
          max={10}
          step={0.5}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-gray-500 dark:text-[#A0A0A0] mt-1">
          <span>2h</span>
          <span>10h</span>
        </div>
      </div>

      {/* Visual timeline */}
      <div>
        <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-2 block">Phase Timeline ({totalWeeks} weeks)</label>
        <div className="flex h-8 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A]">
          {data.phases
            .filter((p) => p.active)
            .map((phase) => (
              <motion.div
                key={phase.id}
                initial={{ width: 0 }}
                animate={{ width: `${(phase.weeks / totalWeeks) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full flex items-center justify-center"
                style={{ backgroundColor: `${phase.color}30`, borderRight: `2px solid ${phase.color}` }}
              >
                <span className="text-[10px] font-bold truncate px-1" style={{ color: phase.color }}>
                  {phase.name}
                </span>
              </motion.div>
            ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addPhase} className="border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Phase
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecommend}
          className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs"
        >
          <Bot className="w-3.5 h-3.5 mr-1" />
          Recommend Phases
        </Button>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// STEP 5: Weekly Split Designer
// ═══════════════════════════════════════════════════════════

function Step5Split({ data, updateData }: StepProps) {
  const [splitType, setSplitType] = useState('Upper/Lower')

  const toggleDay = useCallback(
    (dayIdx: number) => {
      updateData((prev) => ({
        split: prev.split.map((d, i) => (i === dayIdx ? { ...d, active: !d.active } : d)),
      }))
    },
    [updateData]
  )

  const updateDayWorkout = useCallback(
    (dayIdx: number, value: string) => {
      updateData((prev) => ({
        split: prev.split.map((d, i) => (i === dayIdx ? { ...d, workout: value } : d)),
      }))
    },
    [updateData]
  )

  const applySplit = useCallback(
    (type: string) => {
      setSplitType(type)
      if (SPLIT_DEFAULTS[type]) {
        updateData({ split: SPLIT_DEFAULTS[type].map((d) => ({ ...d })) })
      }
    },
    [updateData]
  )

  const activeDays = useMemo(() => data.split.filter((d) => d.active).length, [data.split])
  const volumeDist = useMemo(() => {
    const dist: Record<string, number> = {}
    data.split.forEach((d) => {
      if (d.active) {
        const key = d.workout.split('—')[0].trim() || 'General'
        dist[key] = (dist[key] || 0) + 1
      }
    })
    return dist
  }, [data.split])

  const handleRecommend = useCallback(() => {
    applySplit('Upper/Lower')
  }, [applySplit])

  return (
    <div className="space-y-5">
      {/* Split type dropdown */}
      <div>
        <label className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mb-1.5 block">Split Type</label>
        <select
          value={splitType}
          onChange={(e) => applySplit(e.target.value)}
          className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00AEEF]"
        >
          {Object.keys(SPLIT_DEFAULTS).map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* 7 day columns */}
      <div className="grid grid-cols-7 gap-2">
        {data.split.map((day, idx) => {
          const dayColors = ['#EF4444', '#F59E0B', '#22C55E', '#00AEEF', '#8B5CF6', '#EC4899', '#6366F1']
          return (
            <motion.div
              key={day.day}
              layout
              className={cn(
                'rounded-xl border overflow-hidden transition-all',
                day.active ? 'border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414]' : 'border-[#1A1A1A] bg-[#0A0A0A] opacity-50'
              )}
            >
              <div className="p-2 text-center border-b border-gray-200 dark:border-[#2A2A2A]">
                <div className="flex items-center justify-center gap-1">
                  <GripVertical className="w-3 h-3 text-[#555]" />
                  <input
                    type="checkbox"
                    checked={day.active}
                    onChange={() => toggleDay(idx)}
                    className="w-3.5 h-3.5 rounded accent-[#00AEEF]"
                  />
                </div>
                <span
                  className="text-[10px] font-bold font-mono mt-1 block"
                  style={{ color: day.active ? dayColors[idx] : '#555' }}
                >
                  {day.day}
                </span>
              </div>
              <div className="p-2">
                <textarea
                  value={day.workout}
                  onChange={(e) => updateDayWorkout(idx, e.target.value)}
                  className={cn(
                    'w-full text-[10px] text-center bg-transparent border-none outline-none resize-none',
                    day.active ? 'text-gray-900 dark:text-[#F0F0F0]' : 'text-[#555]'
                  )}
                  rows={2}
                  disabled={!day.active}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-3">
          <span className="text-gray-500 dark:text-[#A0A0A0] text-xs">Training Frequency</span>
          <div className="text-gray-900 dark:text-[#F0F0F0] text-lg font-bold font-mono">
            {activeDays} <span className="text-sm text-gray-500 dark:text-[#A0A0A0] font-normal">days/week</span>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-3">
          <span className="text-gray-500 dark:text-[#A0A0A0] text-xs">Volume Distribution</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(volumeDist).map(([k, v]) => (
              <Badge key={k} variant="outline" className="text-[10px] border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0]">
                {k}: {v}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRecommend}
        className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs"
      >
        <Bot className="w-3.5 h-3.5 mr-1" />
        Recommend Split
      </Button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 6: Exercise Review (Poliquin Notation)
// ═══════════════════════════════════════════════════════════

function Step6Exercises({ data, updateData }: StepProps) {
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({})

  const updateExercise = useCallback(
    (idx: number, field: keyof ProgramData['exercises'][0], value: string | number) => {
      updateData((prev) => ({
        exercises: prev.exercises.map((e, i) => (i === idx ? { ...e, [field]: value } : e)),
      }))
    },
    [updateData]
  )

  const deleteExercise = useCallback(
    (idx: number) => {
      updateData((prev) => ({
        exercises: prev.exercises.filter((_, i) => i !== idx),
      }))
    },
    [updateData]
  )

  const addExercise = useCallback(() => {
    updateData((prev) => ({
      exercises: [
        ...prev.exercises,
        { code: `B${prev.exercises.length + 1}`, name: 'New Exercise', sets: 3, reps: '10', pct1RM: 'N/A', tempo: '2-0-1-0', rest: '2:00' },
      ],
    }))
  }, [updateData])

  const handleAutoFill = useCallback(() => {
    updateData({ exercises: DEFAULT_EXERCISES.map((e) => ({ ...e })) })
  }, [updateData])

  const toggleRow = useCallback((idx: number) => {
    setOpenRows((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }, [])

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoFill}
          className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          AI Auto-Fill
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={addExercise}
          className="border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Exercise
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-xs"
        >
          <Search className="w-3.5 h-3.5 mr-1" />
          Load from Library
        </Button>
      </div>

      {/* Exercise table */}
      <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-9 gap-1 px-3 py-2 bg-[#0A0A0A] border-b border-gray-200 dark:border-[#2A2A2A] text-[10px] text-gray-500 dark:text-[#A0A0A0] font-semibold uppercase tracking-wider">
          <span>Code</span>
          <span className="col-span-2">Exercise</span>
          <span>Sets</span>
          <span>Reps</span>
          <span>%1RM</span>
          <span>Tempo</span>
          <span>Rest</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Table rows */}
        <AnimatePresence>
          {data.exercises.map((exercise, idx) => (
            <motion.div
              key={`${exercise.code}-${idx}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-200 dark:border-[#2A2A2A] last:border-b-0"
            >
              <div className="grid grid-cols-9 gap-1 px-3 py-2 items-center text-xs">
                <span className="text-[#00AEEF] font-mono font-bold">{exercise.code}</span>
                <span className="col-span-2 text-gray-900 dark:text-[#F0F0F0] font-medium truncate">{exercise.name}</span>
                <span className="text-gray-500 dark:text-[#A0A0A0]">{exercise.sets}</span>
                <span className="text-gray-500 dark:text-[#A0A0A0]">{exercise.reps}</span>
                <span className="text-gray-500 dark:text-[#A0A0A0] font-mono">{exercise.pct1RM}</span>
                <span className="text-[#8B5CF6] font-mono">{exercise.tempo}</span>
                <span className="text-[#F59E0B] font-mono">{exercise.rest}</span>
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => toggleRow(idx)}
                    className="p-1 rounded hover:bg-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:text-gray-900 dark:hover:text-[#F0F0F0] transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteExercise(idx)}
                    className="p-1 rounded hover:bg-[#EF4444]/10 text-gray-500 dark:text-[#A0A0A0] hover:text-[#EF4444] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Expandable edit row */}
              <AnimatePresence>
                {openRows[idx] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 pb-3 bg-[#0A0A0A]">
                      <div>
                        <label className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">Sets</label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                          className="h-7 text-xs bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">Reps</label>
                        <Input
                          value={exercise.reps}
                          onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                          className="h-7 text-xs bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">%1RM</label>
                        <Input
                          value={exercise.pct1RM}
                          onChange={(e) => updateExercise(idx, 'pct1RM', e.target.value)}
                          className="h-7 text-xs bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">Tempo</label>
                        <Input
                          value={exercise.tempo}
                          onChange={(e) => updateExercise(idx, 'tempo', e.target.value)}
                          className="h-7 text-xs bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tempo legend */}
      <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-3">
        <h5 className="text-gray-900 dark:text-[#F0F0F0] text-xs font-semibold mb-1.5">Tempo Legend (Poliquin Notation)</h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            <span className="text-[#8B5CF6] font-mono font-bold">Eccentric</span> — Lowering
          </div>
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            <span className="text-[#8B5CF6] font-mono font-bold">Pause Bottom</span> — Hold
          </div>
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            <span className="text-[#8B5CF6] font-mono font-bold">Concentric</span> — Lifting
          </div>
          <div className="text-gray-500 dark:text-[#A0A0A0]">
            <span className="text-[#8B5CF6] font-mono font-bold">Pause Top</span> — Squeeze
          </div>
        </div>
        <p className="text-[#666] text-[10px] mt-1.5">Example: 4-0-1-0 = 4s down, no pause, 1s up, no pause</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 7: Program Preview
// ═══════════════════════════════════════════════════════════

function Step7Preview({ data }: StepProps) {
  const totalWeeks = useMemo(
    () => data.phases.filter((p) => p.active).reduce((s, p) => s + p.weeks, 0),
    [data.phases]
  )
  const totalExercises = data.exercises.length
  const totalSets = data.exercises.reduce((sum, e) => sum + (e.sets || 0), 0)
  const activeDays = data.split.filter((d) => d.active).length
  const restDays = data.split.filter((d) => !d.active).length

  const intensity = useMemo(() => {
    const avgPct = data.exercises.reduce((sum, e) => {
      const num = parseFloat(e.pct1RM)
      return sum + (isNaN(num) ? 70 : num)
    }, 0) / totalExercises || 70
    return Math.round(avgPct)
  }, [data.exercises, totalExercises])

  const avgRest = useMemo(() => {
    const rests = data.exercises.map((e) => parseInt(e.rest) || 90)
    return Math.round(rests.reduce((a, b) => a + b, 0) / rests.length)
  }, [data.exercises])

  const aiConfidence = useMemo(() => {
    let score = 70
    if (data.goal) score += 10
    if (data.method) score += 10
    if (data.clientContext.ageRange) score += 5
    if (data.phases.length > 0) score += 5
    return Math.min(score, 98)
  }, [data])

  const goalName = GOALS.find((g) => g.id === data.goal)?.name || '—'
  const methodName = METHODS.find((m) => m.id === data.method)?.name || '—'
  const methodData = METHODS.find((m) => m.id === data.method)
  const splitName = data.split.filter((d) => d.active).length > 0
    ? `${data.split.filter((d) => d.active).length}-Day Split`
    : '—'

  return (
    <div className="space-y-5">
      {/* ══════ OVERVIEW CARD ══════ */}
      <Card className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-gray-900 dark:text-[#F0F0F0] text-xl font-bold">
              {data.programName || 'Untitled Program'}
            </h3>
            <p className="text-gray-500 dark:text-[#A0A0A0] text-sm mt-1">
              {goalName} — {methodName} — {totalWeeks} weeks — {activeDays} days/week
            </p>
          </div>
          <div className="text-right">
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">AI Confidence</div>
            <div
              className="text-lg font-bold font-mono"
              style={{ color: aiConfidence > 85 ? '#22C55E' : aiConfidence > 60 ? '#F59E0B' : '#EF4444' }}
            >
              {aiConfidence}%
            </div>
          </div>
        </div>

        {/* Key stat badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 text-center">
            <div className="text-[#EF4444] text-lg font-bold font-mono">{intensity}%</div>
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Avg Intensity</div>
          </div>
          <div className="bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 text-center">
            <div className="text-[#00AEEF] text-lg font-bold font-mono">{totalSets}</div>
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Total Sets / Week</div>
          </div>
          <div className="bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 text-center">
            <div className="text-[#F59E0B] text-lg font-bold font-mono">{totalExercises}</div>
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Exercises</div>
          </div>
          <div className="bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 text-center">
            <div className="text-[#8B5CF6] text-lg font-bold font-mono">{data.weeklyHours}h</div>
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Weekly Time</div>
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm mb-4 leading-relaxed">{data.description}</p>
        )}

        {/* Tags */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {data.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Program Timeline */}
        <div className="mb-4">
          <div className="text-gray-500 dark:text-[#A0A0A0] text-xs mb-2 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Program Timeline — {totalWeeks} Weeks
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A]">
            {data.phases
              .filter((p) => p.active)
              .map((phase) => (
                <motion.div
                  key={phase.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${(phase.weeks / totalWeeks) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full flex items-center justify-center relative"
                  style={{ backgroundColor: phase.color + '30', borderRight: `2px solid ${phase.color}` }}
                  title={`${phase.name}: ${phase.weeks} weeks — ${phase.focus}`}
                >
                  <span className="text-[10px] font-semibold text-gray-900 dark:text-[#F0F0F0] truncate px-1">{phase.name}</span>
                </motion.div>
              ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 dark:text-[#A0A0A0] mt-1">
            <span>Week 1</span>
            <span>Week {totalWeeks}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-xs">
            <Eye className="w-3.5 h-3.5 mr-1" />
            Preview Workout
          </Button>
          <Button variant="outline" size="sm" className="border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-xs">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />
            Analytics
          </Button>
          <Button variant="outline" size="sm" className="border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-xs">
            <Download className="w-3.5 h-3.5 mr-1" />
            Export PDF
          </Button>
        </div>
      </Card>

      {/* ══════ PROGRAM DETAILS ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Method Details */}
        <Card className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] p-5">
          <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-bold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00AEEF]" />
            Training Method
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Method</span>
              <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{methodName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Goal</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{goalName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Structure</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{methodData?.structure || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Progression</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{methodData?.progression || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Target Audience</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{methodData?.targetAudience || '—'}</span>
            </div>
          </div>
        </Card>

        {/* Client Context Summary */}
        <Card className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] p-5">
          <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-bold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#22C55E]" />
            Client Context
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Age Range</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.ageRange || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Experience</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.experience || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Body Type</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.bodyType || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[#A0A0A0]">Availability</span>
              <span className="text-gray-900 dark:text-[#F0F0F0]">{data.clientContext.availability || '—'}</span>
            </div>
            {data.clientContext.limitations.length > 0 && (
              <div className="pt-1">
                <span className="text-gray-500 dark:text-[#A0A0A0] text-xs">Limitations:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.clientContext.limitations.map((lim) => (
                    <span key={lim} className="text-[10px] px-1.5 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444]">{lim}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ══════ WEEKLY SPLIT ══════ */}
      <Card className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] p-5">
        <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#F59E0B]" />
          Weekly Split — {splitName}
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {data.split.map((day) => (
            <div
              key={day.day}
              className={`rounded-lg p-2.5 text-center border ${day.active ? 'bg-[#0A0A0A] border-gray-200 dark:border-[#2A2A2A]' : 'bg-[#0A0A0A]/50 border-gray-200 dark:border-[#1F1F1F]'}`}
            >
              <div className={`text-[10px] font-bold ${day.active ? 'text-gray-900 dark:text-[#F0F0F0]' : 'text-[#555]'}`}>{day.day}</div>
              <div className={`text-[10px] mt-1 ${day.active ? 'text-[#00AEEF]' : 'text-[#555]'}`}>
                {day.active ? (day.workout || 'Workout') : 'Rest'}
              </div>
              {day.active && <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] mx-auto mt-1" />}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-[#A0A0A0]">
          <span>{activeDays} training days</span>
          <span>{restDays} rest days</span>
          <span>{data.weeklyHours}h/week</span>
          <span>~{Math.round((data.weeklyHours / activeDays) * 60)}min/session</span>
        </div>
      </Card>

      {/* ══════ EXERCISE BREAKDOWN ══════ */}
      <Card className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] p-5">
        <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-bold mb-3 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-[#8B5CF6]" />
          Exercise Breakdown — {totalExercises} exercises, {totalSets} sets/week
        </h4>
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 dark:text-[#A0A0A0] font-semibold border-b border-gray-200 dark:border-[#2A2A2A] pb-2 mb-2">
          <div className="col-span-1">Code</div>
          <div className="col-span-4">Exercise</div>
          <div className="col-span-1 text-center">Sets</div>
          <div className="col-span-1 text-center">Reps</div>
          <div className="col-span-2 text-center">%1RM</div>
          <div className="col-span-1 text-center">Tempo</div>
          <div className="col-span-1 text-center">Rest</div>
          <div className="col-span-1 text-center">Sets/Wk</div>
        </div>
        {/* Rows */}
        <div className="space-y-1.5">
          {data.exercises.map((ex) => (
            <div key={ex.code} className="grid grid-cols-12 gap-2 text-xs items-center py-1.5 border-b border-gray-200 dark:border-[#1F1F1F] last:border-0">
              <div className="col-span-1 text-gray-900 dark:text-[#F0F0F0] font-mono font-bold">{ex.code}</div>
              <div className="col-span-4 text-gray-900 dark:text-[#F0F0F0]">{ex.name}</div>
              <div className="col-span-1 text-center text-gray-500 dark:text-[#A0A0A0]">{ex.sets}</div>
              <div className="col-span-1 text-center text-gray-500 dark:text-[#A0A0A0]">{ex.reps}</div>
              <div className="col-span-2 text-center text-[#EF4444] font-mono">{ex.pct1RM}</div>
              <div className="col-span-1 text-center text-[#8B5CF6] font-mono text-[10px]">{ex.tempo}</div>
              <div className="col-span-1 text-center text-gray-500 dark:text-[#A0A0A0]">{ex.rest}s</div>
              <div className="col-span-1 text-center text-[#00AEEF] font-mono">{ex.sets * activeDays}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══════ PHASE BREAKDOWN ══════ */}
      <Card className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] p-5">
        <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-bold mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#EF4444]" />
          Phase Breakdown
        </h4>
        <div className="space-y-3">
          {data.phases
            .filter((p) => p.active)
            .map((phase, i) => (
              <div key={phase.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A]">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: phase.color }}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-[#F0F0F0] text-sm font-semibold">{phase.name}</div>
                  <div className="text-gray-500 dark:text-[#A0A0A0] text-xs">{phase.focus}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 dark:text-[#F0F0F0] font-mono font-bold text-sm">{phase.weeks}w</div>
                  <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">{Math.round((phase.weeks / totalWeeks) * 100)}% of program</div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* ══════ SUMMARY STATS ══════ */}
      <Card className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] p-5">
        <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-bold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#00AEEF]" />
          Summary Statistics
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-[#0A0A0A] rounded-lg p-3 border border-gray-200 dark:border-[#2A2A2A]">
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Total Weeks</div>
            <div className="text-gray-900 dark:text-[#F0F0F0] font-mono font-bold text-lg">{totalWeeks}</div>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-3 border border-gray-200 dark:border-[#2A2A2A]">
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Training Days</div>
            <div className="text-gray-900 dark:text-[#F0F0F0] font-mono font-bold text-lg">{activeDays}<span className="text-[#555] text-xs">/wk</span></div>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-3 border border-gray-200 dark:border-[#2A2A2A]">
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Total Sets</div>
            <div className="text-[#00AEEF] font-mono font-bold text-lg">{totalSets * activeDays}<span className="text-[#555] text-xs">/wk</span></div>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-3 border border-gray-200 dark:border-[#2A2A2A]">
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Avg Rest</div>
            <div className="text-[#F59E0B] font-mono font-bold text-lg">{avgRest}s</div>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-3 border border-gray-200 dark:border-[#2A2A2A]">
            <div className="text-gray-500 dark:text-[#A0A0A0] text-[10px]">Est. Duration</div>
            <div className="text-[#8B5CF6] font-mono font-bold text-lg">~{Math.round(totalWeeks * activeDays * (data.weeklyHours / activeDays))}h</div>
          </div>
        </div>
      </Card>

      {/* AI Adjustments */}
      <Button
        variant="outline"
        size="sm"
        className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs"
      >
        <Sparkles className="w-3.5 h-3.5 mr-1" />
        Recommend Adjustments
      </Button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 8: Save & Assign
// ═══════════════════════════════════════════════════════════

function Step8Save({ data, updateData, onSave, onSaveAndAssign }: StepProps) {
  const toggleTag = useCallback(
    (tag: string) => {
      updateData((prev) => {
        const next = prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
        return { tags: next }
      })
    },
    [updateData]
  )

  return (
    <div className="space-y-5">
      {/* Program name */}
      <div>
        <label className="text-gray-900 dark:text-[#F0F0F0] text-sm font-semibold mb-1.5 block">Program Name</label>
        <Input
          value={data.programName}
          onChange={(e) => updateData({ programName: e.target.value })}
          placeholder="e.g., 12-Week Hypertrophy Block"
          className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-gray-900 dark:text-[#F0F0F0] text-sm font-semibold mb-1.5 block">Description</label>
        <Textarea
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Describe the program goals, target audience, and expected outcomes..."
          className="bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] min-h-[80px]"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-[#F0F0A0] text-sm font-semibold mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const isSelected = data.tags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  isSelected
                    ? 'bg-[#00AEEF]/10 border-[#00AEEF] text-[#00AEEF]'
                    : 'bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:border-[#3A3A3A]'
                )}
              >
                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Public template checkbox */}
      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414] cursor-pointer hover:border-[#3A3A3A] transition-colors">
        <input
          type="checkbox"
          checked={data.isPublic}
          onChange={(e) => updateData({ isPublic: e.target.checked })}
          className="w-5 h-5 rounded accent-[#00AEEF]"
        />
        <div>
          <span className="text-gray-900 dark:text-[#F0F0F0] text-sm font-medium">Make public template</span>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-xs">Other trainers can view and use this program</p>
        </div>
      </label>

      {/* Client dropdown */}
      <div>
        <label className="text-gray-900 dark:text-[#F0F0F0] text-sm font-semibold mb-1.5 block">Assign to Client</label>
        <select
          value={data.assignedClient}
          onChange={(e) => updateData({ assignedClient: e.target.value })}
          className="w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#00AEEF]"
        >
          {CLIENTS.map((c) => (
            <option key={c} value={c === '— Unassigned —' ? '' : c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Big action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={onSave}
          className="bg-[#00AEEF] hover:bg-[#0099D1] text-white font-semibold px-6"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Program
        </Button>
        <Button
          onClick={onSaveAndAssign}
          className="bg-[#22C55E] hover:bg-[#1EAD4E] text-white font-semibold px-6"
        >
          <Check className="w-4 h-4 mr-2" />
          Save & Assign
        </Button>
        <Button
          variant="outline"
          onClick={onSaveAndAssign}
          className="border-[var(--cyan)] text-[var(--cyan)] hover:bg-[var(--cyan)]/10 font-semibold px-6"
        >
          <Play className="w-4 h-4 mr-2" />
          Open in Session
        </Button>
        <Button variant="ghost" className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// FLOATING SUMMARY PANEL
// ═══════════════════════════════════════════════════════════

function FloatingSummary({ data }: { data: ProgramData }) {
  const totalWeeks = data.phases.filter((p) => p.active).reduce((s, p) => s + p.weeks, 0)
  const activeDays = data.split.filter((d) => d.active).length
  const goalName = GOALS.find((g) => g.id === data.goal)?.name || '—'
  const methodName = METHODS.find((m) => m.id === data.method)?.name || '—'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-4 space-y-3 sticky top-4"
    >
      <h4 className="text-gray-900 dark:text-[#F0F0F0] text-sm font-bold flex items-center gap-2">
        <Target className="w-4 h-4 text-[#00AEEF]" />
        Current Selections
      </h4>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#A0A0A0]">Goal</span>
          <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{goalName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#A0A0A0]">Method</span>
          <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{methodName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#A0A0A0]">Duration</span>
          <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{totalWeeks} weeks</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#A0A0A0]">Frequency</span>
          <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{activeDays} days/wk</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#A0A0A0]">Exercises</span>
          <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{data.exercises.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#A0A0A0]">Weekly Hours</span>
          <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{data.weeklyHours}h</span>
        </div>
        {data.clientContext.ageRange && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-[#A0A0A0]">Client</span>
            <span className="text-gray-900 dark:text-[#F0F0F0] font-medium">{data.clientContext.ageRange}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

const STEPS = [
  { title: 'Goal Selection', component: Step1Goal },
  { title: 'Method Selection', component: Step2Method },
  { title: 'Client Context', component: Step3Context },
  { title: 'Phase Configuration', component: Step4Phases },
  { title: 'Weekly Split Designer', component: Step5Split },
  { title: 'Exercise Review', component: Step6Exercises },
  { title: 'Program Preview', component: Step7Preview },
  { title: 'Save & Assign', component: Step8Save },
]

const defaultData: ProgramData = {
  goal: '',
  method: '',
  clientContext: {
    ageRange: '',
    experience: '',
    bodyType: '',
    availability: '',
    limitations: [],
    otherLimitation: '',
  },
  phases: PHASES_DEFAULT.map((p) => ({ ...p })),
  weeklyHours: 4.5,
  split: SPLIT_DEFAULTS['Upper/Lower'].map((d) => ({ ...d })),
  exercises: DEFAULT_EXERCISES.map((e) => ({ ...e })),
  programName: '',
  description: '',
  tags: [],
  isPublic: false,
  assignedClient: '',
}

export default function AllInOneProgramPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<ProgramData>(() => {
    // Check if we're loading a saved program for editing
    const editId = localStorage.getItem('azfit-creator-edit-id')
    if (editId) {
      localStorage.removeItem('azfit-creator-edit-id')
      const programs = getSavedPrograms()
      const found = programs.find(p => p.id === editId)
      if (found) {
        return found.data
      }
    }
    return defaultData
  })
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({ 0: true })
  const [savedList, setSavedList] = useState<SavedProgram[]>(getSavedPrograms())
  const [saveFlash, setSaveFlash] = useState(false)

  const loadSavedProgram = useCallback((saved: SavedProgram) => {
    setData(saved.data)
    setOpenSteps({ 6: true })
  }, [])

  const toggleStep = useCallback((idx: number) => {
    setOpenSteps((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }, [])

  const updateData = useCallback(
    (partial: Partial<ProgramData> | ((prev: ProgramData) => Partial<ProgramData>)) => {
      setData((prev) => {
        const next = typeof partial === 'function' ? partial(prev) : partial
        return { ...prev, ...next }
      })
    },
    []
  )

  // Auto-generate full program
  const handleAutoGenerate = useCallback(() => {
    setData({
      ...defaultData,
      goal: 'hypertrophy',
      method: 'german-volume',
      clientContext: {
        ageRange: '26-35',
        experience: '1-3 years',
        bodyType: 'Mesomorph',
        availability: '4 days',
        limitations: ['None (healthy)'],
        otherLimitation: '',
      },
      programName: 'AI-Generated Hypertrophy Program',
      description: 'A complete 12-week hypertrophy program designed with AI recommendations.',
      tags: ['Hypertrophy', 'Strength'],
    })
    setOpenSteps({ 6: true }) // Open preview
  }, [])

  const handleReset = useCallback(() => {
    setData(defaultData)
    setOpenSteps({ 0: true })
  }, [])

  // Completion check per step
  const stepComplete = useMemo(
    () => [
      !!data.goal,
      !!data.method,
      !!(data.clientContext.ageRange && data.clientContext.experience),
      data.phases.some((p) => p.active),
      data.split.some((d) => d.active),
      data.exercises.length > 0,
      !!(data.goal && data.method),
      !!data.programName,
    ],
    [data]
  )

  const completionPercent = useMemo(
    () => Math.round((stepComplete.filter(Boolean).length / stepComplete.length) * 100),
    [stepComplete]
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-900 dark:text-[#F0F0F0]">
      {/* ── Header Bar ─────────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-[#2A2A2A] bg-[#0A0A0A] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#00AEEF] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-[#F0F0F0]">All-in-One Program Creator</h1>
              </div>
              <p className="text-gray-500 dark:text-[#A0A0A0] text-sm">Design complete training programs with AI-powered recommendations</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleAutoGenerate}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#00AEEF] hover:from-[#7C4FE4] hover:to-[#0099D1] text-white text-xs font-semibold px-4"
              >
                <Bot className="w-4 h-4 mr-1.5" />
                Auto-Generate Full Program
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  saveProgram(data)
                  setSavedList(getSavedPrograms())
                  setSaveFlash(true)
                  setTimeout(() => setSaveFlash(false), 1200)
                }}
                className={`border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-xs transition-all ${saveFlash ? 'border-[#22C55E] text-[#22C55E]' : ''}`}
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {saveFlash ? 'Saved!' : 'Save Program'}
              </Button>
              {savedList.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    const saved = savedList.find(p => p.id === e.target.value)
                    if (saved) loadSavedProgram(saved)
                  }}
                  className="h-9 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#F0F0F0] text-xs rounded-lg px-3 focus:outline-none focus:border-[#00AEEF]"
                >
                  <option value="">Load Saved...</option>
                  {savedList.map((p) => (
                    <option key={p.id} value={p.id}>{p.data.programName || 'Untitled'}</option>
                  ))}
                </select>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-gray-500 dark:text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Master Bar ──────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <span className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium mr-2 shrink-0">AI Quick Actions:</span>
            {STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOpenSteps({ [idx]: true })
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors text-gray-500 dark:text-[#A0A0A0] text-[10px] whitespace-nowrap"
              >
                <Bot className="w-3 h-3" />
                {step.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Progress Bar ───────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-[#A0A0A0] text-xs font-medium whitespace-nowrap">
              Completion: <span className="text-gray-900 dark:text-[#F0F0F0] font-mono font-bold">{completionPercent}%</span>
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-2.5 border border-gray-200 dark:border-[#2A2A2A]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-[#00AEEF] via-[#8B5CF6] to-[#22C55E]"
              />
            </div>
            <span className="text-gray-500 dark:text-[#A0A0A0] text-[10px] font-mono">
              {stepComplete.filter(Boolean).length}/{stepComplete.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Steps */}
          <div className="flex-1 space-y-3">
            {STEPS.map((step, idx) => {
              const Component = step.component
              const isOpen = !!openSteps[idx]
              const isComplete = stepComplete[idx]
              return (
                <div key={idx} className="rounded-xl overflow-hidden">
                  <StepHeader
                    step={idx + 1}
                    title={step.title}
                    isOpen={isOpen}
                    isComplete={isComplete}
                    onToggle={() => toggleStep(idx)}
                  />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-50 dark:bg-[#141414] border border-t-0 border-gray-200 dark:border-[#2A2A2A] rounded-b-xl p-4 sm:p-5">
                          <Component
                        data={data}
                        updateData={updateData}
                        onSave={() => {
                          saveProgram(data)
                          setSavedList(getSavedPrograms())
                          setSaveFlash(true)
                          setTimeout(() => setSaveFlash(false), 1200)
                        }}
                        onSaveAndAssign={() => {
                          const saved = saveProgram(data)
                          setSavedList(getSavedPrograms())
                          navigate('/programs/session/' + saved.id)
                        }}
                      />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Floating Summary Panel */}
          <div className="w-full lg:w-64 shrink-0">
            <FloatingSummary data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
