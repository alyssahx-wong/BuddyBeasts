import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../stores/authStore'

export default function Login() {
  const navigate = useNavigate()
  const loginDemo = useAuthStore((state) => state.loginDemo)
  const loginGoogle = useAuthStore((state) => state.loginGoogle)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      setError(null)
      await loginGoogle(credentialResponse.credential)
      navigate('/hub-selection')
    } catch (err) {
      console.error('Login error:', err)
      setError('Google login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleError = () => {
    setError('Google login failed. Please try again.')
  }

  const handleDemoLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      await loginDemo('Demo Player')
      navigate('/hub-selection')
    } catch (err) {
      console.error('Demo login error:', err)
      setError('Could not connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pixel-dark to-pixel-purple">
      <div className="max-w-md w-full pixel-card p-8 text-center">
        <div className="mb-8">
          <h1 className="font-pixel text-2xl md:text-3xl text-pixel-yellow mb-4 animate-pulse-slow">
            KarmaLoop
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

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm font-game">
            {error}
          </div>
        )}

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
            disabled={loading}
            className="pixel-button bg-pixel-blue hover:bg-pixel-green text-white w-full disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Try Demo'}
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
