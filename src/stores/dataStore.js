import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDataStore = create(
  persist(
    (set) => ({
      // Analytics data
      questHistory: [],
      dropOffEvents: [],
      timeOfDayPatterns: {},
      belongingScores: [],
      
      // Track quest interaction
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
      
      // Get recommendations based on history
      getRecommendations: () => {
        const state = useDataStore.getState()
        const completed = state.questHistory.filter(q => q.status === 'completed')
        
        if (completed.length === 0) {
          return {
            recommendedTypes: ['coffee_chat', 'study_jam', 'sunset_walk'],
            recommendedGroupSize: 'small',
            bestTimeOfDay: 'afternoon',
          }
        }
        
        // Calculate preferred quest types
        const typeCount = {}
        completed.forEach(q => {
          typeCount[q.questType] = (typeCount[q.questType] || 0) + 1
        })
        const recommendedTypes = Object.entries(typeCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type]) => type)
        
        // Calculate preferred group size
        const avgGroupSize = completed.reduce((sum, q) => sum + (q.groupSize || 2), 0) / completed.length
        const recommendedGroupSize = avgGroupSize <= 2 ? '1-1' : avgGroupSize <= 4 ? 'small' : 'large'
        
        // Calculate best time of day
        const hourCounts = {}
        completed.forEach(q => {
          const hour = new Date(q.startTime).getHours()
          const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
          hourCounts[period] = (hourCounts[period] || 0) + 1
        })
        const bestTimeOfDay = Object.entries(hourCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'afternoon'
        
        return {
          recommendedTypes,
          recommendedGroupSize,
          bestTimeOfDay,
        }
      },
    }),
    {
      name: 'karmaloop-data',
    }
  )
)
