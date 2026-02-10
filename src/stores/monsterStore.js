import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

export const useMonsterStore = create(
  persist(
    (set) => ({
      monster: {
        id: null,
        name: 'Buddy',
        level: 1,
        crystals: 0,
        evolution: 'baby',
        traits: [],
        questsCompleted: 0,
        socialScore: 0,
        preferredQuestTypes: {},
        preferredGroupSize: 'small',
      },

      // Fetch monster from backend and sync to local state
      fetchMonster: async () => {
        try {
          const { data } = await api.get('/api/monsters/me')
          if (data && data.id) {
            set({ monster: data })
          }
          return data
        } catch {
          return null
        }
      },

      initializeMonster: (userId) => set((state) => ({
        monster: { ...state.monster, id: userId }
      })),

      addCrystals: async (amount) => {
        try {
          const { data } = await api.post('/api/monsters/me/crystals', { amount })
          set({ monster: data })
          return data
        } catch {
          return null
        }
      },

      completeQuest: async (questType, isGroup) => {
        try {
          const { data } = await api.post('/api/monsters/me/complete-quest', {
            questType,
            isGroup,
          })
          set({ monster: data })
          return data
        } catch {
          return null
        }
      },

      evolveMonster: async (newEvolution, traits) => {
        try {
          const { data } = await api.post('/api/monsters/me/evolve', {
            evolution: newEvolution,
            traits,
          })
          set({ monster: data })
          return data
        } catch (err) {
          throw err
        }
      },

      renameMonster: async (name) => {
        try {
          const { data } = await api.put('/api/monsters/me/name', { name })
          set({ monster: data })
          return data
        } catch {
          return null
        }
      },

      updatePreferredGroupSize: (size) => set((state) => ({
        monster: { ...state.monster, preferredGroupSize: size }
      })),
    }),
    {
      name: 'karmaloop-monster',
    }
  )
)
