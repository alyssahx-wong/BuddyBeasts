import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import LoginBackground from '../components/LoginBackground'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const initializeMonster = useMonsterStore((state) => state.initializeMonster)

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential)
      const user = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      }
      
      setUser(user)
      
      // Navigate to personality quiz first
      navigate('/quiz')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleError = () => {
    console.error('Login failed')
  }

  const handleDemoLogin = () => {
    // Demo login for testing without Google OAuth
    const demoUser = {
      id: 'demo_' + Date.now(),
      name: 'Demo Player',
      email: 'demo@buddybeasts.com',
      picture: null,
    }
    
    setUser(demoUser)
    navigate('/quiz')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <LoginBackground />
      <div className="max-w-md w-full pixel-card p-8 text-center relative z-10">
        <div className="mb-8">
          <h1 className="font-pixel text-2xl md:text-3xl text-pixel-yellow mb-4 animate-pulse-slow">
            BuddyBeasts
          </h1>
          <p className="text-lg md:text-xl text-pixel-light font-game">
            Turn local social connection into a living pixel world
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-pixel-pink rounded-lg flex items-center justify-center animate-float">
            <div className="pixel-border text-6xl">👾</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="filled_black"
              size="large"
              text="continue_with"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-pixel-purple"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-pixel-dark text-pixel-light">OR</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            className="pixel-button bg-pixel-blue hover:bg-pixel-green text-white w-full"
          >
            Try Demo
          </button>
        </div>

        <div className="mt-8 text-xs text-pixel-light opacity-75 font-game">
          <p className="mb-2">🎮 Complete group quests</p>
          <p className="mb-2">🐾 Grow your pixel monster</p>
          <p>🤝 Build real community connections</p>
        </div>
      </div>
    </div>
  )
}
