import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, User, Activity,
  X, ChevronRight, MoreVertical,
  Trash2, Users, Clock,
} from 'lucide-react'
import { getCurrentCoach, deleteClient, loadClientsForCoach, getInitials } from '@/lib/auth'
import { toast } from 'sonner'
import type { Client } from '@/types/auth'

/* ── Types ───────────────────────────────────────────── */

/* ── Status Styles ───────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', dot: '#22C55E' },
  paused: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308', dot: '#EAB308' },
  archived: { bg: 'rgba(107,114,128,0.15)', text: '#9CA3AF', dot: '#9CA3AF' },
}

const GOAL_COLORS: Record<string, string> = {
  'Lose Weight': '#22C55E',
  'Build Muscle': '#8B5CF6',
  'Strength': '#00AEEF',
  'Endurance': '#F97316',
  'Athletic Performance': '#EC4899',
  'Rehab/Mobility': '#EAB308',
  'General Fitness': '#94A3B8',
}

/* ── Client Card ─────────────────────────────────────── */
function ClientCard({ client, index, onDelete }: {
  client: Client
  index: number
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS_STYLES[client.status]
  const goalColor = GOAL_COLORS[client.goals.primary] || '#94A3B8'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:border-[rgba(0,174,239,0.2)] group"
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)', color: '#fff' }}
          >
            {getInitials(client.personal.fullName)}
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-[#F1F5F9] font-semibold text-sm">{client.personal.fullName}</h3>
            <p className="text-gray-400 dark:text-[#6B6B6B] text-xs">{client.personal.age} yrs · {client.personal.gender.charAt(0).toUpperCase() + client.personal.gender.slice(1)}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            className="text-gray-400 dark:text-[#6B6B6B] hover:text-gray-900 dark:hover:text-[#F0F0F0] p-1 rounded transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-7 w-40 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg shadow-xl z-50 py-1"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate(`/clients/${client.id}`) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-[#A0A0A0] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:bg-gray-200 dark:hover:bg-[#242424] transition-colors"
                  >
                    <ChevronRight size={13} /> View Profile
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(client.id) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-gray-200 dark:hover:bg-[#242424] transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ backgroundColor: status.bg, color: status.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[rgba(192,192,192,0.1)]"
          style={{ color: goalColor }}
        >
          {client.goals.primary}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 dark:text-[#6B6B6B]">Experience</span>
          <span className="text-gray-500 dark:text-[#A0A0A0] font-medium">{client.goals.experienceLevel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 dark:text-[#6B6B6B]">Sessions/Week</span>
          <span className="text-gray-500 dark:text-[#A0A0A0] font-medium">{client.goals.sessionsPerWeek}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 dark:text-[#6B6B6B]">Duration</span>
          <span className="text-[#00AEEF] font-medium">{client.goals.sessionDuration} min</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#1F1F1F] flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-400 dark:text-[#6B6B6B] text-xs">
          <Activity size={12} />
          {client.goals.primary}
        </div>
        <ChevronRight size={14} className="text-gray-400 dark:text-[#6B6B6B] group-hover:text-[#00AEEF] transition-colors" />
      </div>
    </motion.div>
  )
}

/* ── Main Page ───────────────────────────────────────── */
export default function ClientsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const coach = getCurrentCoach()

  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    if (!coach) {
      navigate('/login')
      return
    }
    loadClientsForCoach(coach.id).then(setClients)
  }, [coach, navigate, location.key])

  const filtered = useMemo(() => {
    let result = clients
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.personal.fullName.toLowerCase().includes(q) ||
        c.personal.email.toLowerCase().includes(q) ||
        c.goals.primary.toLowerCase().includes(q)
      )
    }
    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter)
    }
    return result
  }, [clients, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = clients.length
    const active = clients.filter(c => c.status === 'active').length
    const paused = clients.filter(c => c.status === 'paused').length
    const archived = clients.filter(c => c.status === 'archived').length
    return { total, active, paused, archived }
  }, [clients])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id)
      setClients(prev => prev.filter(c => c.id !== id))
      toast.success('Client deleted')
    }
  }

  if (!coach) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 dark:text-[#F0F0F0] text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm mt-0.5">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/clients/add')}
          className="bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, label: 'Total', value: stats.total, color: '#F0F0F0' },
          { icon: Activity, label: 'Active', value: stats.active, color: '#22C55E' },
          { icon: Clock, label: 'Paused', value: stats.paused, color: '#EAB308' },
          { icon: X, label: 'Archived', value: stats.archived, color: '#6B6B6B' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span className="text-gray-400 dark:text-[#6B6B6B] text-xs">{stat.label}</span>
            </div>
            <p className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-lg" style={{ fontFamily: 'Space Mono, monospace' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl px-5 py-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-[#1A1A1A] rounded-full border border-gray-200 dark:border-[#2A2A2A] focus-within:border-[#00AEEF] transition-colors w-full sm:w-80">
            <Search size={16} className="text-gray-400 dark:text-[#6B6B6B] ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-[#F0F0F0] text-sm placeholder-[#6B6B6B] px-3 py-2 w-full outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 dark:text-[#6B6B6B] hover:text-gray-900 dark:hover:text-[#F0F0F0] mr-3">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {['active', 'paused', 'archived'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 capitalize ${
                  statusFilter === status
                    ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.15)] text-[#00AEEF]'
                    : 'border-gray-200 dark:border-[#2A2A2A] bg-gray-100 dark:bg-[#1A1A1A] text-gray-400 dark:text-[#6B6B6B] hover:text-gray-500 dark:hover:text-[#A0A0A0] hover:border-[#3A3A3A]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-[#EF4444] hover:text-[#DC2626] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Client Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <User size={48} className="text-gray-400 dark:text-[#6B6B6B] mb-4 opacity-50" />
          <h3 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-base mb-1">No clients found</h3>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm mb-4">Try adjusting your search or add a new client</p>
          <button
            onClick={() => navigate('/clients/add')}
            className="bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((client, i) => (
              <ClientCard
                key={client.id}
                client={client}
                index={i}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
