import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import PixelMonster from '../components/PixelMonster'
import api from '../api'
import coffeeBg from '../icons/coffee.png'
import studyBg from '../icons/study.png'
import outdoorBg from '../icons/outdoor.png'

const CATEGORY_BG = {
  coffee: coffeeBg,
  study: studyBg,
  walk: outdoorBg,
  help: coffeeBg,
}

export default function Lobby() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const { user } = useAuthStore()

  const [lobby, setLobby] = useState(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(null)
  const [floatingEmotes, setFloatingEmotes] = useState([])

  const fetchLobby = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/lobbies/${questId}`)
      console.log('Lobby state:', data)
      console.log('All ready?', data.allReady)
      console.log('Participants:', data.participants.map(p => ({ name: p.name, isReady: p.isReady })))
      setLobby(data)
      return data
    } catch (err) {
      console.error('Failed to fetch lobby:', err)
      if (err.response?.status === 404) {
        navigate('/quests')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [questId, navigate])

  useEffect(() => {
    // Join the lobby on mount
    api.post(`/api/lobbies/${questId}/join`)
      .then(() => fetchLobby())
      .catch(() => fetchLobby())

    // Poll lobby state every 2 seconds
    const interval = setInterval(fetchLobby, 2000)
    return () => clearInterval(interval)
  }, [questId, fetchLobby])

  // Separate effect for countdown
  useEffect(() => {
    console.log('Lobby state:', { allReady: lobby?.allReady, countdown })
    if (lobby?.allReady && countdown === null) {
      console.log('🎯 Starting countdown!')
      setCountdown(5)
    }
  }, [lobby?.allReady, countdown])

  // Countdown timer
  useEffect(() => {
    console.log('⏱️ Countdown effect:', countdown)
    if (countdown !== null && countdown > 0) {
      console.log(`Countdown: ${countdown} - setting timeout`)
      const timer = setTimeout(() => {
        console.log(`⬇️ Decrementing from ${countdown} to ${countdown - 1}`)
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      console.log('🚀 Navigating to checkin!')
      navigate(`/checkin/${questId}`)
    }
  }, [countdown, questId, navigate])

  const handleReady = async () => {
    try {
      const { data } = await api.put(`/api/lobbies/${questId}/ready`)
      setLobby(data)
    } catch (err) {
      console.error('Failed to toggle ready:', err)
    }
  }

  const handleLeave = async () => {
    try {
      await api.delete(`/api/lobbies/${questId}/leave`)
    } catch {
      // ignore
    }
    navigate('/quests')
  }

  const handleEmote = async (emote) => {
    const id = Date.now() + Math.random()
    const left = Math.random() * 60 + 20
    setFloatingEmotes(prev => [...prev, { id, emote, left }])
    setTimeout(() => {
      setFloatingEmotes(prev => prev.filter(e => e.id !== id))
    }, 1500)
    try {
      await api.post(`/api/lobbies/${questId}/emote`, { emote })
    } catch {
      // ephemeral, ignore errors
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark flex items-center justify-center">
        <p className="font-game text-pixel-light animate-pulse">Loading lobby...</p>
      </div>
    )
  }

  if (!lobby) return null

  const quest = lobby.quest
  const participants = lobby.participants
  const myParticipant = participants.find(p => p.id === user.id)
  const isReady = myParticipant?.isReady || false

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-pixel text-sm md:text-base text-pixel-yellow flex items-center gap-2">
                <span>{quest.icon}</span>
                {quest.title} Lobby
              </h1>
              <p className="text-xs text-pixel-light font-game mt-1">
                {participants.length}/{quest.maxParticipants} participants
              </p>
            </div>
            <button
              onClick={handleLeave}
              className="text-pixel-pink hover:text-pixel-light text-sm font-game"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Countdown Banner */}
        {countdown !== null && (
          <div className="pixel-card p-6 mb-6 bg-pixel-green bg-opacity-90 text-center animate-pulse">
            <p className="font-pixel text-2xl text-white mb-2">{countdown}</p>
            <p className="font-game text-white">Starting quest...</p>
          </div>
        )}

        {/* Quest Info */}
        <div className="pixel-card p-5 mb-6 bg-pixel-blue bg-opacity-20">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm font-game text-pixel-light mb-2">
                {quest.description}
              </p>
              <div className="flex gap-3 text-xs font-game">
                <span className="text-pixel-green">{quest.duration} min</span>
                <span className="text-pixel-yellow">{quest.crystals} crystals</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-pixel-blue font-game">
            {quest.location}
          </p>
        </div>

        {/* Campfire Scene */}
        <div
          className="pixel-card min-h-[300px] p-6 mb-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(to bottom, rgba(26,26,46,0.6), rgba(26,26,46,0.85)), url(${CATEGORY_BG[quest.category] || coffeeBg}) center/cover no-repeat`,
            imageRendering: 'pixelated',
          }}
        >

          {/* Participants around campfire */}
          <div className="relative h-full flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="text-center"
                  style={{
                    animation: `float ${2 + index * 0.5}s ease-in-out infinite`
                  }}
                >
                  <div className="mb-2 pixel-card p-2 bg-pixel-dark bg-opacity-75 inline-block">
                    <p className="font-game text-xs text-white">
                      {participant.name}
                      {participant.id === user.id && ' (You)'}
                    </p>
                    <p className="text-xs mt-1">
                      {participant.isReady ? (
                        <span className="text-pixel-green">Ready</span>
                      ) : (
                        <span className="text-pixel-yellow">Waiting</span>
                      )}
                    </p>
                  </div>
                  <PixelMonster
                    evolution={participant.monster?.evolution || 'baby'}
                    monsterType={participant.monster?.monsterType}
                    customImageUrl={participant.monster?.customCharacterUrl}
                    size="medium"
                    animated={true}
                    isPlayer={participant.id === user.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emote Actions */}
        <div className="relative">
          {/* Floating emotes */}
          {floatingEmotes.map(({ id, emote, left }) => (
            <span
              key={id}
              className="absolute text-3xl pointer-events-none"
              style={{
                left: `${left}%`,
                bottom: '100%',
                animation: 'emote-float 1.5s ease-out forwards',
              }}
            >
              {emote}
            </span>
          ))}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {['👋', '😊', '👍', '🎉'].map((emote) => (
              <button
                key={emote}
                onClick={() => handleEmote(emote)}
                className="pixel-button bg-pixel-purple hover:bg-pixel-pink text-white py-4 text-2xl active:scale-90 transition-transform"
              >
                {emote}
              </button>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes emote-float {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            50% { opacity: 0.8; transform: translateY(-60px) scale(1.2); }
            100% { opacity: 0; transform: translateY(-120px) scale(0.8); }
          }
        `}</style>

        {/* Ready Check */}
        <div className="space-y-4">
          {participants.length < quest.minParticipants && (
            <div className="pixel-card p-4 bg-pixel-yellow bg-opacity-20 text-center">
              <p className="font-game text-pixel-yellow">
                Waiting for {quest.minParticipants - participants.length} more player(s)
              </p>
            </div>
          )}

          <button
            onClick={handleReady}
            className={`
              pixel-button w-full py-6 text-base
              ${isReady
                ? 'bg-pixel-green text-white'
                : 'bg-pixel-blue hover:bg-pixel-green text-white'
              }
            `}
          >
            {isReady ? 'Ready!' : 'I\'m Ready'}
          </button>

          {lobby.allReady && !countdown && (
            <div className="pixel-card p-4 bg-pixel-green bg-opacity-20 text-center animate-pulse">
              <p className="font-game text-pixel-green">
                All players ready! Quest starting soon...
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 pixel-card p-4 bg-pixel-purple bg-opacity-20">
          <p className="text-xs text-pixel-light font-game text-center">
            Once everyone is ready, you'll receive the meeting location and QR check-in code
          </p>
        </div>
      </div>
    </div>
  )
}
