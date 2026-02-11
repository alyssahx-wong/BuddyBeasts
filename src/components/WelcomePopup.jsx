import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function WelcomePopup({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const setHideWelcomePopup = useAuthStore((state) => state.setHideWelcomePopup)

  const handleClose = () => {
    if (dontShowAgain) {
      setHideWelcomePopup()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="pixel-card max-w-md w-full p-6 bg-pixel-dark relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-pixel-light hover:text-pixel-pink text-2xl"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-float">💎</div>
          <h2 className="font-pixel text-lg text-pixel-yellow mb-2">
            Welcome to BuddyBeasts!
          </h2>
          <p className="font-game text-sm text-pixel-light">
            You've received 1000 crystals to get started!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="pixel-card p-4 bg-pixel-purple bg-opacity-20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐾</span>
              <div>
                <h3 className="font-pixel text-xs text-pixel-yellow mb-1">
                  Feed Your Monster
                </h3>
                <p className="text-xs font-game text-pixel-light">
                  Use crystals to evolve and grow your buddy beast
                </p>
              </div>
            </div>
          </div>

          <div className="pixel-card p-4 bg-pixel-blue bg-opacity-20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛍️</span>
              <div>
                <h3 className="font-pixel text-xs text-pixel-yellow mb-1">
                  Shop for Items
                </h3>
                <p className="text-xs font-game text-pixel-light">
                  Purchase items, skins, and accessories for your monster
                </p>
              </div>
            </div>
          </div>

          <div className="pixel-card p-4 bg-pixel-green bg-opacity-20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-pixel text-xs text-pixel-yellow mb-1">
                  Create Quests (100 Crystals)
                </h3>
                <p className="text-xs font-game text-pixel-light">
                  Start your own quest and invite others to join you
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-game text-pixel-light">
              Don't show this again
            </span>
          </label>
        </div>

        <button
          onClick={handleClose}
          className="pixel-button bg-pixel-blue hover:bg-pixel-green text-white w-full py-3"
        >
          Let's Go!
        </button>
      </div>
    </div>
  )
}
