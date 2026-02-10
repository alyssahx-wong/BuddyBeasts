import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
        unlockedSkins: ['default'],
        activeSkin: 'default',
      },
      
      initializeMonster: (userId) => set((state) => ({
        monster: {
          ...state.monster,
          id: userId,
        }
      })),
      
      addCrystals: (amount) => set((state) => ({
        monster: {
          ...state.monster,
          crystals: state.monster.crystals + amount,
          level: Math.floor((state.monster.crystals + amount) / 100) + 1,
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

      unlockSkin: (skinId) => set((state) => {
        if (state.monster.unlockedSkins.includes(skinId)) return state
        return {
          monster: {
            ...state.monster,
            unlockedSkins: [...state.monster.unlockedSkins, skinId],
          },
        }
      }),

      setActiveSkin: (skinId) => set((state) => {
        if (!state.monster.unlockedSkins.includes(skinId)) return state
        return {
          monster: {
            ...state.monster,
            activeSkin: skinId,
          },
        }
      }),
    }),
    {
      name: 'karmaloop-monster',
    }
  )
)
