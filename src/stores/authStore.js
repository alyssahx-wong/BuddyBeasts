import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentHub: null,

      loginDemo: async (name = 'Demo Player') => {
        const { data } = await api.post('/api/auth/demo', { name })
        set({ user: data.user, token: data.token })
        return data
      },

      loginGoogle: async (credential) => {
        const { data } = await api.post('/api/auth/google', { token: credential })
        set({ user: data.user, token: data.token })
        return data
      },

      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await api.post('/api/auth/logout')
        } catch {
          // ignore if token already invalid
        }
        set({ user: null, token: null, currentHub: null })
      },

      setCurrentHub: (hub) => set({ currentHub: hub }),
    }),
    {
      name: 'buddybeasts-auth',
    }
  )
)
