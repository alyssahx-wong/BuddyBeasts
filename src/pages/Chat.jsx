import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { useHubStore } from '../stores/hubStore'
import { useDataStore } from '../stores/dataStore'
import NavigationBar from '../components/NavigationBar'

export default function Chat() {
  const navigate = useNavigate()
  const { user, currentHub } = useAuthStore()
  const {
    messages,
    conversations,
    currentConversationId,
    sendMessage,
    setCurrentConversation,
  } = useChatStore()
  const { onlineUsers: hubOnlineUsers } = useHubStore()
  const { questHistory } = useDataStore()

  const [messageText, setMessageText] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showConversationList, setShowConversationList] = useState(true)
  const messagesEndRef = useRef(null)

  // Initialize - select first available conversation or hub chat
  useEffect(() => {
    if (!selectedConversation && currentHub) {
      const hubChatId = `hub_${currentHub.id}`
      const questConvs = conversations.filter((c) => c.isQuest)
      
      // Select first quest conversation if available, else hub chat
      if (questConvs.length > 0) {
        setSelectedConversation(questConvs[0].id)
      } else {
        setSelectedConversation(hubChatId)
      }
    }
  }, [selectedConversation, currentHub, conversations])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return

    const conversation = conversations.find((c) => c.id === selectedConversation)
    const conversationName = conversation?.name || currentHub?.name || 'Chat'

    sendMessage({
      userId: user.id,
      userName: user.name,
      userAvatar: user.picture,
      text: messageText,
      conversationName,
    })

    setMessageText('')
  }

  const handleSelectConversation = (convId) => {
    setSelectedConversation(convId)
    setCurrentConversation(convId)
    setShowConversationList(false)
  }

  const conversationMessages = messages.filter(
    (m) => m.conversationId === selectedConversation
  )

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  )

  // Quest conversations from recent quests
  const questConversations = conversations.filter((c) => c.isQuest)
  const hubChatId = `hub_${currentHub?.id}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-pixel text-lg md:text-2xl text-pixel-yellow">
              💬 Messages
            </h1>
            <p className="text-xs text-pixel-light font-game mt-1">
              {currentConversation?.name || 'Select a conversation'}
            </p>
          </div>
          {!showConversationList && (
            <button
              onClick={() => setShowConversationList(true)}
              className="pixel-button bg-pixel-purple hover:bg-pixel-blue text-white text-xs px-3 py-2"
            >
              📋 Chats
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col md:flex-row gap-4 px-4 py-4">
        {/* Conversation List - Mobile: Toggle, Desktop: Always Show */}
        <div
          className={`${
            showConversationList ? 'block' : 'hidden'
          } md:block md:w-1/3 space-y-2`}
        >
          {/* Hub Chat */}
          <div
            onClick={() => handleSelectConversation(hubChatId)}
            className={`pixel-card p-4 cursor-pointer transition-all ${
              selectedConversation === hubChatId
                ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-10'
                : 'hover:border-pixel-blue'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏠</span>
              <h3 className="font-pixel text-xs text-pixel-light">
                {currentHub?.name} Hub
              </h3>
            </div>
            <p className="text-xs text-pixel-blue font-game">
              👥 {hubOnlineUsers.length + 1} online
            </p>
          </div>

          {/* Quest Conversations */}
          {questConversations.length > 0 && (
            <>
              <div className="px-2 py-1">
                <p className="text-xs font-pixel text-pixel-yellow">
                  Quest Teams
                </p>
              </div>
              {questConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`pixel-card p-4 cursor-pointer transition-all ${
                    selectedConversation === conv.id
                      ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-10'
                      : 'hover:border-pixel-blue'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📋</span>
                    <h3 className="font-pixel text-xs text-pixel-light">
                      {conv.name}
                    </h3>
                  </div>
                  <p className="text-xs text-pixel-blue font-game">
                    {conv.members.length} members
                  </p>
                  {conv.lastMessage && (
                    <p className="text-xs text-pixel-light opacity-75 mt-2 truncate">
                      {conv.lastMessage}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}

          {questConversations.length === 0 && (
            <div className="pixel-card p-4 bg-pixel-dark border-2 border-pixel-purple opacity-50">
              <p className="text-xs text-pixel-light font-game text-center">
                Complete quests to chat with your team!
              </p>
            </div>
          )}
        </div>

        {/* Messages Area - Mobile: Show when conversation selected */}
        <div
          className={`${
            showConversationList ? 'hidden md:flex' : 'flex'
          } flex-1 flex-col`}
        >
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pixel-card p-4 bg-pixel-dark bg-opacity-50">
                {conversationMessages.length > 0 ? (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.userId === user.id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs ${
                          message.userId === user.id
                            ? 'order-2 bg-pixel-green'
                            : 'order-1 bg-pixel-blue'
                        } pixel-card p-3 rounded`}
                      >
                        {message.userId !== user.id && (
                          <p className="text-xs font-pixel text-pixel-yellow mb-1">
                            {message.userName}
                          </p>
                        )}
                        <p className="text-sm font-game text-white break-words">
                          {message.text}
                        </p>
                        <p className="text-xs text-pixel-light opacity-75 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {message.userId !== user.id && message.userAvatar && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pixel-pink order-1">
                          <img
                            src={message.userAvatar}
                            alt={message.userName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-xs text-pixel-light font-game">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="pixel-card p-4 bg-pixel-dark border-2 border-pixel-purple">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message... (Enter to send)"
                    className="flex-1 p-3 bg-pixel-dark border-2 border-pixel-purple text-pixel-light font-game text-sm placeholder-pixel-blue placeholder-opacity-50 focus:outline-none focus:border-pixel-yellow rounded"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="pixel-button bg-pixel-green hover:bg-pixel-blue text-white disabled:opacity-50 disabled:cursor-not-allowed px-4"
                  >
                    📤
                  </button>
                </div>
                <p className="text-xs text-pixel-blue font-game mt-2 opacity-75">
                  💡 Chat with quest teammates and hub members!
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center pixel-card p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="font-game text-pixel-light">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}
