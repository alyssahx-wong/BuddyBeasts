import { create } from 'zustand'

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
  
  // Simulated polling for demo (replace with WebSocket or real API later)
  startPolling: (hubId) => {
    const interval = setInterval(() => {
      // Simulate random user activity
      const state = get()
      if (Math.random() > 0.7 && state.onlineUsers.length < 10) {
        const newUser = {
          id: `user_${Date.now()}`,
          name: `Player${Math.floor(Math.random() * 100)}`,
          monster: {
            evolution: ['baby', 'teen', 'adult'][Math.floor(Math.random() * 3)],
            position: {
              x: Math.random() * 80 + 10,
              y: Math.random() * 60 + 20,
            }
          }
        }
        state.addOnlineUser(newUser)
      }
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
