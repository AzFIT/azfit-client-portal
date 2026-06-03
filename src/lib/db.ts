import { supabase } from './supabase'
import type { Coach, Client } from '@/types/auth'

// ═══════════════════════════════════════════════════════════
// COACHES
// ═══════════════════════════════════════════════════════════

export async function getCoachByEmail(email: string): Promise<Coach | null> {
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !data) return null
  return dbCoachToCoach(data)
}

export async function getCoachById(id: string): Promise<Coach | null> {
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return dbCoachToCoach(data)
}

export async function createCoach(coach: Omit<Coach, 'id' | 'createdAt'>): Promise<Coach | null> {
  const { data, error } = await supabase
    .from('coaches')
    .insert({
      full_name: coach.fullName,
      email: coach.email.toLowerCase(),
      password_hash: coach.passwordHash,
      business_name: coach.businessName,
      specialty: coach.specialty,
      years_experience: coach.yearsExperience,
      settings: coach.settings,
      role: coach.role || 'coach',
      last_login: coach.lastLogin,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('createCoach error:', error)
    return null
  }
  return dbCoachToCoach(data)
}

export async function updateCoachLogin(id: string): Promise<void> {
  await supabase
    .from('coaches')
    .update({ last_login: new Date().toISOString() })
    .eq('id', id)
}

// ═══════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════

export async function getClientsForCoach(coachId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('getClientsForCoach error:', error)
    return []
  }
  return data.map(dbClientToClient)
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return dbClientToClient(data)
}

export async function createClient(client: Client): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .insert(dbClientFromClient(client))
    .select()
    .single()

  if (error || !data) {
    console.error('createClient error:', error)
    return null
  }
  return dbClientToClient(data)
}

export async function updateClient(client: Client): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .update(dbClientFromClient(client))
    .eq('id', client.id)
    .select()
    .single()

  if (error || !data) {
    console.error('updateClient error:', error)
    return null
  }
  return dbClientToClient(data)
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) {
    console.error('deleteClient error:', error)
    return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════
// PROGRAMS
// ═══════════════════════════════════════════════════════════

export async function getProgramsForCoach(coachId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProgramsForCoach error:', error)
    return []
  }
  return data || []
}

export async function getProgramsForClient(clientId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProgramsForClient error:', error)
    return []
  }
  return data || []
}

export async function saveProgram(program: any): Promise<any | null> {
  const isUpdate = !!program.id
  const payload = {
    coach_id: program.coachId,
    client_id: program.clientId || null,
    name: program.name || program.data?.programName || 'Untitled Program',
    description: program.description || '',
    status: program.status || 'active',
    data: program.data || program,
    updated_at: new Date().toISOString(),
  }

  if (isUpdate) {
    const { data, error } = await supabase
      .from('programs')
      .update(payload)
      .eq('id', program.id)
      .select()
      .single()
    if (error) {
      console.error('updateProgram error:', error)
      return null
    }
    return data
  }

  const { data, error } = await supabase
    .from('programs')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('createProgram error:', error)
    return null
  }
  return data
}

// ═══════════════════════════════════════════════════════════
// EXERCISES
// ═══════════════════════════════════════════════════════════

export async function getAllExercises(): Promise<any[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllExercises error:', error)
    return []
  }
  return data || []
}

// ═══════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════

export async function getNotesForClient(clientId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getNotesForClient error:', error)
    return []
  }
  return data || []
}

export async function addClientNote(clientId: string, coachId: string, text: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('client_notes')
    .insert({ client_id: clientId, coach_id: coachId, note_text: text })
    .select()
    .single()

  if (error) {
    console.error('addClientNote error:', error)
    return null
  }
  return data
}

// ═══════════════════════════════════════════════════════════
// WORKOUT SESSIONS
// ═══════════════════════════════════════════════════════════

export async function getSessionsForCoach(coachId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getSessionsForCoach error:', error)
    return []
  }
  return data || []
}

export async function getSessionsForClient(clientId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getSessionsForClient error:', error)
    return []
  }
  return data || []
}

export async function createSession(session: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert(session)
    .select()
    .single()

  if (error) {
    console.error('createSession error:', error)
    return null
  }
  return data
}

export async function updateSession(id: string, updates: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateSession error:', error)
    return null
  }
  return data
}

export async function deleteSession(id: string): Promise<boolean> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
  if (error) {
    console.error('deleteSession error:', error)
    return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════
// PERSONAL RECORDS
// ═══════════════════════════════════════════════════════════

export async function getPRsForClient(clientId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('client_id', clientId)
    .order('achieved_at', { ascending: false })

  if (error) {
    console.error('getPRsForClient error:', error)
    return []
  }
  return data || []
}

export async function upsertPR(pr: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('personal_records')
    .upsert(pr, { onConflict: 'client_id,exercise_id' })
    .select()
    .single()

  if (error) {
    console.error('upsertPR error:', error)
    return null
  }
  return data
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function dbCoachToCoach(db: any): Coach {
  return {
    id: db.id,
    fullName: db.full_name,
    email: db.email,
    passwordHash: db.password_hash,
    businessName: db.business_name || '',
    specialty: db.specialty || '',
    yearsExperience: db.years_experience || 0,
    role: db.role || 'coach',
    createdAt: db.created_at,
    lastLogin: db.last_login,
    settings: db.settings || { theme: 'dark', unitSystem: 'metric', defaultSessionDuration: 60 },
  }
}

function dbClientToClient(db: any): Client {
  return {
    id: db.id,
    coachId: db.coach_id,
    personal: db.personal || {},
    goals: db.goals || {},
    bodyAssessment: db.body_assessment || {},
    tdee: db.tdee || {},
    medical: db.medical || {},
    nutrition: db.nutrition || {},
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    assessmentHistory: db.assessment_history || [],
  } as Client
}

function dbClientFromClient(client: Client): any {
  return {
    coach_id: client.coachId,
    full_name: client.personal?.fullName || '',
    email: client.personal?.email || '',
    status: client.status,
    updated_at: new Date().toISOString(),
    personal: client.personal,
    goals: client.goals,
    body_assessment: client.bodyAssessment,
    tdee: client.tdee,
    medical: client.medical,
    nutrition: client.nutrition,
    assessment_history: client.assessmentHistory,
  }
}
