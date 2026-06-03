import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Play,
  X,
  Dumbbell,
  ChevronDown,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { cn } from '../lib/utils'

// ── Types ──────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/shorts\/|\/embed\/|\/v\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ''
}

function getYouTubeEmbed(url: string): string {
  const id = extractYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : ''
}

function generateSafetyNotes(exercise: Exercise): string {
  const notes: Record<string, string> = {
    'Barbell Back Squat': 'Keep core braced throughout. Do not round lower back. Use safety bars when training heavy.',
    'Romanian Deadlift': 'Maintain neutral spine. Do not hyperextend at lockout. Stop if hamstring strain is felt.',
    'Bench Press': 'Use spotter for heavy sets. Keep feet planted. Do not bounce bar off chest.',
    'Overhead Press': 'Avoid excessive lumbar arch. Brace abs. Do not use leg drive unless specified.',
    'Pull-Up': 'Full range of motion. Control descent. Avoid swinging or kipping unless specified.',
    'Barbell Row': 'Keep back flat. Pull to lower chest/upper abs. Avoid excessive momentum.',
    'Front Squat': 'Elbows must stay high. Core tight. Stop if wrist/elbow pain occurs.',
    'Incline Dumbbell Press': 'Control dumbbells on descent. Do not drop from top position.',
  }
  return notes[exercise.Name] || `Perform with controlled tempo. Use appropriate weight for ${exercise.Difficulty} level. Ensure proper warm-up before attempting.`
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', darkBg: 'dark:bg-emerald-500/10', darkText: 'dark:text-emerald-400' }
    case 'Intermediate': return { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', darkBg: 'dark:bg-amber-500/10', darkText: 'dark:text-amber-400' }
    case 'Advanced': return { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', darkBg: 'dark:bg-red-500/10', darkText: 'dark:text-red-400' }
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20', darkBg: 'dark:bg-slate-500/10', darkText: 'dark:text-slate-400' }
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'Compound': return { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/20', darkBg: 'dark:bg-sky-500/10', darkText: 'dark:text-sky-400' }
    case 'Isolation': return { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/20', darkBg: 'dark:bg-violet-500/10', darkText: 'dark:text-violet-400' }
    case 'Olympic': return { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20', darkBg: 'dark:bg-orange-500/10', darkText: 'dark:text-orange-400' }
    case 'Plyo': return { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500/20', darkBg: 'dark:bg-pink-500/10', darkText: 'dark:text-pink-400' }
    case 'Isometric': return { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/20', darkBg: 'dark:bg-teal-500/10', darkText: 'dark:text-teal-400' }
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20', darkBg: 'dark:bg-slate-500/10', darkText: 'dark:text-slate-400' }
  }
}

function getMuscleColor(muscle: string) {
  if (muscle.includes('Chest')) return { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20', darkBg: 'dark:bg-rose-500/10', darkText: 'dark:text-rose-400' }
  if (muscle.includes('Back')) return { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20', darkBg: 'dark:bg-indigo-500/10', darkText: 'dark:text-indigo-400' }
  if (muscle.includes('Quads') || muscle.includes('Leg')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', darkBg: 'dark:bg-emerald-500/10', darkText: 'dark:text-emerald-400' }
  if (muscle.includes('Hamstrings')) return { bg: 'bg-lime-500/10', text: 'text-lime-600', border: 'border-lime-500/20', darkBg: 'dark:bg-lime-500/10', darkText: 'dark:text-lime-400' }
  if (muscle.includes('Shoulders')) return { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20', darkBg: 'dark:bg-cyan-500/10', darkText: 'dark:text-cyan-400' }
  if (muscle.includes('Biceps') || muscle.includes('Triceps')) return { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', darkBg: 'dark:bg-amber-500/10', darkText: 'dark:text-amber-400' }
  if (muscle.includes('Core') || muscle.includes('Abs')) return { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20', darkBg: 'dark:bg-orange-500/10', darkText: 'dark:text-orange-400' }
  return { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20', darkBg: 'dark:bg-slate-500/10', darkText: 'dark:text-slate-400' }
}

// ── Filter Dropdown ────────────────────────────────────
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors min-w-[140px]",
          "bg-white dark:bg-gray-50 dark:bg-[#141414] border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A] text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0]",
          "hover:border-[#00AEEF] dark:hover:border-[#00AEEF]"
        )}
      >
        <span className="text-gray-500 dark:text-[#94A3B8] text-xs">{label}</span>
        <span className="font-medium truncate">{value}</span>
        <ChevronDown size={14} className={cn("ml-auto transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1 w-full min-w-[160px] bg-white dark:bg-gray-100 dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A] rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto"
            >
              <button
                onClick={() => { onChange('All'); setOpen(false) }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm transition-colors",
                  value === 'All'
                    ? "bg-[#00AEEF]/10 text-[#00AEEF]"
                    : "text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0] hover:bg-[#F1F5F9] dark:hover:bg-gray-200 dark:hover:bg-[#242424]"
                )}
              >
                All
              </button>
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-sm transition-colors",
                    value === opt
                      ? "bg-[#00AEEF]/10 text-[#00AEEF]"
                      : "text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0] hover:bg-[#F1F5F9] dark:hover:bg-gray-200 dark:hover:bg-[#242424]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Exercise Card ──────────────────────────────────────
function ExerciseCard({
  exercise,
  index,
  onPlay,
}: {
  exercise: Exercise
  index: number
  onPlay: (ex: Exercise) => void
}) {
  const [showSafety, setShowSafety] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const diffColor = getDifficultyColor(exercise.Difficulty)
  const typeColor = getTypeColor(exercise.Type)
  const muscleColor = getMuscleColor(exercise.MuscleGroup)
  const thumb = getYouTubeThumbnail(exercise.VideoURL)
  const safetyNotes = generateSafetyNotes(exercise)
  const descTooLong = exercise.Description.length > 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.02, ease: [0.16, 1, 0.3, 1] }}
      layout
      className={cn(
        "bg-white dark:bg-gray-50 dark:bg-[#141414] border border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A] rounded-xl overflow-hidden",
        "flex flex-col transition-all duration-200 hover:shadow-lg dark:hover:shadow-[0_8px_24px_rgba(0,174,239,0.08)]"
      )}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-[#0A0A0A] group cursor-pointer" onClick={() => onPlay(exercise)}>
        {thumb ? (
          <img
            src={thumb}
            alt={exercise.Name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#1A1A1A]">
            <Dumbbell size={32} className="text-[#3A3A3A]" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-[#00AEEF]/80 transition-all duration-200">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm mb-2.5">
          {exercise.Name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
            muscleColor.bg, muscleColor.text, muscleColor.border,
            muscleColor.darkBg, muscleColor.darkText
          )}>
            {exercise.MuscleGroup}
          </span>
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
            diffColor.bg, diffColor.text, diffColor.border,
            diffColor.darkBg, diffColor.darkText
          )}>
            {exercise.Difficulty}
          </span>
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
            typeColor.bg, typeColor.text, typeColor.border,
            typeColor.darkBg, typeColor.darkText
          )}>
            {exercise.Type}
          </span>
        </div>

        {/* Equipment */}
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#94A3B8] mb-2">
          <Dumbbell size={12} />
          <span className="text-[11px]">{exercise.Equipment}</span>
        </div>

        {/* Description */}
        <p className="text-[#64748B] dark:text-gray-500 dark:text-[#A0A0A0] text-xs leading-relaxed mb-2 flex-1">
          {showFullDesc ? exercise.Description : exercise.Description.slice(0, 80)}
          {descTooLong && !showFullDesc && '...'}
        </p>
        {descTooLong && (
          <button
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="text-[#00AEEF] text-xs font-medium hover:underline mb-2 text-left"
          >
            {showFullDesc ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Safety Notes Toggle */}
        <button
          onClick={() => setShowSafety(!showSafety)}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors mt-auto",
            showSafety ? "text-amber-500" : "text-gray-500 dark:text-[#94A3B8] hover:text-amber-500"
          )}
        >
          <AlertTriangle size={12} />
          {showSafety ? 'Hide safety notes' : 'Show safety notes'}
        </button>
        <AnimatePresence>
          {showSafety && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 rounded-lg">
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  {safetyNotes}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Video Modal ────────────────────────────────────────
function VideoModal({ exercise, onClose }: { exercise: Exercise | null; onClose: () => void }) {
  if (!exercise) return null
  const embedUrl = getYouTubeEmbed(exercise.VideoURL)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-gray-50 dark:bg-[#141414] border border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A] rounded-xl overflow-hidden w-full max-w-3xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A]">
            <div>
              <h3 className="text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm">{exercise.Name}</h3>
              <p className="text-gray-500 dark:text-[#94A3B8] text-xs">{exercise.MuscleGroup} &middot; {exercise.Difficulty}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:bg-[#F1F5F9] dark:hover:bg-gray-200 dark:hover:bg-[#242424] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Video */}
          <div className="aspect-video bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={exercise.Name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-[#6B6B6B]">
                Video not available
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-gray-100 dark:bg-[#1A1A1A] text-[#64748B] dark:text-gray-500 dark:text-[#A0A0A0] border border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A]">
                {exercise.Equipment}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-gray-100 dark:bg-[#1A1A1A] text-[#64748B] dark:text-gray-500 dark:text-[#A0A0A0] border border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A]">
                {exercise.Type}
              </span>
            </div>
            <p className="text-[#64748B] dark:text-gray-500 dark:text-[#A0A0A0] text-xs leading-relaxed">
              {exercise.Description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main Page ──────────────────────────────────────────
export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('All')
  const [equipmentFilter, setEquipmentFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [playingExercise, setPlayingExercise] = useState<Exercise | null>(null)

  // Fetch data
  useEffect(() => {
    fetch('./exercises_db.json')
      .then((r) => r.json())
      .then((data: Exercise[]) => {
        setExercises(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derive filter options
  const muscleOptions = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((e) => set.add(e.MuscleGroup))
    return Array.from(set).sort()
  }, [exercises])

  const equipmentOptions = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((e) => set.add(e.Equipment))
    return Array.from(set).sort()
  }, [exercises])

  const difficultyOptions = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((e) => set.add(e.Difficulty))
    return Array.from(set).sort()
  }, [exercises])

  const typeOptions = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((e) => set.add(e.Type))
    return Array.from(set).sort()
  }, [exercises])

  // Filter
  const filtered = useMemo(() => {
    let result = exercises
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.Name.toLowerCase().includes(q) ||
          e.MuscleGroup.toLowerCase().includes(q) ||
          e.Equipment.toLowerCase().includes(q) ||
          e.Description.toLowerCase().includes(q)
      )
    }
    if (muscleFilter !== 'All') result = result.filter((e) => e.MuscleGroup === muscleFilter)
    if (equipmentFilter !== 'All') result = result.filter((e) => e.Equipment === equipmentFilter)
    if (difficultyFilter !== 'All') result = result.filter((e) => e.Difficulty === difficultyFilter)
    if (typeFilter !== 'All') result = result.filter((e) => e.Type === typeFilter)
    return result
  }, [exercises, searchQuery, muscleFilter, equipmentFilter, difficultyFilter, typeFilter])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setMuscleFilter('All')
    setEquipmentFilter('All')
    setDifficultyFilter('All')
    setTypeFilter('All')
  }, [])

  const hasFilters = searchQuery || muscleFilter !== 'All' || equipmentFilter !== 'All' || difficultyFilter !== 'All' || typeFilter !== 'All'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0]">Exercise Library</h2>
          <p className="text-sm text-gray-500 dark:text-[#94A3B8] mt-0.5">
            {filtered.length} of {exercises.length} exercises
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none transition-colors",
              "bg-white dark:bg-gray-50 dark:bg-[#141414] border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A]",
              "text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0]",
              "focus:border-[#00AEEF] dark:focus:border-[#00AEEF]"
            )}
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-gray-500 dark:text-[#94A3B8] mr-1" />
          <FilterDropdown label="Muscle" value={muscleFilter} options={muscleOptions} onChange={setMuscleFilter} />
          <FilterDropdown label="Equipment" value={equipmentFilter} options={equipmentOptions} onChange={setEquipmentFilter} />
          <FilterDropdown label="Difficulty" value={difficultyFilter} options={difficultyOptions} onChange={setDifficultyFilter} />
          <FilterDropdown label="Type" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#00AEEF] hover:underline font-medium ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-50 dark:bg-[#141414] border border-[#E2E8F0] dark:border-gray-200 dark:border-[#2A2A2A] rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-100 dark:bg-[#1A1A1A]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-[#1A1A1A] rounded w-3/4" />
                <div className="flex gap-1">
                  <div className="h-4 bg-gray-100 dark:bg-[#1A1A1A] rounded w-12" />
                  <div className="h-4 bg-gray-100 dark:bg-[#1A1A1A] rounded w-10" />
                </div>
                <div className="h-2 bg-gray-100 dark:bg-[#1A1A1A] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Search size={48} className="text-gray-500 dark:text-[#94A3B8] mb-4 opacity-50" />
          <h3 className="text-[#0F172A] dark:text-gray-900 dark:text-[#F0F0F0] font-semibold text-base mb-1">No exercises found</h3>
          <p className="text-gray-500 dark:text-[#94A3B8] text-sm mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="border border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)] font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((exercise, i) => (
              <ExerciseCard
                key={exercise.ExerciseID}
                exercise={exercise}
                index={i}
                onPlay={setPlayingExercise}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {playingExercise && (
          <VideoModal exercise={playingExercise} onClose={() => setPlayingExercise(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
