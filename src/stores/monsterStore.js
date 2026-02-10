import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

export const useMonsterStore = create(
  persist(
    (set) => ({
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
      },
      monsters: [],
      inventory: [],
      eggs: [],
      groupPhotos: [],

<<<<<<< HEAD
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

=======
>>>>>>> junhern
      initializeMonster: (userId, quizData = {}) => set((state) => {
        const initialized = {
          ...state.monster,
          id: userId,
          name: quizData.name || 'Buddy',
          monsterType: quizData.monsterType || state.monster.monsterType,
        }
        const hasMonster = state.monsters.some((m) => m.id === userId)
        return {
          monster: initialized,
          monsters: hasMonster ? state.monsters : [...state.monsters, initialized],
        }
      }),

<<<<<<< HEAD
      addCrystals: async (amount) => {
        try {
          const { data } = await api.post('/api/monsters/me/crystals', { amount })
          set((state) => ({
            monster: { ...state.monster, ...data },
            monsters: state.monsters.map((m) => (m.id === data.id ? { ...m, ...data } : m)),
          }))
          return data
        } catch {
          return null
=======
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

        const updatedMonster = {
          ...state.monster,
          crystals: newCrystals,
          level: newLevel,
          evolution: newEvolution,
          justEvolved,
>>>>>>> junhern
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
<<<<<<< HEAD
=======

      completeQuest: (questType, isGroup) => set((state) => {
        const newPreferred = { ...state.monster.preferredQuestTypes }
        newPreferred[questType] = (newPreferred[questType] || 0) + 1

        const updatedMonster = {
          ...state.monster,
          questsCompleted: state.monster.questsCompleted + 1,
          socialScore: isGroup ? state.monster.socialScore + 10 : state.monster.socialScore + 3,
          preferredQuestTypes: newPreferred,
        }
>>>>>>> junhern

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
<<<<<<< HEAD
      },

      evolveMonster: async (newEvolution, traits) => {
        try {
          const { data } = await api.post('/api/monsters/me/evolve', {
            evolution: newEvolution,
            traits,
          })
          set((state) => ({
            monster: { ...state.monster, ...data },
            monsters: state.monsters.map((m) => (m.id === data.id ? { ...m, ...data } : m)),
          }))
          return data
        } catch (err) {
          throw err
=======
      }),

      evolveMonster: (newEvolution, traits) => set((state) => {
        const updatedMonster = {
          ...state.monster,
          evolution: newEvolution,
          traits: [...state.monster.traits, ...traits],
>>>>>>> junhern
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
<<<<<<< HEAD
      },
=======
      }),
>>>>>>> junhern

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
    }),
    {
      name: 'buddybeasts-monster',
    }
  )
)
