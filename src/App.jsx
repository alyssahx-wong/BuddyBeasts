import React from 'react'
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
  const { monster, clearJustEvolved } = useMonsterStore()
  const animSrc = getEvolveAnim(monster.monsterType)

  if (!monster.justEvolved || !animSrc) return null

  return (
    <EvolutionOverlay
      animSrc={animSrc}
      monsterName={monster.name}
      onComplete={() => clearJustEvolved()}
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
