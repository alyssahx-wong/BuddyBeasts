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

  sendHeartbeat: async (hubId) => {
    try {
      await api.post(`/api/hubs/${hubId}/heartbeat`)
    } catch {
      // ignore heartbeat failures
    }
  },

  fetchOnlineUsers: async (hubId) => {
    try {
      const { data } = await api.get(`/api/hubs/${hubId}/users`)
      set({ onlineUsers: data })
    } catch (err) {
      console.error('Failed to fetch online users:', err)
    }
  },

  // Poll the backend for online users every 5 seconds, with heartbeat
  startPolling: (hubId) => {
    const { fetchOnlineUsers, sendHeartbeat, stopPolling } = get()
    stopPolling()
    // Send initial heartbeat + fetch
    sendHeartbeat(hubId)
    fetchOnlineUsers(hubId)
    const interval = setInterval(() => {
      sendHeartbeat(hubId)
      fetchOnlineUsers(hubId)
    }, 5000)
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
