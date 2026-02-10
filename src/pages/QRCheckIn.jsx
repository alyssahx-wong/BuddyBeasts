import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthStore } from '../stores/authStore'
import api from '../api'

export default function QRCheckIn() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const { user } = useAuthStore()

  const [checkInCode, setCheckInCode] = useState('')
  const [checkedIn, setCheckedIn] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [result, setResult] = useState(null)
  const [lobby, setLobby] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch lobby state for quest info + participants
        const lobbyRes = await api.get(`/api/lobbies/${questId}`)
        setLobby(lobbyRes.data)

        // Generate check-in code from backend
        const codeRes = await api.get(`/api/checkin/${questId}/code`)
        setCheckInCode(codeRes.data.code)
      } catch (err) {
        console.error('Failed to init check-in:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [questId])

  const handleCheckIn = async () => {
    if (checkedIn) return
    try {
      const participantCount = lobby?.participants?.length || 1
      const { data } = await api.post(`/api/checkin/${questId}/confirm`, {
        participantCount,
      })
      setResult(data)
      setCheckedIn(true)

      // Navigate back to hub after 3 seconds
      setTimeout(() => {
        navigate('/hub', {
          state: {
            questCompleted: true,
            crystalsEarned: data.crystalsEarned,
            questName: data.questName,
          }
        })
      }, 3000)
    } catch (err) {
      console.error('Check-in failed:', err)
    }
  }

  const handleCancel = () => {
    navigate('/quests')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark flex items-center justify-center">
        <p className="font-game text-pixel-light animate-pulse">Loading check-in...</p>
      </div>
    )
  }

  const quest = lobby?.quest || {}
  const participants = lobby?.participants || []

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
                        Level {participant.monster?.level || 1} {participant.monster?.evolution || 'baby'}
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
                  value={checkInCode || 'loading'}
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
                You earned <span className="text-pixel-yellow">{result?.crystalsEarned || 0}</span> crystals!
              </p>

              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-3xl mb-2">💎</p>
                  <p className="text-xs font-game text-pixel-light">
                    +{result?.crystalsEarned || 0}
                  </p>
                </div>
                <div>
                  <p className="text-3xl mb-2">⭐</p>
                  <p className="text-xs font-game text-pixel-light">
                    +{result?.xp || 10} XP
                  </p>
                </div>
                <div>
                  <p className="text-3xl mb-2">🤝</p>
                  <p className="text-xs font-game text-pixel-light">
                    +{result?.connections || 0} connection{(result?.connections || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="animate-pulse-slow">
                <p className="font-game text-pixel-blue">
                  Returning to hub...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
