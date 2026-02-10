import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import NavigationBar from '../components/NavigationBar'
import api from '../api'

const CATEGORIES = [
  { id: 'all',    label: 'All',    icon: '🌟' },
  { id: 'coffee', label: 'Coffee', icon: '☕' },
  { id: 'study',  label: 'Study',  icon: '📚' },
  { id: 'walk',   label: 'Walk',   icon: '🚶' },
  { id: 'help',   label: 'Help',   icon: '🤝' },
]

export default function QuestBoard() {
  const navigate = useNavigate()
  const { currentHub } = useAuthStore()
  const { getRecommendations } = useDataStore()
  const [quests, setQuests] = useState([])
  const [monster, setMonster] = useState({ crystals: 0, questsCompleted: 0 })
  const [filter, setFilter] = useState('all')
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentHub) {
      navigate('/hub-selection')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch recommendations, instances, and monster in parallel
        const [recs, instancesRes, monsterRes] = await Promise.all([
          getRecommendations(),
          api.get('/api/quests/instances', { params: { hub_id: currentHub.id } }),
          api.get('/api/monsters/me'),
        ])

        setRecommendations(recs)
        if (monsterRes.data && monsterRes.data.id) setMonster(monsterRes.data)

        // Mark which quests are recommended
        const instances = instancesRes.data.map(q => ({
          ...q,
          isRecommended: recs.recommendedTypes.includes(q.type),
        }))
        setQuests(instances)
      } catch (err) {
        console.error('Failed to load quest board:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentHub])

  const filteredQuests = quests.filter(quest => {
    if (filter === 'all') return true
    return quest.category === filter
  })

  const handleJoinQuest = async (quest) => {
    try {
      // Create a new instance from the template, or join existing instance
      let instanceId = quest.instanceId
      if (!instanceId) {
        // This is a template — create a new instance
        const { data } = await api.post('/api/quests/instances', {
          templateId: quest.id,
          hubId: currentHub.id,
        })
        instanceId = data.instanceId
      } else {
        // Join the existing instance
        await api.post(`/api/quests/instances/${instanceId}/join`)
      }
      navigate(`/lobby/${instanceId}`)
    } catch (err) {
      console.error('Failed to join quest:', err)
    }
  }

  const spotsLeft = (quest) => quest.maxParticipants - quest.currentParticipants

  if (!currentHub) return null

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

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`
                  px-4 py-2 rounded-lg font-cute text-xs whitespace-nowrap transition-all
                  ${filter === cat.id
                    ? 'bg-pixel-yellow text-pixel-dark font-bold'
                    : 'bg-pixel-purple bg-opacity-50 text-pixel-light hover:bg-pixel-blue'
                  }
                `}
              >
                {cat.icon} {cat.label}
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

        {loading && (
          <div className="pixel-card p-8 text-center">
            <p className="font-game text-pixel-light animate-pulse">Loading quests...</p>
          </div>
        )}

        {/* Quest Cards */}
        <div className="space-y-4">
          {filteredQuests.map((quest) => (
            <div
              key={quest.instanceId || quest.id}
              className={`
                pixel-card p-5 transition-all hover:border-pixel-blue
                ${quest.isRecommended ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-5' : ''}
              `}
            >
              {/* Title row */}
              <div className="flex items-start gap-3 mb-2">
                <div className="text-3xl">{quest.icon}</div>
                <div className="flex-1">
                  <h3 className="font-pixel text-sm text-pixel-light">
                    {quest.title}
                  </h3>
                  <p className="text-xs text-pixel-blue font-game mt-1">
                    {quest.description}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 mb-3 text-xs font-cute text-pixel-light">
                <span>
                  🕐 {quest.duration}mins
                </span>
                <span>
                  👥 {quest.minParticipants}-{quest.maxParticipants} people
                </span>
                <span className="text-pixel-yellow">
                  💎 {quest.crystals}
                </span>
                <span className={spotsLeft(quest) <= 1 ? 'text-pixel-pink' : 'text-pixel-green'}>
                  {spotsLeft(quest)} spots left
                </span>
              </div>

              {/* Location */}
              <p className="text-xs text-pixel-blue font-game mb-4">
                📍 {quest.location}
              </p>

              {/* Join Button */}
              <button
                onClick={() => handleJoinQuest(quest)}
                className="pixel-button bg-pixel-green hover:bg-pixel-yellow text-pixel-dark w-full py-3 text-sm"
                disabled={spotsLeft(quest) <= 0}
              >
                {spotsLeft(quest) <= 0
                  ? '🔒 Quest Full'
                  : '🎯 Join Quest'
                }
              </button>
            </div>
          ))}
        </div>

        {!loading && filteredQuests.length === 0 && (
          <div className="pixel-card p-8 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-game text-pixel-light">
              No quests available in this category
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
