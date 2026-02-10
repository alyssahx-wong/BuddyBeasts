import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import api from '../api'

export default function QRCheckIn() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const { user } = useAuthStore()
  const { saveGroupPhoto } = useMonsterStore()

  const [checkInCode, setCheckInCode] = useState('')
  const [checkedIn, setCheckedIn] = useState(false)
  const [result, setResult] = useState(null)
  const [lobby, setLobby] = useState(null)
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState('photo')
  const [emoteChoice, setEmoteChoice] = useState(null)
  const [allEmotesIn, setAllEmotesIn] = useState(false)
  const [reactionConfirmed, setReactionConfirmed] = useState(false)
  const [memoryWord, setMemoryWord] = useState(null)
  const [groupMemory, setGroupMemory] = useState(null)
  const [signals, setSignals] = useState({ emote: false, reaction: false, memory: false })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [wordStatus, setWordStatus] = useState(null)
  const [pollingWordStatus, setPollingWordStatus] = useState(false)
  const [groupPhotoData, setGroupPhotoData] = useState(null)
  const [pollingGroupPhoto, setPollingGroupPhoto] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch lobby state for quest info + participants
        const lobbyRes = await api.get(`/api/lobbies/${questId}`)
        setLobby(lobbyRes.data)

        // Generate check-in code from backend
        const codeRes = await api.get(`/api/checkin/${questId}/code`)
        setCheckInCode(codeRes.data.code)
        
        // Start polling for group photo immediately
        setPollingGroupPhoto(true)
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
    } catch (err) {
      console.error('Check-in failed:', err)
    }
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

  const handlePhotoContinue = () => {
    if (groupPhotoData?.photoData) {
      setStep('emote')
    } else {
      alert('Please take or upload a group photo first')
    }
  }

  const finishIfQualified = () => {
    if (signalCount >= 2 && !checkedIn) {
      handleCheckIn()
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

  const handleMemorySelect = async (word) => {
    console.log('📝 User selected word:', word)
    setMemoryWord(word)
    markSignal('memory')
    
    try {
      const { data } = await api.post('/api/quests/word-selection', {
        questId,
        word,
      })
      
      console.log('✓ Word selection submitted:', data)
      setWordStatus(data)
      
      if (data.allSameWord) {
        console.log('✓ All participants agreed!')
        setGroupMemory(word)
        finishIfQualified()
      } else {
        console.log('⏳ Waiting for other participants...')
        // Start polling for word status
        setPollingWordStatus(true)
      }
    } catch (err) {
      console.error('Failed to submit word selection:', err)
      // Fallback to old behavior
      const otherWord = WORDS.filter((w) => w !== word)[Math.floor(Math.random() * (WORDS.length - 1))]
      setGroupMemory(`${word} + ${otherWord}`)
      finishIfQualified()
    }
  }

  const quest = lobby?.quest || {}
  const participants = lobby?.participants || []

  const handleSaveSnapshot = () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#2A2A3E" />
  <rect y="220" width="640" height="140" fill="#4A7A55" />
  <text x="24" y="40" font-size="20" fill="#F7E76B" font-family="monospace">${quest?.title || 'Shared Moment'}</text>
  <text x="24" y="68" font-size="14" fill="#B9C2FF" font-family="monospace">Group felt: ${groupMemory || 'Together'}</text>
  <text x="24" y="320" font-size="12" fill="#FFFFFF" font-family="monospace">${new Date().toLocaleString()}</text>
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result
      setPhotoPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSavePhoto = async () => {
    if (!photoPreview) return
    
    try {
      console.log('📸 Uploading photo for quest:', questId)
      const response = await api.post('/api/quests/photos/upload', {
        questId,
        imageData: photoPreview,
        groupMemory: groupMemory || 'Together',
        groupSize: participants.length,
      })
      
      console.log('✓ Photo uploaded:', response.data)
      
      // Also save to local store for immediate display
      if (saveGroupPhoto) {
        saveGroupPhoto({
          imageBase64: photoPreview,
          questTitle: quest?.title || 'Shared Moment',
          questIcon: quest?.icon || '📷',
          groupMemory: groupMemory || 'Together',
          groupSize: participants.length,
        })
      }
      
      setPhotoUploaded(true)
      // Immediately set group photo data so this user can see it
      setGroupPhotoData({
        photoData: photoPreview,
        uploadedBy: user?.name || 'You'
      })
      
      console.log('✓ Photo saved locally, polling stopped')
    } catch (err) {
      console.error('Failed to upload photo:', err)
      alert('Failed to save photo. Please try again.')
    }
  }

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setCameraStream(stream)
      setCameraActive(true)
    } catch (err) {
      console.error('Camera access denied:', err)
      alert('Camera access is required to take a photo')
    }
  }

  const handleTakePhoto = () => {
    const video = document.getElementById('camera-video')
    if (video) {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      const photoData = canvas.toDataURL('image/jpeg')
      setPhotoPreview(photoData)
      handleStopCamera()
    }
  }

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  // Poll word selection status when waiting for others
  useEffect(() => {
    if (!pollingWordStatus) return
    
    console.log('🔄 Starting word status polling for quest:', questId)
    
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/quests/${questId}/word-status`)
        console.log('📝 Word status:', data)
        setWordStatus(data)
        
        if (data.allSameWord) {
          console.log('✓ All participants selected the same word!')
          setGroupMemory(data.chosenWord)
          setPollingWordStatus(false)
          finishIfQualified()
        }
      } catch (err) {
        console.error('Failed to fetch word status:', err)
      }
    }, 2000)
    
    return () => {
      console.log('🛑 Stopping word status polling')
      clearInterval(interval)
    }
  }, [pollingWordStatus, questId])

  // Poll for group photo uploaded by other participants
  useEffect(() => {
    if (!pollingGroupPhoto) return
    
    console.log('🔄 Starting group photo polling for quest:', questId)
    
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/quests/${questId}/group-photo`)
        console.log('📷 Group photo status:', data)
        
        if (data.photoData && !groupPhotoData) {
          console.log('✓ Group photo found! Updating...')
          setGroupPhotoData({
            photoData: data.photoData,
            uploadedBy: data.uploadedBy || 'Someone',
            groupMemory: data.groupMemory
          })
        }
      } catch (err) {
        console.error('Failed to fetch group photo:', err)
      }
    }, 1500) // Poll every 1.5 seconds
    
    return () => {
      console.log('🛑 Stopping group photo polling')
      clearInterval(interval)
    }
  }, [pollingGroupPhoto, questId, groupPhotoData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark flex items-center justify-center">
        <p className="font-game text-pixel-light animate-pulse">Loading check-in...</p>
      </div>
    )
  }

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
                Optional, low-pressure, and collective
              </p>
            </div>

            {/* Group Photo Section - Always visible */}
            <div className="pixel-card p-6 mb-6">
              <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                Take Group Photo
              </h3>
              <p className="text-xs text-pixel-light font-game mb-4">
                Only one person needs to take a photo. Once uploaded, everyone can see it.
              </p>
              
              {!groupPhotoData ? (
                !cameraActive && !photoPreview ? (
                  <div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={handleStartCamera}
                        className="pixel-card p-4 text-center hover:border-pixel-blue transition"
                      >
                        <p className="text-2xl mb-2">📷</p>
                        <p className="text-xs font-game text-pixel-light">
                          Take Photo
                        </p>
                      </button>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <div className="pixel-card p-4 text-center hover:border-pixel-blue transition">
                          <p className="text-2xl mb-2">📁</p>
                          <p className="text-xs font-game text-pixel-light">
                            Upload Photo
                          </p>
                        </div>
                      </label>
                    </div>
                    {!cameraActive && !photoPreview && (
                      <p className="text-xs text-pixel-blue font-game text-center">
                        💡 Waiting for someone to share a photo...
                      </p>
                    )}
                  </div>
                ) : cameraActive ? (
                  <div>
                    <video
                      id="camera-video"
                      autoPlay
                      playsInline
                      className="w-full max-h-60 object-cover mb-3 pixel-card"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleTakePhoto}
                        className="pixel-button bg-pixel-blue text-white text-xs py-2"
                      >
                        Snap
                      </button>
                      <button
                        onClick={handleStopCamera}
                        className="pixel-button bg-pixel-pink text-white text-xs py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full max-h-40 object-cover mb-3 pixel-card"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => setPhotoPreview(null)}
                        className="pixel-button bg-pixel-pink text-white text-xs py-2"
                      >
                        Change Photo
                      </button>
                      <button
                        onClick={handleSavePhoto}
                        className="pixel-button bg-pixel-blue text-white text-xs py-2"
                      >
                        {photoUploaded ? 'Saved ✓' : 'Save Photo'}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <img
                    src={groupPhotoData.photoData}
                    alt="Group Photo"
                    className="w-full max-h-40 object-cover mb-3 pixel-card"
                  />
                  <p className="text-xs text-pixel-green font-game mb-3">
                    ✓ Group photo captured by {groupPhotoData.uploadedBy || 'someone'}
                  </p>
                  <button
                    onClick={() => setStep('emote')}
                    className="pixel-button bg-pixel-blue text-white w-full py-3"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>

            {step === 'emote' && (
              <div className="pixel-card p-6 mb-6">
                <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                  1. Group Emote Sync
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
                  2. Monster Group Reaction
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
                  {allEmotesIn ? 'That feels right' : 'Waiting for others...'}
                </button>
              </div>
            )}

            {step === 'memory' && (
              <div className="pixel-card p-6 mb-6">
                <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                  3. One-Word Group Memory
                </h3>
                <p className="text-xs text-pixel-light font-game mb-4">
                  In one word, how did this feel? Everyone must choose the same word.
                </p>
                {memoryWord ? (
                  <div className="text-center">
                    <div className="pixel-card p-4 bg-pixel-blue bg-opacity-20 mb-4">
                      <p className="text-sm font-game text-pixel-yellow mb-2">
                        You selected: {memoryWord}
                      </p>
                      {wordStatus && !wordStatus.allSameWord && (
                        <p className="text-xs text-pixel-light font-game">
                          Waiting for others... ({wordStatus.totalSelections}/{wordStatus.totalParticipants} selected)
                        </p>
                      )}
                      {wordStatus && wordStatus.allSameWord && (
                        <p className="text-xs text-pixel-green font-game">
                          ✓ Everyone agreed on: {groupMemory}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {step === 'snapshot' && (
              <div className="pixel-card p-6 mb-6 text-center">
                <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
                  4. Optional Pixel Snapshot
                </h3>
                <p className="text-xs text-pixel-light font-game mb-4">
                  A playful memory token. Save it or discard it.
                </p>
                <div className="pixel-card p-4 mb-4 bg-pixel-dark">
                  <div className="text-3xl mb-2">🐥 🐥 🐥</div>
                  <p className="text-xs text-pixel-blue font-game">This group felt: {groupMemory}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={handleSaveSnapshot}
                    className="pixel-button bg-pixel-blue text-white w-full py-3"
                  >
                    Save Snapshot
                  </button>
                  <button
                    onClick={() => {
                      if (!checkedIn) handleCheckIn()
                      navigate('/hub', {
                        state: {
                          questCompleted: true,
                          crystalsEarned: result?.crystalsEarned,
                          questName: result?.questName,
                        }
                      })
                    }}
                    className="pixel-button bg-pixel-green text-white w-full py-3"
                  >
                    Finish
                  </button>
                </div>

                {/* Photo Upload Section */}
                <div className="pixel-card p-4 bg-pixel-purple bg-opacity-20">
                  <p className="text-xs text-pixel-yellow font-pixel mb-3">
                    5. Optional Group Photo
                  </p>
                  {!cameraActive && !photoPreview ? (
                    <div>
                      <p className="text-xs text-pixel-light font-game mb-3">
                        Take or upload a real photo to remember this moment together.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleStartCamera}
                          className="pixel-card p-4 text-center hover:border-pixel-blue"
                        >
                          <p className="text-2xl mb-2">📷</p>
                          <p className="text-xs font-game text-pixel-light">
                            Take Photo
                          </p>
                        </button>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <div className="pixel-card p-4 text-center hover:border-pixel-blue">
                            <p className="text-2xl mb-2">📁</p>
                            <p className="text-xs font-game text-pixel-light">
                              Upload Photo
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : cameraActive ? (
                    <div>
                      <video
                        id="camera-video"
                        autoPlay
                        playsInline
                        className="w-full max-h-60 object-cover mb-3 pixel-card"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleTakePhoto}
                          className="pixel-button bg-pixel-blue text-white text-xs py-2"
                        >
                          Snap
                        </button>
                        <button
                          onClick={handleStopCamera}
                          className="pixel-button bg-pixel-pink text-white text-xs py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full max-h-40 object-cover mb-3 pixel-card"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPhotoPreview(null)}
                          className="pixel-button bg-pixel-pink text-white text-xs py-2"
                        >
                          Change Photo
                        </button>
                        <button
                          onClick={handleSavePhoto}
                          className="pixel-button bg-pixel-blue text-white text-xs py-2"
                        >
                          {photoUploaded ? 'Saved' : 'Save Photo'}
                        </button>
                      </div>
                    </div>
                  )}
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

              <button
                onClick={() => navigate('/hub')}
                className="pixel-button bg-pixel-blue text-white w-full py-4"
              >
                Return to Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
