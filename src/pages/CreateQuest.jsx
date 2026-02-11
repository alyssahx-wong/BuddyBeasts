import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import NavigationBar from '../components/NavigationBar'
import api from '../api'

const QUEST_TYPES = [
  { id: 'coffee_chat', label: 'Coffee Chat', icon: '☕', description: 'Casual coffee conversation' },
  { id: 'study_jam', label: 'Study Jam', icon: '📚', description: 'Group study session' },
  { id: 'sunset_walk', label: 'Sunset Walk', icon: '🌅', description: 'Evening stroll' },
  { id: 'help_neighbor', label: 'Help a Neighbor', icon: '🤝', description: 'Community help task' },
  { id: 'lunch_crew', label: 'Lunch Crew', icon: '🍱', description: 'Grab lunch together' },
  { id: 'game_night', label: 'Game Night', icon: '🎮', description: 'Board/video game session' },
  { id: 'morning_workout', label: 'Morning Workout', icon: '💪', description: 'Group exercise' },
  { id: 'art_cafe', label: 'Art Café', icon: '🎨', description: 'Creative session' },
]

export default function CreateQuest() {
  const navigate = useNavigate()
  const { currentHub } = useAuthStore()
  const { monster, addCrystals } = useMonsterStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'coffee_chat',
    icon: '☕',
    location: currentHub?.location || '',
    duration: 30,
    difficulty: 'easy',
    crystals: 100,
  })

  const handleTypeChange = (type) => {
    const selectedType = QUEST_TYPES.find(t => t.id === type)
    setFormData({
      ...formData,
      type,
      icon: selectedType?.icon || '🎯',
      title: formData.title || selectedType?.label || '',
      description: formData.description || selectedType?.description || '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields')
      return
    }

    if (monster.crystals < 100) {
      setError('You need at least 100 crystals to create a quest')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Deduct 100 crystals
      await addCrystals(-100)

      // Create quest template
      const templateId = `custom_${Date.now()}`
      await api.post('/api/quests/templates', {
        id: templateId,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        minParticipants: 1,
        maxParticipants: 1,
        difficulty: formData.difficulty,
        crystals: formData.crystals,
        icon: formData.icon,
        type: formData.type,
        tags: ['custom', formData.type],
      })

      // Create quest instance
      const instance = await api.post('/api/quests/instances', {
        templateId,
        hubId: currentHub.id,
        location: formData.location,
      })

      // Navigate to lobby
      navigate(`/lobby/${instance.data.instanceId}`)
    } catch (err) {
      console.error('Failed to create quest:', err)
      setError(err.response?.data?.detail || 'Failed to create quest. Please try again.')
      // Refund crystals on error
      await addCrystals(100)
    } finally {
      setLoading(false)
    }
  }

  if (!currentHub) {
    navigate('/hub-selection')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/quests')}
              className="text-pixel-light hover:text-pixel-yellow"
            >
              <span className="text-2xl">←</span>
            </button>
            <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
              Create Quest
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-game text-pixel-light">
              Your Crystals:
            </span>
            <span className="text-sm font-pixel text-pixel-yellow">
              💎 {monster.crystals}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="pixel-card p-4 mb-6 bg-pixel-blue bg-opacity-20">
          <p className="text-xs text-pixel-light font-game">
            💡 Creating a quest costs 100 crystals. Set up for 1 participant for demo purposes.
          </p>
        </div>

        {error && (
          <div className="pixel-card p-4 mb-6 bg-pixel-pink bg-opacity-20">
            <p className="text-xs text-pixel-pink font-game">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quest Type */}
          <div className="pixel-card p-5">
            <label className="block font-pixel text-xs text-pixel-yellow mb-3">
              Quest Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {QUEST_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id)}
                  className={`pixel-card p-3 text-center transition-all ${
                    formData.type === type.id
                      ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-10'
                      : 'hover:border-pixel-blue'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-game text-pixel-light">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="pixel-card p-5">
            <label className="block font-pixel text-xs text-pixel-yellow mb-3">
              Quest Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Coffee at Central Cafe"
              className="w-full bg-pixel-dark border-2 border-pixel-purple rounded px-3 py-2 text-pixel-light font-game text-sm focus:border-pixel-blue outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="pixel-card p-5">
            <label className="block font-pixel text-xs text-pixel-yellow mb-3">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your quest..."
              rows={3}
              className="w-full bg-pixel-dark border-2 border-pixel-purple rounded px-3 py-2 text-pixel-light font-game text-sm focus:border-pixel-blue outline-none resize-none"
              required
            />
          </div>

          {/* Location */}
          <div className="pixel-card p-5">
            <label className="block font-pixel text-xs text-pixel-yellow mb-3">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Central Cafe, 123 Main St"
              className="w-full bg-pixel-dark border-2 border-pixel-purple rounded px-3 py-2 text-pixel-light font-game text-sm focus:border-pixel-blue outline-none"
            />
          </div>

          {/* Duration & Difficulty */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="pixel-card p-5">
              <label className="block font-pixel text-xs text-pixel-yellow mb-3">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                min="15"
                max="300"
                className="w-full bg-pixel-dark border-2 border-pixel-purple rounded px-3 py-2 text-pixel-light font-game text-sm focus:border-pixel-blue outline-none"
              />
            </div>

            <div className="pixel-card p-5">
              <label className="block font-pixel text-xs text-pixel-yellow mb-3">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-pixel-dark border-2 border-pixel-purple rounded px-3 py-2 text-pixel-light font-game text-sm focus:border-pixel-blue outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Reward Crystals */}
          <div className="pixel-card p-5">
            <label className="block font-pixel text-xs text-pixel-yellow mb-3">
              Reward Crystals
            </label>
            <input
              type="number"
              value={formData.crystals}
              onChange={(e) => setFormData({ ...formData, crystals: parseInt(e.target.value) || 100 })}
              min="50"
              max="500"
              className="w-full bg-pixel-dark border-2 border-pixel-purple rounded px-3 py-2 text-pixel-light font-game text-sm focus:border-pixel-blue outline-none"
            />
            <p className="text-xs text-pixel-blue font-game mt-2">
              Participants will earn this many crystals upon completion
            </p>
          </div>

          {/* Submit Button */}
          <div className="pixel-card p-5 bg-pixel-purple bg-opacity-20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-game text-pixel-light">Creation Cost:</span>
              <span className="text-sm font-pixel text-pixel-yellow">💎 100 Crystals</span>
            </div>
            <button
              type="submit"
              disabled={loading || monster.crystals < 100}
              className="pixel-button bg-pixel-green hover:bg-pixel-yellow text-pixel-dark w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Quest...' : 'Create Quest (100 💎)'}
            </button>
            {monster.crystals < 100 && (
              <p className="text-xs text-pixel-pink font-game mt-2 text-center">
                Not enough crystals! Complete more quests to earn crystals.
              </p>
            )}
          </div>
        </form>
      </div>

      <NavigationBar />
    </div>
  )
}
