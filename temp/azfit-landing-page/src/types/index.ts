export interface Client {
  id: string
  trainerId: string
  name: string
  email: string
  phone?: string
  status: 'active' | 'at-risk' | 'new' | 'inactive'
  notes?: string
  avatar?: string
  createdAt: string
}

export interface Program {
  id: string
  trainerId: string
  name: string
  description?: string
  category: string
  duration: number
  createdAt: string
}

export interface WorkoutSession {
  id: string
  trainerId: string
  clientId: string
  clientName: string
  date: string
  type: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed'
  notes?: string
}

export interface CalendarEvent {
  id: string
  trainerId: string
  clientId?: string
  title: string
  date: string
  time?: string
  type: 'session' | 'assessment' | 'check-in' | 'other'
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface NutritionEntry {
  id: string
  clientId: string
  date: string
  meal: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes?: string
}

export interface ActivityItem {
  id: string
  trainerId?: string
  text: string
  time: string
  type: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'trainer' | 'admin'
  avatar?: string
  createdAt?: string
}
