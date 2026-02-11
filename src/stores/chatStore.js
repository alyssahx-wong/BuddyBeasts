import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

export const useChatStore = create(
  persist(
    (set, get) => ({
      messagesByLobby: {},
      conversations: [],
      currentConversationId: null,
      pollingInterval: null,

      // Fetch messages from backend for a lobby
      fetchMessages: async (lobbyId) => {
        try {
          const { data } = await api.get(`/api/chat/${lobbyId}`)
          const messages = data.map((msg) => ({
            id: msg.id,
            conversationId: lobbyId,
            userId: msg.userId,
            userName: msg.userName,
            text: msg.content,
            timestamp: new Date(msg.timestamp * 1000).toISOString(),
          }))
          set((state) => ({
            messagesByLobby: {
              ...state.messagesByLobby,
              [lobbyId]: messages,
            },
          }))
        } catch (err) {
          console.error('Failed to fetch messages:', err)
        }
      },

      // Send a message via backend
      sendMessage: async (lobbyId, content) => {
        try {
          const { data } = await api.post(`/api/chat/${lobbyId}`, { content })
          const message = {
            id: data.id,
            conversationId: lobbyId,
            userId: data.userId,
            userName: data.userName,
            text: data.content,
            timestamp: new Date(data.timestamp * 1000).toISOString(),
          }
          set((state) => ({
            messagesByLobby: {
              ...state.messagesByLobby,
              [lobbyId]: [...(state.messagesByLobby[lobbyId] || []), message],
            },
            conversations: state.conversations.map((c) =>
              c.id === lobbyId
                ? { ...c, lastMessage: content, lastMessageTime: message.timestamp }
                : c
            ),
          }))
        } catch (err) {
          console.error('Failed to send message:', err)
        }
      },

      // Poll for new messages every 3 seconds (same pattern as hubStore)
      startPolling: (lobbyId) => {
        const { fetchMessages, stopPolling } = get()
        stopPolling()
        fetchMessages(lobbyId)
        const interval = setInterval(() => fetchMessages(lobbyId), 3000)
        set({ pollingInterval: interval })
      },

      stopPolling: () => {
        const { pollingInterval } = get()
        if (pollingInterval) {
          clearInterval(pollingInterval)
          set({ pollingInterval: null })
        }
      },

      // Ensure a hub conversation entry exists in the sidebar list
      ensureHubConversation: (hubId, hubName) =>
        set((state) => {
          const convId = `hub_${hubId}`
          if (state.conversations.find((c) => c.id === convId)) return state
          return {
            conversations: [
              {
                id: convId,
                name: `${hubName} Hub`,
                members: [],
                lastMessage: '',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
                createdAt: new Date().toISOString(),
                isQuest: false,
              },
              ...state.conversations,
            ],
          }
        }),

      // Add quest participants to create a quest team conversation
      addQuestParticipants: (questId, questName, participants) =>
        set((state) => {
          const existingConv = state.conversations.find(
            (c) => c.questId === questId
          )
          if (existingConv) return state

          const newConversation = {
            id: `quest_${questId}`,
            questId,
            name: `${questName} Team`,
            members: participants.map((p) => p.id),
            memberDetails: participants,
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            isQuest: true,
          }

          return {
            conversations: [newConversation, ...state.conversations],
          }
        }),

      // Switch active conversation
      setCurrentConversation: (conversationId) =>
        set({ currentConversationId: conversationId }),

      // Mark conversation as read
      markAsRead: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        })),

      // Create a group conversation
      createGroupConversation: (name, memberIds) =>
        set((state) => ({
          conversations: [
            ...state.conversations,
            {
              id: `conv_${Date.now()}`,
              name,
              members: memberIds,
              lastMessage: '',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
              createdAt: new Date().toISOString(),
              isGroup: true,
            },
          ],
        })),

      // Clear local state
      clearChat: () =>
        set({ messagesByLobby: {}, conversations: [], currentConversationId: null }),
    }),
    {
      name: 'buddybeasts-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)
