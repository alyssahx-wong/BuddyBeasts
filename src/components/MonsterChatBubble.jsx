import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useMonsterStore } from '../stores/monsterStore'
import { useCompanionStore } from '../stores/companionStore'
import {
  isGeminiAvailable,
  buildSystemPrompt,
  sendMessage,
  generateGreeting,
} from '../services/geminiService'
import PixelMonster from './PixelMonster'

function formatTime(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function MonsterChatBubble() {
  const { monster } = useMonsterStore()
  const {
    messages,
    isOpen,
    isLoading,
    hasGreeted,
    toggleChat,
    closeChat,
    addUserMessage,
    addMonsterMessage,
    setLoading,
    setHasGreeted,
    addMoodEntry,
  } = useCompanionStore()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const lastSendRef = useRef(0)

  // Draggable state
  const [bubblePos, setBubblePos] = useState({ x: null, y: null })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, moved: false })
  const bubbleRef = useRef(null)

  // Don't render if Gemini is not available or no monster data
  if (!isGeminiAvailable() || !monster?.id) return null

  const systemPrompt = buildSystemPrompt(monster)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Proactive greeting when chat opens for the first time this session
  useEffect(() => {
    if (!isOpen || hasGreeted || isLoading) return

    const greet = async () => {
      setLoading(true)
      setHasGreeted(true)
      try {
        const { cleanText, mood } = await generateGreeting(systemPrompt)
        addMonsterMessage(cleanText)
        if (mood) addMoodEntry(mood)
      } catch (err) {
        console.error('Greeting failed:', err)
        addMonsterMessage(
          `${monster.name} waves at you excitedly! How are you doing today?`
        )
      } finally {
        setLoading(false)
      }
    }
    greet()
  }, [isOpen, hasGreeted])

  // --- Drag handlers ---
  const getClientPos = (e) => {
    if (e.touches) return { cx: e.touches[0].clientX, cy: e.touches[0].clientY }
    return { cx: e.clientX, cy: e.clientY }
  }

  const handleDragStart = useCallback((e) => {
    const { cx, cy } = getClientPos(e)
    const rect = bubbleRef.current?.getBoundingClientRect()
    if (!rect) return

    dragRef.current = {
      startX: cx,
      startY: cy,
      origX: rect.left,
      origY: rect.top,
      moved: false,
    }
    setIsDragging(true)
  }, [])

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    const { cx, cy } = getClientPos(e)
    const dx = cx - dragRef.current.startX
    const dy = cy - dragRef.current.startY

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true
    }

    const bubbleSize = 56
    const newX = Math.max(0, Math.min(window.innerWidth - bubbleSize, dragRef.current.origX + dx))
    const newY = Math.max(0, Math.min(window.innerHeight - bubbleSize, dragRef.current.origY + dy))
    setBubblePos({ x: newX, y: newY })
  }, [isDragging])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    // If the user barely moved, treat it as a tap/click
    if (!dragRef.current.moved) {
      toggleChat()
    }
  }, [isDragging, toggleChat])

  // Attach move/end listeners to window so dragging works even outside the bubble
  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => handleDragMove(e)
    const onEnd = () => handleDragEnd()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    // Rate limit: 2s between sends
    const now = Date.now()
    if (now - lastSendRef.current < 2000) return
    lastSendRef.current = now

    // Truncate to 500 chars
    const truncated = text.slice(0, 500)
    setInput('')
    addUserMessage(truncated)
    setLoading(true)

    try {
      const updatedMessages = [
        ...messages,
        { role: 'user', text: truncated },
      ]
      const { cleanText, mood } = await sendMessage(systemPrompt, updatedMessages)
      addMonsterMessage(cleanText)
      if (mood) addMoodEntry(mood)
    } catch (err) {
      console.error('Send failed:', err)
      addMonsterMessage(
        `${monster.name} is thinking too hard... try again in a moment!`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Unread indicator
  const hasUnread = !isOpen && hasGreeted && messages.length > 0 &&
    messages[messages.length - 1].role === 'monster'

  // Default position: bottom-right above nav
  const defaultStyle = { bottom: 80, right: 16 }
  const bubbleStyle = bubblePos.x !== null
    ? { left: bubblePos.x, top: bubblePos.y, position: 'fixed' }
    : { ...defaultStyle, position: 'fixed' }

  // Chat overlay position: anchor near the bubble
  const overlayStyle = {}
  if (bubblePos.x !== null) {
    // Position chat overlay above/below the bubble depending on screen space
    const spaceAbove = bubblePos.y
    const spaceBelow = window.innerHeight - bubblePos.y - 56
    if (spaceAbove > spaceBelow && spaceAbove > 300) {
      // Show above bubble
      overlayStyle.bottom = window.innerHeight - bubblePos.y + 8
      overlayStyle.right = Math.max(12, window.innerWidth - bubblePos.x - 360)
    } else {
      // Show below bubble
      overlayStyle.top = bubblePos.y + 64
      overlayStyle.right = Math.max(12, window.innerWidth - bubblePos.x - 360)
    }
  }

  return (
    <>
      {/* Floating Draggable Bubble */}
      {!isOpen && (
        <div
          ref={bubbleRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className={`z-40 w-14 h-14 rounded-full bg-pixel-purple border-4 border-pixel-pink flex items-center justify-center shadow-lg select-none ${
            isDragging ? 'scale-110 cursor-grabbing' : 'animate-float cursor-grab hover:scale-110'
          } transition-transform`}
          style={{ ...bubbleStyle, zIndex: 40 }}
          aria-label={`Chat with ${monster.name}`}
          role="button"
        >
          <PixelMonster
            evolution={monster.evolution}
            monsterType={monster.monsterType}
            size="small"
            className="pointer-events-none"
            customImageUrl={monster.monsterImageUrl}
          />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pixel-pink rounded-full border-2 border-pixel-dark animate-pulse" />
          )}
        </div>
      )}

      {/* Chat Overlay */}
      {isOpen && (
        <div
          className="fixed z-40 flex flex-col bg-pixel-dark border-4 border-pixel-purple rounded-lg shadow-2xl"
          style={{
            ...(Object.keys(overlayStyle).length > 0
              ? overlayStyle
              : { bottom: 80, right: 12 }),
            width: 'min(360px, calc(100vw - 24px))',
            maxHeight: 'calc(100vh - 120px)',
            height: '420px',
          }}
        >
          {/* Header — draggable to reposition chat window */}
          <div className="flex items-center gap-2 px-3 py-2 bg-pixel-purple rounded-t-sm border-b-2 border-pixel-pink shrink-0">
            <PixelMonster
              evolution={monster.evolution}
              monsterType={monster.monsterType}
              size="small"
              className="pointer-events-none"
            />
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[10px] text-pixel-yellow truncate">
                {monster.name}
              </p>
              <p className="font-game text-xs text-pixel-light opacity-70 capitalize">
                {monster.evolution} companion
              </p>
            </div>
            <button
              onClick={closeChat}
              className="w-8 h-8 flex items-center justify-center text-pixel-light hover:text-pixel-pink transition-colors"
              aria-label="Close chat"
            >
              <span className="font-pixel text-xs">X</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && !isLoading && (
              <p className="text-center text-xs font-game text-pixel-light opacity-40 mt-8">
                Say hello to {monster.name}!
              </p>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'monster' && (
                  <div className="shrink-0 mr-2 mt-1">
                    <PixelMonster
                      evolution={monster.evolution}
                      monsterType={monster.monsterType}
                      size="small"
                      className="pointer-events-none"
                      customImageUrl={monster.monsterImageUrl}
                    />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-pixel-blue text-white'
                      : 'bg-pixel-pink bg-opacity-30 text-pixel-light border border-pixel-pink border-opacity-30'
                  }`}
                >
                  <p className="font-game text-sm leading-relaxed break-words">
                    {msg.text}
                  </p>
                  <p className={`text-[10px] font-game mt-1 ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-pixel-light opacity-40'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="shrink-0 mr-2 mt-1">
                  <PixelMonster
                    evolution={monster.evolution}
                    monsterType={monster.monsterType}
                    size="small"
                    className="pointer-events-none"
                  />
                </div>
                <div className="bg-pixel-pink bg-opacity-30 px-3 py-2 rounded-lg border border-pixel-pink border-opacity-30">
                  <p className="font-game text-sm text-pixel-light animate-pulse">
                    {monster.name} is thinking...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 py-2 border-t-2 border-pixel-purple bg-pixel-dark rounded-b-sm">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Talk to ${monster.name}...`}
                maxLength={500}
                disabled={isLoading}
                className="flex-1 bg-pixel-purple bg-opacity-30 border-2 border-pixel-purple rounded px-3 py-2 text-sm font-game text-pixel-light placeholder-pixel-light placeholder-opacity-30 focus:outline-none focus:border-pixel-pink disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="pixel-button bg-pixel-pink hover:bg-pixel-yellow text-white px-4 py-2 text-sm disabled:opacity-50 disabled:hover:bg-pixel-pink"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
