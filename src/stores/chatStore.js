import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatStore = create(
  persist(
    (set) => ({
      messages: [],
      conversations: [],
      currentConversationId: null,
      onlineUsers: [],
      questParticipants: [], // Track who participated in recent quests
      
      // Send a message
      sendMessage: (message) =>
        set((state) => {
          const conversationId =
            state.currentConversationId || `conv_${Date.now()}`
          const newMessage = {
            id: `msg_${Date.now()}`,
            conversationId,
            userId: message.userId,
            userName: message.userName,
            userAvatar: message.userAvatar,
            text: message.text,
            timestamp: new Date().toISOString(),
            read: false,
          }

          // Add message to messages
          const updatedMessages = [...state.messages, newMessage]

          // Update or create conversation
          const conversationIndex = state.conversations.findIndex(
            (c) => c.id === conversationId
          )
          let updatedConversations = state.conversations

          if (conversationIndex >= 0) {
            updatedConversations = state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessage: newMessage.text,
                    lastMessageTime: newMessage.timestamp,
                    unreadCount: 0,
                  }
                : c
            )
          } else {
            updatedConversations = [
              ...state.conversations,
              {
                id: conversationId,
                name: message.conversationName || 'Hub Chat',
                members: [message.userId],
                lastMessage: newMessage.text,
                lastMessageTime: newMessage.timestamp,
                unreadCount: 0,
                createdAt: new Date().toISOString(),
              },
            ]
          }

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
            currentConversationId: conversationId,
          }
        }),
      
      // Get messages for a conversation
      getConversationMessages: (conversationId) =>
        set((state) => ({
          currentConversationId: conversationId,
        })),
      
      // Set online users in current hub
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      
      // Add quest participants for chat
      addQuestParticipants: (questId, questName, participants) =>
        set((state) => {
          const existingConv = state.conversations.find(
            (c) => c.questId === questId
          )

          if (existingConv) {
            return state
          }

          // Create a new conversation for this quest
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
            questParticipants: [
              ...state.questParticipants,
              { questId, questName, participants, timestamp: Date.now() },
            ],
          }
        }),
      
      // Switch to a conversation
      setCurrentConversation: (conversationId) =>
        set({ currentConversationId: conversationId }),
      
      // Mark conversation as read
      markAsRead: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        })),
      
      // Create a new group conversation
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
      
      // Delete a message
      deleteMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        })),
      
      // Clear all messages
      clearChat: () => set({ messages: [], conversations: [], currentConversationId: null }),
    }),
    {
      name: 'karmaloop-chat',
    }
  )
)
