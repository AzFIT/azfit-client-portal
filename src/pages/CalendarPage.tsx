import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  LayoutGrid,
  List,
  Plus,
  Filter,
  User,
} from 'lucide-react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
  isSameMonth,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ViewMode = 'week' | 'day' | 'month' | 'agenda'

type SessionType = 'Personal Training' | 'Group Class' | 'Assessment' | 'Online' | 'Consultation'

interface CalendarSession {
  id: string
  clientName: string
  type: SessionType
  startTime: Date
  duration: number // minutes
  notes?: string
}

const SESSION_COLORS: Record<SessionType, { bg: string; border: string; text: string }> = {
  'Personal Training': { bg: 'rgba(0,174,239,0.2)', border: 'rgba(0,174,239,0.5)', text: '#00AEEF' },
  'Group Class': { bg: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.5)', text: '#8B5CF6' },
  'Assessment': { bg: 'rgba(34,197,94,0.2)', border: 'rgba(34,197,94,0.5)', text: '#22C55E' },
  'Online': { bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.5)', text: '#F97316' },
  'Consultation': { bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.5)', text: '#3B82F6' },
}

const SESSION_TYPE_LABELS: SessionType[] = [
  'Personal Training',
  'Group Class',
  'Assessment',
  'Online',
  'Consultation',
]

const CLIENT_NAMES = ['Sarah', 'Mike', 'Emily', 'David', 'Jessica', 'Ryan', 'Amanda']

const HK_TIME_SLOTS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

function generateDemoSessions(): CalendarSession[] {
  const sessions: CalendarSession[] = []
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  let idCounter = 1

  const sessionTemplates: { time: [number, number]; type: SessionType; duration: number }[] = [
    { time: [7, 0], type: 'Personal Training', duration: 60 },
    { time: [8, 0], type: 'Group Class', duration: 60 },
    { time: [9, 30], type: 'Personal Training', duration: 60 },
    { time: [11, 0], type: 'Assessment', duration: 45 },
    { time: [14, 0], type: 'Online', duration: 30 },
    { time: [15, 30], type: 'Personal Training', duration: 60 },
    { time: [17, 0], type: 'Group Class', duration: 60 },
    { time: [18, 30], type: 'Personal Training', duration: 60 },
    { time: [20, 0], type: 'Consultation', duration: 30 },
  ]

  for (let d = 0; d < 7; d++) {
    const day = addDays(weekStart, d)
    const dayName = format(day, 'EEE')

    // Skip some sessions on weekends
    const isWeekend = dayName === 'Sat' || dayName === 'Sun'
    const sessionsPerDay = isWeekend ? 3 : 6 + Math.floor(Math.random() * 3)

    const shuffled = [...sessionTemplates]
      .sort(() => Math.random() - 0.5)
      .slice(0, sessionsPerDay)

    shuffled.forEach((tmpl) => {
      const clientName = CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)]
      const startTime = setMinutes(setHours(day, tmpl.time[0]), tmpl.time[1])
      sessions.push({
        id: `session-${idCounter++}`,
        clientName,
        type: tmpl.type,
        startTime,
        duration: tmpl.duration,
        notes: '',
      })
    })
  }

  return sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}

/* ─── Time indicator hook ─── */
function useCurrentTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  return now
}

/* ─── Week View ─── */
function WeekView({
  days,
  sessions,
  filterType,
  onSlotClick,
  onEventClick,
}: {
  days: Date[]
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onSlotClick: (e: React.MouseEvent, date: Date, hour: number, minute: number) => void
  onEventClick: (session: CalendarSession) => void
}) {
  const now = useCurrentTime()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * 64 // scroll to 7am
    }
  }, [])

  const filtered = useMemo(
    () => (filterType === 'All' ? sessions : sessions.filter((s) => s.type === filterType)),
    [sessions, filterType]
  )

  const timeIndicatorTop = useMemo(() => {
    const h = getHours(now)
    const m = getMinutes(now)
    return (h - 5 + m / 60) * 64
  }, [now])

  const showTimeIndicator = useMemo(() => {
    const h = getHours(now)
    return h >= 0 && h < 24
  }, [now])

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto">
      <div className="min-w-[900px]">
        {/* Header row */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#2A2A2A] bg-[#141414] sticky top-0 z-20">
          <div className="h-12 border-r border-[#2A2A2A]" />
          {days.map((day) => {
            const today = isToday(day)
            return (
              <div
                key={day.toISOString()}
                className={`h-12 flex flex-col items-center justify-center border-r border-[#2A2A2A] ${
                  today ? 'bg-[rgba(0,174,239,0.05)]' : ''
                }`}
              >
                <span className="text-[#6B6B6B] text-[10px] uppercase font-medium">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={`text-sm font-semibold ${today ? 'text-[#00AEEF]' : 'text-[#F0F0F0]'}`}
                >
                  {format(day, 'd')}
                </span>
                {today && (
                  <span className="text-[8px] bg-[#00AEEF] text-white px-1 rounded-full">Today</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="relative">
          <div className="grid grid-cols-[60px_repeat(7,1fr)]">
            {/* Time labels */}
            <div className="border-r border-[#2A2A2A]">
              {Array.from({ length: 18 }, (_, i) => i + 5).map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-[#1F1F1F] flex items-start justify-end pr-2 pt-1"
                >
                  <span className="text-[10px] text-[#6B6B6B] font-mono">{String(hour).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const today = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-[#2A2A2A] relative ${
                    today ? 'bg-[rgba(0,174,239,0.03)]' : ''
                  }`}
                  style={today ? { borderLeft: '2px solid #00AEEF' } : {}}
                >
                  {Array.from({ length: 18 }, (_, i) => i + 5).map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b border-[#1F1F1F] hover:bg-[rgba(0,174,239,0.06)] transition-colors cursor-pointer"
                      onClick={(e) => onSlotClick(e, day, hour, 0)}
                    />
                  ))}

                  {/* Sessions */}
                  {filtered
                    .filter((s) => isSameDay(s.startTime, day))
                    .map((session) => {
                      const h = getHours(session.startTime)
                      const m = getMinutes(session.startTime)
                      const top = (h - 5) * 64 + (m / 60) * 64
                      const height = Math.max((session.duration / 60) * 64, 32)
                      const colors = SESSION_COLORS[session.type]

                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
                          className="absolute left-1 right-1 rounded-lg p-1.5 cursor-pointer overflow-hidden group"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(session)
                          }}
                        >
                          <p className="text-gray-900 dark:text-white text-[11px] font-semibold truncate leading-tight">
                            {session.clientName}
                          </p>
                          <p className="text-[9px] opacity-80 truncate" style={{ color: colors.text }}>
                            {session.type}
                          </p>
                          <p className="text-[9px] text-[#6B6B6B] font-mono truncate">
                            {format(session.startTime, 'HH:mm')} -{' '}
                            {format(
                              new Date(session.startTime.getTime() + session.duration * 60000),
                              'HH:mm'
                            )}
                          </p>
                          <div
                            className="absolute bottom-1 left-1.5 right-1.5 h-[2px] rounded-full opacity-30"
                            style={{ background: colors.text }}
                          />
                        </motion.div>
                      )
                    })}
                </div>
              )
            })}
          </div>

          {/* Current time indicator */}
          {showTimeIndicator && timeIndicatorTop >= 0 && timeIndicatorTop <= 18 * 64 && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: `${timeIndicatorTop}px` }}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse flex-shrink-0" />
                <div className="h-[2px] bg-[#EF4444] flex-1" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Day View ─── */
function DayView({
  date,
  sessions,
  filterType,
  onSlotClick,
  onEventClick,
}: {
  date: Date
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onSlotClick: (e: React.MouseEvent, date: Date, hour: number, minute: number) => void
  onEventClick: (session: CalendarSession) => void
}) {
  const now = useCurrentTime()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 2 * 64
    }
  }, [date])

  const filtered = useMemo(
    () =>
      (filterType === 'All' ? sessions : sessions.filter((s) => s.type === filterType)).filter(
        (s) => isSameDay(s.startTime, date)
      ),
    [sessions, filterType, date]
  )

  const timeIndicatorTop = useMemo(() => {
    const h = getHours(now)
    const m = getMinutes(now)
    return (h + m / 60) * 64
  }, [now])

  const totalDuration = useMemo(
    () => filtered.reduce((sum, s) => sum + s.duration, 0),
    [filtered]
  )

  const uniqueClients = useMemo(
    () => [...new Set(filtered.map((s) => s.clientName))].length,
    [filtered]
  )

  return (
    <div className="flex flex-1 overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="min-w-[400px]">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr] border-b border-[#2A2A2A] bg-[#141414] sticky top-0 z-20">
            <div className="h-14 border-r border-[#2A2A2A]" />
            <div className="h-14 flex items-center px-4">
              <span className="text-[#F0F0F0] font-semibold text-sm">
                {format(date, 'EEEE, d MMMM yyyy')}
              </span>
              {isToday(date) && (
                <span className="ml-2 text-[10px] bg-[#00AEEF] text-white px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
          </div>

          {/* Time grid */}
          <div className="relative">
            <div className="grid grid-cols-[80px_1fr]">
              <div className="border-r border-[#2A2A2A]">
                {Array.from({ length: 18 }, (_, i) => i + 5).map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-[#1F1F1F] flex items-start justify-end pr-3 pt-1"
                  >
                    <span className="text-[11px] text-[#6B6B6B] font-mono">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative">
                {Array.from({ length: 18 }, (_, i) => i + 5).map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-[#1F1F1F] hover:bg-[rgba(0,174,239,0.04)] transition-colors cursor-pointer"
                    onClick={(e) => onSlotClick(e, date, hour, 0)}
                  />
                ))}

                {filtered.map((session) => {
                  const h = getHours(session.startTime)
                  const m = getMinutes(session.startTime)
                  const top = (h - 5) * 64 + (m / 60) * 64
                  const height = Math.max((session.duration / 60) * 64, 40)
                  const colors = SESSION_COLORS[session.type]

                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-2 right-2 rounded-lg p-2.5 cursor-pointer overflow-hidden group"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        zIndex: 10,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(session)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: colors.border }}
                        >
                          <User size={14} style={{ color: colors.text }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white text-sm font-semibold truncate">
                            {session.clientName}
                          </p>
                          <p className="text-[10px] opacity-80" style={{ color: colors.text }}>
                            {session.type}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#6B6B6B] font-mono">
                          {format(session.startTime, 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B6B6B] mt-1">
                        Duration: {session.duration} min
                      </p>
                      <div
                        className="absolute bottom-1.5 left-2.5 right-2.5 h-[3px] rounded-full opacity-30"
                        style={{ background: colors.text }}
                      />
                    </motion.div>
                  )
                })}

                {/* Current time indicator */}
                {isToday(date) && timeIndicatorTop >= 0 && timeIndicatorTop <= 18 * 64 && (
                  <div
                    className="absolute left-0 right-0 z-30 pointer-events-none"
                    style={{ top: `${timeIndicatorTop}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse flex-shrink-0" />
                      <div className="h-[2px] bg-[#EF4444] flex-1" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="hidden xl:block w-80 border-l border-[#2A2A2A] bg-[#141414] p-5 overflow-auto">
        <h3 className="text-[#F0F0F0] font-semibold text-base mb-4">Daily Summary</h3>

        <div className="space-y-3 mb-6">
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
            <p className="text-[#6B6B6B] text-xs mb-1">Total Sessions</p>
            <p className="text-[#F0F0F0] text-2xl font-bold font-mono">{filtered.length}</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
            <p className="text-[#6B6B6B] text-xs mb-1">Total Duration</p>
            <p className="text-[#F0F0F0] text-2xl font-bold font-mono">{totalDuration} min</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
            <p className="text-[#6B6B6B] text-xs mb-1">Clients Seen</p>
            <p className="text-[#F0F0F0] text-2xl font-bold font-mono">{uniqueClients}</p>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-4">
          <h4 className="text-[#A0A0A0] text-sm font-medium mb-3">Session Breakdown</h4>
          {SESSION_TYPE_LABELS.map((type) => {
            const count = filtered.filter((s) => s.type === type).length
            if (count === 0) return null
            return (
              <div key={type} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: SESSION_COLORS[type].text }}
                  />
                  <span className="text-[#A0A0A0] text-xs">{type}</span>
                </div>
                <span className="text-[#F0F0F0] text-xs font-semibold">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Month View ─── */
function MonthView({
  currentDate,
  sessions,
  filterType,
  onDayClick,
}: {
  currentDate: Date
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onDayClick: (date: Date) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  )

  const filtered = useMemo(
    () => (filterType === 'All' ? sessions : sessions.filter((s) => s.type === filterType)),
    [sessions, filterType]
  )

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center py-2">
              <span className="text-[11px] text-[#6B6B6B] uppercase font-semibold">{d}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-fr gap-1">
          {calendarDays.map((day, idx) => {
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            const daySessions = filtered.filter((s) => isSameDay(s.startTime, day))

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.005 }}
                className={`min-h-[110px] rounded-lg p-2 cursor-pointer transition-colors border ${
                  inMonth ? 'bg-[#141414]' : 'bg-[#0A0A0A] opacity-50'
                } ${today ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.05)]' : 'border-[#1F1F1F]'}`}
                onClick={() => onDayClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      today ? 'text-[#00AEEF]' : inMonth ? 'text-[#F0F0F0]' : 'text-[#3A3A3A]'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {today && (
                    <span className="text-[8px] bg-[#00AEEF] text-white px-1 rounded-full">Today</span>
                  )}
                </div>

                {/* Session dots */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {daySessions.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className="w-2 h-2 rounded-full"
                      style={{ background: SESSION_COLORS[s.type].text }}
                      title={`${s.clientName} - ${s.type}`}
                    />
                  ))}
                  {daySessions.length > 4 && (
                    <span className="text-[9px] text-[#6B6B6B]">+{daySessions.length - 4}</span>
                  )}
                </div>

                {/* Mini session labels */}
                <div className="mt-1 space-y-0.5">
                  {daySessions.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className="text-[9px] truncate px-1 py-0.5 rounded"
                      style={{
                        background: SESSION_COLORS[s.type].bg,
                        color: SESSION_COLORS[s.type].text,
                      }}
                    >
                      {format(s.startTime, 'HH:mm')} {s.clientName}
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Agenda View ─── */
function AgendaView({
  sessions,
  filterType,
  onEventClick,
}: {
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onEventClick: (session: CalendarSession) => void
}) {
  const filtered = useMemo(
    () => (filterType === 'All' ? sessions : sessions.filter((s) => s.type === filterType)),
    [sessions, filterType]
  )

  const grouped = useMemo(() => {
    const groups: Record<string, CalendarSession[]> = {}
    filtered.forEach((s) => {
      const key = format(s.startTime, 'yyyy-MM-dd')
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const now = new Date()

  const getGroupLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isToday(d)) return 'Today'
    if (isSameDay(d, addDays(now, 1))) return 'Tomorrow'
    if (d < now) return 'Past'
    return format(d, 'EEEE, d MMMM yyyy')
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="max-w-[900px] mx-auto space-y-4">
        {grouped.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#6B6B6B] text-sm">No sessions found</p>
          </div>
        )}

        {grouped.map(([dateStr, daySessions]) => (
          <div key={dateStr}>
            <h3 className="text-[#F0F0F0] font-semibold text-sm mb-2 px-1">
              {getGroupLabel(dateStr)}
              <span className="text-[#6B6B6B] font-normal ml-2">
                {format(new Date(dateStr), 'dd/MM/yyyy')}
              </span>
            </h3>

            <div className="space-y-1">
              {daySessions.map((session, idx) => {
                const colors = SESSION_COLORS[session.type]
                const endTime = new Date(session.startTime.getTime() + session.duration * 60000)

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-4 bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#1F1F1F] transition-colors"
                    onClick={() => onEventClick(session)}
                  >
                    {/* Time */}
                    <div className="w-20 flex-shrink-0">
                      <p className="text-[#F0F0F0] text-sm font-mono font-medium">
                        {format(session.startTime, 'HH:mm')}
                      </p>
                      <p className="text-[#6B6B6B] text-xs font-mono">
                        {format(endTime, 'HH:mm')}
                      </p>
                    </div>

                    {/* Color indicator */}
                    <div
                      className="w-1 h-10 rounded-full flex-shrink-0"
                      style={{ background: colors.text }}
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-[#F0F0F0] text-sm font-semibold truncate">
                        {session.clientName}
                      </p>
                      <p className="text-[#6B6B6B] text-xs">{session.duration} min</p>
                    </div>

                    {/* Type badge */}
                    <div
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {session.type}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Add Event Modal ─── */
function AddEventModal({
  open,
  onClose,
  initialDate,
  eventType,
}: {
  open: boolean
  onClose: () => void
  initialDate?: Date
  eventType: string
}) {
  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [type, setType] = useState<SessionType>('Personal Training')
  const [duration, setDuration] = useState('60')
  const [dateStr, setDateStr] = useState('')
  const [timeStr, setTimeStr] = useState('05:00')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  useEffect(() => {
    if (initialDate) {
      setDateStr(format(initialDate, 'yyyy-MM-dd'))
      const h = getHours(initialDate)
      const m = getMinutes(initialDate)
      setTimeStr(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    } else {
      setDateStr(format(new Date(), 'yyyy-MM-dd'))
      setTimeStr('05:00')
    }
    setTitle('')
    setClient('')
    setDescription('')
    setLocation('')
    setPriority('Medium')
    setClientEmail('')
    setClientPhone('')
  }, [initialDate, open])

  const handleSubmit = () => {
    onClose()
  }

  const getModalTitle = () => {
    switch (eventType) {
      case 'session': return 'Add Session'
      case 'event': return 'Add Event'
      case 'task': return 'Add Task'
      case 'birthday': return 'Add Birthday'
      case 'appointment': return 'Add Appointment'
      case 'focus': return 'Add Focus Time'
      case 'unavailability': return 'Add Unavailability'
      case 'client': return 'Add Client'
      default: return 'Add to Calendar'
    }
  }

  const getSaveLabel = () => {
    switch (eventType) {
      case 'session': return 'Save Session'
      case 'event': return 'Save Event'
      case 'task': return 'Save Task'
      case 'birthday': return 'Save Birthday'
      case 'appointment': return 'Save Appointment'
      case 'focus': return 'Save Focus Time'
      case 'unavailability': return 'Save'
      case 'client': return 'Add Client'
      default: return 'Save'
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{getModalTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title / Name / Client field */}
          {eventType !== 'focus' && eventType !== 'unavailability' && (
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">
                {eventType === 'session' ? 'Client' : eventType === 'birthday' ? 'Person Name' : eventType === 'client' ? 'Client Name' : 'Title'}
              </label>
              {eventType === 'session' ? (
                <Select value={client} onValueChange={setClient}>
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    {CLIENT_NAMES.map((c) => (
                      <SelectItem key={c} value={c} className="text-[#F0F0F0]">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={eventType === 'birthday' ? 'Enter name' : eventType === 'client' ? 'Enter client name' : 'Enter title'}
                  className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF]"
                />
              )}
            </div>
          )}

          {/* Client contact fields */}
          {eventType === 'client' && (
            <>
              <div>
                <label className="text-xs text-[#A0A0A0] mb-1 block">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF]"
                />
              </div>
              <div>
                <label className="text-xs text-[#A0A0A0] mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF]"
                />
              </div>
            </>
          )}

          {/* Date & Time */}
          {eventType !== 'client' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A0A0A0] mb-1 block">Date</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[#A0A0A0] mb-1 block">Time</label>
                <select
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm"
                >
                  {HK_TIME_SLOTS.map((h) =>
                    [0, 30].map((m) => (
                      <option key={`${h}-${m}`} value={`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`}>
                        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Duration */}
          {(eventType === 'session' || eventType === 'appointment' || eventType === 'focus' || eventType === 'unavailability') && (
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {['30', '45', '60', '90', '120'].map((d) => (
                    <SelectItem key={d} value={d} className="text-[#F0F0F0]">
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Session Type */}
          {eventType === 'session' && (
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">Session Type</label>
              <Select value={type} onValueChange={(v) => setType(v as SessionType)}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {SESSION_TYPE_LABELS.map((t) => (
                    <SelectItem key={t} value={t} className="text-[#F0F0F0]">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority for tasks */}
          {eventType === 'task' && (
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {['Low', 'Medium', 'High'].map((p) => (
                    <SelectItem key={p} value={p} className="text-[#F0F0F0]">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location for events and appointments */}
          {(eventType === 'event' || eventType === 'appointment') && (
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF]"
              />
            </div>
          )}

          {/* Description / Notes / Reason */}
          {eventType !== 'client' && (
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">
                {eventType === 'unavailability' ? 'Reason' : eventType === 'task' ? 'Notes' : 'Description'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={eventType === 'unavailability' ? 'Enter reason...' : eventType === 'task' ? 'Add task notes...' : 'Add description...'}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] resize-none focus:outline-none focus:border-[#00AEEF]"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424]"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#00AEEF] hover:bg-[#009BD6] text-white">
            {getSaveLabel()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── View Toggle Button ─── */
function ViewToggle({
  view,
  setView,
}: {
  view: ViewMode
  setView: (v: ViewMode) => void
}) {
  const views: { key: ViewMode; label: string; icon: typeof CalendarDays }[] = [
    { key: 'week', label: 'Week', icon: CalendarDays },
    { key: 'day', label: 'Day', icon: Clock },
    { key: 'month', label: 'Month', icon: LayoutGrid },
    { key: 'agenda', label: 'Agenda', icon: List },
  ]

  return (
    <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-lg p-1 border border-[#2A2A2A]">
      {views.map((v) => {
        const active = view === v.key
        const Icon = v.icon
        return (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              active
                ? 'bg-[#242424] text-[#F0F0F0] border border-[#2A2A2A]'
                : 'text-[#6B6B6B] hover:text-[#A0A0A0] hover:bg-[#1F1F1F]'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN CALENDAR PAGE
   ═══════════════════════════════════════════ */
export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterType, setFilterType] = useState<SessionType | 'All'>('All')
  const [sessions] = useState(() => generateDemoSessions())
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>()
  const [eventType, setEventType] = useState('session')
  const [slotMenu, setSlotMenu] = useState<{
    x: number
    y: number
    date: Date
  } | null>(null)
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null)

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [currentDate])

  const handlePrev = useCallback(() => {
    switch (view) {
      case 'week':
        setCurrentDate((d) => subWeeks(d, 1))
        break
      case 'day':
        setCurrentDate((d) => subDays(d, 1))
        break
      case 'month':
        setCurrentDate((d) => subMonths(d, 1))
        break
      case 'agenda':
        setCurrentDate((d) => subWeeks(d, 1))
        break
    }
  }, [view])

  const handleNext = useCallback(() => {
    switch (view) {
      case 'week':
        setCurrentDate((d) => addWeeks(d, 1))
        break
      case 'day':
        setCurrentDate((d) => addDays(d, 1))
        break
      case 'month':
        setCurrentDate((d) => addMonths(d, 1))
        break
      case 'agenda':
        setCurrentDate((d) => addWeeks(d, 1))
        break
    }
  }, [view])

  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const handleSlotClick = useCallback(
    (e: React.MouseEvent, date: Date, hour: number, minute: number) => {
      const d = setMinutes(setHours(date, hour), minute)
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setSlotMenu({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height,
        date: d,
      })
    },
    []
  )

  const handleEventClick = useCallback((session: CalendarSession) => {
    setSelectedSession(session)
  }, [])

  /* Close slot menu on outside click */
  useEffect(() => {
    if (!slotMenu) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.slot-context-menu')) {
        setSlotMenu(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [slotMenu])

  const handleDayClick = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      setView('day')
    },
    []
  )

  const dateDisplay = useMemo(() => {
    switch (view) {
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = addDays(start, 6)
        return `${format(start, 'd')} - ${format(end, 'd MMM yyyy')}`
      }
      case 'day':
        return format(currentDate, 'd MMM yyyy')
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'agenda':
        return 'Upcoming Sessions'
      default:
        return ''
    }
  }, [view, currentDate])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100dvh-64px)] bg-[#0A0A0A]"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-6 py-3 bg-[#141414] border-b border-[#2A2A2A] flex-shrink-0">
        {/* Left: View toggle */}
        <ViewToggle view={view} setView={setView} />

        {/* Center: Date navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-[#F0F0F0] font-semibold text-sm min-w-[160px] text-center">
            {dateDisplay}
          </h2>
          <button
            onClick={handleNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleToday}
            className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors border border-[#2A2A2A]"
          >
            Today
          </button>
        </div>

        {/* Right: Filter + New */}
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as SessionType | 'All')}>
            <SelectTrigger className="w-[150px] h-8 bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] text-xs">
              <Filter size={12} className="mr-1 text-[#6B6B6B]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
              <SelectItem value="All" className="text-[#F0F0F0]">
                All Types
              </SelectItem>
              {SESSION_TYPE_LABELS.map((t) => (
                <SelectItem key={t} value={t} className="text-[#F0F0F0]">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00AEEF] hover:bg-[#009BD6] text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02]">
                <Plus size={14} />
                <span className="hidden sm:inline">Add to Calendar</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A1A1A] border-[#2A2A2A]">
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('session')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Add Sessions
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('client')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Add Client
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('event')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Events
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('task')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Tasks
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('birthday')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Birthdays
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('appointment')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Appointments
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('focus')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Focus Time
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-900 dark:text-[#F0F0F0] hover:text-white focus:text-white hover:bg-[#242424] focus:bg-[#242424] cursor-pointer"
                onClick={() => {
                  setEventType('unavailability')
                  setNewSessionDate(undefined)
                  setShowNewSession(true)
                }}
              >
                Unavailability
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${currentDate.toISOString()}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === 'week' && (
              <WeekView
                days={weekDays}
                sessions={sessions}
                filterType={filterType}
                onSlotClick={handleSlotClick}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'day' && (
              <DayView
                date={currentDate}
                sessions={sessions}
                filterType={filterType}
                onSlotClick={handleSlotClick}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                sessions={sessions}
                filterType={filterType}
                onDayClick={handleDayClick}
              />
            )}
            {view === 'agenda' && (
              <AgendaView
                sessions={sessions}
                filterType={filterType}
                onEventClick={handleEventClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Event Modal */}
      <AddEventModal open={showNewSession} onClose={() => setShowNewSession(false)} initialDate={newSessionDate} eventType={eventType} />

      {/* Slot Context Menu */}
      {slotMenu && (
        <div
          className="slot-context-menu fixed z-[400]"
          style={{ left: slotMenu.x, top: slotMenu.y, transform: 'translateX(-50%)' }}
        >
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl py-1 min-w-[180px]">
            {[
              { label: 'Add Sessions', type: 'session' },
              { label: 'Add Client', type: 'client' },
              { label: 'Events', type: 'event' },
              { label: 'Tasks', type: 'task' },
              { label: 'Birthdays', type: 'birthday' },
              { label: 'Appointments', type: 'appointment' },
              { label: 'Focus Time', type: 'focus' },
              { label: 'Unavailability', type: 'unavailability' },
            ].map((item) => (
              <button
                key={item.type}
                className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-[#F0F0F0] hover:text-white hover:bg-[#242424] transition-colors"
                onClick={() => {
                  setEventType(item.type)
                  setNewSessionDate(slotMenu.date)
                  setShowNewSession(true)
                  setSlotMenu(null)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={(o) => !o && setSelectedSession(null)}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: SESSION_COLORS[selectedSession.type].border }}
                >
                  <User size={18} style={{ color: SESSION_COLORS[selectedSession.type].text }} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-[#F0F0F0] font-semibold">{selectedSession.clientName}</p>
                  <p className="text-[#6B6B6B] text-xs">{selectedSession.type}</p>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B] text-xs">Date</span>
                  <span className="text-[#F0F0F0] text-xs font-medium">
                    {format(selectedSession.startTime, 'EEEE, d MMMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B] text-xs">Time</span>
                  <span className="text-[#F0F0F0] text-xs font-medium font-mono">
                    {format(selectedSession.startTime, 'HH:mm')} -{' '}
                    {format(
                      new Date(selectedSession.startTime.getTime() + selectedSession.duration * 60000),
                      'HH:mm'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B] text-xs">Duration</span>
                  <span className="text-[#F0F0F0] text-xs font-medium">
                    {selectedSession.duration} minutes
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSession(null)}
                  className="text-[#A0A0A0] hover:text-[#F0F0F0]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
