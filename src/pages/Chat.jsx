import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { useHubStore } from '../stores/hubStore'
import NavigationBar from '../components/NavigationBar'
import api from '../api'

export default function Chat() {
  const navigate = useNavigate()
  const { user, currentHub } = useAuthStore()
  const {
    messagesByLobby,
    conversations,
    dmConversations,
    sendMessage,
    setCurrentConversation,
    ensureHubConversation,
    fetchDMConversations,
    startDMConversation,
    startPolling,
    stopPolling,
  } = useChatStore()
  const { onlineUsers: hubOnlineUsers } = useHubStore()

  const [messageText, setMessageText] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showConversationList, setShowConversationList] = useState(true)
  const [showNewDMModal, setShowNewDMModal] = useState(false)
  const [connections, setConnections] = useState([])
  const [dmSearchQuery, setDmSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  // Ensure hub conversation exists on mount & load DM conversations
  useEffect(() => {
    if (currentHub) {
      ensureHubConversation(currentHub.id, currentHub.name)
    }
    fetchDMConversations()
  }, [currentHub, ensureHubConversation, fetchDMConversations])

  // Initialize - select first available conversation or hub chat
  useEffect(() => {
    if (!selectedConversation && currentHub) {
      const hubChatId = `hub_${currentHub.id}`
      const questConvs = conversations.filter((c) => c.isQuest)

      if (questConvs.length > 0) {
        setSelectedConversation(questConvs[0].id)
      } else {
        setSelectedConversation(hubChatId)
      }
    }
  }, [selectedConversation, currentHub, conversations])

  // Start/stop polling when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      startPolling(selectedConversation)
    }
    return () => stopPolling()
  }, [selectedConversation, startPolling, stopPolling])

  // Derive messages for current conversation
  const conversationMessages = messagesByLobby[selectedConversation] || []

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages])

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return
    sendMessage(selectedConversation, messageText.trim())
    setMessageText('')
  }

  const handleSelectConversation = (convId) => {
    setSelectedConversation(convId)
    setCurrentConversation(convId)
    setShowConversationList(false)
  }

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  )

  const currentDM = dmConversations.find(
    (c) => c.id === selectedConversation
  )

  // Derive display name for the active conversation
  const activeConversationName = currentConversation?.name
    || (currentDM ? currentDM.otherUserName : 'Select a conversation')

  const questConversations = conversations.filter((c) => c.isQuest)
  const hubChatId = `hub_${currentHub?.id}`

  // Load connections when opening the New DM modal
  const handleOpenNewDM = async () => {
    try {
      const { data } = await api.get('/api/connections')
      setConnections(data)
    } catch (err) {
      console.error('Failed to load connections:', err)
    }
    setDmSearchQuery('')
    setShowNewDMModal(true)
  }

  const handleStartDM = async (targetUserId, targetUserName) => {
    const lobbyId = await startDMConversation(targetUserId, targetUserName)
    if (lobbyId) {
      setShowNewDMModal(false)
      handleSelectConversation(lobbyId)
    }
  }

  const filteredConnections = connections.filter((c) =>
    c.connectedUserName.toLowerCase().includes(dmSearchQuery.toLowerCase())
  )

  return (
    <div className="h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-pixel text-lg md:text-2xl text-pixel-yellow">
              Messages
            </h1>
            <p className="text-xs text-pixel-light font-game mt-1">
              {activeConversationName}
            </p>
          </div>
          {!showConversationList && (
            <button
              onClick={() => setShowConversationList(true)}
              className="pixel-button bg-pixel-purple hover:bg-pixel-blue text-white text-xs px-3 py-2"
            >
              Chats
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto flex flex-col md:flex-row gap-4 px-4 py-4 pb-20">
        {/* Conversation List */}
        <div
          className={`${
            showConversationList ? 'block' : 'hidden'
          } md:block md:w-1/3 space-y-2 overflow-y-auto min-h-0 max-h-full chat-scroll`}
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
              {hubOnlineUsers.length + 1} online
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

          {/* Direct Messages */}
          <div className="px-2 py-1 flex items-center justify-between">
            <p className="text-xs font-pixel text-pixel-yellow">
              Direct Messages
            </p>
            <button
              onClick={handleOpenNewDM}
              className="text-pixel-green hover:text-pixel-yellow text-lg leading-none"
              title="New Direct Message"
            >
              +
            </button>
          </div>

          {dmConversations.length > 0 ? (
            dmConversations.map((dm) => (
              <div
                key={dm.id}
                onClick={() => handleSelectConversation(dm.id)}
                className={`pixel-card p-4 cursor-pointer transition-all ${
                  selectedConversation === dm.id
                    ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-10'
                    : 'hover:border-pixel-blue'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💬</span>
                  <h3 className="font-pixel text-xs text-pixel-light">
                    {dm.otherUserName}
                  </h3>
                </div>
                {dm.lastMessage && (
                  <p className="text-xs text-pixel-light opacity-75 mt-1 truncate">
                    {dm.lastMessage}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="pixel-card p-4 bg-pixel-dark border-2 border-pixel-purple opacity-50">
              <p className="text-xs text-pixel-light font-game text-center">
                Tap + to message a connection!
              </p>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div
          className={`${
            showConversationList ? 'hidden md:flex' : 'flex'
          } flex-1 flex-col min-h-0`}
        >
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-4 space-y-3 pixel-card p-4 bg-pixel-dark bg-opacity-50 chat-scroll">
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
                            ? 'bg-pixel-green'
                            : 'bg-pixel-blue'
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
                    Send
                  </button>
                </div>
                <p className="text-xs text-pixel-blue font-game mt-2 opacity-75">
                  Chat with hub members, quest teammates, or friends!
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

      {/* New DM Modal */}
      {showNewDMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="pixel-card bg-pixel-dark border-4 border-pixel-purple w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-pixel-purple">
              <h2 className="font-pixel text-sm text-pixel-yellow">New Message</h2>
              <button
                onClick={() => setShowNewDMModal(false)}
                className="text-pixel-light hover:text-pixel-yellow text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <input
                type="text"
                value={dmSearchQuery}
                onChange={(e) => setDmSearchQuery(e.target.value)}
                placeholder="Search connections..."
                className="w-full p-3 bg-pixel-dark border-2 border-pixel-purple text-pixel-light font-game text-sm placeholder-pixel-blue placeholder-opacity-50 focus:outline-none focus:border-pixel-yellow rounded"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((conn) => (
                  <div
                    key={conn.id}
                    onClick={() => handleStartDM(conn.connectedUserId, conn.connectedUserName)}
                    className="pixel-card p-3 cursor-pointer hover:border-pixel-green transition-all flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-pixel-purple flex items-center justify-center text-sm">
                      {conn.connectedUserName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-game text-sm text-pixel-light">
                      {conn.connectedUserName}
                    </span>
                  </div>
                ))
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🤝</div>
                  <p className="text-xs text-pixel-light font-game">
                    Complete quests to make connections first!
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-pixel-light font-game">
                    No matching connections found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  )
}
