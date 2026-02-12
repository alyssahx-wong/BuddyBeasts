import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCompanionStore = create(
  persist(
    (set, get) => ({
      // Session-only state (excluded from persistence)
      messages: [],
      isOpen: false,
      isLoading: false,
      hasGreeted: false,

      // Persisted state
      moodHistory: [],

      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

      openChat: () => set({ isOpen: true }),

      closeChat: () => set({ isOpen: false }),

      addUserMessage: (text) => set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `msg_${Date.now()}`,
            role: 'user',
            text,
            timestamp: Date.now(),
          },
        ],
      })),

      addMonsterMessage: (text) => set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `msg_${Date.now()}`,
            role: 'monster',
            text,
            timestamp: Date.now(),
          },
        ],
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      setHasGreeted: (greeted) => set({ hasGreeted: greeted }),

      addMoodEntry: (mood) => set((state) => ({
        moodHistory: [
          ...state.moodHistory,
          { mood, timestamp: Date.now() },
        ],
      })),

      getMoodHistory: (days) => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        return get().moodHistory.filter((entry) => entry.timestamp >= cutoff)
      },
    }),
    {
      name: 'buddybeasts-companion',
      partialize: (state) => ({
        moodHistory: state.moodHistory,
      }),
    }
  )
)
