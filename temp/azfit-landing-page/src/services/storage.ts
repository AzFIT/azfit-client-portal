const STORAGE_KEY = 'azfit_portal'

function getKey(key: string): string {
  return `${STORAGE_KEY}_${key}`
}

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(getKey(key))
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(getKey(key), JSON.stringify(value))
    } catch {
      // ignore
    }
  },

  remove(key: string): void {
    localStorage.removeItem(getKey(key))
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_KEY))
      .forEach(k => localStorage.removeItem(k))
  },
}

// Seed initial demo data for new users
export function seedDemoData(trainerId: string): void {
  if (storage.get<boolean>('seeded', false)) return

  const today = new Date().toISOString().split('T')[0]

  // Seed clients
  const clients = [
    { id: 'c1', trainerId, name: 'John Tan', email: 'john@email.com', phone: '+852 9123 4567',
      status: 'active' as const, goals: ['fat_loss', 'strength'], notes: 'Former athlete, very motivated',
      joinedDate: '2026-01-15', nextSession: `${today}T10:00`, progress: 78 },
    { id: 'c2', trainerId, name: 'Maria Li', email: 'maria@email.com', phone: '+852 9234 5678',
      status: 'active' as const, goals: ['muscle_gain', 'strength'], notes: 'Focus on lower body',
      joinedDate: '2026-02-01', nextSession: `${today}T14:00`, progress: 92 },
    { id: 'c3', trainerId, name: 'David Park', email: 'david@email.com', phone: '+852 9345 6789',
      status: 'at-risk' as const, goals: ['fat_loss'], notes: 'Missed 2 sessions, needs motivation',
      joinedDate: '2026-01-20', nextSession: undefined, progress: 45 },
    { id: 'c4', trainerId, name: 'Sarah Chen', email: 'sarah@email.com', phone: '+852 9456 7890',
      status: 'active' as const, goals: ['endurance', 'fat_loss'], notes: 'Training for marathon',
      joinedDate: '2026-03-01', nextSession: `${today}T09:00`, progress: 85 },
    { id: 'c5', trainerId, name: 'Kevin Wong', email: 'kevin@email.com', phone: '+852 9567 8901',
      status: 'active' as const, goals: ['strength', 'muscle_gain'], notes: 'New PR on bench: 100kg',
      joinedDate: '2025-11-10', nextSession: `${today}T16:00`, progress: 71 },
    { id: 'c6', trainerId, name: 'Lisa Zhang', email: 'lisa@email.com', phone: '+852 9678 9012',
      status: 'new' as const, goals: ['general_fitness'], notes: 'First time training',
      joinedDate: today, nextSession: `${today}T11:00`, progress: 0 },
  ]
  storage.set('clients', clients)

  // Seed programs
  const programs = [
    { id: 'p1', trainerId, name: '12-Week Strength Builder', description: 'Progressive overload focused on compound movements', category: 'Strength', duration: 12, createdAt: '2026-01-01' },
    { id: 'p2', trainerId, name: '8-Week Fat Loss', description: 'High intensity with metabolic conditioning', category: 'Fat Loss', duration: 8, createdAt: '2026-02-01' },
  ]
  storage.set('programs', programs)

  // Seed calendar events
  const events = [
    { id: 'ev1', trainerId, clientId: 'c1', title: 'Session with John Tan', date: today, startTime: '10:00', endTime: '11:00', type: 'session' as const, status: 'scheduled' as const },
    { id: 'ev2', trainerId, clientId: 'c6', title: 'Session with Lisa Zhang', date: today, startTime: '11:00', endTime: '12:00', type: 'session' as const, status: 'scheduled' as const },
    { id: 'ev3', trainerId, clientId: 'c2', title: 'BioPrint Assessment - Maria', date: today, startTime: '14:00', endTime: '15:00', type: 'assessment' as const, status: 'scheduled' as const },
    { id: 'ev4', trainerId, clientId: 'c5', title: 'Session with Kevin Wong', date: today, startTime: '16:00', endTime: '17:00', type: 'session' as const, status: 'scheduled' as const },
  ]
  storage.set('events', events)

  // Seed workouts
  storage.set('workouts', [
    { id: 'ws1', clientId: 'c1', trainerId, programId: 'p1', name: 'Upper Body A', date: '2026-05-26', duration: 55, exercises: [{ id: 'le1', name: 'Bench Press', sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 80 }, { reps: 7, weight: 82.5 }, { reps: 6, weight: 85 }] }], notes: 'Good session' },
    { id: 'ws2', clientId: 'c2', trainerId, programId: 'p2', name: 'HIIT Cardio', date: '2026-05-26', duration: 40, exercises: [{ id: 'le3', name: 'Kettlebell Swings', sets: [{ reps: 15, weight: 16 }, { reps: 15, weight: 16 }] }], notes: 'Great intensity' },
  ])

  // Seed nutrition
  storage.set('nutrition', [
    { id: 'n1', clientId: 'c1', date: today, mealType: 'lunch' as const, foods: [{ name: 'Grilled Chicken Breast', grams: 200, calories: 330, protein: 62, carbs: 0, fat: 7.2 }, { name: 'Brown Rice', grams: 150, calories: 168, protein: 3.6, carbs: 36, fat: 1.2 }], totalCalories: 498, totalProtein: 65.6, totalCarbs: 36, totalFat: 8.4 },
  ])

  // Seed activities
  storage.set('activities', [
    { id: 'a1', type: 'workout' as const, text: 'John Tan logged Workout A — Upper Body Strength', time: '2 hours ago', clientName: 'John Tan' },
    { id: 'a2', type: 'assessment' as const, text: 'Maria Li completed BioPrint assessment', time: '15 min ago', clientName: 'Maria Li' },
    { id: 'a3', type: 'client_added' as const, text: 'New client: Lisa Zhang signed up', time: '1 hour ago', clientName: 'Lisa Zhang' },
    { id: 'a4', type: 'workout' as const, text: 'Kevin Wong hit new PR — Bench Press 100kg', time: '3 hours ago', clientName: 'Kevin Wong' },
    { id: 'a5', type: 'program_update' as const, text: 'Updated 8-Week Fat Loss program for David Park', time: '5 hours ago' },
    { id: 'a6', type: 'session_missed' as const, text: 'David Park missed scheduled session', time: 'Yesterday', clientName: 'David Park' },
  ])

  storage.set('seeded', true)
}
