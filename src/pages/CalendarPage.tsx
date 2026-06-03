import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function CalendarPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="flex flex-col items-center justify-center py-32 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-cyan-50 dark:bg-[rgba(0,174,239,0.08)] flex items-center justify-center mb-6">
        <CalendarDays size={40} className="text-[#00AEEF]" />
      </div>
      <h1 className="text-gray-900 dark:text-[#F1F5F9] text-2xl font-bold mb-3">Calendar</h1>
      <p className="text-gray-500 dark:text-[#94A3B8] text-sm max-w-sm leading-relaxed">
        Coming in Phase 4. Schedule sessions, manage appointments, and sync with your clients&apos; calendars.
      </p>
    </motion.div>
  )
}
