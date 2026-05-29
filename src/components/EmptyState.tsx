import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="text-[#6B6B6B] opacity-50 mb-4">{icon}</div>
      <h3 className="text-[#F0F0F0] font-semibold text-base mb-2">{title}</h3>
      <p className="text-[#A0A0A0] text-sm max-w-[360px] mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
