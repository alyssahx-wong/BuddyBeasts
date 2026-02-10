import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from './stores/authStore'
import { useMonsterStore } from './stores/monsterStore'
import { getEvolveAnim } from './components/PixelMonster'
import EvolutionOverlay from './components/EvolutionOverlay'

// Pages
import Login from './pages/Login'
import HubSelection from './pages/HubSelection'
import LivingHub from './pages/LivingHub'
import QuestBoard from './pages/QuestBoard'
import Lobby from './pages/Lobby'
import QRCheckIn from './pages/QRCheckIn'
import Profile from './pages/Profile'

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
          <Routes>
            <Route path="/login" element={<Login />} />
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
            <Route path="/" element={<Navigate to="/hub" />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
