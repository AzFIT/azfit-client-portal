import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, User, Dumbbell, ChevronRight, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getProgramsForCoach } from '@/lib/db'
import { getCurrentCoach } from '@/lib/auth'
import type { SavedProgram } from '@/types'

interface SessionLauncherProps {
  open: boolean
  onClose: () => void
  clientId?: string
  clientName?: string
}

export default function SessionLauncher({ open, onClose, clientId, clientName }: SessionLauncherProps) {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<SavedProgram[]>([])
  const [selectedProgram, setSelectedProgram] = useState<SavedProgram | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const coach = getCurrentCoach()
    if (!coach) return
    getProgramsForCoach(coach.id).then(data => {
      setPrograms(data)
      if (data.length === 1) setSelectedProgram(data[0])
    })
  }, [open])

  const activeDays = selectedProgram?.data?.split?.filter(d => d.active) || []

  function handleStart() {
    if (!selectedProgram || !selectedDay) return
    setLoading(true)
    const params = new URLSearchParams()
    params.set('day', selectedDay)
    if (clientId) params.set('clientId', clientId)
    params.set('launch', '1')
    navigate(`/programs/session/${selectedProgram.id}?${params.toString()}`)
    onClose()
  }

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[310] p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-2xl p-6 w-full max-w-md pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-gray-900 dark:text-[#F1F5F9] text-lg font-semibold flex items-center gap-2">
                  <Play size={18} className="text-[#00AEEF]" />
                  Start Session
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-[#6B6B6B] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Client info */}
              {clientName && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
                  <User size={14} className="text-[#00AEEF]" />
                  <span className="text-sm text-gray-900 dark:text-[#F0F0F0]">{clientName}</span>
                </div>
              )}

              {/* Program selection */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium mb-1.5 block">Program</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {programs.map(prog => (
                    <button
                      key={prog.id}
                      onClick={() => { setSelectedProgram(prog); setSelectedDay('') }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                        selectedProgram?.id === prog.id
                          ? 'bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)] border border-[#00AEEF]/30'
                          : 'bg-gray-50 dark:bg-[#1A1A1A] border border-transparent hover:border-gray-200 dark:hover:border-[#2A2A2A]'
                      }`}
                    >
                      <Dumbbell size={14} className={selectedProgram?.id === prog.id ? 'text-[#00AEEF]' : 'text-gray-400 dark:text-[#6B6B6B]'} />
                      <span className={`flex-1 truncate ${selectedProgram?.id === prog.id ? 'text-[#00AEEF] font-medium' : 'text-gray-900 dark:text-[#F0F0F0]'}`}>
                        {prog.data.programName}
                      </span>
                      {selectedProgram?.id === prog.id && <ChevronRight size={14} className="text-[#00AEEF]" />}
                    </button>
                  ))}
                  {programs.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-[#94A3B8] text-center py-3">No programs yet. Create one first.</p>
                  )}
                </div>
              </div>

              {/* Day selection */}
              {selectedProgram && activeDays.length > 0 && (
                <div className="mb-5">
                  <label className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium mb-1.5 block">Workout Day</label>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDays.map(d => (
                      <button
                        key={d.day}
                        onClick={() => setSelectedDay(d.day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedDay === d.day
                            ? 'bg-[#00AEEF] text-white'
                            : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F0F0F0]'
                        }`}
                      >
                        {d.day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start button */}
              <button
                onClick={handleStart}
                disabled={!selectedProgram || !selectedDay || loading}
                className="w-full flex items-center justify-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Clock size={14} />
                    Start Workout
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
