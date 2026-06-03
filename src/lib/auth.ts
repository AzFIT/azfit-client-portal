import type { Coach, Client } from '@/types/auth'
import {
  getCoachByEmail,
  getCoachById,
  createCoach,
  updateCoachLogin,
  getClientsForCoach as dbGetClientsForCoach,
  getClientById as dbGetClientById,
  createClient as dbCreateClient,
  updateClient as dbUpdateClient,
  deleteClient as dbDeleteClient,
} from './db'

const COACHES_KEY = 'azfit-coaches'
const AUTH_TOKEN_KEY = 'azfit-auth-token'
const CLIENTS_KEY = 'azfit-clients'

/* ── Cache ───────────────────────────────────────────── */
let coachCache: Coach | null = null
let clientsCache: Client[] = []

/* ── Init ────────────────────────────────────────────── */
export async function initAuth(): Promise<void> {
  const token = getAuthToken()
  if (!token) return
  const coach = await getCoachById(token)
  if (coach) {
    coachCache = coach
    clientsCache = await dbGetClientsForCoach(token)
  } else {
    // Fallback to localStorage if Supabase coach not found
    const localCoach = findCoachByIdLocal(token)
    if (localCoach) {
      coachCache = localCoach
    }
  }
}

/* ── Dev Auto-Login ──────────────────────────────────── */
const DEV_COACH_ID = 'dev_admin_001'

export function devAutoLogin(): void {
  if (getAuthToken()) return // Already logged in

  const coaches = getCoachesLocal()
  let devCoach = coaches.find(c => c.id === DEV_COACH_ID)

  if (!devCoach) {
    devCoach = {
      id: DEV_COACH_ID,
      fullName: 'Azwar Admin',
      email: 'dev@azfit.app',
      passwordHash: simpleHash('dev123'),
      businessName: 'AzFIT Dev',
      specialty: 'Full Stack',
      yearsExperience: 10,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: { theme: 'dark', unitSystem: 'metric', defaultSessionDuration: 60 },
    }
    coaches.push(devCoach)
    saveCoachesLocal(coaches)
  }

  setAuthToken(devCoach.id)
  coachCache = devCoach
}

/* ── Coaches (localStorage fallback) ─────────────────── */

function getCoachesLocal(): Coach[] {
  try {
    const raw = localStorage.getItem(COACHES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveCoachesLocal(coaches: Coach[]) {
  localStorage.setItem(COACHES_KEY, JSON.stringify(coaches))
}

function addCoachLocal(coach: Coach) {
  const coaches = getCoachesLocal()
  coaches.push(coach)
  saveCoachesLocal(coaches)
}

function findCoachByEmailLocal(email: string): Coach | undefined {
  return getCoachesLocal().find(c => c.email.toLowerCase() === email.toLowerCase())
}

function findCoachByIdLocal(id: string): Coach | undefined {
  return getCoachesLocal().find(c => c.id === id)
}

/* ── Auth Token ──────────────────────────────────────── */

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  coachCache = null
  clientsCache = []
}

/* ── Current Coach (sync, uses cache) ────────────────── */

export function getCurrentCoach(): Coach | null {
  if (coachCache) return coachCache
  const token = getAuthToken()
  if (!token) return null
  // fallback to localStorage
  const coach = findCoachByIdLocal(token)
  if (coach) coachCache = coach
  return coachCache
}

export function isAuthenticated(): boolean {
  return !!getCurrentCoach()
}

/* ── Async Auth Actions ──────────────────────────────── */

export async function loginCoach(email: string, password: string): Promise<Coach | null> {
  // Try Supabase first
  const coach = await getCoachByEmail(email)
  if (coach && verifyPassword(password, coach.passwordHash)) {
    await updateCoachLogin(coach.id)
    setAuthToken(coach.id)
    coachCache = coach
    clientsCache = await dbGetClientsForCoach(coach.id)
    return coach
  }
  // Fallback to localStorage
  const localCoach = findCoachByEmailLocal(email)
  if (localCoach && verifyPassword(password, localCoach.passwordHash)) {
    setAuthToken(localCoach.id)
    coachCache = localCoach
    return localCoach
  }
  return null
}

export async function registerCoach(coach: Omit<Coach, 'id' | 'createdAt'>): Promise<Coach | null> {
  // Try Supabase first
  const existing = await getCoachByEmail(coach.email)
  if (existing) return null
  const newCoach = await createCoach(coach)
  if (newCoach) {
    setAuthToken(newCoach.id)
    coachCache = newCoach
    return newCoach
  }
  // Fallback to localStorage
  const localExisting = findCoachByEmailLocal(coach.email)
  if (localExisting) return null
  const localCoach: Coach = {
    ...coach,
    id: 'coach_' + Date.now(),
    createdAt: new Date().toISOString(),
  } as Coach
  addCoachLocal(localCoach)
  setAuthToken(localCoach.id)
  coachCache = localCoach
  return localCoach
}

/* ── Clients (localStorage fallback) ─────────────────── */

function getClientsLocal(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveClientsLocal(clients: Client[]) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
}

function addClientLocal(client: Client) {
  const clients = getClientsLocal()
  clients.push(client)
  saveClientsLocal(clients)
}

function updateClientLocal(updated: Client) {
  const clients = getClientsLocal()
  const idx = clients.findIndex(c => c.id === updated.id)
  if (idx >= 0) {
    clients[idx] = updated
    saveClientsLocal(clients)
  }
}

function deleteClientLocal(id: string) {
  const clients = getClientsLocal().filter(c => c.id !== id)
  saveClientsLocal(clients)
}

/* ── Async Client Actions ────────────────────────────── */

export async function loadClientsForCoach(coachId: string): Promise<Client[]> {
  const dbClients = await dbGetClientsForCoach(coachId)
  if (dbClients.length > 0) {
    clientsCache = dbClients
    return dbClients
  }
  // fallback
  clientsCache = getClientsLocal().filter(c => c.coachId === coachId)
  return clientsCache
}

export function getClientsForCoach(coachId: string): Client[] {
  if (clientsCache.length > 0 && clientsCache[0]?.coachId === coachId) {
    return clientsCache
  }
  return getClientsLocal().filter(c => c.coachId === coachId)
}

export function getClients(): Client[] {
  if (clientsCache.length > 0) return clientsCache
  return getClientsLocal()
}

export async function getClientById(id: string): Promise<Client | null> {
  const dbClient = await dbGetClientById(id)
  if (dbClient) return dbClient
  return getClientsLocal().find(c => c.id === id) || null
}

export async function addClient(client: Client): Promise<Client | null> {
  const result = await dbCreateClient(client)
  if (result) {
    clientsCache = await dbGetClientsForCoach(client.coachId)
  }
  addClientLocal(client)
  return result || client
}

export async function updateClient(updated: Client): Promise<Client | null> {
  const result = await dbUpdateClient(updated)
  if (result) {
    const idx = clientsCache.findIndex(c => c.id === updated.id)
    if (idx >= 0) clientsCache[idx] = result
    else clientsCache.push(result)
  }
  updateClientLocal(updated)
  return result || updated
}

export async function deleteClient(id: string): Promise<boolean> {
  const result = await dbDeleteClient(id)
  if (result) {
    clientsCache = clientsCache.filter(c => c.id !== id)
  }
  deleteClientLocal(id)
  return result
}

/* ── Helpers ─────────────────────────────────────────── */

export function simpleHash(password: string): string {
  try {
    return btoa(password)
  } catch {
    return password
  }
}

export function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash
}

export function calculateAge(dob: string): number {
  if (!dob) return 0
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
