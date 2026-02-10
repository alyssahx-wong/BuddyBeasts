import React, { useEffect, useState, useRef } from 'react'
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
  const [monsterPosition, setMonsterPosition] = useState({ x: 50, y: 60 })
  const [isMoving, setIsMoving] = useState(false)
  const hubSceneRef = useRef(null)

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

  const handleSceneClick = (e) => {
    if (!hubSceneRef.current) return

    const rect = hubSceneRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Keep monster within bounds
    const boundedX = Math.max(5, Math.min(95, x))
    const boundedY = Math.max(15, Math.min(85, y))

    setMonsterPosition({ x: boundedX, y: boundedY })
    setIsMoving(true)
    setTimeout(() => setIsMoving(false), 500)
  }

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
        {/* Enhanced Pixel Art Background with Click Interaction */}
        <div
          ref={hubSceneRef}
          onClick={handleSceneClick}
          className="pixel-card min-h-[500px] md:min-h-[600px] relative overflow-hidden cursor-pointer"
          style={{
            background: 'linear-gradient(to bottom, #87CEEB 0%, #87CEEB 60%, #90EE90 60%, #90EE90 100%)',
            imageRendering: 'pixelated',
          }}
        >
          {/* Sky Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Sun */}
            <div className="absolute top-8 right-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg animate-pulse-slow" />
            
            {/* Clouds */}
            <div className="absolute top-12 left-20 text-6xl opacity-80 animate-float">☁️</div>
            <div className="absolute top-24 right-32 text-5xl opacity-70 animate-float" style={{ animationDelay: '1s' }}>☁️</div>
            <div className="absolute top-32 left-1/3 text-4xl opacity-60 animate-float" style={{ animationDelay: '2s' }}>☁️</div>
          </div>

          {/* Background Decorations */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            {/* Trees */}
            <div className="absolute bottom-16 left-8 text-7xl transform scale-y-110">🌳</div>
            <div className="absolute bottom-16 right-12 text-7xl transform scale-y-110">🌳</div>
            <div className="absolute bottom-20 left-32 text-5xl opacity-80">🌲</div>
            <div className="absolute bottom-20 right-40 text-6xl opacity-75">🌲</div>
            
            {/* Flowers and Grass */}
            <div className="absolute bottom-24 left-1/4 text-3xl">🌸</div>
            <div className="absolute bottom-28 right-1/3 text-3xl">🌼</div>
            <div className="absolute bottom-24 left-1/2 text-2xl">🌺</div>
            <div className="absolute bottom-20 left-1/3 text-2xl">🌻</div>
          </div>

          {/* Ground Pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
            <div
              className="w-full h-full opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 16px)',
              }}
            />
          </div>

          {/* Player's Monster */}
          <div
            className="absolute transition-all duration-700 ease-out z-20"
            style={{
              left: `${monsterPosition.x}%`,
              top: `${monsterPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="text-center pointer-events-none">
              <div className={`${isMoving ? 'animate-bounce' : ''}`}>
                <PixelMonster 
                  evolution={monster.evolution} 
                  size="large"
                  animated={true}
                  isPlayer={true}
                  equippedItems={monster.equippedItems}
                />
              </div>
              <div className="mt-2 pixel-card p-2 bg-pixel-yellow inline-block shadow-lg">
                <p className="font-pixel text-xs text-pixel-dark whitespace-nowrap">
                  {user.name} (You)
                </p>
              </div>
            </div>
          </div>

          {/* Other Online Monsters */}
          {onlineUsers.slice(0, 6).map((onlineUser, index) => {
            const positions = [
              { top: '30%', left: '20%' },
              { top: '45%', left: '75%' },
              { top: '55%', left: '35%' },
              { top: '35%', left: '65%' },
              { top: '60%', left: '15%' },
              { top: '40%', left: '85%' },
            ]
            const pos = positions[index % positions.length]

            return (
              <div
                key={onlineUser.id}
                className="absolute transition-all duration-1000 z-10"
                style={pos}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Interact with', onlineUser.name)
                  }}
                  className="text-center hover:scale-110 transition-transform pointer-events-auto"
                >
                  <div className="animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    <PixelMonster 
                      evolution={onlineUser.monster?.evolution || 'baby'} 
                      size="medium"
                      animated={true}
                    />
                  </div>
                  <div className="mt-1 bg-pixel-dark bg-opacity-90 px-2 py-1 rounded text-xs font-game text-white whitespace-nowrap shadow-md">
                    {onlineUser.name}
                  </div>
                </button>
              </div>
            )
          })}

          {/* Interaction Prompt */}
          <div className="absolute top-4 left-4 pixel-card p-3 bg-pixel-dark bg-opacity-90 max-w-xs shadow-lg z-30 pointer-events-none">
            <p className="text-xs font-game text-pixel-light">
              💡 Click anywhere to move your monster!
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
