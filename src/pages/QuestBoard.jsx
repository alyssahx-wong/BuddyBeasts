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
  const { currentHub, user } = useAuthStore()
  const { getRecommendations } = useDataStore()
  const [quests, setQuests] = useState([])
  const [monster, setMonster] = useState({ crystals: 0, coins: 0, level: 1, questsCompleted: 0 })
  const [filter, setFilter] = useState('all')
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentHub) {
      navigate('/hub-selection')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        console.log('Fetching quests for hub:', currentHub.id)
        
        // Fetch quest instances from backend
        const instancesRes = await api.get('/api/quests/instances', { 
          params: { hub_id: currentHub.id } 
        })
        
        console.log('Quest instances response:', instancesRes.data)
        
        // Try to fetch monster data
        try {
          const monsterRes = await api.get('/api/monsters/me')
          if (monsterRes.data && monsterRes.data.id) {
            setMonster(monsterRes.data)
          }
        } catch (err) {
          console.log('Could not fetch monster data:', err)
        }

        // Get recommendations
        const recs = getRecommendations()
        setRecommendations(recs)

        // Mark which quests are recommended
        const instances = (instancesRes.data || []).map(q => ({
          ...q,
          isRecommended: recs?.recommendedTypes?.includes(q.type) || false,
        }))
        
        console.log('Processed quests:', instances)
        setQuests(instances)
      } catch (err) {
        console.error('Failed to load quest board:', err)
        console.error('Error details:', err.response?.data || err.message)
        setQuests([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentHub, navigate, getRecommendations])

  const filteredQuests = quests.filter(quest => {
    if (filter === 'all') return true
    // Match filter with quest type or tags
    const typeMatch = quest.type?.toLowerCase().includes(filter.toLowerCase())
    const tagMatch = quest.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    return typeMatch || tagMatch
  })

  const handleJoinQuest = async (quest) => {
    try {
      const instanceId = quest.instanceId

      if (!instanceId) {
        console.error('No instance ID found for quest')
        return
      }

      // Join the existing instance
      await api.post(`/api/quests/instances/${instanceId}/join`)

      // Navigate to lobby
      navigate(`/lobby/${instanceId}`)
    } catch (err) {
      console.error('Failed to join quest:', err)
      alert('Could not join quest. Please try again.')
    }
  }

  const handleDeleteQuest = async (quest) => {
    if (!confirm(`Are you sure you want to delete "${quest.title}"?`)) {
      return
    }

    try {
      await api.delete(`/api/quests/instances/${quest.instanceId}`)

      // Refresh quest list
      const instancesRes = await api.get('/api/quests/instances', {
        params: { hub_id: currentHub.id }
      })
      const instances = (instancesRes.data || []).map(q => ({
        ...q,
        isRecommended: recommendations?.recommendedTypes?.includes(q.type) || false,
      }))
      setQuests(instances)

      alert('Quest deleted successfully')
    } catch (err) {
      console.error('Failed to delete quest:', err)
      alert(err.response?.data?.detail || 'Could not delete quest. Please try again.')
    }
  }

  const spotsLeft = (quest) => quest.maxParticipants - quest.currentParticipants

  if (!currentHub) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
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
            <button
              onClick={() => {
                if (monster.level < 4) {
                  alert(`Level ${monster.level} - Create Unlocks at Level 4`)
                } else {
                  navigate('/quests/create')
                }
              }}
              className={`pixel-button bg-pixel-green hover:bg-pixel-yellow text-pixel-dark px-3 py-2 text-xs ${
                monster.level < 4 ? 'opacity-40' : ''
              }`}
            >
              + Create
            </button>
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

        {loading ? (
          <div className="pixel-card p-8 text-center">
            <p className="font-game text-pixel-light animate-pulse">Loading quests...</p>
          </div>
        ) : (
          <>
        {/* Quest Cards */}
        <div className="space-y-4">
          {filteredQuests.length > 0 && filteredQuests.map((quest) => (
            <div
              key={quest.instanceId || quest.id}
              className={`
                pixel-card p-5 transition-all hover:border-pixel-blue
                ${quest.isRecommended ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-5' : ''}
              `}
            >
              {/* Creator & Delete Button */}
              <div className="flex items-center justify-between mb-3">
                {quest.creatorName && (
                  <p className="text-xs text-pixel-green font-game">
                    👤 Created by: {quest.creatorName}
                  </p>
                )}
                {quest.creatorUserId === user?.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteQuest(quest)
                    }}
                    className="pixel-button bg-pixel-pink hover:bg-red-600 text-white px-3 py-1 text-xs"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

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
                <span className={spotsLeft(quest) <= 1 ? 'text-pixel-pink' : 'text-pixel-green'}>
                  {spotsLeft(quest)} spots left
                </span>
              </div>

              {/* Rewards row */}
              <div className="flex flex-wrap gap-3 mb-3 text-xs font-game">
                <span className="text-pixel-yellow">
                  💎 {quest.maxParticipants * 10} Crystals
                </span>
                <span className="text-pixel-green">
                  🪙 {quest.maxParticipants * 100} Coins
                </span>
              </div>

              {/* Location & Start Time */}
              <div className="space-y-1 mb-4">
                <p className="text-xs text-pixel-blue font-game">
                  📍 {quest.location}
                </p>
                {quest.startTime && (
                  <p className="text-xs text-pixel-yellow font-game">
                    ⏰ Starts: {new Date(quest.startTime).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                )}
              </div>

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

        {filteredQuests.length === 0 && (
          <div className="pixel-card p-8 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-game text-pixel-light mb-2">
              No quests available {filter !== 'all' ? 'in this category' : 'right now'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="pixel-button bg-pixel-blue text-white mt-4"
              >
                View All Quests
              </button>
            )}
          </div>
        )}
          </>
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
