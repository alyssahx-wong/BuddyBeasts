import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import { useHubStore } from '../stores/hubStore'
import PixelMonster from '../components/PixelMonster'
import NavigationBar from '../components/NavigationBar'

export default function LivingHub() {
  const navigate = useNavigate()
  const { user, currentHub } = useAuthStore()
  const { monster } = useMonsterStore()
  const { onlineUsers, startPolling, stopPolling } = useHubStore()
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    if (!currentHub) {
      navigate('/hub-selection')
      return
    }

    // Start polling for online users
    startPolling(currentHub.id)

    // Hide welcome message after 3 seconds
    const timer = setTimeout(() => setShowWelcome(false), 3000)

    return () => {
      stopPolling()
      clearTimeout(timer)
    }
  }, [currentHub, navigate, startPolling, stopPolling])

  if (!currentHub) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
              {currentHub.name}
            </h1>
            <p className="text-xs text-pixel-light font-game mt-1">
              👥 {onlineUsers.length + 1} monsters online
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-pixel-pink"
          >
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-pixel-blue flex items-center justify-center text-white font-pixel text-xs">
                {user.name[0]}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      {showWelcome && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 animate-float">
          <div className="pixel-card p-4 bg-pixel-green bg-opacity-90">
            <p className="font-game text-white text-center">
              Welcome to {currentHub.name}! 👋
            </p>
          </div>
        </div>
      )}

      {/* Hub Scene */}
      <div className="relative max-w-4xl mx-auto mt-8 px-4">
        {/* Pixel Art Background */}
        <div className="pixel-card min-h-[400px] md:min-h-[500px] bg-gradient-to-b from-pixel-blue to-pixel-green bg-opacity-20 p-6 relative overflow-hidden">
          {/* Sky/Background Elements */}
          <div className="absolute top-4 right-4 text-4xl animate-pulse-slow">☀️</div>
          <div className="absolute bottom-4 left-4 text-2xl">🌳</div>
          <div className="absolute bottom-4 right-12 text-2xl">🌳</div>
          <div className="absolute top-12 left-12 text-xl opacity-50">☁️</div>
          <div className="absolute top-20 right-20 text-xl opacity-50">☁️</div>

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-pixel-green bg-opacity-30 border-t-4 border-pixel-green"></div>

          {/* Player's Monster */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10">
            <div className="text-center">
              <PixelMonster
                evolution={monster.evolution}
                size="large"
                animated={true}
                isPlayer={true}
                skin={monster.activeSkin || 'default'}
              />
              <div className="mt-2 pixel-card p-2 bg-pixel-yellow inline-block">
                <p className="font-pixel text-xs text-pixel-dark">
                  {user.name} (You)
                </p>
              </div>
            </div>
          </div>

          {/* Other Online Monsters */}
          {onlineUsers.slice(0, 8).map((onlineUser, index) => {
            const positions = [
              { bottom: '25%', left: '15%' },
              { bottom: '35%', right: '20%' },
              { bottom: '45%', left: '25%' },
              { bottom: '30%', right: '35%' },
              { bottom: '40%', left: '60%' },
              { bottom: '25%', right: '50%' },
              { bottom: '35%', left: '40%' },
              { bottom: '50%', right: '15%' },
            ]
            const pos = positions[index % positions.length]

            return (
              <div
                key={onlineUser.id}
                className="absolute transition-all duration-1000"
                style={pos}
              >
                <button
                  onClick={() => {
                    // Could open interaction menu
                    console.log('Interact with', onlineUser.name)
                  }}
                  className="text-center hover:scale-110 transition-transform"
                >
                  <PixelMonster
                    evolution={onlineUser.monster?.evolution || 'baby'}
                    size="medium"
                    animated={true}
                    skin={onlineUser.monster?.activeSkin || 'default'}
                  />
                  <div className="mt-1 bg-pixel-dark bg-opacity-75 px-2 py-1 rounded text-xs font-game text-white">
                    {onlineUser.name}
                  </div>
                </button>
              </div>
            )
          })}

          {/* Interaction Prompt */}
          <div className="absolute top-4 left-4 pixel-card p-3 bg-pixel-dark bg-opacity-80 max-w-xs">
            <p className="text-xs font-game text-pixel-light">
              💡 Tap monsters to wave or join their quest lobby
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/quests')}
            className="pixel-button bg-pixel-yellow hover:bg-pixel-pink text-pixel-dark py-6 flex flex-col items-center gap-2"
          >
            <span className="text-3xl">📋</span>
            <span className="text-xs md:text-sm">Quest Board</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="pixel-button bg-pixel-blue hover:bg-pixel-green text-white py-6 flex flex-col items-center gap-2"
          >
            <span className="text-3xl">👾</span>
            <span className="text-xs md:text-sm">My Monster</span>
          </button>
        </div>

        {/* Hub Stats */}
        <div className="mt-6 pixel-card p-4 bg-pixel-purple bg-opacity-20">
          <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Hub Activity</h3>
          <div className="grid grid-cols-3 gap-4 text-center font-game">
            <div>
              <p className="text-2xl">🎯</p>
              <p className="text-xs text-pixel-light mt-1">42 Quests</p>
              <p className="text-xs text-pixel-blue">This Week</p>
            </div>
            <div>
              <p className="text-2xl">🤝</p>
              <p className="text-xs text-pixel-light mt-1">127 Meetups</p>
              <p className="text-xs text-pixel-green">All Time</p>
            </div>
            <div>
              <p className="text-2xl">⭐</p>
              <p className="text-xs text-pixel-light mt-1">4.8 Rating</p>
              <p className="text-xs text-pixel-pink">Community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  )
}
