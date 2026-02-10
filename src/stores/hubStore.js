import { create } from 'zustand'
import api from '../api'

export const useHubStore = create((set, get) => ({
  onlineUsers: [],
  activeQuests: [],
  completedQuests: [],
  pollingInterval: null,

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (user) => set((state) => ({
    onlineUsers: [...state.onlineUsers.filter(u => u.id !== user.id), user]
  })),

  removeOnlineUser: (userId) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
  })),

  setActiveQuests: (quests) => set({ activeQuests: quests }),

  addCompletedQuest: (quest) => set((state) => ({
    completedQuests: [...state.completedQuests, quest]
  })),

  fetchOnlineUsers: async (hubId) => {
    try {
      const { data } = await api.get(`/api/hubs/${hubId}/users`)
      set({ onlineUsers: data })
    } catch (err) {
      console.error('Failed to fetch online users:', err)
    }
  },

  // Poll the backend for online users every 5 seconds
  startPolling: (hubId) => {
<<<<<<< HEAD
    const { fetchOnlineUsers, stopPolling } = get()
    stopPolling()
    fetchOnlineUsers(hubId)
    const interval = setInterval(() => fetchOnlineUsers(hubId), 5000)
=======
    const interval = setInterval(() => {
      // Simulate random user activity
      const state = get()
      if (Math.random() > 0.7 && state.onlineUsers.length < 10) {
        const newUser = {
          id: `user_${Date.now()}`,
          name: `Player${Math.floor(Math.random() * 100)}`,
          monster: {
            evolution: ['baby', 'teen', 'adult'][Math.floor(Math.random() * 3)],
            monsterType: Math.floor(Math.random() * 9) + 1,
            position: {
              x: Math.random() * 80 + 10,
              y: Math.random() * 60 + 20,
            }
          }
        }
        state.addOnlineUser(newUser)
      }
    }, 5000)
    
>>>>>>> junhern
    set({ pollingInterval: interval })
  },

  stopPolling: () => {
    const { pollingInterval } = get()
    if (pollingInterval) {
      clearInterval(pollingInterval)
      set({ pollingInterval: null })
    }
  },
}))
