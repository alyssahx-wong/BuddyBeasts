import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import { useDataStore } from '../stores/dataStore'
import NavigationBar from '../components/NavigationBar'

// Quest templates
const QUEST_TEMPLATES = [
  {
    id: 'coffee_chat',
    title: 'Coffee Chat',
    description: 'Meet for a casual 20-min coffee conversation',
    duration: 20,
    minParticipants: 2,
    maxParticipants: 3,
    difficulty: 'easy',
    crystals: 50,
    icon: '☕',
    type: 'coffee_chat',
    tags: ['casual', 'short', 'indoor']
  },
  {
    id: 'study_jam',
    title: 'Study Jam',
    description: 'Group study session with focused work time',
    duration: 60,
    minParticipants: 3,
    maxParticipants: 5,
    difficulty: 'medium',
    crystals: 100,
    icon: '📚',
    type: 'study_jam',
    tags: ['productive', 'medium', 'indoor']
  },
  {
    id: 'sunset_walk',
    title: 'Sunset Walk',
    description: 'Evening stroll around the neighborhood',
    duration: 30,
    minParticipants: 2,
    maxParticipants: 4,
    difficulty: 'easy',
    crystals: 75,
    icon: '🌅',
    type: 'sunset_walk',
    tags: ['outdoor', 'relaxing', 'evening']
  },
  {
    id: 'help_neighbor',
    title: 'Help a Neighbor',
    description: 'Quick task helping someone in the community',
    duration: 15,
    minParticipants: 2,
    maxParticipants: 2,
    difficulty: 'easy',
    crystals: 60,
    icon: '🤝',
    type: 'help_neighbor',
    tags: ['volunteer', 'short', 'community']
  },
  {
    id: 'lunch_crew',
    title: 'Lunch Crew',
    description: 'Grab lunch together and share stories',
    duration: 45,
    minParticipants: 3,
    maxParticipants: 6,
    difficulty: 'easy',
    crystals: 80,
    icon: '🍱',
    type: 'lunch_crew',
    tags: ['food', 'social', 'medium']
  },
  {
    id: 'game_night',
    title: 'Game Night Setup',
    description: 'Organize a board game or video game session',
    duration: 90,
    minParticipants: 4,
    maxParticipants: 8,
    difficulty: 'hard',
    crystals: 150,
    icon: '🎮',
    type: 'game_night',
    tags: ['fun', 'long', 'indoor']
  },
  {
    id: 'morning_workout',
    title: 'Morning Workout',
    description: 'Start the day with group exercise',
    duration: 40,
    minParticipants: 2,
    maxParticipants: 6,
    difficulty: 'medium',
    crystals: 90,
    icon: '💪',
    type: 'morning_workout',
    tags: ['fitness', 'morning', 'outdoor']
  },
  {
    id: 'art_cafe',
    title: 'Art Café',
    description: 'Creative session with drawing or crafts',
    duration: 60,
    minParticipants: 3,
    maxParticipants: 5,
    difficulty: 'medium',
    crystals: 110,
    icon: '🎨',
    type: 'art_cafe',
    tags: ['creative', 'indoor', 'relaxing']
  },
]

export default function QuestBoard() {
  const navigate = useNavigate()
  const { currentHub } = useAuthStore()
  const { monster } = useMonsterStore()
  const { getRecommendations } = useDataStore()
  const [quests, setQuests] = useState([])
  const [filter, setFilter] = useState('all') // all, recommended, available
  const [recommendations, setRecommendations] = useState(null)

  useEffect(() => {
    // Get personalized recommendations
    const recs = getRecommendations()
    setRecommendations(recs)

    // Generate active quests with participants
    const activeQuests = QUEST_TEMPLATES.map((template, index) => ({
      ...template,
      instanceId: `quest_${template.id}_${Date.now()}_${index}`,
      currentParticipants: Math.floor(Math.random() * (template.minParticipants + 1)),
      isRecommended: recs.recommendedTypes.includes(template.type),
      startTime: null,
      location: 'Hub Central Plaza', // Mock location
    }))

    setQuests(activeQuests)
  }, [])

  const filteredQuests = quests.filter(quest => {
    if (filter === 'recommended') return quest.isRecommended
    if (filter === 'available') return quest.currentParticipants < quest.maxParticipants
    return true
  })

  const handleJoinQuest = (quest) => {
    navigate(`/lobby/${quest.instanceId}`, { state: { quest } })
  }

  const difficultyColors = {
    easy: 'text-pixel-green',
    medium: 'text-pixel-yellow',
    hard: 'text-pixel-pink'
  }

  if (!currentHub) {
    navigate('/hub-selection')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/hub')}
              className="text-pixel-light hover:text-pixel-yellow"
            >
              <span className="text-2xl">←</span>
            </button>
            <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
              Quest Board
            </h1>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'recommended', 'available'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`
                  px-4 py-2 rounded font-game text-xs whitespace-nowrap
                  ${filter === filterType
                    ? 'bg-pixel-yellow text-pixel-dark'
                    : 'bg-pixel-purple text-pixel-light hover:bg-pixel-blue'
                  }
                `}
              >
                {filterType === 'all' && '🌟 All Quests'}
                {filterType === 'recommended' && '✨ For You'}
                {filterType === 'available' && '🎯 Open Now'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Recommendations Banner */}
        {recommendations && filter === 'all' && (
          <div className="pixel-card p-4 mb-6 bg-pixel-blue bg-opacity-20">
            <h3 className="font-pixel text-xs text-pixel-yellow mb-2">
              📊 Your Profile
            </h3>
            <div className="font-game text-sm text-pixel-light space-y-1">
              <p>💎 Crystals: {monster.crystals}</p>
              <p>🎯 Quests Completed: {monster.questsCompleted}</p>
              <p>👥 Preferred Group Size: {recommendations.recommendedGroupSize}</p>
              <p>⏰ Best Time: {recommendations.bestTimeOfDay}</p>
            </div>
          </div>
        )}

        {/* Quest Cards */}
        <div className="space-y-4">
          {filteredQuests.map((quest) => (
            <div
              key={quest.instanceId}
              className={`
                pixel-card p-5 transition-all hover:border-pixel-blue
                ${quest.isRecommended ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-5' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{quest.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-pixel text-sm text-pixel-light">
                        {quest.title}
                      </h3>
                      {quest.isRecommended && (
                        <span className="text-xs px-2 py-1 bg-pixel-yellow text-pixel-dark rounded font-game">
                          FOR YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-pixel-blue font-game">
                      {quest.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quest Details */}
              <div className="flex flex-wrap gap-2 mb-3 text-xs font-game">
                <span className="text-pixel-green">
                  ⏱️ {quest.duration} min
                </span>
                <span className="text-pixel-pink">
                  👥 {quest.currentParticipants}/{quest.maxParticipants}
                </span>
                <span className={difficultyColors[quest.difficulty]}>
                  ⭐ {quest.difficulty}
                </span>
                <span className="text-pixel-yellow">
                  💎 {quest.crystals}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quest.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-pixel-purple bg-opacity-30 text-pixel-light text-xs rounded font-game"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Location */}
              <p className="text-xs text-pixel-blue font-game mb-4">
                📍 {quest.location}
              </p>

              {/* Action Button */}
              <button
                onClick={() => handleJoinQuest(quest)}
                className="pixel-button bg-pixel-green hover:bg-pixel-yellow text-pixel-dark w-full py-3 text-sm"
                disabled={quest.currentParticipants >= quest.maxParticipants}
              >
                {quest.currentParticipants >= quest.maxParticipants
                  ? '🔒 Quest Full'
                  : '🎯 Join Quest'
                }
              </button>
            </div>
          ))}
        </div>

        {filteredQuests.length === 0 && (
          <div className="pixel-card p-8 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-game text-pixel-light">
              No quests available with this filter
            </p>
            <button
              onClick={() => setFilter('all')}
              className="pixel-button bg-pixel-blue text-white mt-4"
            >
              View All Quests
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 pixel-card p-4 bg-pixel-purple bg-opacity-20">
          <p className="text-xs text-pixel-light font-game text-center">
            💡 Complete quests with others to earn more crystals and evolve your monster!
          </p>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}
