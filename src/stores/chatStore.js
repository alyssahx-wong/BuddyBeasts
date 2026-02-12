import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'
import { useAuthStore } from './authStore'
import { filterProfanity } from '../utils/profanityFilter'

export const useChatStore = create(
  persist(
    (set, get) => ({
      messagesByLobby: {},
      conversations: [],
      dmConversations: [],
      currentConversationId: null,
      pollingInterval: null,
      backgroundPollingInterval: null,
      lastReadByLobby: {},
      blockedUsers: [],

      // Load read status from backend
      loadReadStatus: async () => {
        try {
          const { data } = await api.get('/api/chat/read/all')
          set({ lastReadByLobby: data })
        } catch (err) {
          console.error('Failed to load read status:', err)
        }
      },

      // Fetch messages from backend for a lobby
      fetchMessages: async (lobbyId) => {
        try {
          const { data } = await api.get(`/api/chat/${lobbyId}`)
          const state = get()
          const blockedUsers = state.blockedUsers || []
          
          // Filter out messages from blocked users and apply profanity filter
          const messages = data
            .filter(msg => !blockedUsers.includes(msg.userId))
            .map((msg) => ({
              id: msg.id,
              conversationId: lobbyId,
              userId: msg.userId,
              userName: msg.userName,
              text: filterProfanity(msg.content),
              timestamp: new Date(msg.timestamp * 1000).toISOString(),
            }))
          
          // Calculate unread count for this conversation (exclude current user's messages)
          const currentState = get()
          const currentUserId = useAuthStore.getState().user?.id
          const lastReadTime = currentState.lastReadByLobby?.[lobbyId] || 0
          const unreadCount = messages.filter(
            (msg) => 
              new Date(msg.timestamp).getTime() / 1000 > lastReadTime &&
              msg.userId !== currentUserId
          ).length
          
          // Get the last message for preview
          const lastMessage = messages.length > 0 ? messages[messages.length - 1].text : ''
          
          // Check if this is the currently selected conversation
          const isCurrentConv = currentState.currentConversationId === lobbyId
          
          set((state) => ({
            messagesByLobby: {
              ...state.messagesByLobby,
              [lobbyId]: messages,
            },
            // Update unread count and last message in conversations
            // If it's the current conversation, keep unreadCount at 0
            conversations: state.conversations.map((c) =>
              c.id === lobbyId ? { ...c, unreadCount: isCurrentConv ? 0 : unreadCount, lastMessage } : c
            ),
            dmConversations: state.dmConversations.map((c) =>
              c.id === lobbyId ? { ...c, unreadCount: isCurrentConv ? 0 : unreadCount, lastMessage } : c
            ),
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
          // Update lastReadByLobby when sending so user's own messages don't count as unread
          set((state) => ({
            messagesByLobby: {
              ...state.messagesByLobby,
              [lobbyId]: [...(state.messagesByLobby[lobbyId] || []), message],
            },
            lastReadByLobby: {
              ...state.lastReadByLobby,
              [lobbyId]: Date.now() / 1000,
            },
            conversations: state.conversations.map((c) =>
              c.id === lobbyId
                ? { ...c, lastMessage: content, lastMessageTime: message.timestamp, unreadCount: 0 }
                : c
            ),
            dmConversations: state.dmConversations.map((c) =>
              c.id === lobbyId
                ? { ...c, lastMessage: content, lastMessageTime: message.timestamp, unreadCount: 0 }
                : c
            ),
          }))
        } catch (err) {
          console.error('Failed to send message:', err)
        }
      },

      // Poll for new messages every 3 seconds (same pattern as hubStore)
      startPolling: (lobbyId) => {
        const { fetchMessages, stopPolling, fetchAllConversationsMessages } = get()
        stopPolling()
        
        // Fetch initial messages for selected conversation
        fetchMessages(lobbyId)
        
        // Also fetch all conversations once initially
        fetchAllConversationsMessages()
        
        const interval = setInterval(() => {
          // Fetch messages for active conversation (higher priority)
          fetchMessages(lobbyId)
          // Also fetch all other conversations to update sidebar
          fetchAllConversationsMessages()
        }, 3000)
        
        set({ pollingInterval: interval })
      },

      stopPolling: () => {
        const { pollingInterval } = get()
        if (pollingInterval) {
          clearInterval(pollingInterval)
          set({ pollingInterval: null })
        }
      },

      // Background polling for all conversations (when not on chat page)
      startBackgroundPolling: () => {
        const { stopBackgroundPolling, fetchAllConversationsMessages } = get()
        stopBackgroundPolling()
        
        // Poll every 10 seconds for all conversations
        const interval = setInterval(() => {
          fetchAllConversationsMessages()
        }, 10000)
        
        set({ backgroundPollingInterval: interval })
      },

      stopBackgroundPolling: () => {
        const { backgroundPollingInterval } = get()
        if (backgroundPollingInterval) {
          clearInterval(backgroundPollingInterval)
          set({ backgroundPollingInterval: null })
        }
      },

      // Fetch messages for all active conversations
      fetchAllConversationsMessages: async () => {
        const state = get()
        const allConversations = [...state.conversations, ...state.dmConversations]
        
        // Fetch messages for each conversation
        for (const conv of allConversations) {
          try {
            await get().fetchMessages(conv.id)
          } catch (err) {
            // Silent fail for individual conversations
          }
        }
      },

      // Get total unread count across all conversations
      getTotalUnreadCount: () => {
        const state = get()
        const convUnread = state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
        const dmUnread = state.dmConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
        return convUnread + dmUnread
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

      // ── Direct Messages ─────────────────────────────────────────

      // Fetch all DM conversations from backend
      fetchDMConversations: async () => {
        try {
          const { data } = await api.get('/api/dm/conversations')
          const state = get()
          const currentUserId = useAuthStore.getState().user?.id
          // Add unread count to each DM conversation
          const dmsWithUnread = data.map((dm) => {
            const messages = state.messagesByLobby[dm.id] || []
            const lastReadTime = state.lastReadByLobby?.[dm.id] || 0
            const unreadCount = messages.filter(
              (msg) => 
                new Date(msg.timestamp).getTime() / 1000 > lastReadTime &&
                msg.userId !== currentUserId
            ).length
            return { ...dm, unreadCount }
          })
          set({ dmConversations: dmsWithUnread })
        } catch (err) {
          console.error('Failed to fetch DM conversations:', err)
        }
      },

      // Start (or retrieve) a DM conversation with another user
      startDMConversation: async (targetUserId, targetUserName) => {
        try {
          const { data } = await api.post('/api/dm/start', {
            targetUserId,
            targetUserName,
          })
          // Add to local DM conversations list if not already present
          set((state) => {
            const exists = state.dmConversations.find((c) => c.id === data.id)
            if (exists) return state
            return {
              dmConversations: [
                {
                  id: data.id,
                  otherUserId: targetUserId,
                  otherUserName: targetUserName,
                  lastMessage: '',
                  lastMessageTime: data.createdAt,
                  createdAt: data.createdAt,
                  unreadCount: 0,
                },
                ...state.dmConversations,
              ],
            }
          })
          return data.id
        } catch (err) {
          console.error('Failed to start DM:', err)
          return null
        }
      },

      // Update unread counts for all conversations based on current messages
      updateAllUnreadCounts: () => {
        set((state) => {
          const currentUserId = useAuthStore.getState().user?.id
          
          const updatedConversations = state.conversations.map((conv) => {
            const messages = state.messagesByLobby[conv.id] || []
            const lastReadTime = state.lastReadByLobby?.[conv.id] || 0
            const unreadCount = messages.filter(
              (msg) => 
                new Date(msg.timestamp).getTime() / 1000 > lastReadTime &&
                msg.userId !== currentUserId
            ).length
            return { ...conv, unreadCount }
          })
          
          const updatedDMs = state.dmConversations.map((dm) => {
            const messages = state.messagesByLobby[dm.id] || []
            const lastReadTime = state.lastReadByLobby?.[dm.id] || 0
            const unreadCount = messages.filter(
              (msg) => 
                new Date(msg.timestamp).getTime() / 1000 > lastReadTime &&
                msg.userId !== currentUserId
            ).length
            return { ...dm, unreadCount }
          })
          
          return {
            conversations: updatedConversations,
            dmConversations: updatedDMs,
          }
        })
      },

      // Mark a conversation as read and sync with backend
      markConversationRead: async (convId) => {
        // Local update (for UI) - set to current timestamp
        const readTime = Date.now() / 1000
        set((state) => ({
          lastReadByLobby: {
            ...(state.lastReadByLobby || {}),
            [convId]: readTime,
          },
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, unreadCount: 0 } : c
          ),
          dmConversations: state.dmConversations.map((c) =>
            c.id === convId ? { ...c, unreadCount: 0 } : c
          ),
        }))
        
        // Sync with backend
        try {
          await api.post(`/api/chat/${convId}/read`)
        } catch (err) {
          console.error('Failed to mark conversation read on backend:', err)
        }
      },

      // Block a user
      blockUser: (userId) => {
        set((state) => {
          if (state.blockedUsers.includes(userId)) return state
          
          // Remove all messages from blocked user across all conversations
          const updatedMessages = {}
          Object.keys(state.messagesByLobby).forEach((lobbyId) => {
            updatedMessages[lobbyId] = state.messagesByLobby[lobbyId].filter(
              (msg) => msg.userId !== userId
            )
          })
          
          return {
            blockedUsers: [...state.blockedUsers, userId],
            messagesByLobby: updatedMessages,
          }
        })
      },

      // Unblock a user
      unblockUser: (userId) => {
        set((state) => ({
          blockedUsers: state.blockedUsers.filter((id) => id !== userId),
        }))
        // Re-fetch messages for current conversation to show unblocked user's messages
        const currentConv = get().currentConversationId
        if (currentConv) {
          get().fetchMessages(currentConv)
        }
      },

      // Check if a user is blocked
      isUserBlocked: (userId) => {
        const { blockedUsers } = get()
        return blockedUsers.includes(userId)
      },

      // Get list of blocked users
      getBlockedUsers: () => get().blockedUsers,

      // Clear local state
      clearChat: () =>
        set({ messagesByLobby: {}, conversations: [], dmConversations: [], currentConversationId: null }),
    }),
    {
      name: 'buddybeasts-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        dmConversations: state.dmConversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)
