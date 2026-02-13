import React, { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from './stores/authStore'
import { useMonsterStore } from './stores/monsterStore'
import { getEvolveAnim } from './components/PixelMonster'
import EvolutionOverlay from './components/EvolutionOverlay'
import MonsterChatBubble from './components/MonsterChatBubble'

// Pages
import Login from './pages/Login'
import PersonalityQuiz from './pages/PersonalityQuiz'
import HubSelection from './pages/HubSelection'
import LivingHub from './pages/LivingHub'
import QuestBoard from './pages/QuestBoard'
import CreateQuest from './pages/CreateQuest'
import Lobby from './pages/Lobby'
import QRCheckIn from './pages/QRCheckIn'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import GroupPhotoGallery from './pages/GroupPhotoGallery'

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" />
}

function EvolutionLayer() {
  const { monster, clearJustEvolved, generateEvolvedImage } = useMonsterStore()
  const [evolvedImageUrl, setEvolvedImageUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState(null)
  const generationStarted = useRef(false)

  // Capture the baby image at the moment evolution starts (before it gets overwritten)
  const babyImageRef = useRef(null)
  const babySpriteSrc = getEvolveAnim(monster.monsterType)

  useEffect(() => {
    if (monster.justEvolved && !babyImageRef.current) {
      babyImageRef.current = monster.monsterImageUrl
    }
  }, [monster.justEvolved, monster.monsterImageUrl])

  // Start Sogni generation as soon as the overlay is shown
  useEffect(() => {
    if (!monster.justEvolved || generationStarted.current) return
    generationStarted.current = true
    setIsGenerating(true)
    setGenerationError(null)

    generateEvolvedImage()
      .then((data) => {
        setEvolvedImageUrl(data?.monsterImageUrl || null)
        setIsGenerating(false)
      })
      .catch(() => {
        setGenerationError('Image generation failed')
        setIsGenerating(false)
      })
  }, [monster.justEvolved, generateEvolvedImage])

  const handleComplete = useCallback(() => {
    clearJustEvolved()
    setEvolvedImageUrl(null)
    setIsGenerating(false)
    setGenerationError(null)
    generationStarted.current = false
    babyImageRef.current = null
  }, [clearJustEvolved])

  if (!monster.justEvolved) return null

  return (
    <EvolutionOverlay
      babyImageUrl={babyImageRef.current}
      babySpriteSrc={babySpriteSrc}
      monsterName={monster.name}
      evolvedImageUrl={evolvedImageUrl}
      generationError={generationError}
      onComplete={handleComplete}
    />
  )
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id'

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <div className="app min-h-screen bg-pixel-dark">
          <EvolutionLayer />
          <MonsterChatBubble />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <PersonalityQuiz />
              </ProtectedRoute>
            } />
            <Route path="/hub-selection" element={
              <ProtectedRoute>
                <HubSelection />
              </ProtectedRoute>
            } />
            <Route path="/hub" element={
              <ProtectedRoute>
                <LivingHub />
              </ProtectedRoute>
            } />
            <Route path="/quests" element={
              <ProtectedRoute>
                <QuestBoard />
              </ProtectedRoute>
            } />
            <Route path="/quests/create" element={
              <ProtectedRoute>
                <CreateQuest />
              </ProtectedRoute>
            } />
            <Route path="/lobby/:questId" element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            } />
            <Route path="/checkin/:questId" element={
              <ProtectedRoute>
                <QRCheckIn />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute>
                <GroupPhotoGallery />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/hub" />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
