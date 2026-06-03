import { supabase, setCoachContext } from './supabase'
import { getCurrentCoach } from './auth'
import type { SavedSession, PersonalRecord } from '@/types'

const SESSIONS_KEY = 'azfit-sessions'
const PRS_KEY = 'azfit-prs'

/* ── localStorage helpers ────────────────────────────── */

function getSessionsLocal(): SavedSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveSessionsLocal(sessions: SavedSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

function getPRsLocal(): PersonalRecord[] {
  try {
    const raw = localStorage.getItem(PRS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function savePRsLocal(prs: PersonalRecord[]) {
  localStorage.setItem(PRS_KEY, JSON.stringify(prs))
}

/* ── Supabase wrappers ───────────────────────────────── */

export async function getSessionsForClient(clientId: string): Promise<SavedSession[]> {
  const coach = getCurrentCoach()
  if (coach) await setCoachContext(coach.id)

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    // Fallback to localStorage
    return getSessionsLocal().filter(s => s.clientId === clientId)
  }

  return data.map(dbSessionToSession)
}

export async function getSessionsForCoach(coachId: string): Promise<SavedSession[]> {
  await setCoachContext(coachId)

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return getSessionsLocal().filter(s => s.coachId === coachId)
  }

  return data.map(dbSessionToSession)
}

export async function saveSession(session: SavedSession): Promise<SavedSession | null> {
  const coach = getCurrentCoach()
  if (coach) await setCoachContext(coach.id)

  // Try Supabase first
  const dbPayload = sessionToDbSession(session)
  const { data, error } = await supabase
    .from('workout_sessions')
    .upsert(dbPayload)
    .select()
    .single()

  if (error || !data) {
    console.warn('Supabase session save failed, falling back to localStorage:', error?.message)
    // Fallback to localStorage
    const sessions = getSessionsLocal()
    const idx = sessions.findIndex(s => s.id === session.id)
    if (idx >= 0) sessions[idx] = session
    else sessions.unshift(session)
    saveSessionsLocal(sessions)
    return session
  }

  return dbSessionToSession(data)
}

export async function deleteSession(id: string): Promise<boolean> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
  if (error) return false

  const sessions = getSessionsLocal().filter(s => s.id !== id)
  saveSessionsLocal(sessions)
  return true
}

/* ── PR helpers ──────────────────────────────────────── */

export async function getPRsForClient(clientId: string): Promise<PersonalRecord[]> {
  const coach = getCurrentCoach()
  if (coach) await setCoachContext(coach.id)

  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('client_id', clientId)
    .order('achieved_at', { ascending: false })

  if (error || !data) {
    return getPRsLocal().filter(p => p.clientId === clientId)
  }

  return data.map(dbPRToPR)
}

export async function savePR(pr: PersonalRecord): Promise<PersonalRecord | null> {
  const coach = getCurrentCoach()
  if (coach) await setCoachContext(coach.id)

  const { data, error } = await supabase
    .from('personal_records')
    .upsert({
      coach_id: pr.coachId,
      client_id: pr.clientId,
      exercise_id: pr.exerciseId,
      exercise_name: pr.exerciseName,
      load: pr.load,
      reps: pr.reps,
      estimated_1rm: pr.estimated1rm,
      session_id: pr.sessionId,
      achieved_at: pr.achievedAt,
    }, { onConflict: 'client_id,exercise_id' })
    .select()
    .single()

  if (error || !data) {
    const prs = getPRsLocal()
    const idx = prs.findIndex(p => p.clientId === pr.clientId && p.exerciseId === pr.exerciseId)
    if (idx >= 0) prs[idx] = pr
    else prs.unshift(pr)
    savePRsLocal(prs)
    return pr
  }

  return dbPRToPR(data)
}

/* ── Dashboard stats ─────────────────────────────────── */

export function getWeeklySessionStats(sessions: SavedSession[]) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const thisWeekSessions = sessions.filter(s => {
    const d = new Date(s.startTime)
    return d >= startOfWeek && s.status === 'completed'
  })

  const plannedSessions = 20 // default, could come from client goals
  const completedSessions = thisWeekSessions.length
  const adherence = plannedSessions > 0 ? Math.round((completedSessions / plannedSessions) * 100) : 0

  const totalVolume = thisWeekSessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0)

  return {
    completedSessions,
    plannedSessions,
    adherence: Math.min(adherence, 100),
    totalVolume,
  }
}

/* ── Mappers ─────────────────────────────────────────── */

function dbSessionToSession(db: any): SavedSession {
  return {
    id: db.id,
    coachId: db.coach_id,
    clientId: db.client_id,
    clientName: db.client_name,
    programId: db.program_id,
    programName: db.program_name,
    dayName: db.day_name,
    dayOfWeek: db.day_of_week,
    phaseName: db.phase_name,
    exercises: db.exercises || [],
    startTime: db.start_time,
    endTime: db.end_time,
    durationMinutes: db.duration_minutes || 0,
    totalVolume: db.total_volume || 0,
    totalSets: db.total_sets || 0,
    completedSets: db.completed_sets || 0,
    avgRpe: db.avg_rpe || 0,
    coachNotes: db.coach_notes || '',
    status: db.status,
    createdAt: db.created_at,
  }
}

function sessionToDbSession(s: SavedSession): any {
  return {
    id: s.id,
    coach_id: s.coachId,
    client_id: s.clientId,
    client_name: s.clientName,
    program_id: s.programId,
    program_name: s.programName,
    day_name: s.dayName,
    day_of_week: s.dayOfWeek,
    phase_name: s.phaseName,
    exercises: s.exercises,
    start_time: s.startTime,
    end_time: s.endTime,
    duration_minutes: s.durationMinutes,
    total_volume: s.totalVolume,
    total_sets: s.totalSets,
    completed_sets: s.completedSets,
    avg_rpe: s.avgRpe,
    coach_notes: s.coachNotes,
    status: s.status,
  }
}

function dbPRToPR(db: any): PersonalRecord {
  return {
    id: db.id,
    coachId: db.coach_id,
    clientId: db.client_id,
    exerciseId: db.exercise_id,
    exerciseName: db.exercise_name,
    load: db.load,
    reps: db.reps,
    estimated1rm: db.estimated_1rm,
    sessionId: db.session_id,
    achievedAt: db.achieved_at,
  }
}
