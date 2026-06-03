import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  Plus,
  Search,
  ChevronRight,
  X,
  Target,
  Dumbbell,
  BarChart3,
  Eye,
  EyeOff,
  Play,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCurrentCoach, loadClientsForCoach, getInitials } from '@/lib/auth'
import { getSessionsForCoach } from '@/lib/sessions'
import type { Client } from '@/types/auth'
import type { SavedSession } from '@/types'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ── Ring Animation Hook ─────────────────────────────── */
function useRingAnimation(targetPercent: number, delay: number = 0) {
  const [percent, setPercent] = useState(0)
  const [dotVisible, setDotVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDotVisible(targetPercent > 0)
      const startTime = performance.now()
      const duration = 1000
      function step(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(eased * targetPercent)
        setPercent(current)
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timer)
  }, [targetPercent, delay])

  return { percent, dotVisible }
}

/* ── Theme-aware track color helper ──────────────────── */
function useRingTrackColor() {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark ? '#1E293B' : '#E2E8F0'
}

/* ── Conic Ring ──────────────────────────────────────── */
function ConicRing({
  percent,
  color,
  size = 64,
  dotVisible = false,
  children,
}: {
  percent: number
  color: string
  size?: number
  dotVisible?: boolean
  children?: React.ReactNode
}) {
  const trackColor = useRingTrackColor()
  const isComplete = percent >= 100

  // FIX: angle starts at 0 for top (0% fill), progresses clockwise
  const angle = (percent / 100) * 360
  const maskInset = Math.max(5, Math.round(size * 0.11))
  const dotSize = Math.max(6, Math.round(size * 0.14))
  const radius = size / 2 - maskInset / 2 // center of stroke

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0 group"
      style={{ width: size, height: size }}
      title={`${Math.round(percent)}% complete`}
      role="img"
      aria-label={`Progress ring at ${Math.round(percent)} percent`}
    >
      {/* Progress trail — faint full-circle outline */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${percent}%, ${trackColor} 0%)`,
          boxShadow: `0 0 8px ${color}26, inset 0 0 12px rgba(0,0,0,0.15)`,
        }}
      />
      {/* Inner mask — creates donut hole */}
      <div
        className="absolute rounded-full bg-white dark:bg-[#151D2E]"
        style={{
          top: maskInset, left: maskInset, right: maskInset, bottom: maskInset,
          boxShadow: isComplete
            ? `inset 0 0 20px ${color}40, 0 0 30px ${color}30, inset 0 0 8px ${color}20`
            : 'inset 0 2px 6px rgba(0,0,0,0.15), 0 1px 2px rgba(255,255,255,0.05)',
          transition: 'box-shadow 0.6s ease',
        }}
      />
      {/* 100% success glow — soft inner highlight */}
      {isComplete && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: maskInset - 1, left: maskInset - 1, right: maskInset - 1, bottom: maskInset - 1,
            boxShadow: `inset 0 0 20px ${color}40, 0 0 24px ${color}20`,
            transition: 'opacity 0.8s ease',
            opacity: dotVisible ? 1 : 0,
          }}
        />
      )}
      {/* End-cap dot — FIXED: correct angle + radius */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full transition-opacity duration-300"
        style={{
          width: dotSize, height: dotSize,
          marginTop: -dotSize / 2, marginLeft: -dotSize / 2,
          background: color,
          boxShadow: `0 0 6px ${color}, 0 0 12px ${color}66`,
          transform: `rotate(${angle}deg) translateY(-${radius}px)`,
          opacity: dotVisible && percent > 0 ? 1 : 0,
        }}
      />
      {/* Center content */}
      <div className="relative z-10 text-center">{children}</div>

      {/* Hover tooltip */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  )
}

/* ── Status Segment Bar ──────────────────────────────── */
function StatusSegmentBar({ active, paused, archived }: { active: number; paused: number; archived: number }) {
  const total = active + paused + archived
  if (total === 0) return null
  return (
    <div className="flex items-center gap-2.5 text-[10px]">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
        <span className="text-gray-500 dark:text-[#94A3B8]">{active}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
        <span className="text-gray-500 dark:text-[#94A3B8]">{paused}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
        <span className="text-gray-500 dark:text-[#94A3B8]">{archived}</span>
      </div>
    </div>
  )
}

/* ── Ring Metric Card ────────────────────────────────── */
function RingMetricCard({
  ringPercent,
  ringColor,
  ringValue,
  label,
  value,
  delta,
  deltaColor = '#22C55E',
  extra,
  delay = 0,
  hideValue = false,
  onToggleHide,
}: {
  ringPercent: number
  ringColor: string
  ringValue: React.ReactNode
  label: string
  value: string
  delta: string
  deltaColor?: string
  extra?: React.ReactNode
  delay?: number
  hideValue?: boolean
  onToggleHide?: () => void
}) {
  const { percent, dotVisible } = useRingAnimation(ringPercent, delay)
  const [ringSize, setRingSize] = useState(64)

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      setRingSize(w < 640 ? 56 : w < 1024 ? 72 : w < 1400 ? 64 : 72)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const fontSize = Math.max(11, Math.round(ringSize * 0.22))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-xl border border-gray-200 dark:border-[#2A3A50] bg-white dark:bg-[#151D2E] relative overflow-hidden group hover:border-[rgba(0,174,239,0.2)] hover:shadow-[0_4px_24px_rgba(0,174,239,0.08)] transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(0,174,239,0.06) 0%, rgba(139,92,246,0.03) 100%)',
      }}
    >
      <div className="flex flex-col items-center text-center gap-2 p-3 sm:flex-row sm:items-center sm:text-left sm:gap-3.5 sm:p-4">
        <ConicRing percent={percent} color={ringColor} size={ringSize} dotVisible={dotVisible}>
          <span className="font-bold text-gray-900 dark:text-[#F1F5F9]" style={{ fontSize, lineHeight: 1.1 }}>
            {ringValue}
          </span>
        </ConicRing>
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 dark:text-[#94A3B8] font-medium uppercase tracking-wider text-[9px] sm:text-[10px] xl:text-[11px]">
            {label}
          </p>
          <div className="flex items-center gap-2 mt-0.5 justify-center sm:justify-start">
            <span className="font-bold text-gray-900 dark:text-[#F1F5F9] text-base sm:text-lg xl:text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
              {hideValue ? '••••' : value}
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${deltaColor}20`, color: deltaColor }}
            >
              {delta}
            </span>
          </div>
          {extra && <div className="mt-1">{extra}</div>}
        </div>
      </div>
      {onToggleHide && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleHide() }}
          className="absolute top-2 right-2 p-1 rounded text-gray-400 dark:text-[#6B6B6B] hover:text-gray-500 dark:hover:text-[#94A3B8] transition-colors"
        >
          {hideValue ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </motion.div>
  )
}

/* ── Status Badge ────────────────────────────────────── */
function ClientStatusBadge({ status }: { status: Client['status'] }) {
  const styles = {
    active: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', label: 'Active' },
    paused: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308', label: 'Paused' },
    archived: { bg: 'rgba(107,114,128,0.15)', text: '#9CA3AF', label: 'Archived' },
  }
  const s = styles[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.text }} />
      {s.label}
    </span>
  )
}

/* ── Learn How It Works Modal ────────────────────────── */
function LearnHowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const steps = [
    { icon: UserPlus, title: 'Add Your Clients', desc: 'Create client profiles with goals, experience level, and training preferences.' },
    { icon: Target, title: 'Set Goals', desc: 'Define primary goals, session frequency, and track progress over time.' },
    { icon: Dumbbell, title: 'Build Programs', desc: 'Coming in Phase 2 — create customized workout programs for each client.' },
    { icon: BarChart3, title: 'Track Progress', desc: 'Coming in Phase 3 — monitor body composition, strength gains, and adherence.' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[300]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="fixed inset-0 flex items-center justify-center z-[310] p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-2xl p-6 sm:p-8 w-full max-w-md pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 dark:text-[#F1F5F9] text-lg font-semibold">How AzFIT Works</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-[#6B6B6B] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <step.icon size={16} className="text-[#00AEEF]" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-[#F1F5F9] text-sm font-medium">{i + 1}. {step.title}</p>
                      <p className="text-gray-500 dark:text-[#94A3B8] text-xs leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full mt-6 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Empty Dashboard ─────────────────────────────────── */
function EmptyDashboard({ coachName, onAddClient }: { coachName: string; onAddClient: () => void }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        {/* Illustration — Person with Clipboard SVG */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 rounded-full bg-cyan-50 dark:bg-[rgba(0,174,239,0.08)] flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-[#00AEEF]">
              <rect x="6" y="3" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="9" y1="3" x2="9" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="3" x2="15" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="2" x2="15" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              <line x1="9" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              <path d="M15 13l1.5 1.5L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="22" r="3" fill="currentColor" opacity="0.15" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#00AEEF]/20 animate-ping" />
        </div>

        <h2 className="text-gray-900 dark:text-[#F1F5F9] text-2xl font-bold mb-3">
          Welcome to AzFIT, {coachName}!
        </h2>
        <p className="text-gray-500 dark:text-[#94A3B8] text-sm max-w-md mb-8 leading-relaxed">
          Start by adding your first client. Track their progress, build programs, and transform results.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onAddClient}
            className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
          >
            <UserPlus size={16} />
            Add New Client
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 border border-gray-200 dark:border-[#2A3A50] hover:border-[#00AEEF]/50 text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F1F5F9] font-medium px-6 py-3 rounded-xl transition-all duration-200 text-sm"
          >
            Learn How It Works
          </button>
        </div>
      </motion.div>

      <LearnHowModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

/* ── Main Dashboard ──────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate()
  const coach = getCurrentCoach()
  const [searchQuery, setSearchQuery] = useState('')
  const [hideRevenue, setHideRevenue] = useState(false)

  useEffect(() => {
    if (!coach) {
      navigate('/login')
    }
  }, [coach, navigate])

  const [clients, setClients] = useState<Client[]>([])
  const [sessions, setSessions] = useState<SavedSession[]>([])

  useEffect(() => {
    if (!coach) return
    loadClientsForCoach(coach.id).then(setClients)
    getSessionsForCoach(coach.id).then(setSessions)
  }, [coach])

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const q = searchQuery.toLowerCase()
    return clients.filter(c =>
      c.personal.fullName.toLowerCase().includes(q) ||
      c.personal.email.toLowerCase().includes(q)
    )
  }, [clients, searchQuery])

  const stats = useMemo(() => {
    const total = clients.length
    const active = clients.filter(c => c.status === 'active').length
    const paused = clients.filter(c => c.status === 'paused').length
    const archived = clients.filter(c => c.status === 'archived').length
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const newThisWeek = clients.filter(c => new Date(c.createdAt) >= oneWeekAgo).length

    // Real session data
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const thisWeekSessions = sessions.filter(s => {
      const d = new Date(s.startTime)
      return d >= startOfWeek && s.status === 'completed'
    })

    const sessionTarget = clients.reduce((sum, c) => sum + (c.goals.sessionsPerWeek || 0), 0)
    const sessionCompleted = thisWeekSessions.length
    const sessionPercent = sessionTarget > 0 ? Math.min(100, Math.round((sessionCompleted / sessionTarget) * 100)) : 0

    // Adherence = actual completed sessions / planned sessions over last 4 weeks
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const recentSessions = sessions.filter(s => {
      const d = new Date(s.startTime)
      return d >= fourWeeksAgo && s.status === 'completed'
    })
    const fourWeekTarget = clients.reduce((sum, c) => sum + (c.goals.sessionsPerWeek || 0), 0) * 4
    const adherence = fourWeekTarget > 0 ? Math.min(100, Math.round((recentSessions.length / fourWeekTarget) * 100)) : 0

    // Revenue estimate: completed sessions × $65 average session rate
    const weeklyRevenue = sessionCompleted * 65
    const revenueTarget = sessionTarget * 65
    const revenuePercent = revenueTarget > 0 ? Math.min(100, Math.round((weeklyRevenue / revenueTarget) * 100)) : 0

    return { total, active, paused, archived, newThisWeek, sessionTarget, sessionCompleted, sessionPercent, adherence, weeklyRevenue, revenueTarget, revenuePercent }
  }, [clients, sessions])

  if (!coach) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Empty State */}
      {clients.length === 0 && (
        <EmptyDashboard
          coachName={coach.fullName.split(' ')[0]}
          onAddClient={() => navigate('/clients/add')}
        />
      )}

      {/* Dashboard with clients */}
      {clients.length > 0 && (
        <>
          {/* KPI Ring Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <RingMetricCard
              delay={0}
              ringPercent={stats.sessionPercent}
              ringColor="#00AEEF"
              ringValue={`${stats.sessionPercent}%`}
              label="Sessions This Week"
              value={`${stats.sessionCompleted}/${stats.sessionTarget}`}
              delta={`+${Math.max(0, Math.round(stats.sessionTarget * 0.15))}`}
              deltaColor="#22C55E"
            />
            <RingMetricCard
              delay={0.1}
              ringPercent={stats.adherence}
              ringColor="#8B5CF6"
              ringValue={`${stats.adherence}%`}
              label="Adherence Score"
              value={`${stats.adherence}%`}
              delta="+5%"
              deltaColor="#22C55E"
            />
            <RingMetricCard
              delay={0.2}
              ringPercent={100}
              ringColor="#22C55E"
              ringValue={stats.active}
              label="Active Clients"
              value={`${stats.active}`}
              delta={`+${stats.newThisWeek}`}
              deltaColor="#22C55E"
              extra={<StatusSegmentBar active={stats.active} paused={stats.paused} archived={stats.archived} />}
            />
            <RingMetricCard
              delay={0.3}
              ringPercent={stats.revenuePercent}
              ringColor="#F59E0B"
              ringValue={`$${Math.round(stats.weeklyRevenue / 100)}`}
              label="Weekly Revenue"
              value={`$${stats.weeklyRevenue.toLocaleString()}`}
              delta={`${stats.revenuePercent >= 100 ? '+' : ''}${stats.revenuePercent - 100}%`}
              deltaColor={stats.revenuePercent >= 100 ? '#22C55E' : '#F59E0B'}
              hideValue={hideRevenue}
              onToggleHide={() => setHideRevenue(v => !v)}
            />
          </div>

          {/* Client List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: easeOut }}
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-gray-900 dark:text-[#F1F5F9] text-lg font-semibold">Your Clients</h2>
                <span className="text-gray-500 dark:text-[#94A3B8] text-sm">({clients.length})</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B6B6B]" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-[#F0F0F0] placeholder:text-gray-400 dark:placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#00AEEF] transition-colors"
                  />
                </div>
                <button
                  onClick={() => navigate('/programs/session/quick')}
                  className="flex items-center gap-1.5 bg-[#00AEEF]/10 hover:bg-[#00AEEF]/20 text-[#00AEEF] text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  <Zap size={13} />
                  Quick Session
                </button>
                <Link
                  to="/clients"
                  className="text-[#00AEEF] text-xs font-medium hover:text-[#33BFF2] transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  View All
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Client Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredClients.map((client, idx) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: 0.1 + idx * 0.05, ease: easeOut }}
                    whileHover={{ y: -3, transition: { duration: 0.25 } }}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5 relative cursor-pointer hover:border-[rgba(0,174,239,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-250"
                  >
                    {/* Top Row: Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)', color: '#fff' }}
                      >
                        {getInitials(client.personal.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 dark:text-[#F1F5F9] text-sm font-semibold truncate">{client.personal.fullName}</p>
                        <p className="text-gray-400 dark:text-[#6B6B6B] text-xs">
                          {client.personal.age} yrs · {client.personal.gender.charAt(0).toUpperCase() + client.personal.gender.slice(1)}
                        </p>
                      </div>
                    </div>

                    {/* Goal + Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <ClientStatusBadge status={client.status} />
                      <span className="text-xs text-gray-500 dark:text-[#94A3B8]">{client.goals.primary}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <p className="text-gray-900 dark:text-[#F1F5F9] text-xs font-semibold" style={{ fontFamily: '"Space Mono", monospace' }}>
                          {client.goals.sessionsPerWeek}
                        </p>
                        <p className="text-gray-400 dark:text-[#6B6B6B] text-[10px] mt-0.5">Sessions/wk</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-900 dark:text-[#F1F5F9] text-xs font-semibold" style={{ fontFamily: '"Space Mono", monospace' }}>
                          {client.goals.sessionDuration}
                        </p>
                        <p className="text-gray-400 dark:text-[#6B6B6B] text-[10px] mt-0.5">Mins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-900 dark:text-[#F1F5F9] text-xs font-semibold" style={{ fontFamily: '"Space Mono", monospace' }}>
                          {client.goals.experienceLevel}
                        </p>
                        <p className="text-gray-400 dark:text-[#6B6B6B] text-[10px] mt-0.5">Level</p>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#1F1F1F]">
                      <p className="text-gray-400 dark:text-[#6B6B6B] text-[10px]">
                        Added {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                      <span className="text-[#00AEEF] text-xs font-medium hover:underline">
                        View Profile
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredClients.length === 0 && searchQuery && (
              <div className="text-center py-12 text-gray-400 dark:text-[#6B6B6B] text-sm">
                No clients match your search
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-[250]">
        <motion.button
          onClick={() => navigate('/clients/add')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(0,174,239,0.3)] hover:shadow-[0_4px_28px_rgba(0,174,239,0.45)]"
          style={{
            background: '#00AEEF',
            animation: 'pulseGlow 2s infinite',
          }}
          title="Add New Client"
        >
          <Plus size={22} />
        </motion.button>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,174,239,0.3); }
          50% { box-shadow: 0 4px 28px rgba(0,174,239,0.5), 0 0 20px 4px rgba(0,174,239,0.2); }
        }
      `}</style>
    </motion.div>
  )
}
