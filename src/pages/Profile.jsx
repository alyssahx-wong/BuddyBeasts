import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import { useDataStore } from '../stores/dataStore'
import PixelMonster from '../components/PixelMonster'
import NavigationBar from '../components/NavigationBar'

export default function Profile() {
  const navigate = useNavigate()
  const { user, currentHub, logout } = useAuthStore()
  const { monster, evolveMonster } = useMonsterStore()
  const { questHistory, belongingScores, trackBelongingScore } = useDataStore()
  const [showBelongingPrompt, setShowBelongingPrompt] = useState(false)
  const [belongingScore, setBelongingScore] = useState(5)

  const completedQuests = questHistory.filter(q => q.status === 'completed')
  const successRate = questHistory.length > 0 
    ? Math.round((completedQuests.length / questHistory.length) * 100)
    : 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleEvolutionCheck = () => {
    if (monster.crystals >= monster.level * 100) {
      // Evolution logic
      let newEvolution = monster.evolution
      let newTraits = []

      if (monster.level >= 10 && monster.evolution === 'baby') {
        newEvolution = 'teen'
        newTraits = ['Growing']
      } else if (monster.level >= 20 && monster.evolution === 'teen') {
        // Check for special evolutions based on quest history
        const groupQuestRatio = completedQuests.filter(q => q.groupSize > 2).length / completedQuests.length
        if (groupQuestRatio > 0.7) {
          newEvolution = 'leader'
          newTraits = ['Social Leader']
        } else if (completedQuests.filter(q => q.questType === 'help_neighbor').length > 5) {
          newEvolution = 'support'
          newTraits = ['Community Helper']
        } else {
          newEvolution = 'adult'
          newTraits = ['Mature']
        }
      }

      if (newEvolution !== monster.evolution) {
        evolveMonster(newEvolution, newTraits)
        alert(`🎉 Your monster evolved into a ${newEvolution}!`)
      }
    }
  }

  const handleBelongingSubmit = () => {
    trackBelongingScore(belongingScore)
    setShowBelongingPrompt(false)
    alert('Thank you for your feedback! 💙')
  }

  const averageBelonging = belongingScores.length > 0
    ? (belongingScores.reduce((sum, s) => sum + s.score, 0) / belongingScores.length).toFixed(1)
    : 'N/A'

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
            Profile
          </h1>
          <button
            onClick={handleLogout}
            className="text-pixel-pink hover:text-pixel-light text-sm font-game"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* User Card */}
        <div className="pixel-card p-6 mb-6 bg-gradient-to-br from-pixel-blue to-pixel-purple bg-opacity-20">
          <div className="flex items-center gap-4 mb-4">
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name}
                className="w-16 h-16 rounded-full border-4 border-pixel-yellow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-pixel-yellow bg-pixel-blue flex items-center justify-center">
                <span className="font-pixel text-2xl text-white">{user.name[0]}</span>
              </div>
            )}
            <div>
              <h2 className="font-pixel text-base text-pixel-light">{user.name}</h2>
              <p className="text-xs text-pixel-blue font-game">{user.email}</p>
              <p className="text-xs text-pixel-green font-game mt-1">
                📍 {currentHub?.name || 'No hub selected'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/hub-selection')}
            className="w-full pixel-button bg-pixel-purple hover:bg-pixel-blue text-white py-2 text-xs"
          >
            Change Hub
          </button>
        </div>

        {/* Monster Card */}
        <div className="pixel-card p-6 mb-6 text-center">
          <h3 className="font-pixel text-sm text-pixel-yellow mb-4">Your Monster</h3>
          <div className="mb-4">
            <PixelMonster 
              evolution={monster.evolution}
              size="large"
              animated={true}
              isPlayer={true}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm font-game mb-4">
            <div>
              <p className="text-pixel-blue">Evolution</p>
              <p className="text-pixel-light capitalize">{monster.evolution}</p>
            </div>
            <div>
              <p className="text-pixel-blue">Level</p>
              <p className="text-pixel-light">{monster.level}</p>
            </div>
            <div>
              <p className="text-pixel-blue">Crystals</p>
              <p className="text-pixel-yellow">💎 {monster.crystals}</p>
            </div>
            <div>
              <p className="text-pixel-blue">Social Score</p>
              <p className="text-pixel-green">⭐ {monster.socialScore}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-game text-pixel-light mb-2">
              <span>Next Level</span>
              <span>{monster.crystals % 100} / 100</span>
            </div>
            <div className="w-full h-4 bg-pixel-dark border-2 border-pixel-purple rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pixel-blue to-pixel-green transition-all duration-500"
                style={{ width: `${(monster.crystals % 100)}%` }}
              />
            </div>
          </div>

          {/* Traits */}
          {monster.traits.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-pixel-blue font-game mb-2">Traits</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {monster.traits.map((trait, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-pixel-yellow text-pixel-dark text-xs rounded font-game"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleEvolutionCheck}
            disabled={monster.crystals < monster.level * 100}
            className="pixel-button bg-pixel-pink hover:bg-pixel-yellow text-white w-full py-3"
          >
            {monster.crystals >= monster.level * 100 ? '✨ Check Evolution' : '🔒 Need More Crystals'}
          </button>
        </div>

        {/* Stats Card */}
        <div className="pixel-card p-6 mb-6">
          <h3 className="font-pixel text-sm text-pixel-yellow mb-4">Quest Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-center font-game">
            <div className="p-3 bg-pixel-purple bg-opacity-20 rounded">
              <p className="text-3xl mb-1">🎯</p>
              <p className="text-2xl text-pixel-light">{monster.questsCompleted}</p>
              <p className="text-xs text-pixel-blue mt-1">Completed</p>
            </div>
            <div className="p-3 bg-pixel-purple bg-opacity-20 rounded">
              <p className="text-3xl mb-1">✓</p>
              <p className="text-2xl text-pixel-green">{successRate}%</p>
              <p className="text-xs text-pixel-blue mt-1">Success Rate</p>
            </div>
            <div className="p-3 bg-pixel-purple bg-opacity-20 rounded">
              <p className="text-3xl mb-1">👥</p>
              <p className="text-2xl text-pixel-light">{completedQuests.filter(q => q.groupSize > 1).length}</p>
              <p className="text-xs text-pixel-blue mt-1">Group Quests</p>
            </div>
            <div className="p-3 bg-pixel-purple bg-opacity-20 rounded">
              <p className="text-3xl mb-1">💙</p>
              <p className="text-2xl text-pixel-pink">{averageBelonging}</p>
              <p className="text-xs text-pixel-blue mt-1">Belonging</p>
            </div>
          </div>
        </div>

        {/* Preferred Quest Types */}
        {Object.keys(monster.preferredQuestTypes).length > 0 && (
          <div className="pixel-card p-6 mb-6">
            <h3 className="font-pixel text-sm text-pixel-yellow mb-4">Favorite Quest Types</h3>
            <div className="space-y-2">
              {Object.entries(monster.preferredQuestTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center p-2 bg-pixel-purple bg-opacity-20 rounded">
                    <span className="text-sm font-game text-pixel-light capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-game text-pixel-blue">
                      {count} completed
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Belonging Score Prompt */}
        {!showBelongingPrompt ? (
          <button
            onClick={() => setShowBelongingPrompt(true)}
            className="pixel-button bg-pixel-blue hover:bg-pixel-green text-white w-full py-4 mb-6"
          >
            💙 Rate Your Belonging (1-Tap Survey)
          </button>
        ) : (
          <div className="pixel-card p-6 mb-6 bg-pixel-blue bg-opacity-20">
            <h3 className="font-pixel text-sm text-pixel-yellow mb-3 text-center">
              How connected do you feel?
            </h3>
            <p className="text-xs font-game text-pixel-light text-center mb-4">
              1 = Not at all, 10 = Very connected
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => setBelongingScore(score)}
                  className={`
                    w-8 h-8 rounded font-game text-sm
                    ${belongingScore === score
                      ? 'bg-pixel-yellow text-pixel-dark'
                      : 'bg-pixel-purple text-pixel-light hover:bg-pixel-pink'
                    }
                  `}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBelongingSubmit}
                className="pixel-button bg-pixel-green text-white flex-1 py-3"
              >
                Submit
              </button>
              <button
                onClick={() => setShowBelongingPrompt(false)}
                className="pixel-button bg-pixel-purple text-white flex-1 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* App Info */}
        <div className="pixel-card p-4 bg-pixel-purple bg-opacity-20 text-center">
          <p className="text-xs text-pixel-light font-game mb-2">
            KarmaLoop v0.1.0 - Built for Building Belonging
          </p>
          <p className="text-xs text-pixel-blue font-game">
            🎮 Turning local connections into pixel adventures
          </p>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}
