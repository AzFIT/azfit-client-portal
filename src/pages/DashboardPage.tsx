import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  Plus,
  CalendarPlus,
  Dumbbell,
  MessageSquare,
  AlertTriangle,
  Bell,
  Info,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/* ------------------------------------------------------------------ */
/*  Easing                                                             */
/* ------------------------------------------------------------------ */
const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number]
const easeSpring = [0.175, 0.885, 0.32, 1.275] as [number, number, number, number]
const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SessionItem {
  time: string
  client: string
  type: string
  duration: string
  status: 'completed' | 'in-progress' | 'upcoming'
  color: string
}

interface AlertItem {
  type: 'danger' | 'warning' | 'info' | 'success'
  message: string
  client: string
  time: string
}

interface ClientData {
  id: number
  name: string
  weight: string
  bodyFat: string
  sessions: number
  status: 'active' | 'warning' | 'alert'
  lastSession: string
}

/* ------------------------------------------------------------------ */
/*  Circular Progress Ring (conic-gradient style)                     */
/* ------------------------------------------------------------------ */
function CircularProgress({
  percentage,
  color,
  size = 80,
  strokeWidth = 8,
  children,
}: {
  percentage: number
  color: string
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Metric Card Base                                                   */
/* ------------------------------------------------------------------ */
function MetricCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-xl border border-[#2A2A2A] p-5 relative overflow-hidden group hover:border-[rgba(0,174,239,0.2)] hover:shadow-[0_4px_24px_rgba(0,174,239,0.08)] transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(0,174,239,0.08) 0%, rgba(139,92,246,0.04) 100%), #141414',
      }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Card 1 — Sessions This Week                                        */
/* ------------------------------------------------------------------ */
function SessionsCard() {
  const booked = 14
  const attended = 12
  const lastWeek = 11
  const percentage = Math.round((attended / booked) * 100)
  const diff = booked - lastWeek

  return (
    <MetricCard delay={0}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-3" style={{ color: '#FFFFFF' }}>Sessions This Week</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold" style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF' }}>
              {attended}/{booked}
            </span>
            <span className="text-xs font-medium" style={{ color: '#22C55E' }}>+{diff} vs last week</span>
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{booked} booked this week</p>
        </div>
        <CircularProgress percentage={percentage} color="#22C55E" size={72} strokeWidth={6}>
          <div className="text-center">
            <span className="text-sm font-bold" style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF' }}>
              {percentage}%
            </span>
          </div>
        </CircularProgress>
      </div>
    </MetricCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Card 2 — Active Clients                                            */
/* ------------------------------------------------------------------ */
function ActiveClientsCard() {
  const total = 24
  const active = 18      // seen within 2 weeks
  const semiActive = 4   // not seen in 2-4 weeks
  const needAttention = 2 // not seen in >1 month
  const percentage = Math.round((active / total) * 100)

  return (
    <MetricCard delay={0.08}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-3" style={{ color: '#FFFFFF' }}>Active Clients</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold" style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF' }}>
              {active}/{total}
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{active} seen within 2 weeks</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{semiActive} semi-active (2–4 wks)</p>
            {needAttention > 0 && (
              <p className="text-[11px] font-medium" style={{ color: '#EF4444' }}>{needAttention} require attention (&gt;1 month)</p>
            )}
          </div>
        </div>
        <CircularProgress percentage={percentage} color="#8B5CF6" size={72} strokeWidth={6}>
          <div className="text-center">
            <span className="text-sm font-bold" style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF' }}>
              {percentage}%
            </span>
          </div>
        </CircularProgress>
      </div>
    </MetricCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Card 3 — Total New Signups                                         */
/* ------------------------------------------------------------------ */
function SignupsCard() {
  const current = 3
  const goal = 8
  const percentage = Math.round((current / goal) * 100)

  return (
    <MetricCard delay={0.16}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-3" style={{ color: '#FFFFFF' }}>New Signups</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold" style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF' }}>
              {current}
            </span>
            <span className="text-xs font-medium" style={{ color: '#F97316' }}>/ {goal} goal</span>
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{current} new signups this month</p>
        </div>
        <CircularProgress percentage={percentage} color="#F97316" size={72} strokeWidth={6}>
          <div className="text-center">
            <span className="text-sm font-bold" style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF' }}>
              {percentage}%
            </span>
          </div>
        </CircularProgress>
      </div>
    </MetricCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Card 4 — Weekly Revenue                                            */
/* ------------------------------------------------------------------ */
function RevenueCard() {
  const [revealed, setRevealed] = useState(false)
  const revenue = 48650
  const lastMonth = 43400
  const percentage = Math.round(((revenue - lastMonth) / lastMonth) * 100)
  const goal = 60000
  const goalPct = Math.round((revenue / goal) * 100)

  const formatCurrency = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <MetricCard delay={0.24}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: '#FFFFFF' }}>Weekly Revenue</p>
            <button
              onClick={() => setRevealed(v => !v)}
              className="text-[#6B6B6B] hover:text-[#00AEEF] transition-colors"
              title={revealed ? 'Hide' : 'Reveal'}
            >
              {revealed ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="text-2xl font-bold transition-all"
              style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF', filter: revealed ? 'none' : 'blur(6px)' }}
            >
              {formatCurrency(revenue)}
            </span>
          </div>
          <p className="text-[11px] font-medium" style={{ color: '#22C55E' }}>+{percentage}% vs last month</p>
        </div>
        <CircularProgress percentage={goalPct} color="#00AEEF" size={72} strokeWidth={6}>
          <div className="text-center">
            <span className="text-sm font-bold" style={{ fontFamily: '"Space Mono", monospace', color: '#FFFFFF' }}>
              {goalPct}%
            </span>
          </div>
        </CircularProgress>
      </div>
    </MetricCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Sample Data                                                        */
/* ------------------------------------------------------------------ */
const todaySessions: SessionItem[] = [
  { time: '07:00', client: 'Michael T.', type: 'Strength', duration: '60 min', status: 'completed', color: '#00AEEF' },
  { time: '09:00', client: 'Sarah L.', type: 'Hypertrophy', duration: '90 min', status: 'in-progress', color: '#8B5CF6' },
  { time: '11:00', client: 'David K.', type: 'Fat Loss', duration: '60 min', status: 'upcoming', color: '#22C55E' },
  { time: '14:00', client: 'Emma W.', type: 'Rehabilitation', duration: '45 min', status: 'upcoming', color: '#EAB308' },
  { time: '16:00', client: 'James C.', type: 'Strength', duration: '60 min', status: 'upcoming', color: '#00AEEF' },
  { time: '18:00', client: 'Lisa M.', type: 'Endurance', duration: '45 min', status: 'upcoming', color: '#F97316' },
]

const followupAlerts: AlertItem[] = [
  { type: 'danger', message: 'Missed check-in for 3 days', client: 'Michael T.', time: '2h ago' },
  { type: 'warning', message: 'Program expires in 2 days', client: 'Sarah L.', time: '5h ago' },
  { type: 'info', message: 'New body stats uploaded', client: 'David K.', time: '1d ago' },
  { type: 'success', message: 'Goal achieved: -5kg weight loss', client: 'Emma W.', time: '1d ago' },
  { type: 'warning', message: 'Low adherence this week (65%)', client: 'James C.', time: '2d ago' },
]

const clientList: ClientData[] = [
  { id: 1, name: 'Sarah Johnson', weight: '62.3 kg', bodyFat: '22.1%', sessions: 18, status: 'active', lastSession: '15/01/2025' },
  { id: 2, name: 'Mike Chen', weight: '78.5 kg', bodyFat: '14.2%', sessions: 24, status: 'active', lastSession: '14/01/2025' },
  { id: 3, name: 'Emily Wong', weight: '55.8 kg', bodyFat: '21.4%', sessions: 15, status: 'active', lastSession: '11/01/2025' },
  { id: 4, name: 'David Lau', weight: '85.0 kg', bodyFat: '18.5%', sessions: 31, status: 'warning', lastSession: '10/01/2025' },
  { id: 5, name: 'Jessica Park', weight: '58.7 kg', bodyFat: '19.8%', sessions: 12, status: 'active', lastSession: '13/01/2025' },
  { id: 6, name: 'Ryan Tan', weight: '91.2 kg', bodyFat: '24.3%', sessions: 8, status: 'alert', lastSession: '05/01/2025' },
  { id: 7, name: 'Amanda Lee', weight: '65.4 kg', bodyFat: '16.1%', sessions: 27, status: 'active', lastSession: '15/01/2025' },
  { id: 8, name: 'Kevin Ho', weight: '76.4 kg', bodyFat: '13.9%', sessions: 35, status: 'active', lastSession: '15/01/2025' },
  { id: 9, name: 'Michelle Tsang', weight: '60.2 kg', bodyFat: '17.8%', sessions: 22, status: 'active', lastSession: '14/01/2025' },
  { id: 10, name: 'Jason Wong', weight: '80.1 kg', bodyFat: '15.5%', sessions: 20, status: 'active', lastSession: '12/01/2025' },
  { id: 11, name: 'Stephanie Yau', weight: '68.9 kg', bodyFat: '23.5%', sessions: 10, status: 'warning', lastSession: '08/01/2025' },
  { id: 12, name: 'Chris Chan', weight: '88.6 kg', bodyFat: '20.2%', sessions: 6, status: 'alert', lastSession: '03/01/2025' },
]

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: SessionItem['status'] }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22C55E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        Done
      </span>
    )
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00AEEF]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] animate-pulse" />
        Now
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B6B]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B]" />
      Upcoming
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Alert Icon                                                         */
/* ------------------------------------------------------------------ */
function AlertIcon({ type }: { type: AlertItem['type'] }) {
  const props = { size: 18, className: 'flex-shrink-0' }
  switch (type) {
    case 'danger':
      return <AlertTriangle {...props} className="flex-shrink-0 text-[#EF4444]" />
    case 'warning':
      return <Clock {...props} className="flex-shrink-0 text-[#EAB308]" />
    case 'info':
      return <Info {...props} className="flex-shrink-0 text-[#3B82F6]" />
    case 'success':
      return <CheckCircle2 {...props} className="flex-shrink-0 text-[#22C55E]" />
    default:
      return <Bell {...props} className="flex-shrink-0 text-[#6B6B6B]" />
  }
}

function AlertBorderColor({ type }: { type: AlertItem['type'] }) {
  switch (type) {
    case 'danger': return '#EF4444'
    case 'warning': return '#EAB308'
    case 'info': return '#3B82F6'
    case 'success': return '#22C55E'
    default: return '#6B6B6B'
  }
}

/* ------------------------------------------------------------------ */
/*  Status Dot                                                         */
/* ------------------------------------------------------------------ */
function StatusDot({ status }: { status: ClientData['status'] }) {
  const color = status === 'active' ? '#22C55E' : status === 'warning' ? '#EAB308' : '#EF4444'
  return (
    <span
      className="absolute top-3 right-3 w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      title={status === 'active' ? 'Active' : status === 'warning' ? 'Attention' : 'Alert'}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const navigate = useNavigate()
  const [fabOpen, setFabOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filteredClients, setFilteredClients] = useState(clientList)

  /* Filter clients */
  useEffect(() => {
    let filtered = clientList
    if (searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    if (filterStatus !== 'All') {
      filtered = filtered.filter((c) => {
        if (filterStatus === 'Active') return c.status === 'active'
        if (filterStatus === 'Inactive') return c.status === 'alert'
        if (filterStatus === 'New This Month') return c.sessions < 12
        return true
      })
    }
    setFilteredClients(filtered)
  }, [searchQuery, filterStatus])

  /* Close FAB on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFabOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const fabActions = [
    { label: 'New Session', icon: CalendarPlus, action: () => navigate('/calendar') },
    { label: 'Add Client', icon: UserPlus, action: () => navigate('/clients', { state: { openQuestionnaire: true } }) },
    { label: 'Create Program', icon: Dumbbell, action: () => navigate('/programs/new') },
    { label: 'Send Message', icon: MessageSquare, action: () => setFabOpen(false) },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* ============================================================ */}
      {/*  KPI CARDS ROW — 4 cols desktop, 2×2 mobile                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SessionsCard />
        <ActiveClientsCard />
        <SignupsCard />
        <RevenueCard />
      </div>

      {/* ============================================================ */}
      {/*  TWO-COLUMN: Schedule + Alerts                               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* --- Today's Schedule (3/5) --- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: easeOut }}
          className="lg:col-span-3 bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 lg:p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[#F0F0F0] text-lg font-semibold">Today&apos;s Schedule</h2>
              <p className="text-[#6B6B6B] text-xs mt-0.5">Wednesday, 15 January 2025</p>
            </div>
            <Link
              to="/calendar"
              className="text-[#00AEEF] text-xs font-medium hover:text-[#33BFF2] transition-colors flex items-center gap-1"
            >
              View Calendar
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Timeline */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {todaySessions.map((session, idx) => (
              <motion.div
                key={session.time}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + idx * 0.08, ease: easeSpring }}
                className="relative flex items-start gap-4 group"
              >
                {/* Time label */}
                <div className="w-[50px] text-right text-xs text-[#6B6B6B] pt-3" style={{ fontFamily: '"Space Mono", monospace' }}>
                  {session.time}
                </div>

                {/* Dot on the line */}
                <div
                  className="relative z-10 w-[10px] h-[10px] rounded-full mt-3.5 flex-shrink-0"
                  style={{
                    backgroundColor: session.status === 'in-progress' ? session.color : '#2A2A2A',
                    boxShadow: session.status === 'in-progress' ? `0 0 8px ${session.color}` : 'none',
                  }}
                >
                  {session.status === 'in-progress' && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ backgroundColor: session.color, opacity: 0.4 }}
                    />
                  )}
                </div>

                {/* Session Card */}
                <div
                  className="flex-1 bg-[#1A1A1A] rounded-lg p-3.5 border-l-4 transition-all duration-150 group-hover:bg-[#242424] group-hover:scale-[1.01]"
                  style={{ borderLeftColor: session.color }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#6B6B6B]" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {session.time} - {String(parseInt(session.time.split(':')[0]) + parseInt(session.duration.split(' ')[0]) / 60).split('.')[0].padStart(2, '0')}:{session.time.split(':')[1]}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                  <p className="text-[#F0F0F0] text-sm font-semibold">{session.client}</p>
                  <p className="text-[#A0A0A0] text-xs">{session.type}</p>
                  <p className="text-[#6B6B6B] text-[10px] mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {session.duration}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* --- Follow-ups & Alerts (2/5) --- */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: easeOut }}
          className="lg:col-span-2 bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 lg:p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[#F0F0F0] text-lg font-semibold">Follow-ups &amp; Alerts</h2>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[rgba(239,68,68,0.15)] text-[#EF4444] text-xs font-bold">
              {followupAlerts.length}
            </span>
          </div>

          {/* Alert List */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {followupAlerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + idx * 0.1, ease: easeOut }}
                className="bg-[#1A1A1A] rounded-lg p-4 border-l-[3px] hover:bg-[#242424] transition-colors duration-150 cursor-pointer flex items-start gap-3"
                style={{ borderLeftColor: AlertBorderColor({ type: alert.type }) }}
                onClick={() => navigate('/clients/1')}
              >
                <AlertIcon type={alert.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#F0F0F0] text-xs font-medium leading-snug">{alert.message}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[#00AEEF] text-xs hover:underline">{alert.client}</span>
                    <span className="text-[#6B6B6B] text-[10px]" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {alert.time}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#6B6B6B] flex-shrink-0 mt-0.5" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/*  CLIENT OVERVIEW GRID                                         */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: easeOut }}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-[#F0F0F0] text-lg font-semibold">Your Clients</h2>
            <span className="text-[#6B6B6B] text-sm">(24)</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F0F0F0] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#00AEEF] transition-colors"
              />
            </div>
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-3 pr-8 py-2 text-xs text-[#F0F0F0] focus:outline-none focus:border-[#00AEEF] transition-colors cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="New This Month">New This Month</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
            </div>
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
                transition={{ duration: 0.35, delay: 0.6 + idx * 0.05, ease: easeOut }}
                whileHover={{
                  y: -3,
                  transition: { duration: 0.25, ease: easeSmooth },
                }}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 relative cursor-pointer hover:border-[rgba(0,174,239,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-250"
              >
                <StatusDot status={client.status} />

                {/* Top Row: Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="./avatar-placeholder.png"
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[#F0F0F0] text-sm font-semibold truncate">{client.name}</p>
                    <p className="text-[#6B6B6B] text-xs capitalize">{client.status}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-[#F0F0F0] text-xs font-semibold" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {client.weight}
                    </p>
                    <p className="text-[#6B6B6B] text-[10px] mt-0.5">Weight</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#F0F0F0] text-xs font-semibold" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {client.bodyFat}
                    </p>
                    <p className="text-[#6B6B6B] text-[10px] mt-0.5">Body Fat</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#F0F0F0] text-xs font-semibold" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {client.sessions}
                    </p>
                    <p className="text-[#6B6B6B] text-[10px] mt-0.5">Sessions</p>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1F1F1F]">
                  <p className="text-[#6B6B6B] text-[10px]">
                    Last: {client.lastSession}
                  </p>
                  <span className="text-[#00AEEF] text-xs font-medium hover:underline">
                    View Profile
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-[#6B6B6B] text-sm">
            No clients match your search
          </div>
        )}
      </motion.div>

      {/* ============================================================ */}
      {/*  QUICK ACTION FAB                                             */}
      {/* ============================================================ */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-[200]"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[250] flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, idx) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{
                  duration: 0.25,
                  delay: idx * 0.05,
                  ease: easeSpring,
                }}
                className="flex items-center gap-3"
              >
                <span className="bg-[#141414] border border-[#2A2A2A] text-[#F0F0F0] text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  {action.label}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  className="w-11 h-11 rounded-full bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#00AEEF] hover:bg-[rgba(0,174,239,0.15)] transition-colors shadow-lg"
                >
                  <action.icon size={18} />
                </motion.button>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Primary FAB */}
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: fabOpen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: easeSmooth }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(0,174,239,0.3)] hover:shadow-[0_4px_28px_rgba(0,174,239,0.45)]"
          style={{
            background: 'linear-gradient(135deg, #00AEEF 0%, #8B5CF6 100%)',
            animation: fabOpen ? 'none' : 'pulseGlow 2s infinite',
          }}
        >
          <Plus size={22} />
        </motion.button>
      </div>

      {/* pulseGlow keyframe injected */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,174,239,0.3); }
          50% { box-shadow: 0 4px 28px rgba(0,174,239,0.5), 0 0 20px 4px rgba(0,174,239,0.2); }
        }
      `}</style>
    </motion.div>
  )
}
