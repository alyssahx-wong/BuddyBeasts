import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMonsterStore = create(
  persist(
    (set) => ({
      monster: {
        id: null,
        name: 'Buddy',
        monsterType: Math.floor(Math.random() * 9) + 1,
        level: 1,
        crystals: 0,
        evolution: 'baby',
        traits: [],
        questsCompleted: 0,
        socialScore: 0,
        preferredQuestTypes: {},
        preferredGroupSize: 'small', // 1-1, small, large
      },
      
      initializeMonster: (userId) => set((state) => ({
        monster: {
          ...state.monster,
          id: userId,
        }
      })),
      
      addCrystals: (amount) => set((state) => {
        const newCrystals = state.monster.crystals + amount
        const newLevel = Math.floor(newCrystals / 100) + 1
        const oldLevel = state.monster.level

        // Auto-evolve from baby to teen at level 5
        let newEvolution = state.monster.evolution
        let justEvolved = false
        if (oldLevel < 5 && newLevel >= 5 && state.monster.evolution === 'baby') {
          newEvolution = 'teen'
          justEvolved = true
        }

        return {
          monster: {
            ...state.monster,
            crystals: newCrystals,
            level: newLevel,
            evolution: newEvolution,
            justEvolved,
          }
        }
      }),

      clearJustEvolved: () => set((state) => ({
        monster: {
          ...state.monster,
          justEvolved: false,
        }
      })),
      
      completeQuest: (questType, isGroup) => set((state) => {
        const newPreferred = { ...state.monster.preferredQuestTypes }
        newPreferred[questType] = (newPreferred[questType] || 0) + 1
        
        return {
          monster: {
            ...state.monster,
            questsCompleted: state.monster.questsCompleted + 1,
            socialScore: isGroup ? state.monster.socialScore + 10 : state.monster.socialScore + 3,
            preferredQuestTypes: newPreferred,
          }
        }
      }),
      
      evolveMonster: (newEvolution, traits) => set((state) => ({
        monster: {
          ...state.monster,
          evolution: newEvolution,
          traits: [...state.monster.traits, ...traits],
        }
      })),
      
      updatePreferredGroupSize: (size) => set((state) => ({
        monster: {
          ...state.monster,
          preferredGroupSize: size,
        }
      })),
    }),
    {
      name: 'karmaloop-monster',
    }
  )
)
