import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

export const useMonsterStore = create(
  persist(
    (set, get) => ({
      monster: {
        id: null,
        name: 'Buddy',
        monsterType: Math.floor(Math.random() * 9) + 1,
        level: 1,
        crystals: 0,
        coins: 0,
        evolution: 'baby',
        traits: [],
        questsCompleted: 0,
        socialScore: 0,
        preferredQuestTypes: {},
        preferredGroupSize: 'small',
        unlockedSkins: ['default'],
        activeSkin: 'default',
        equippedItems: {
          hat: null,
          outfit: null,
        },
        personalityScores: null,
        customCharacterUrl: null,
      },
      monsters: [],
      inventory: [],
      eggs: [],
      groupPhotos: [],
      generatedCharacter: null, // { name, imageUrl, answers }

      // Reset monster to defaults (used on logout or user switch)
      resetMonster: () => set({
        monster: {
          id: null,
          name: 'Buddy',
          monsterType: Math.floor(Math.random() * 9) + 1,
          level: 1,
          crystals: 0,
          coins: 0,
          evolution: 'baby',
          traits: [],
          questsCompleted: 0,
          socialScore: 0,
          preferredQuestTypes: {},
          preferredGroupSize: 'small',
          unlockedSkins: ['default'],
          activeSkin: 'default',
          equippedItems: { hat: null, outfit: null },
          personalityScores: null,
          customCharacterUrl: null,
        },
        generatedCharacter: null,
      }),

      // ── Backend-synced methods ──

      fetchMonster: async () => {
        try {
          const { data } = await api.get('/api/monsters/me')
          if (data && data.id) {
            set((state) => ({
              monster: { ...state.monster, ...data },
            }))
          }
          return data
        } catch {
          return null
        }
      },

      initializeMonster: (userId, quizData = {}) => set((state) => {
        const initialized = {
          ...state.monster,
          id: userId,
          name: quizData.name || 'Buddy',
          monsterType: quizData.monsterType || state.monster.monsterType,
          personalityScores: quizData.personalityScores || state.monster.personalityScores,
        }
        const hasMonster = state.monsters.some((m) => m.id === userId)
        return {
          monster: initialized,
          monsters: hasMonster ? state.monsters : [...state.monsters, initialized],
        }
      }),

      addCrystals: async (amount) => {
        try {
          const oldEvolution = get().monster.evolution
          const { data } = await api.post('/api/monsters/me/crystals', { amount })
          // Detect evolution change to trigger the animation overlay
          const justEvolved = data.evolution && data.evolution !== oldEvolution
          set((state) => ({
            monster: { ...state.monster, ...data, justEvolved: justEvolved || false },
            monsters: state.monsters.map((m) => (m.id === data.id ? { ...m, ...data } : m)),
          }))
          return data
        } catch {
          return null
        }
      },

      clearJustEvolved: () => set((state) => ({
        monster: {
          ...state.monster,
          justEvolved: false,
        }
      })),

      addCoins: (amount) => set((state) => {
        const updatedMonster = {
          ...state.monster,
          coins: (state.monster.coins || 0) + amount,
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
        }
      }),

      completeQuest: async (questType, isGroup) => {
        try {
          const { data } = await api.post('/api/monsters/me/complete-quest', {
            questType,
            isGroup,
          })
          set((state) => ({
            monster: { ...state.monster, ...data },
            monsters: state.monsters.map((m) => (m.id === data.id ? { ...m, ...data } : m)),
          }))
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
          // Ensure traits is always an array to prevent render crashes
          if (data.traits && !Array.isArray(data.traits)) {
            data.traits = typeof data.traits === 'string' ? data.traits.split(',').filter(Boolean) : []
          }
          set((state) => ({
            monster: { ...state.monster, ...data, justEvolved: true },
            monsters: state.monsters.map((m) => (m.id === data.id ? { ...m, ...data } : m)),
          }))
          return data
        } catch (err) {
          throw err
        }
      },

      renameMonster: async (name) => {
        try {
          const { data } = await api.put('/api/monsters/me/name', { name })
          set((state) => ({
            monster: { ...state.monster, ...data },
            monsters: state.monsters.map((m) => (m.id === data.id ? { ...m, ...data } : m)),
          }))
          return data
        } catch {
          return null
        }
      },

      updatePreferredGroupSize: (size) => set((state) => {
        const updatedMonster = {
          ...state.monster,
          preferredGroupSize: size,
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
        }
      }),

      // ── Local-only features (skins, marketplace, eggs, photos) ──

      unlockSkin: (skinId) => set((state) => {
        if (state.monster.unlockedSkins.includes(skinId)) return state
        const updatedMonster = {
          ...state.monster,
          unlockedSkins: [...state.monster.unlockedSkins, skinId],
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
        }
      }),

      setActiveSkin: (skinId) => set((state) => {
        if (!state.monster.unlockedSkins.includes(skinId)) return state
        const updatedMonster = {
          ...state.monster,
          activeSkin: skinId,
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
        }
      }),

      addItemToInventory: (itemId) => set((state) => {
        if (state.inventory.includes(itemId)) return state
        return { inventory: [...state.inventory, itemId] }
      }),

      equipItem: (slot, itemId) => set((state) => {
        if (!state.inventory.includes(itemId)) return state
        const updatedMonster = {
          ...state.monster,
          equippedItems: {
            ...state.monster.equippedItems,
            [slot]: itemId,
          },
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
        }
      }),

      unequipItem: (slot) => set((state) => {
        const updatedMonster = {
          ...state.monster,
          equippedItems: {
            ...state.monster.equippedItems,
            [slot]: null,
          },
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
        }
      }),

      buyItem: (item) => set((state) => {
        if ((state.monster.coins || 0) < item.cost) return state
        if (state.inventory.includes(item.id)) return state
        const updatedMonster = {
          ...state.monster,
          coins: (state.monster.coins || 0) - item.cost,
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
          inventory: [...state.inventory, item.id],
        }
      }),

      buyEgg: (egg) => set((state) => {
        if ((state.monster.coins || 0) < egg.cost) return state
        const updatedMonster = {
          ...state.monster,
          coins: (state.monster.coins || 0) - egg.cost,
        }
        return {
          monster: updatedMonster,
          monsters: state.monsters.map((m) => (m.id === updatedMonster.id ? updatedMonster : m)),
          eggs: [...state.eggs, { ...egg, id: `${egg.id}_${Date.now()}` }],
        }
      }),

      hatchEgg: (eggId) => set((state) => {
        const egg = state.eggs.find((e) => e.id === eggId)
        if (!egg) return state

        const evolutions = ['baby', 'teen', 'adult', 'leader', 'support']
        const newEvolution = evolutions[Math.floor(Math.random() * evolutions.length)]
        const newMonster = {
          id: `${state.monster.id}_m${Date.now()}`,
          name: egg.name || 'Hatchling',
          level: 1,
          crystals: 0,
          coins: 0,
          evolution: newEvolution,
          traits: [egg.rarity || 'common'],
          questsCompleted: 0,
          socialScore: 0,
          preferredQuestTypes: {},
          preferredGroupSize: 'small',
          unlockedSkins: ['default'],
          activeSkin: 'default',
          equippedItems: { hat: null, outfit: null },
        }

        return {
          eggs: state.eggs.filter((e) => e.id !== eggId),
          monsters: [...state.monsters, newMonster],
        }
      }),

      setActiveMonster: (monsterId) => set((state) => {
        const nextMonster = state.monsters.find((m) => m.id === monsterId)
        if (!nextMonster) return state
        return { monster: nextMonster }
      }),

      saveGroupPhoto: (photoData) => set((state) => {
        const photo = {
          id: `photo_${Date.now()}`,
          imageBase64: photoData.imageBase64,
          imageUrl: photoData.imageUrl || null,
          questTitle: photoData.questTitle,
          questIcon: photoData.questIcon,
          groupMemory: photoData.groupMemory,
          groupSize: photoData.groupSize,
          timestamp: Date.now(),
          date: new Date().toLocaleString(),
        }
        return { groupPhotos: [...state.groupPhotos, photo] }
      }),

      deleteGroupPhoto: (photoId) => set((state) => {
        return { groupPhotos: state.groupPhotos.filter((p) => p.id !== photoId) }
      }),

      setGeneratedCharacter: (charData) => set((state) => {
        const updatedMonster = {
          ...state.monster,
          name: charData.name || state.monster.name,
          customCharacterUrl: charData.customCharacterUrl || charData.imageUrl || null,
          generatedImageUrl: charData.imageUrl || null,
          characterAnswers: charData.answers || {},
        }
        return {
          monster: updatedMonster,
          generatedCharacter: charData,
          monsters: state.monsters.map((m) =>
            m.id === updatedMonster.id ? updatedMonster : m
          ),
        }
      }),
    }),
    {
      name: 'buddybeasts-monster',
      version: 2,
      migrate: (persisted, version) => {
        if (version === 0 || version === undefined) {
          // Only seed personality scores for genuinely old users who
          // completed quests before the nurturing trait was added.
          // New users (no quests completed) should go through the quiz.
          if (
            persisted.monster &&
            !persisted.monster.personalityScores &&
            persisted.monster.questsCompleted > 0
          ) {
            persisted.monster.personalityScores = {
              social: 3,
              creative: 4,
              adventurous: 2,
              calm: 3,
              nurturing: 4,
            }
          }
        }
        // v1→v2: ensure customCharacterUrl field exists
        if (persisted.monster && persisted.monster.customCharacterUrl === undefined) {
          persisted.monster.customCharacterUrl = null
        }
        return persisted
      },
    }
  )
)
