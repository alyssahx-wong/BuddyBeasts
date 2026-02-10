import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

export const useDataStore = create(
  persist(
    (set) => ({
      // Local analytics kept for quick UI access
      questHistory: [],
      dropOffEvents: [],
      timeOfDayPatterns: {},
      belongingScores: [],

      trackQuestStart: (questId, questType) => set((state) => ({
        questHistory: [...state.questHistory, {
          questId,
          questType,
          startTime: Date.now(),
          status: 'started',
        }]
      })),

      trackQuestComplete: (questId, groupSize, duration) => set((state) => ({
        questHistory: state.questHistory.map(q =>
          q.questId === questId
            ? { ...q, status: 'completed', groupSize, duration, endTime: Date.now() }
            : q
        )
      })),

      trackQuestDropOff: (questId, reason) => set((state) => ({
        dropOffEvents: [...state.dropOffEvents, {
          questId,
          reason,
          timestamp: Date.now(),
        }],
        questHistory: state.questHistory.map(q =>
          q.questId === questId
            ? { ...q, status: 'dropped', dropReason: reason }
            : q
        )
      })),

      trackBelongingScore: (score) => set((state) => ({
        belongingScores: [...state.belongingScores, {
          score,
          timestamp: Date.now(),
        }]
      })),

      // Fetch recommendations from backend
      getRecommendations: async () => {
        try {
          const { data } = await api.get('/api/recommendations')
          return data
        } catch {
          return {
            recommendedTypes: ['coffee_chat', 'study_jam', 'sunset_walk'],
            recommendedGroupSize: 'small',
            bestTimeOfDay: 'afternoon',
          }
        }
      },
    }),
    {
      name: 'karmaloop-data',
    }
  )
)
