import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Users, Dumbbell, Calendar, TrendingUp,
  Award, ChevronRight, Mail, Clock, BarChart3
} from 'lucide-react'
import { getCurrentCoach } from '@/lib/auth'
import { supabase, setCoachContext } from '@/lib/supabase'
import type { Coach } from '@/types/auth'

interface AdminStats {
  totalCoaches: number
  totalClients: number
  totalPrograms: number
  totalExercises: number
  activeClients: number
  pausedClients: number
  archivedClients: number
  recentSignups: number
}

interface CoachSummary {
  id: string
  full_name: string
  email: string
  business_name: string
  specialty: string
  client_count: number
  last_login: string
  created_at: string
  role: string
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [coach, setCoach] = useState<Coach | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [coaches, setCoaches] = useState<CoachSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const c = getCurrentCoach()
    if (!c || c.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    setCoach(c)
    loadAdminData()
  }, [navigate])

  async function loadAdminData() {
    setLoading(true)
    try {
      const currentCoach = getCurrentCoach()
      if (!currentCoach) return

      // Set coach context for RLS + admin RPC functions
      await setCoachContext(currentCoach.id)

      // Get admin stats via secure RPC
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_stats')

      if (statsError) {
        console.error('Admin stats error:', statsError)
        return
      }

      const s = statsData || {}
      setStats({
        totalCoaches: s.total_coaches || 0,
        totalClients: s.total_clients || 0,
        totalPrograms: s.total_programs || 0,
        totalExercises: s.total_exercises || 0,
        activeClients: s.active_clients || 0,
        pausedClients: s.paused_clients || 0,
        archivedClients: s.archived_clients || 0,
        recentSignups: s.recent_signups || 0,
      })

      // Get all coaches with stats via secure RPC
      const { data: coachesData, error: coachesError } = await supabase
        .rpc('get_all_coaches_with_stats')

      if (coachesError) {
        console.error('Coaches list error:', coachesError)
        return
      }

      setCoaches((coachesData || []).map((c: any) => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        business_name: c.business_name,
        specialty: c.specialty,
        role: c.role,
        last_login: c.last_login,
        created_at: c.created_at,
        client_count: Number(c.client_count) || 0,
      })))
    } catch (e) {
      console.error('Admin data load error:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = stats ? [
    { label: 'Coaches', value: stats.totalCoaches, icon: Users, color: '#00AEEF' },
    { label: 'Clients', value: stats.totalClients, icon: Shield, color: '#22C55E' },
    { label: 'Programs', value: stats.totalPrograms, icon: Dumbbell, color: '#8B5CF6' },
    { label: 'Exercises', value: stats.totalExercises, icon: BarChart3, color: '#F59E0B' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#F0F0F0] tracking-tight flex items-center gap-2">
            <Shield size={24} className="text-[#00AEEF]" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm mt-0.5">
            Platform overview and coach management
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-[rgba(0,174,239,0.08)] border border-[#00AEEF]/20">
          <Award size={14} className="text-[#00AEEF]" />
          <span className="text-xs font-medium text-[#00AEEF]">Admin Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-[#F0F0F0]" style={{ fontFamily: 'Space Mono, monospace' }}>
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Client Status Breakdown */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-4">
            Client Status Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
              <p className="text-xl font-bold text-[#22C55E]">{stats.activeClients}</p>
              <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">Active</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
              <p className="text-xl font-bold text-[#EAB308]">{stats.pausedClients}</p>
              <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">Paused</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
              <p className="text-xl font-bold text-[#EF4444]">{stats.archivedClients}</p>
              <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">Archived</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Coaches Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#2A3A50] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0]">
            All Coaches ({coaches.length})
          </h3>
          {stats && stats.recentSignups > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-[rgba(0,174,239,0.08)] text-[#00AEEF] font-medium">
              {stats.recentSignups} new this month
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-200 dark:divide-[#1F1F1F]">
          {coaches.map((c) => (
            <div
              key={c.id}
              className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-[#F0F0F0] truncate">
                    {c.full_name}
                  </p>
                  {c.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00AEEF]/10 text-[#00AEEF] font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500 dark:text-[#94A3B8] flex items-center gap-1">
                    <Mail size={10} /> {c.email}
                  </span>
                  {c.business_name && (
                    <span className="text-xs text-gray-400 dark:text-[#6B6B6B]">
                      {c.business_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs text-gray-500 dark:text-[#94A3B8]">
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-[#F0F0F0]">{c.client_count}</p>
                  <p className="text-[10px]">clients</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-[#F0F0F0]">{c.specialty || '—'}</p>
                  <p className="text-[10px]">specialty</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-[#F0F0F0] flex items-center gap-1">
                    <Clock size={10} />
                    {c.last_login ? new Date(c.last_login).toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-[10px]">last login</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-400 dark:text-[#6B6B6B] flex-shrink-0" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
