import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useHubStore } from '../stores/hubStore'
import PixelMonster from '../components/PixelMonster'
import NavigationBar from '../components/NavigationBar'
import api from '../api'

export default function LivingHub() {
  const navigate = useNavigate()
  const { user, currentHub } = useAuthStore()
  const { onlineUsers, startPolling, stopPolling } = useHubStore()
  const [monster, setMonster] = useState({ evolution: 'baby', level: 1 })
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    if (!currentHub) {
      navigate('/hub-selection')
      return
    }

    // Fetch the player's own monster from the backend
    api.get('/api/monsters/me').then(({ data }) => {
      if (data && data.id) setMonster(data)
    }).catch(() => {})

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
              {onlineUsers.length + 1} monsters online
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Crystals + Level Bar */}
            <div className="text-right">
              <p className="text-xs font-cute text-pixel-yellow">
                {monster.crystals} <span className="text-pixel-light">Lv.{monster.level}</span>
              </p>
              <div className="w-28 h-2 bg-pixel-dark border border-pixel-purple rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-pixel-blue to-pixel-green transition-all duration-500 rounded-full"
                  style={{ width: `${monster.crystals % 100}%` }}
                />
              </div>
              <p className="text-[9px] font-game text-pixel-light mt-0.5">{monster.crystals % 100}/100 to next</p>
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
      </div>

      {/* Welcome Message */}
      {showWelcome && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 animate-float">
          <div className="pixel-card p-4 bg-pixel-green bg-opacity-90">
            <p className="font-game text-white text-center">
              Welcome to {currentHub.name}!
            </p>
          </div>
        </div>
      )}

      {/* Hub Scene */}
      <div className="relative max-w-4xl mx-auto mt-8 px-4">
        {/* Pixel Art Background */}
        <div className="pixel-card min-h-[400px] md:min-h-[500px] p-6 relative overflow-hidden" style={{background: "url('/fireside-bg.svg') center/cover no-repeat", imageRendering: 'pixelated'}}>

          {/* Player's Monster */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10">
            <div className="text-center">
              <PixelMonster
                evolution={monster.evolution}
                monsterType={monster.monsterType}
                size="large"
                animated={true}
                isPlayer={true}
              />
              <div className="mt-2 px-3 py-1.5 bg-pixel-pink rounded-lg inline-block border-2 border-pixel-light">
                <p className="font-cute text-sm text-white font-bold">
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
                    console.log('Interact with', onlineUser.name)
                  }}
                  className="text-center hover:scale-110 transition-transform"
                >
                  <PixelMonster
                    evolution={onlineUser.monster?.evolution || 'baby'}
                    monsterType={onlineUser.monster?.monsterType}
                    size="medium"
                    animated={true}
                  />
                  <div className="mt-1 bg-pixel-dark bg-opacity-80 px-2 py-1 rounded-lg text-xs font-cute text-pixel-light">
                    {onlineUser.name}
                  </div>
                </button>
              </div>
            )
          })}

          {/* Interaction Prompt */}
          <div className="absolute top-4 left-4 pixel-card p-3 bg-pixel-dark bg-opacity-80 max-w-xs">
            <p className="text-xs font-game text-pixel-light">
              Tap monsters to wave or join their quest lobby
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="pixel-card p-3">
            <p className="text-xl">🏆</p>
            <p className="font-cute text-sm text-pixel-light font-bold">{monster.questsCompleted}</p>
            <p className="text-[10px] font-cute text-pixel-blue">Quests Done</p>
          </div>
          <div className="pixel-card p-3">
            <p className="text-xl">🤝</p>
            <p className="font-cute text-sm text-pixel-light font-bold">{onlineUsers.length}</p>
            <p className="text-[10px] font-cute text-pixel-blue">Friends Met</p>
          </div>
          <div className="pixel-card p-3">
            <p className="text-xl">🔥</p>
            <p className="font-cute text-sm text-pixel-light font-bold">5 days</p>
            <p className="text-[10px] font-cute text-pixel-blue">Streak</p>
          </div>
        </div>

        {/* Active Quest */}
        <div className="mt-6">
          <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Active Quest</h3>
          <div className="pixel-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">☕</div>
              <div>
                <p className="font-cute text-sm text-pixel-light font-bold">Coffee Chat</p>
                <p className="text-[10px] font-cute text-pixel-blue">Starts in 15 min · 2/3 joined</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/quests')}
              className="px-3 py-2 bg-pixel-green rounded font-cute text-xs text-pixel-dark font-bold hover:bg-pixel-yellow transition-colors"
            >
              LOBBY
            </button>
          </div>
        </div>

        {/* Recommended For You */}
        <div className="mt-6">
          <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Recommended For You</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/quests')}
              className="pixel-card p-4 flex items-center gap-3 w-full text-left hover:border-pixel-blue transition-all"
            >
              <div className="text-2xl">🌇</div>
              <div>
                <p className="font-cute text-sm text-pixel-light font-bold">Sunset Walk</p>
                <p className="text-[10px] font-cute text-pixel-blue">Today 6pm · 3 spots</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/quests')}
              className="pixel-card p-4 flex items-center gap-3 w-full text-left hover:border-pixel-blue transition-all"
            >
              <div className="text-2xl">📚</div>
              <div>
                <p className="font-cute text-sm text-pixel-light font-bold">Study Jam</p>
                <p className="text-[10px] font-cute text-pixel-blue">Tomorrow 2pm · 2 spots</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  )
}
