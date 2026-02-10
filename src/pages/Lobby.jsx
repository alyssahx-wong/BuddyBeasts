import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import { useDataStore } from '../stores/dataStore'
import { useChatStore } from '../stores/chatStore'
import PixelMonster from '../components/PixelMonster'

export default function Lobby() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const location = useLocation()
  const quest = location.state?.quest
  
  const { user } = useAuthStore()
  const { monster } = useMonsterStore()
  const { trackQuestStart } = useDataStore()
  const { addQuestParticipants } = useChatStore()
  
  const [participants, setParticipants] = useState([])
  const [isReady, setIsReady] = useState(false)
  const [allReady, setAllReady] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [floatingEmote, setFloatingEmote] = useState(null)

  useEffect(() => {
    if (!quest) {
      navigate('/quests')
      return
    }

    // Track quest start
    trackQuestStart(questId, quest.type)

    // Add current user to participants
    const currentUser = {
      id: user.id,
      name: user.name,
      monster: monster,
      isReady: false,
      isHost: true,
    }
    setParticipants([currentUser])

    // Simulate other participants joining
    const joinInterval = setInterval(() => {
      setParticipants(prev => {
        if (prev.length < quest.maxParticipants && Math.random() > 0.3) {
          const newParticipant = {
            id: `user_${Date.now()}_${Math.random()}`,
            name: `Player${Math.floor(Math.random() * 100)}`,
            monster: {
              evolution: ['baby', 'teen', 'adult'][Math.floor(Math.random() * 3)],
              level: Math.floor(Math.random() * 10) + 1,
              activeSkin: 'default',
            },
            isReady: Math.random() > 0.5,
            isHost: false,
          }
          return [...prev, newParticipant]
        }
        return prev
      })
    }, 3000)

    return () => clearInterval(joinInterval)
  }, [quest, questId, user, monster, trackQuestStart, navigate])

  useEffect(() => {
    // Check if all participants are ready
    const ready = participants.length >= quest.minParticipants && 
                  participants.every(p => p.isReady || p.id === user.id && isReady)
    setAllReady(ready)

    if (ready && !countdown) {
      // Create quest chat conversation when starting
      if (participants.length > 0) {
        addQuestParticipants(
          questId,
          quest.title,
          participants.map((p) => ({
            id: p.id,
            name: p.name,
            avatar: p.id === user.id ? user.picture : null,
          }))
        )
      }

      // Start countdown when all ready
      let count = 5
      setCountdown(count)
      const interval = setInterval(() => {
        count--
        setCountdown(count)
        if (count === 0) {
          clearInterval(interval)
          navigate(`/checkin/${questId}`, { state: { quest, participants } })
        }
      }, 1000)
    }
  }, [participants, isReady, quest, questId, user.id, user.picture, countdown, navigate, addQuestParticipants])

  const handleReady = () => {
    setIsReady(!isReady)
    setParticipants(prev => prev.map(p => 
      p.id === user.id ? { ...p, isReady: !isReady } : p
    ))
  }

  const handleLeave = () => {
    navigate('/quests')
  }

  const handleEmote = (emote) => {
    setFloatingEmote(emote)
    setTimeout(() => setFloatingEmote(null), 2000)
  }

  if (!quest) return null

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
                <span className="text-pixel-green">⏱️ {quest.duration} min</span>
                <span className="text-pixel-yellow">💎 {quest.crystals} crystals</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-pixel-blue font-game">
            📍 {quest.location}
          </p>
        </div>

        {/* Campfire Scene */}
        <div className="pixel-card min-h-[300px] bg-gradient-to-b from-pixel-purple to-pixel-dark bg-opacity-30 p-6 mb-6 relative overflow-hidden">
          {/* Campfire */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-4xl animate-pulse-slow">
            🔥
          </div>

          {/* Participants around campfire */}
          <div className="relative h-full flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="text-center relative"
                  style={{
                    animation: `float ${2 + index * 0.5}s ease-in-out infinite`
                  }}
                >
                  {participant.id === user.id && floatingEmote && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl animate-emote-pop z-10">
                      {floatingEmote}
                    </div>
                  )}
                  <PixelMonster
                    evolution={participant.monster.evolution}
                    size="medium"
                    animated={true}
                    isPlayer={participant.id === user.id}
                    skin={participant.monster?.activeSkin || 'default'}
                    monsterId={participant.monster?.monsterId}
                    usePixelArt={true}
                  />
                  <div className="mt-2 pixel-card p-2 bg-pixel-dark bg-opacity-75 inline-block">
                    <p className="font-game text-xs text-white">
                      {participant.name}
                      {participant.id === user.id && ' (You)'}
                    </p>
                    <p className="text-xs mt-1">
                      {participant.isReady ? (
                        <span className="text-pixel-green">✓ Ready</span>
                      ) : (
                        <span className="text-pixel-yellow">⏳ Waiting</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emote Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {['👋', '😊', '👍', '🎉'].map((emote) => (
            <button
              key={emote}
              onClick={() => handleEmote(emote)}
              className="pixel-button bg-pixel-purple hover:bg-pixel-pink text-white py-4 text-2xl"
            >
              {emote}
            </button>
          ))}
        </div>

        {/* Ready Check */}
        <div className="space-y-4">
          {participants.length < quest.minParticipants && (
            <div className="pixel-card p-4 bg-pixel-yellow bg-opacity-20 text-center">
              <p className="font-game text-pixel-yellow">
                ⏳ Waiting for {quest.minParticipants - participants.length} more player(s)
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
            {isReady ? '✓ Ready!' : '🎯 I\'m Ready'}
          </button>

          {allReady && !countdown && (
            <div className="pixel-card p-4 bg-pixel-green bg-opacity-20 text-center animate-pulse">
              <p className="font-game text-pixel-green">
                ✓ All players ready! Quest starting soon...
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 pixel-card p-4 bg-pixel-purple bg-opacity-20">
          <p className="text-xs text-pixel-light font-game text-center">
            💡 Once everyone is ready, you'll receive the meeting location and QR check-in code
          </p>
        </div>
      </div>
    </div>
  )
}
