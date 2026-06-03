import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Dumbbell, Calendar, TrendingUp, ChevronDown, ChevronUp,
  Trophy, Timer, Flame, CheckCircle2, XCircle, Filter
} from 'lucide-react'
import { getSessionsForClient, getPRsForClient } from '@/lib/sessions'
import type { SavedSession, PersonalRecord } from '@/types'

export default function SessionsTab({ clientId }: { clientId: string }) {
  const [sessions, setSessions] = useState<SavedSession[]>([])
  const [prs, setPRs] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    loadData()
  }, [clientId])

  async function loadData() {
    setLoading(true)
    const [sess, prList] = await Promise.all([
      getSessionsForClient(clientId),
      getPRsForClient(clientId),
    ])
    setSessions(sess)
    setPRs(prList)
    setLoading(false)
  }

  const filtered = sessions.filter(s => filter === 'all' ? true : s.status === filter)

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    totalVolume: sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0),
    totalSets: sessions.reduce((sum, s) => sum + (s.totalSets || 0), 0),
    prCount: prs.length,
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-[#1A1A1A] rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-200 dark:bg-[#1A1A1A] rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-[rgba(0,174,239,0.08)] flex items-center justify-center mx-auto mb-4">
          <Dumbbell size={28} className="text-[#00AEEF]" />
        </div>
        <h3 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-lg mb-1">No Sessions Yet</h3>
        <p className="text-gray-500 dark:text-[#94A3B8] text-sm max-w-sm mx-auto">
          Start a workout from the Programs tab to log sessions for this client.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="#22C55E" />
        <StatCard icon={Flame} label="Total Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}k`} color="#F59E0B" />
        <StatCard icon={Dumbbell} label="Total Sets" value={stats.totalSets} color="#00AEEF" />
        <StatCard icon={Trophy} label="PRs" value={stats.prCount} color="#8B5CF6" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-500 dark:text-[#94A3B8]" />
        {(['all', 'completed', 'cancelled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              filter === f
                ? 'bg-[#00AEEF]/10 text-[#00AEEF] font-medium'
                : 'text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F0F0F0]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Session List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl overflow-hidden"
            >
              {/* Header — always visible */}
              <button
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-[#1A1A1A]/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  session.status === 'completed'
                    ? 'bg-[#22C55E]/10 text-[#22C55E]'
                    : session.status === 'cancelled'
                    ? 'bg-[#EF4444]/10 text-[#EF4444]'
                    : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}>
                  {session.status === 'completed' ? <CheckCircle2 size={16} /> :
                   session.status === 'cancelled' ? <XCircle size={16} /> :
                   <Timer size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-[#F0F0F0] truncate">
                      {session.programName || 'Quick Session'}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      session.status === 'completed'
                        ? 'bg-[#22C55E]/10 text-[#22C55E]'
                        : session.status === 'cancelled'
                        ? 'bg-[#EF4444]/10 text-[#EF4444]'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500 dark:text-[#94A3B8]">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(session.startTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {session.durationMinutes} min</span>
                    <span className="flex items-center gap-1"><TrendingUp size={10} /> {(session.totalVolume / 1000).toFixed(1)}k vol</span>
                  </div>
                </div>
                {expandedId === session.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedId === session.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-gray-200 dark:border-[#1F1F1F]">
                      {/* Exercises */}
                      <div className="space-y-2 mt-2">
                        {session.exercises.map((ex: any, i: number) => (
                          <div key={i} className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-900 dark:text-[#F0F0F0]">
                                {ex.exerciseName}
                                {ex.substituted && <span className="text-[10px] text-amber-500 ml-1">(sub)</span>}
                              </p>
                              <span className="text-[10px] text-gray-500 dark:text-[#94A3B8]">
                                {ex.sets.filter((s: any) => s.completed).length}/{ex.sets.length} sets
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {ex.sets.map((set: any, j: number) => (
                                <div
                                  key={j}
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    set.completed
                                      ? 'bg-[#00AEEF]/10 text-[#00AEEF]'
                                      : 'bg-gray-200 dark:bg-[#242424] text-gray-400 dark:text-[#6B6B6B]'
                                  }`}
                                >
                                  {set.load > 0 ? `${set.load}×${set.reps}` : `${set.reps} reps`}
                                  {set.rpe > 0 && ` @${set.rpe}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary row */}
                      <div className="flex items-center justify-between mt-3 text-[11px]">
                        <div className="flex items-center gap-3 text-gray-500 dark:text-[#94A3B8]">
                          <span>{session.totalSets} sets</span>
                          <span>{session.completedSets} completed</span>
                          <span>Avg RPE: {session.avgRpe || '—'}</span>
                        </div>
                      </div>

                      {session.coachNotes && (
                        <p className="text-[11px] text-gray-500 dark:text-[#94A3B8] mt-2 italic">
                          "{session.coachNotes}"
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-3 text-center">
      <Icon size={16} style={{ color }} className="mx-auto mb-1" />
      <p className="text-lg font-bold text-gray-900 dark:text-[#F0F0F0]" style={{ fontFamily: 'Space Mono, monospace' }}>{value}</p>
      <p className="text-[10px] text-gray-500 dark:text-[#94A3B8] mt-0.5">{label}</p>
    </div>
  )
}
