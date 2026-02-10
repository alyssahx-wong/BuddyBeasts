import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
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
  const { addCrystals, completeQuest, monster } = useMonsterStore()
  const { trackQuestComplete } = useDataStore()
  
  const [checkInCode, setCheckInCode] = useState('')
  const [checkedIn, setCheckedIn] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [questStartTime] = useState(Date.now())

  useEffect(() => {
    if (!quest) {
      navigate('/quests')
      return
    }

    // Generate unique check-in code for this quest instance
    const code = `KARMA_${questId}_${Date.now()}`
    setCheckInCode(code)
  }, [quest, questId, navigate])

  const handleCheckIn = () => {
    if (!checkedIn) {
      // Simulate QR scan success
      setCheckedIn(true)
      
      // Reward the user
      const isGroup = participants.length > 1
      const crystalBonus = isGroup ? Math.floor(quest.crystals * 1.5) : quest.crystals
      
      addCrystals(crystalBonus)
      completeQuest(quest.type, isGroup)
      
      const duration = Math.floor((Date.now() - questStartTime) / 1000 / 60)
      trackQuestComplete(questId, participants.length, duration)

      // Navigate to hub after delay — longer if evolution animation is playing
      const newLevel = Math.floor((monster.crystals + crystalBonus) / 100) + 1
      const willEvolve = monster.level < 5 && newLevel >= 5 && monster.evolution === 'baby'
      const delay = willEvolve ? 8000 : 3000

      setTimeout(() => {
        navigate('/hub', {
          state: {
            questCompleted: true,
            crystalsEarned: crystalBonus,
            questName: quest.title
          }
        })
      }, delay)
    }
  }

  const handleCancel = () => {
    navigate('/quests')
  }

  if (!quest) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
              Quest Check-In
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
              <p className="text-xs text-pixel-light font-game">
                Meet your group at the location and scan the QR code to check in!
              </p>
            </div>

            {/* Participants */}
            <div className="pixel-card p-5 mb-6">
              <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                Quest Party ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div 
                    key={participant.id}
                    className="flex items-center gap-3 p-2 bg-pixel-purple bg-opacity-20 rounded"
                  >
                    <div className="text-2xl">
                      {participant.id === user.id ? '🌟' : '👤'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-game text-pixel-light">
                        {participant.name}
                        {participant.id === user.id && ' (You)'}
                      </p>
                      <p className="text-xs text-pixel-blue">
                        Level {participant.monster.level} {participant.monster.evolution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Display */}
            <div className="pixel-card p-8 mb-6 text-center bg-white">
              <h3 className="font-pixel text-xs text-pixel-dark mb-4">
                Check-In Code
              </h3>
              <div className="flex justify-center mb-4">
                <QRCodeSVG 
                  value={checkInCode}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs font-game text-pixel-dark opacity-75">
                Show this to your group or scan someone else's code
              </p>
            </div>

            {/* Check-In Actions */}
            <div className="space-y-4">
              <button
                onClick={handleCheckIn}
                className="pixel-button bg-pixel-green hover:bg-pixel-yellow text-white w-full py-6 text-base"
              >
                ✓ Confirm Check-In
              </button>
              
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="pixel-button bg-pixel-blue hover:bg-pixel-pink text-white w-full py-4"
              >
                📸 Scan QR Code
              </button>
            </div>

            {/* Scanner Placeholder */}
            {showScanner && (
              <div className="mt-4 pixel-card p-6 bg-pixel-dark text-center">
                <p className="font-game text-pixel-light mb-4">
                  Camera scanner would appear here
                </p>
                <p className="text-xs text-pixel-blue font-game mb-4">
                  (Demo mode: click Confirm Check-In above)
                </p>
                <button
                  onClick={() => setShowScanner(false)}
                  className="text-pixel-pink hover:text-pixel-light text-sm font-game"
                >
                  Close Scanner
                </button>
              </div>
            )}

            {/* Safety Info */}
            <div className="mt-6 pixel-card p-4 bg-pixel-purple bg-opacity-20">
              <h4 className="font-pixel text-xs text-pixel-yellow mb-2">
                🛡️ Safety Reminders
              </h4>
              <ul className="text-xs text-pixel-light font-game space-y-1">
                <li>• Meet in public, well-lit locations</li>
                <li>• Keep your location sharing on</li>
                <li>• Report any concerns immediately</li>
              </ul>
            </div>
          </>
        ) : (
          /* Success Screen */
          <div className="text-center">
            <div className="pixel-card p-8 mb-6 bg-pixel-green bg-opacity-20">
              <div className="text-6xl mb-4 animate-float">🎉</div>
              <h2 className="font-pixel text-xl text-pixel-yellow mb-4">
                Quest Complete!
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

              <div className="animate-pulse-slow">
                <p className="font-game text-pixel-blue">
                  Returning to hub...
                </p>
              </div>
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
