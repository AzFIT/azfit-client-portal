import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { storage, seedDemoData } from '../services/storage'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  seedIfNew: () => void
  ensureAdminAccount: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const users = storage.get<User[]>('users', [])
        const user = users.find((u) => u.email === email)
        if (!user) return { success: false, error: 'No account found with this email' }

        const passwords = storage.get<Record<string, string>>('passwords', {})
        if (passwords[user.id] !== password) return { success: false, error: 'Incorrect password' }

        set({ user, isAuthenticated: true })
        get().seedIfNew()
        return { success: true }
      },

      register: (name, email, password) => {
        const users = storage.get<User[]>('users', [])
        if (users.some((u) => u.email === email)) {
          return { success: false, error: 'An account with this email already exists' }
        }

        const newUser: User = {
          id: 'usr_' + Date.now(),
          email,
          name,
          role: 'trainer',
          createdAt: new Date().toISOString(),
        }

        users.push(newUser)
        storage.set('users', users)

        const passwords = storage.get<Record<string, string>>('passwords', {})
        passwords[newUser.id] = password
        storage.set('passwords', passwords)

        set({ user: newUser, isAuthenticated: true })
        seedDemoData(newUser.id)
        return { success: true }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      seedIfNew: () => {
        const { user } = get()
        if (user && !storage.get('seeded', false)) {
          seedDemoData(user.id)
        }
      },

      ensureAdminAccount: () => {
        const users = storage.get<User[]>('users', [])
        const passwords = storage.get<Record<string, string>>('passwords', {})

        if (!users.some((u) => u.email === 'admin@azfit.com')) {
          const adminUser: User = {
            id: 'usr_admin_default',
            email: 'admin@azfit.com',
            name: 'Admin User',
            role: 'trainer',
            createdAt: new Date().toISOString(),
          }
          users.push(adminUser)
          storage.set('users', users)
          passwords[adminUser.id] = 'password'
          storage.set('passwords', passwords)
          seedDemoData(adminUser.id)
        }
      },
    }),
    {
      name: 'azfit_auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
