import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import { useDataStore } from '../stores/dataStore'

export default function QRCheckIn() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const location = useLocation()
  const quest = location.state?.quest
  const participants = location.state?.participants || []

  const { user } = useAuthStore()
  const { addCrystals, addCoins, completeQuest, monster } = useMonsterStore()
  const { trackQuestComplete } = useDataStore()

  const [checkedIn, setCheckedIn] = useState(false)
  const [questStartTime] = useState(Date.now())

  const [step, setStep] = useState('emote')
  const [emoteChoice, setEmoteChoice] = useState(null)
  const [allEmotesIn, setAllEmotesIn] = useState(false)
  const [reactionConfirmed, setReactionConfirmed] = useState(false)
  const [memoryWord, setMemoryWord] = useState(null)
  const [groupMemory, setGroupMemory] = useState(null)
  const [signals, setSignals] = useState({ emote: false, reaction: false, memory: false })

  useEffect(() => {
    if (!quest) {
      navigate('/quests')
      return
    }
  }, [quest, navigate])

  const performCheckIn = () => {
    if (checkedIn) return
    setCheckedIn(true)
    const isGroup = participants.length > 1
    const crystalBonus = isGroup ? Math.floor(quest.crystals * 1.5) : quest.crystals
    const coinBonus = Math.max(10, Math.floor(crystalBonus / 2))
    addCrystals(crystalBonus)
    addCoins(coinBonus)
    completeQuest(quest.type, isGroup)
    const duration = Math.floor((Date.now() - questStartTime) / 1000 / 60)
    trackQuestComplete(questId, participants.length, duration)
  }

  const handleCancel = () => {
    navigate('/quests')
  }

  const EMOTES = ['🎉 Fun', '😊 Chill', '💪 Productive', '🌿 Calm', '⚡ Energizing']
  const WORDS = ['Fun', 'Calm', 'Focused', 'Energizing', 'Meaningful']

  const groupReaction = useMemo(() => {
    if (!emoteChoice) return 'happy bounce'
    if (emoteChoice.includes('Calm')) return 'calm sit'
    if (emoteChoice.includes('Productive')) return 'group pose'
    if (emoteChoice.includes('Energizing')) return 'excited spin'
    return 'happy bounce'
  }, [emoteChoice])

  const markSignal = (key) => {
    setSignals((prev) => ({ ...prev, [key]: true }))
  }

  const signalCount = Object.values(signals).filter(Boolean).length

  const finishIfQualified = () => {
    if (signalCount >= 2 && !checkedIn) {
      performCheckIn()
    }
    setStep('snapshot')
  }

  const handleEmoteSelect = (emote) => {
    setEmoteChoice(emote)
    markSignal('emote')
    setStep('reaction')
    setAllEmotesIn(false)
    setTimeout(() => setAllEmotesIn(true), 1200)
  }

  const handleReactionConfirm = () => {
    setReactionConfirmed(true)
    markSignal('reaction')
    setStep('memory')
  }

  const handleMemorySelect = (word) => {
    setMemoryWord(word)
    markSignal('memory')
    const otherWord = WORDS.filter((w) => w !== word)[Math.floor(Math.random() * (WORDS.length - 1))]
    setGroupMemory(`${word} + ${otherWord}`)
    finishIfQualified()
  }

  const handleSaveSnapshot = () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#2A2A3E" />
  <rect y="220" width="640" height="140" fill="#4A7A55" />
  <text x="24" y="40" font-size="20" fill="#F7E76B" font-family="monospace">${quest?.title || 'Shared Moment'}</text>
  <text x="24" y="68" font-size="14" fill="#B9C2FF" font-family="monospace">Group felt: ${groupMemory || 'Together'}</text>
  <text x="24" y="320" font-size="12" fill="#FFFFFF" font-family="monospace">${new Date().toLocaleString()}</text>
  <text x="180" y="210" font-size="40">${participants.slice(0, 5).map(() => '🐥').join(' ')}</text>
</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `shared-moment-${questId}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!quest) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
              Shared Moment Proof
            </h1>
            <button
              onClick={handleCancel}
              className="text-pixel-pink hover:text-pixel-light text-sm font-game"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {!checkedIn ? (
          <>
            {/* Quest Info */}
            <div className="pixel-card p-5 mb-6 bg-pixel-blue bg-opacity-20">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{quest.icon}</span>
                <div>
                  <h2 className="font-pixel text-base text-pixel-light">
                    {quest.title}
                  </h2>
                  <p className="text-xs text-pixel-blue font-game mt-1">
                    {quest.location}
                  </p>
                </div>
              </div>
              <p className="text-xs text-pixel-light font-game mb-2">
                Celebrate the moment together. No check-ins, just shared vibes.
              </p>
              <p className="text-xs text-pixel-yellow font-game">
                ✓ Optional, low-pressure, and collective
              </p>
            </div>

            {step === 'emote' && (
              <div className="pixel-card p-6 mb-6">
                <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                  1️⃣ Group Emote Sync
                </h3>
                <p className="text-xs text-pixel-light font-game mb-4">
                  Everyone picks the same vibe. Tap one.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EMOTES.map((emote) => (
                    <button
                      key={emote}
                      onClick={() => handleEmoteSelect(emote)}
                      className="pixel-card p-4 text-center hover:border-pixel-yellow"
                    >
                      <span className="text-lg font-game text-pixel-light">{emote}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'reaction' && (
              <div className="pixel-card p-6 mb-6 text-center">
                <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                  2️⃣ Monster Group Reaction
                </h3>
                <p className="text-xs text-pixel-light font-game mb-4">
                  Monsters gather and react together.
                </p>
                <div className="text-4xl mb-3 animate-float">🐥 🐥 🐥</div>
                <p className="text-xs text-pixel-blue font-game mb-4">
                  Reaction: {groupReaction}
                </p>
                <button
                  onClick={handleReactionConfirm}
                  disabled={!allEmotesIn}
                  className="pixel-button bg-pixel-green text-white w-full py-4 disabled:opacity-60"
                >
                  {allEmotesIn ? 'That feels right 👍' : 'Waiting for others...'}
                </button>
              </div>
            )}

            {step === 'memory' && (
              <div className="pixel-card p-6 mb-6">
                <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                  3️⃣ One-Word Group Memory
                </h3>
                <p className="text-xs text-pixel-light font-game mb-4">
                  In one word, how did this feel?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {WORDS.map((word) => (
                    <button
                      key={word}
                      onClick={() => handleMemorySelect(word)}
                      className="pixel-card p-4 text-center hover:border-pixel-yellow"
                    >
                      <span className="text-sm font-game text-pixel-light">{word}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'snapshot' && (
              <div className="pixel-card p-6 mb-6 text-center">
                <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                  4️⃣ Optional Pixel Snapshot
                </h3>
                <p className="text-xs text-pixel-light font-game mb-4">
                  A playful memory token. Save it or discard it.
                </p>
                <div className="pixel-card p-4 mb-4 bg-pixel-dark">
                  <div className="text-3xl mb-2">🐥 🐥 🐥</div>
                  <p className="text-xs text-pixel-blue font-game">This group felt: {groupMemory}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSaveSnapshot}
                    className="pixel-button bg-pixel-blue text-white w-full py-3"
                  >
                    Save Snapshot
                  </button>
                  <button
                    onClick={() => setStep('complete')}
                    className="pixel-button bg-pixel-green text-white w-full py-3"
                  >
                    Finish
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Success Screen */
          <div className="text-center">
            <div className="pixel-card p-8 mb-6 bg-pixel-green bg-opacity-20">
              <div className="text-6xl mb-4 animate-float">🎉</div>
              <h2 className="font-pixel text-xl text-pixel-yellow mb-4">
                Nice! You completed this together.
              </h2>
              <p className="font-game text-lg text-pixel-light mb-6">
                You earned <span className="text-pixel-yellow">{Math.floor(quest.crystals * 1.5)}</span> crystals!
              </p>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-3xl mb-2">💎</p>
                  <p className="text-xs font-game text-pixel-light">
                    +{Math.floor(quest.crystals * 1.5)}
                  </p>
                </div>
                <div>
                  <p className="text-3xl mb-2">⭐</p>
                  <p className="text-xs font-game text-pixel-light">
                    +10 XP
                  </p>
                </div>
                <div>
                  <p className="text-3xl mb-2">🤝</p>
                  <p className="text-xs font-game text-pixel-light">
                    +{participants.length - 1} connection{participants.length > 2 ? 's' : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/hub')}
                className="pixel-button bg-pixel-blue text-white w-full py-4"
              >
                Return to Hub
              </button>
            </div>

            {/* Monster Evolution Check */}
            {monster.crystals + Math.floor(quest.crystals * 1.5) >= (monster.level * 100) && (
              <div className="pixel-card p-6 bg-pixel-pink bg-opacity-20 animate-pulse">
                <p className="text-4xl mb-2">🌟</p>
                <p className="font-pixel text-sm text-pixel-yellow">
                  Your monster is ready to evolve!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
