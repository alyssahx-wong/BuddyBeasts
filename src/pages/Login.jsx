import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../stores/authStore'
import LoginBackground from '../components/LoginBackground'

export default function Login() {
  const navigate = useNavigate()
  const loginDemo = useAuthStore((state) => state.loginDemo)
  const loginGoogle = useAuthStore((state) => state.loginGoogle)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
    onSuccess: async (codeResponse) => {
      try {
        setLoading(true)
        setError(null)
        await loginGoogle(null, codeResponse.code)
        navigate('/quiz')
      } catch (err) {
        console.error('Login error:', err)
        setError('Google login failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.')
    },
  })

  const handleDemoLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      await loginDemo('Demo Player')
      navigate('/quiz')
    } catch (err) {
      console.error('Demo login error:', err)
      setError('Could not connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
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

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm font-game">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="pixel-button bg-white hover:bg-gray-100 text-gray-800 w-full disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

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
