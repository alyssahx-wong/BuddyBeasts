import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      currentHub: null,
      
      setUser: (user) => set({ user }),
      
      logout: () => set({ user: null, currentHub: null }),
      
      setCurrentHub: (hub) => set({ currentHub: hub }),
    }),
    {
      name: 'karmaloop-auth',
    }
  )
)
