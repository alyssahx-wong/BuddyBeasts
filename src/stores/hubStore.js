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
    const { fetchOnlineUsers, stopPolling } = get()
    stopPolling()
    fetchOnlineUsers(hubId)
    const interval = setInterval(() => fetchOnlineUsers(hubId), 5000)
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
