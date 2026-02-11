import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import { useChatStore } from '../stores/chatStore'
import api from '../api'

const REACTIONS = ['🎉 Fun', '😊 Chill', '💪 Productive', '🌿 Calm', '⚡ Energizing']

export default function QRCheckIn() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const { user } = useAuthStore()
  const { saveGroupPhoto } = useMonsterStore()
  const { addQuestParticipants } = useChatStore()

  const [lobby, setLobby] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('photo')
  const [attempt, setAttempt] = useState(1)
  const maxAttempts = 3

  // Photo states
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [groupPhotoData, setGroupPhotoData] = useState(null)
  const [pollingGroupPhoto, setPollingGroupPhoto] = useState(false)

  // Reaction states
  const [myReaction, setMyReaction] = useState(null)
  const [reactionStatus, setReactionStatus] = useState(null)
  const [pollingReaction, setPollingReaction] = useState(false)

  // Completion states
  const [completionResult, setCompletionResult] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const lobbyRes = await api.get(`/api/lobbies/${questId}`)
        setLobby(lobbyRes.data)
        setPollingGroupPhoto(true)
      } catch (err) {
        console.error('Failed to init check-in:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [questId])

  // Poll for group photo
  useEffect(() => {
    if (!pollingGroupPhoto) return

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/quests/${questId}/group-photo`)
        const photoSrc = data.imageUrl || data.photoData
        if (photoSrc && !groupPhotoData) {
          setGroupPhotoData({
            photoData: photoSrc,
            uploadedBy: data.uploadedBy || 'Someone',
          })
        }
      } catch (err) {
        console.error('Failed to fetch group photo:', err)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [pollingGroupPhoto, questId, groupPhotoData])

  // Poll for reaction status
  useEffect(() => {
    if (!pollingReaction) return

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/quests/${questId}/reaction-status`, {
          params: { attempt }
        })
        setReactionStatus(data)

        if (data.allSameReaction) {
          // All matched!
          setPollingReaction(false)
          handleReactionMatch()
        } else if (data.allSelected && !data.allSameReaction) {
          // All selected but didn't match
          setPollingReaction(false)
        }
      } catch (err) {
        console.error('Failed to fetch reaction status:', err)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [pollingReaction, questId, attempt])

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result)
    }
    reader.readAsDataURL(file)
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
      setPhotoPreview(canvas.toDataURL('image/jpeg'))
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

  const handleSavePhoto = async () => {
    if (!photoPreview) return

    try {
      const { data: uploadResult } = await api.post('/api/quests/photos/upload', {
        questId,
        imageData: photoPreview,
        groupMemory: 'Together',
        groupSize: lobby?.participants?.length || 1,
      })

      const displaySrc = uploadResult.imageUrl || photoPreview

      if (saveGroupPhoto) {
        saveGroupPhoto({
          imageBase64: photoPreview,
          imageUrl: uploadResult.imageUrl || null,
          questTitle: lobby?.quest?.title || 'Shared Moment',
          questIcon: lobby?.quest?.icon || '📷',
          groupMemory: 'Together',
          groupSize: lobby?.participants?.length || 1,
        })
      }

      setPhotoUploaded(true)
      setGroupPhotoData({
        photoData: displaySrc,
        uploadedBy: user?.name || 'You'
      })
    } catch (err) {
      console.error('Failed to upload photo:', err)
      alert('Failed to save photo. Please try again.')
    }
  }

  const handlePhotoContinue = () => {
    if (groupPhotoData?.photoData) {
      setStep('reaction')
    } else {
      alert('Please take or wait for a group photo first')
    }
  }

  const handleReactionSelect = async (reaction) => {
    setMyReaction(reaction)

    try {
      const { data } = await api.post('/api/quests/reaction-selection', {
        questId,
        reaction,
        attempt,
      })

      setReactionStatus(data)

      if (data.allSameReaction) {
        // All matched immediately!
        handleReactionMatch()
      } else if (data.allSelected && !data.allSameReaction) {
        // All selected but didn't match
        // Don't start polling, handle it now
      } else {
        // Wait for others
        setPollingReaction(true)
      }
    } catch (err) {
      console.error('Failed to submit reaction:', err)
    }
  }

  const handleReactionMatch = async () => {
    // All reactions matched! Complete the quest
    try {
      const { data } = await api.post(`/api/quests/${questId}/complete-with-reaction`, null, {
        params: { attempt }
      })
      setCompletionResult(data)
      setStep('complete')

      // Create a quest team conversation so participants can keep chatting
      if (data.matched && lobby?.participants) {
        addQuestParticipants(questId, lobby.quest?.title || 'Quest', lobby.participants)
      }
    } catch (err) {
      console.error('Failed to complete quest:', err)
    }
  }

  const handleReactionMismatch = async () => {
    if (attempt < maxAttempts) {
      // Try again
      const nextAttempt = attempt + 1
      setAttempt(nextAttempt)
      setMyReaction(null)
      setReactionStatus(null)
      alert(`Reactions didn't match! You have ${maxAttempts - attempt} more ${maxAttempts - attempt === 1 ? 'try' : 'tries'}.`)
    } else {
      // Out of attempts, fail the quest
      try {
        const { data } = await api.post(`/api/quests/${questId}/complete-with-reaction`, null, {
          params: { attempt: maxAttempts }
        })
        setCompletionResult(data)
        setStep('complete')
      } catch (err) {
        console.error('Failed to complete quest:', err)
      }
    }
  }

  const handleReturnToHub = () => {
    navigate('/hub')
  }

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

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
              Quest Completion
            </h1>
            {step !== 'complete' && (
              <button
                onClick={() => navigate('/quests')}
                className="text-pixel-pink hover:text-pixel-light text-sm font-game"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
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
            Complete the steps together to earn crystals!
          </p>
        </div>

        {/* STEP 1: PHOTO */}
        {step === 'photo' && (
          <div className="pixel-card p-6 mb-6">
            <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
              Step 1: Take Group Photo
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
                      <p className="text-xs font-game text-pixel-light">Take Photo</p>
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
                        <p className="text-xs font-game text-pixel-light">Upload Photo</p>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-pixel-blue font-game text-center">
                    💡 Waiting for someone to share a photo...
                  </p>
                </div>
              ) : cameraActive ? (
                <div>
                  <video
                    id="camera-video"
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video && cameraStream) {
                        video.srcObject = cameraStream
                      }
                    }}
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
                  ✓ Group photo captured by {groupPhotoData.uploadedBy}
                </p>
                <button
                  onClick={handlePhotoContinue}
                  className="pixel-button bg-pixel-blue text-white w-full py-3"
                >
                  Continue to Reactions →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: REACTION */}
        {step === 'reaction' && (
          <div className="pixel-card p-6 mb-6">
            <h3 className="font-pixel text-xs text-pixel-yellow mb-3">
              Step 2: Select Same Reaction (Attempt {attempt}/{maxAttempts})
            </h3>
            <p className="text-xs text-pixel-light font-game mb-4">
              Everyone must select the SAME reaction. You have {maxAttempts} tries.
            </p>

            {!myReaction ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {REACTIONS.map((reaction) => (
                  <button
                    key={reaction}
                    onClick={() => handleReactionSelect(reaction)}
                    className="pixel-card p-4 text-center hover:border-pixel-yellow transition"
                  >
                    <span className="text-lg font-game text-pixel-light">{reaction}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="pixel-card p-4 bg-pixel-blue bg-opacity-20 mb-4">
                  <p className="text-sm font-game text-pixel-yellow mb-2">
                    You selected: {myReaction}
                  </p>
                  {reactionStatus && !reactionStatus.allSelected && (
                    <p className="text-xs text-pixel-light font-game">
                      Waiting for others... ({reactionStatus.totalSelections}/{reactionStatus.totalParticipants} selected)
                    </p>
                  )}
                  {reactionStatus && reactionStatus.allSelected && !reactionStatus.allSameReaction && (
                    <div>
                      <p className="text-xs text-pixel-pink font-game mb-3">
                        ❌ Reactions don't match! Try again.
                      </p>
                      <button
                        onClick={handleReactionMismatch}
                        className="pixel-button bg-pixel-pink text-white w-full py-3"
                      >
                        {attempt < maxAttempts ? 'Try Again' : 'End Quest'}
                      </button>
                    </div>
                  )}
                  {reactionStatus && reactionStatus.allSameReaction && (
                    <p className="text-xs text-pixel-green font-game">
                      ✓ All reactions matched! Completing quest...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: COMPLETE */}
        {step === 'complete' && completionResult && (
          <div className="text-center">
            <div className={`pixel-card p-8 mb-6 ${completionResult.matched ? 'bg-pixel-green' : 'bg-pixel-pink'} bg-opacity-20`}>
              <div className="text-6xl mb-4 animate-float">
                {completionResult.matched ? '🎉' : '😔'}
              </div>
              <h2 className="font-pixel text-xl text-pixel-yellow mb-4">
                {completionResult.matched ? 'Quest Completed!' : 'Quest Failed'}
              </h2>
              <p className="font-game text-lg text-pixel-light mb-6">
                {completionResult.message}
              </p>

              {completionResult.matched ? (
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <p className="text-3xl mb-2">💎</p>
                    <p className="text-xs font-game text-pixel-light">
                      +{completionResult.crystalsEarned}
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
                      +{completionResult.connections} connection{completionResult.connections !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-game text-pixel-light mb-6">
                  The quest has been removed and no crystals were awarded.
                </p>
              )}

              <button
                onClick={handleReturnToHub}
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
