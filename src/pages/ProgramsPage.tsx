import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  CheckCircle,
  TrendingUp,
  Archive,
  Search,
  Clock,
  Calendar,
  Users,
  Edit,
  Copy,
  UserPlus,
  ArchiveIcon,
  MoreVertical,
  Grid3X3,
  List,
  Star,
  Filter,
  X,
  Dumbbell,
  Zap,
  Wind,
  HeartPulse,
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '../lib/utils'

// ── Types ──────────────────────────────────────────────
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

interface Program {
  id: string
  name: string
  goal: string
  method: string
  category: string
  difficulty: string
  duration: string
  frequency: string
  equipment: string
  structure: string
  progression: string
  timesAssigned: number
  activeClients: number
  lastAssigned: string
  archived: boolean
  createdAt: string
  colorBanner: string
}

// ── Constants ──────────────────────────────────────────
const GOAL_OPTIONS = [
  { label: 'Lose Fat', value: 'fat loss' },
  { label: 'Build Muscle', value: 'muscle' },
  { label: 'Strength', value: 'strength' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Rehabilitation', value: 'rehab' },
  { label: 'General Fitness', value: 'general' },
]

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

const GOAL_COLOR_MAP: Record<string, string> = {
  'fat loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'lose fat': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'weight loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'muscle': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  'hypertrophy': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  'build muscle': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  'strength': 'linear-gradient(135deg, #00AEEF, #0077B6)',
  'endurance': 'linear-gradient(135deg, #F97316, #EA580C)',
  'rehab': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'rehabilitation': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'general': 'linear-gradient(135deg, #C0C0C0, #9CA3AF)',
  'athletic': 'linear-gradient(135deg, #EC4899, #DB2777)',
}

const GOAL_BG_MAP: Record<string, string> = {
  'fat loss': 'rgba(34,197,94,0.15)',
  'lose fat': 'rgba(34,197,94,0.15)',
  'weight loss': 'rgba(34,197,94,0.15)',
  'muscle': 'rgba(139,92,246,0.15)',
  'hypertrophy': 'rgba(139,92,246,0.15)',
  'build muscle': 'rgba(139,92,246,0.15)',
  'strength': 'rgba(0,174,239,0.15)',
  'endurance': 'rgba(249,115,22,0.15)',
  'rehab': 'rgba(234,179,8,0.15)',
  'rehabilitation': 'rgba(234,179,8,0.15)',
  'general': 'rgba(192,192,192,0.15)',
  'athletic': 'rgba(236,72,153,0.15)',
}

const DIFFICULTY_COLOR: Record<string, { text: string; bg: string }> = {
  Beginner: { text: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  Intermediate: { text: '#EAB308', bg: 'rgba(234,179,8,0.15)' },
  Advanced: { text: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  Elite: { text: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
}

// ── Helpers ────────────────────────────────────────────
function normalizeGoal(goal: string): string {
  const g = goal.toLowerCase()
  if (g.includes('fat') || g.includes('loss')) return 'fat loss'
  if (g.includes('muscle') || g.includes('hypertrophy')) return 'muscle'
  if (g.includes('strength')) return 'strength'
  if (g.includes('endurance')) return 'endurance'
  if (g.includes('rehab')) return 'rehab'
  if (g.includes('athletic')) return 'athletic'
  return 'general'
}

function getGoalColor(goal: string): string {
  return GOAL_COLOR_MAP[normalizeGoal(goal)] || GOAL_COLOR_MAP['general']
}

function getGoalBg(goal: string): string {
  return GOAL_BG_MAP[normalizeGoal(goal)] || GOAL_BG_MAP['general']
}

function getDifficultyColor(diff: string) {
  return DIFFICULTY_COLOR[diff] || DIFFICULTY_COLOR['Intermediate']
}

function getGoalIcon(goal: string, size = 32) {
  const g = normalizeGoal(goal)
  switch (g) {
    case 'fat loss': return <Zap size={size} className="text-white" />
    case 'muscle': return <Dumbbell size={size} className="text-white" />
    case 'strength': return <Zap size={size} className="text-white" />
    case 'endurance': return <Wind size={size} className="text-white" />
    case 'rehab': return <HeartPulse size={size} className="text-white" />
    default: return <Activity size={size} className="text-white" />
  }
}

function getMethodFromName(name: string): string {
  if (name.includes('Upper') || name.includes('Lower')) return 'Upper/Lower'
  if (name.includes('PPL') || name.includes('Push') || name.includes('Pull')) return 'Push/Pull/Legs'
  if (name.includes('5x5') || name.includes('5/3/1') || name.includes('StrongLifts')) return 'Full Body'
  if (name.includes('Bro')) return 'Bro Split'
  if (name.includes('Circuit') || name.includes('HIIT')) return 'Circuit/HIIT'
  if (name.includes('Full Body')) return 'Full Body'
  return 'Other'
}

function generateSamplePrograms(methods: TrainingMethod[]): Program[] {
  const now = new Date()
  return methods.map((m, i) => {
    const diffKeywords: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      elite: 'Elite',
    }
    let difficulty = 'Intermediate'
    for (const [key, val] of Object.entries(diffKeywords)) {
      if (m.TargetAudience.toLowerCase().includes(key)) {
        difficulty = val
        break
      }
    }
    const timesAssigned = [18, 24, 15, 9, 7, 11, 6, 13, 20, 4, 8, 12, 5, 3, 10, 14, 2, 16, 6, 9][i % 20]
    const daysAgo = [1, 3, 7, 14, 2, 5, 21, 10, 4, 30, 6, 8, 12, 25, 9, 3, 15, 7, 11, 2][i % 20]
    const lastAssigned = new Date(now)
    lastAssigned.setDate(lastAssigned.getDate() - daysAgo)
    const createdDaysAgo = [30, 60, 14, 90, 45, 120, 7, 200, 55, 80][i % 10]
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - createdDaysAgo)

    return {
      id: `prog-${i + 1}`,
      name: m.Name,
      goal: m.Goal,
      method: getMethodFromName(m.Name),
      category: m.Category,
      difficulty,
      duration: `${m.Duration} wk`,
      frequency: `${m.Frequency}x/wk`,
      equipment: m.Equipment,
      structure: m.Structure,
      progression: m.Progression,
      timesAssigned,
      activeClients: Math.floor(timesAssigned * 0.4),
      lastAssigned: daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
      archived: i >= methods.length - 9,
      createdAt: createdAt.toISOString(),
      colorBanner: getGoalColor(m.Goal),
    }
  })
}

// ── Components ─────────────────────────────────────────

/** Stat Card */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[#F0F0F0] font-semibold text-lg leading-tight truncate" style={{ fontFamily: 'Space Mono, monospace' }}>
          {value}
        </p>
        <p className="text-[#6B6B6B] text-xs truncate">{label}</p>
      </div>
    </motion.div>
  )
}

/** Generate mock program schedule */
function generateMockSchedule(program: Program) {
  const freq = parseInt(program.frequency) || 3
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const exercises = [
    ['Squats', 'Bench Press', 'Barbell Rows', 'Overhead Press'],
    ['Deadlifts', 'Pull-Ups', 'Dumbbell Lunges', 'Face Pulls'],
    ['Leg Press', 'Incline Dumbbell Press', 'Lat Pulldowns', 'Lateral Raises'],
    ['Romanian Deadlifts', 'Push-Ups', 'Seated Cable Rows', 'Plank'],
    ['Box Jumps', 'Dumbbell Bench', 'Bent-Over Rows', 'Tricep Dips'],
    ['Goblet Squats', 'Chest Flyes', 'Pull-Ups', 'Farmer\'s Carry'],
  ]
  const types = ['Strength', 'Hypertrophy', 'Endurance', 'Power', 'Recovery']
  
  const schedule = []
  for (let i = 0; i < freq; i++) {
    const dayIndex = Math.floor((i / freq) * 7 + (7 / freq) / 2)
    schedule.push({
      day: days[Math.min(dayIndex, 6)],
      type: types[i % types.length],
      exercises: exercises[i % exercises.length],
      duration: `${40 + Math.floor(Math.random() * 30)} min`,
      intensity: ['Low', 'Moderate', 'High', 'Very High'][i % 4],
    })
  }
  return schedule
}

/** Program Card — Standardized compact with expand interaction */
function ProgramCard({
  program,
  index,
  onAction,
  isExpanded,
  showFullDetail,
  onToggleExpand,
  onToggleDetail,
}: {
  program: Program
  index: number
  onAction: (action: string, program: Program) => void
  isExpanded: boolean
  showFullDetail: boolean
  onToggleExpand: () => void
  onToggleDetail: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const diffColor = getDifficultyColor(program.difficulty)
  const goalLabel = GOAL_OPTIONS.find(g => program.goal.toLowerCase().includes(g.value))?.label || program.goal
  const schedule = useMemo(() => generateMockSchedule(program), [program.id])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.35, delay: index * 0.04 },
        y: { duration: 0.35, delay: index * 0.04 },
      }}
      className={cn(
        "relative bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden flex flex-col cursor-pointer transition-colors duration-200",
        isExpanded ? "ring-1 ring-[#00AEEF] shadow-[0_8px_32px_rgba(0,174,239,0.15)]" : "hover:border-[#3A3A3A]"
      )}
      onClick={() => {
        if (!menuOpen) onToggleExpand()
      }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Compact Content — standardized size */}
      <div className={cn("p-3 flex flex-col", !isExpanded && "min-h-[148px]")}>
        {/* Header: [Program Icon] [Program Title] [Most Used Badge] */}
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: program.colorBanner }}
          >
            {getGoalIcon(program.goal, 14)}
          </div>
          <h3 className="text-[#F0F0F0] font-semibold text-[13px] leading-snug flex-1 min-w-0 truncate">
            {program.name}
          </h3>
          {program.timesAssigned >= 15 && (
            <span className="flex-shrink-0 flex items-center gap-1 bg-[rgba(234,179,8,0.15)] border border-[rgba(234,179,8,0.3)] text-[#EAB308] text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
              <Star size={8} /> Most Used
            </span>
          )}
          {/* More menu */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="text-[#6B6B6B] hover:text-[#F0F0F0] p-0.5 rounded transition-colors"
              aria-label="More actions"
            >
              <MoreVertical size={14} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-6 w-44 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-50 py-1"
                  >
                    {[
                      { label: 'Edit Program', icon: Edit, action: 'edit' },
                      { label: 'Duplicate', icon: Copy, action: 'duplicate' },
                      { label: 'Assign to Client', icon: UserPlus, action: 'assign' },
                      { label: program.archived ? 'Restore' : 'Archive', icon: ArchiveIcon, action: 'archive' },
                    ].map((item) => (
                      <button
                        key={item.action}
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAction(item.action, program) }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] text-xs transition-colors"
                      >
                        <item.icon size={13} />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 1: (Levels) (Equipment) (Other Tags) (Type of Program) */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: diffColor.bg, color: diffColor.text }}
          >
            {program.difficulty}
          </span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(192,192,192,0.1)] text-[#C0C0C0]">
            {program.equipment}
          </span>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: getGoalBg(program.goal), color: '#F0F0F0' }}
          >
            {goalLabel}
          </span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-[#00AEEF]">
            {program.method}
          </span>
        </div>

        {/* Row 2: (# Weeks) (Last Updated / # Days Ago) (# Active Users) */}
        <div className="mt-auto flex items-center justify-between text-[9px] text-[#6B6B6B]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar size={10} className="text-[#6B6B6B]" />
              <span>{program.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-[#6B6B6B]" />
              <span>{program.lastAssigned}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#A0A0A0]">
            <Users size={10} className="text-[#6B6B6B]" />
            <span>{program.activeClients} active</span>
          </div>
        </div>
      </div>

      {/* Expanded Detail View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-[#2A2A2A] bg-[#0A0A0A] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-[#F0F0F0] font-semibold text-sm">Program Overview</h4>
                <button
                  onClick={onToggleExpand}
                  className="text-[#A0A0A0] hover:text-[#F0F0F0] text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[#242424] transition-colors"
                >
                  Hide Program <ChevronUp size={14} />
                </button>
              </div>

              {/* Description */}
              <div className="text-[#A0A0A0] text-xs leading-relaxed space-y-2">
                <p>
                  <strong className="text-[#F0F0F0]">Structure:</strong> {program.structure}
                </p>
                <p>
                  <strong className="text-[#F0F0F0]">Equipment:</strong> {program.equipment}
                </p>
                <p>
                  <strong className="text-[#F0F0F0]">Progression:</strong> {program.progression}
                </p>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Edit', icon: Edit, action: 'edit' },
                  { label: 'Duplicate', icon: Copy, action: 'duplicate' },
                  { label: 'Assign', icon: UserPlus, action: 'assign' },
                  { label: program.archived ? 'Restore' : 'Archive', icon: ArchiveIcon, action: 'archive' },
                ].map((btn) => (
                  <button
                    key={btn.action}
                    onClick={() => onAction(btn.action, program)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] border border-[#2A2A2A] transition-colors"
                  >
                    <btn.icon size={12} />
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* View Full Program Toggle */}
              <div className="pt-2 border-t border-[#1F1F1F]">
                <button
                  onClick={onToggleDetail}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-[#00AEEF] hover:text-[#33BEF2] transition-colors"
                >
                  {showFullDetail ? (
                    <><EyeOff size={13} /> Hide Full Schedule</>
                  ) : (
                    <><Eye size={13} /> View Full Program</>
                  )}
                  <motion.span
                    animate={{ rotate: showFullDetail ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={13} />
                  </motion.span>
                </button>

                {/* Full Schedule */}
                <AnimatePresence>
                  {showFullDetail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-3">
                        <h5 className="text-[#F0F0F0] text-xs font-semibold">Weekly Schedule</h5>
                        {schedule.map((day, i) => (
                          <motion.div
                            key={day.day}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.25 }}
                            className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[#F0F0F0] text-xs font-semibold">{day.day}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00AEEF]/10 text-[#00AEEF] border border-[#00AEEF]/20">
                                  {day.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-[#6B6B6B]">
                                <span>{day.duration}</span>
                                <span className="text-[#A0A0A0]">{day.intensity}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {day.exercises.map((ex, j) => (
                                <span
                                  key={j}
                                  className="text-[9px] text-[#A0A0A0] bg-[#1A1A1A] px-2 py-0.5 rounded"
                                >
                                  {ex}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ))}

                        {/* Summary Footer */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-2 text-center">
                            <p className="text-[#00AEEF] text-xs font-bold">{program.duration}</p>
                            <p className="text-[9px] text-[#6B6B6B]">Duration</p>
                          </div>
                          <div className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-2 text-center">
                            <p className="text-[#00AEEF] text-xs font-bold">{program.frequency}</p>
                            <p className="text-[9px] text-[#6B6B6B]">Frequency</p>
                          </div>
                          <div className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-2 text-center">
                            <p className="text-[#00AEEF] text-xs font-bold">{program.difficulty}</p>
                            <p className="text-[9px] text-[#6B6B6B]">Level</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/** Program List Row */
function ProgramListRow({
  program,
  index,
  onAction,
}: {
  program: Program
  index: number
  onAction: (action: string, program: Program) => void
}) {
  const [hovered, setHovered] = useState(false)
  const diffColor = getDifficultyColor(program.difficulty)
  const goalLabel = GOAL_OPTIONS.find(g => program.goal.toLowerCase().includes(g.value))?.label || program.goal

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'border-b border-[#1F1F1F] transition-colors duration-150',
        index % 2 === 0 ? 'bg-[#0A0A0A]' : 'bg-[#141414]',
        hovered && 'bg-[#242424]'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: program.colorBanner }} />
          <div>
            <p className="text-[#F0F0F0] text-sm font-medium">{program.name}</p>
            {program.timesAssigned >= 15 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#EAB308] font-semibold">
                <Star size={10} /> Most Used
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: getGoalBg(program.goal), color: '#F0F0F0' }}>
          {goalLabel}
        </span>
      </td>
      <td className="px-4 py-3.5 text-[#A0A0A0] text-xs">{program.method}</td>
      <td className="px-4 py-3.5">
        <span className="text-xs font-semibold" style={{ color: diffColor.text }}>{program.difficulty}</span>
      </td>
      <td className="px-4 py-3.5 text-[#A0A0A0] text-xs">{program.duration}</td>
      <td className="px-4 py-3.5 text-[#A0A0A0] text-xs">{program.frequency}</td>
      <td className="px-4 py-3.5 text-[#A0A0A0] text-xs">{program.timesAssigned}x</td>
      <td className="px-4 py-3.5 text-[#6B6B6B] text-xs">{program.lastAssigned}</td>
      <td className="px-4 py-3.5">
        <div className={cn('flex items-center gap-1 transition-opacity', hovered ? 'opacity-100' : 'opacity-40')}>
          {[
            { icon: Edit, action: 'edit' },
            { icon: Copy, action: 'duplicate' },
            { icon: UserPlus, action: 'assign' },
            { icon: ArchiveIcon, action: 'archive' },
          ].map((btn) => (
            <button
              key={btn.action}
              onClick={() => onAction(btn.action, program)}
              className="text-[#A0A0A0] hover:text-[#F0F0F0] p-1.5 rounded hover:bg-[#242424] transition-colors"
              aria-label={btn.action}
            >
              <btn.icon size={14} />
            </button>
          ))}
        </div>
      </td>
    </motion.tr>
  )
}

/** Pagination */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => (
        typeof p === 'string' ? (
          <span key={`dots-${i}`} className="text-[#6B6B6B] px-1">{p}</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-[#00AEEF] text-white'
                : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424]'
            )}
          >
            {p}
          </button>
        )
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────
export default function ProgramsPage() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)

  // Sort & view
  const [sortBy, setSortBy] = useState<'mostUsed' | 'newest' | 'alpha'>('mostUsed')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Expanded card
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [fullDetailId, setFullDetailId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
    setFullDetailId(null)
  }

  // Fetch data
  useEffect(() => {
    fetch('./training_methods.json')
      .then((r) => r.json())
      .then((data: TrainingMethod[]) => {
        const progs = generateSamplePrograms(data)
        setPrograms(progs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derive filter options from data
  const methodOptions = useMemo(() => {
    const methods = new Set<string>()
    programs.forEach((p) => methods.add(p.method))
    return Array.from(methods).sort()
  }, [programs])

  // Stats
  const stats = useMemo(() => {
    const total = programs.length
    const active = programs.filter(p => !p.archived).length
    const archived = programs.filter(p => p.archived).length
    const mostUsed = programs.reduce((a, b) => (a.timesAssigned > b.timesAssigned ? a : b), programs[0])
    return { total, active, archived, mostUsedName: mostUsed?.name || '—' }
  }, [programs])

  // Filtered & sorted programs
  const filtered = useMemo(() => {
    let result = programs

    // Archive filter
    if (!showArchived) {
      result = result.filter(p => !p.archived)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.goal.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q) ||
        p.equipment.toLowerCase().includes(q)
      )
    }

    // Goal filter
    if (selectedGoals.length > 0) {
      result = result.filter(p => {
        const pg = normalizeGoal(p.goal)
        return selectedGoals.some(sg => pg.includes(sg))
      })
    }

    // Method filter
    if (selectedMethod) {
      result = result.filter(p => p.method === selectedMethod)
    }

    // Difficulty filter
    if (selectedDifficulties.length > 0) {
      result = result.filter(p => selectedDifficulties.includes(p.difficulty))
    }

    // Sort
    switch (sortBy) {
      case 'mostUsed':
        result = [...result].sort((a, b) => b.timesAssigned - a.timesAssigned)
        break
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'alpha':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [programs, searchQuery, selectedGoals, selectedMethod, selectedDifficulties, showArchived, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedGoals, selectedMethod, selectedDifficulties, showArchived, sortBy])

  // Actions
  const handleAction = useCallback((action: string, program: Program) => {
    switch (action) {
      case 'edit':
        navigate(`/programs/${program.id}/edit`)
        break
      case 'duplicate':
        alert(`Duplicated: ${program.name} (Copy)`)
        break
      case 'assign':
        alert(`Assign "${program.name}" to client`)
        break
      case 'archive':
        setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, archived: !p.archived } : p))
        break
    }
  }, [navigate])

  // Active filter count
  const activeFilterCount = selectedGoals.length + (selectedMethod ? 1 : 0) + selectedDifficulties.length + (showArchived ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGoals([])
    setSelectedMethod('')
    setSelectedDifficulties([])
    setShowArchived(false)
  }

  // Toggle helpers
  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal])
  }
  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties(prev => prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F0F0F0] text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Program Library
          </h1>
          <p className="text-[#A0A0A0] text-sm mt-0.5">{filtered.length} program{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <button
          onClick={() => navigate('/programs/new')}
          className="bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm flex items-center gap-2"
        >
          <Dumbbell size={16} />
          New Program
        </button>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl px-6 py-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FolderOpen} label="Total Programs" value={String(stats.total)} color="#F0F0F0" delay={0} />
          <StatCard icon={CheckCircle} label="Active" value={String(stats.active)} color="#22C55E" delay={0.06} />
          <StatCard icon={TrendingUp} label="Most Used This Month" value={stats.mostUsedName} color="#00AEEF" delay={0.12} />
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-left"
          >
            <StatCard icon={Archive} label={showArchived ? 'Showing Archived' : 'Archived'} value={String(stats.archived)} color="#6B6B6B" delay={0.18} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl px-5 py-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center bg-[#1A1A1A] rounded-full border border-[#2A2A2A] focus-within:border-[#00AEEF] transition-colors w-full sm:w-72">
            <Search size={16} className="text-[#6B6B6B] ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[#F0F0F0] text-sm placeholder-[#6B6B6B] px-3 py-2 w-full outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#6B6B6B] hover:text-[#F0F0F0] mr-3">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Goal Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#00AEEF] text-[#A0A0A0] text-sm px-4 py-2 rounded-lg transition-colors">
              <Filter size={14} />
              Goal
              {selectedGoals.length > 0 && (
                <span className="bg-[#00AEEF] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {selectedGoals.length}
                </span>
              )}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-52 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30 py-1">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => toggleGoal(goal.value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    selectedGoals.includes(goal.value)
                      ? 'text-[#00AEEF] bg-[rgba(0,174,239,0.1)]'
                      : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424]'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    selectedGoals.includes(goal.value) ? 'bg-[#00AEEF] border-[#00AEEF]' : 'border-[#6B6B6B]'
                  )}>
                    {selectedGoals.includes(goal.value) && <CheckCircle size={10} className="text-white" />}
                  </div>
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Method Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#00AEEF] text-[#A0A0A0] text-sm px-4 py-2 rounded-lg transition-colors">
              <Dumbbell size={14} />
              Method
              {selectedMethod && (
                <span className="bg-[#00AEEF] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>
              )}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30 py-1">
              <button
                onClick={() => setSelectedMethod('')}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  !selectedMethod ? 'text-[#00AEEF] bg-[rgba(0,174,239,0.1)]' : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424]'
                )}
              >
                All Methods
              </button>
              {methodOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m === selectedMethod ? '' : m)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    selectedMethod === m ? 'text-[#00AEEF] bg-[rgba(0,174,239,0.1)]' : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424]'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {DIFFICULTY_OPTIONS.map((diff) => (
              <button
                key={diff}
                onClick={() => toggleDifficulty(diff)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200',
                  selectedDifficulties.includes(diff)
                    ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.15)] text-[#00AEEF]'
                    : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#6B6B6B] hover:text-[#A0A0A0] hover:border-[#3A3A3A]'
                )}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-[#EF4444] hover:text-[#DC2626] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* Selected goal pills */}
        {selectedGoals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#1F1F1F]">
            {selectedGoals.map((goal) => {
              const label = GOAL_OPTIONS.find(g => g.value === goal)?.label || goal
              return (
                <span key={goal} className="inline-flex items-center gap-1 bg-[rgba(0,174,239,0.1)] text-[#00AEEF] text-xs px-2.5 py-1 rounded-full">
                  {label}
                  <button onClick={() => toggleGoal(goal)} className="hover:text-white"><X size={10} /></button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Sort & View Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6B6B6B] text-sm">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] text-sm px-3 py-1.5 pr-8 rounded-lg focus:border-[#00AEEF] outline-none cursor-pointer"
            >
              <option value="mostUsed">Most Used</option>
              <option value="newest">Newest First</option>
              <option value="alpha">Name A-Z</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-[#242424] text-[#F0F0F0]' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'
            )}
            aria-label="Grid view"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-[#242424] text-[#F0F0F0]' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'
            )}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden animate-pulse">
              <div className="h-14 bg-[#1A1A1A]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#1A1A1A] rounded w-3/4" />
                <div className="flex gap-1">
                  <div className="h-4 bg-[#1A1A1A] rounded w-12" />
                  <div className="h-4 bg-[#1A1A1A] rounded w-10" />
                </div>
                <div className="h-2 bg-[#1A1A1A] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Search size={48} className="text-[#6B6B6B] mb-4 opacity-50" />
          <h3 className="text-[#F0F0F0] font-semibold text-base mb-1">No programs found</h3>
          <p className="text-[#A0A0A0] text-sm mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="border border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)] font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start"
        >
          <AnimatePresence mode="popLayout">
            {paginated.map((program, i) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={i}
                onAction={handleAction}
                isExpanded={expandedId === program.id}
                showFullDetail={fullDetailId === program.id}
                onToggleExpand={() => toggleExpanded(program.id)}
                onToggleDetail={() => setFullDetailId(prev => prev === program.id ? null : program.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#141414] border-b border-[#2A2A2A]">
                {['Name', 'Goal', 'Method', 'Difficulty', 'Duration', 'Frequency', 'Used', 'Last', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#6B6B6B] text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.map((program, i) => (
                  <ProgramListRow key={program.id} program={program} index={i} onAction={handleAction} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </motion.div>
  )
}
