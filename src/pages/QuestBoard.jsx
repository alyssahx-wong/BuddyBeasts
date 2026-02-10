import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import { useDataStore } from '../stores/dataStore'
import NavigationBar from '../components/NavigationBar'

const QUEST_TEMPLATES = [
  // Coffee quests
  {
    id: 'coffee_chat',
    title: 'Coffee Chat',
    description: 'Meet someone new over a warm drink at Koufu Level 2',
    duration: 20,
    minParticipants: 2,
    maxParticipants: 3,
    difficulty: 'easy',
    crystals: 15,
    icon: '☕',
    type: 'coffee_chat',
    category: 'coffee',
    location: 'Koufu Level 2',
    tags: ['casual', 'short', 'indoor']
  },
  {
    id: 'boba_break',
    title: 'Boba Break',
    description: 'Grab bubble tea together and chill at The Deck',
    duration: 25,
    minParticipants: 2,
    maxParticipants: 4,
    difficulty: 'easy',
    crystals: 20,
    icon: '🧋',
    type: 'coffee_chat',
    category: 'coffee',
    location: 'The Deck',
    tags: ['casual', 'fun', 'indoor']
  },
  {
    id: 'morning_brew',
    title: 'Morning Brew',
    description: 'Start the day right with coffee and good vibes at Starbucks',
    duration: 15,
    minParticipants: 2,
    maxParticipants: 3,
    difficulty: 'easy',
    crystals: 12,
    icon: '🌅',
    type: 'coffee_chat',
    category: 'coffee',
    location: 'Starbucks Campus',
    tags: ['morning', 'short', 'indoor']
  },
  // Study quests
  {
    id: 'study_jam',
    title: 'Study Jam',
    description: 'Group study session with focused work time at the Library',
    duration: 60,
    minParticipants: 3,
    maxParticipants: 5,
    difficulty: 'medium',
    crystals: 30,
    icon: '📚',
    type: 'study_jam',
    category: 'study',
    location: 'Library Level 3',
    tags: ['productive', 'quiet', 'indoor']
  },
  {
    id: 'homework_help',
    title: 'Homework Help',
    description: 'Pair up and tackle assignments together at Study Room B',
    duration: 45,
    minParticipants: 2,
    maxParticipants: 3,
    difficulty: 'medium',
    crystals: 25,
    icon: '✏️',
    type: 'study_jam',
    category: 'study',
    location: 'Study Room B',
    tags: ['productive', 'medium', 'indoor']
  },
  {
    id: 'exam_prep',
    title: 'Exam Prep',
    description: 'Intensive group revision session before exams',
    duration: 90,
    minParticipants: 3,
    maxParticipants: 6,
    difficulty: 'hard',
    crystals: 45,
    icon: '🎯',
    type: 'study_jam',
    category: 'study',
    location: 'Tutorial Room 5',
    tags: ['focused', 'long', 'indoor']
  },
  // Walk quests
  {
    id: 'sunset_walk',
    title: 'Sunset Walk',
    description: 'Evening stroll around the campus garden trail',
    duration: 30,
    minParticipants: 2,
    maxParticipants: 4,
    difficulty: 'easy',
    crystals: 20,
    icon: '🌇',
    type: 'sunset_walk',
    category: 'walk',
    location: 'Campus Garden',
    tags: ['outdoor', 'relaxing', 'evening']
  },
  {
    id: 'morning_jog',
    title: 'Morning Jog',
    description: 'Start fresh with a quick jog around the track',
    duration: 25,
    minParticipants: 2,
    maxParticipants: 5,
    difficulty: 'medium',
    crystals: 25,
    icon: '🏃',
    type: 'morning_workout',
    category: 'walk',
    location: 'Running Track',
    tags: ['fitness', 'morning', 'outdoor']
  },
  {
    id: 'photo_walk',
    title: 'Photo Walk',
    description: 'Explore campus and snap cool photos together',
    duration: 40,
    minParticipants: 2,
    maxParticipants: 4,
    difficulty: 'easy',
    crystals: 22,
    icon: '📸',
    type: 'sunset_walk',
    category: 'walk',
    location: 'Main Campus',
    tags: ['creative', 'outdoor', 'fun']
  },
  // Help quests
  {
    id: 'help_neighbor',
    title: 'Help a Neighbor',
    description: 'Quick task helping someone in the community',
    duration: 15,
    minParticipants: 2,
    maxParticipants: 2,
    difficulty: 'easy',
    crystals: 18,
    icon: '🤝',
    type: 'help_neighbor',
    category: 'help',
    location: 'Student Hub',
    tags: ['volunteer', 'short', 'community']
  },
  {
    id: 'campus_cleanup',
    title: 'Campus Cleanup',
    description: 'Pick up litter and make campus shine together',
    duration: 30,
    minParticipants: 3,
    maxParticipants: 8,
    difficulty: 'easy',
    crystals: 28,
    icon: '🧹',
    type: 'help_neighbor',
    category: 'help',
    location: 'Campus Grounds',
    tags: ['volunteer', 'outdoor', 'community']
  },
  {
    id: 'mentor_session',
    title: 'Mentor Session',
    description: 'Guide a junior student through their first week',
    duration: 45,
    minParticipants: 2,
    maxParticipants: 3,
    difficulty: 'medium',
    crystals: 35,
    icon: '🌟',
    type: 'help_neighbor',
    category: 'help',
    location: 'Welcome Center',
    tags: ['mentoring', 'social', 'indoor']
  },
]

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
  const { monster } = useMonsterStore()
  const { getRecommendations } = useDataStore()
  const [quests, setQuests] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const recs = getRecommendations()

    const activeQuests = QUEST_TEMPLATES.map((template, index) => ({
      ...template,
      instanceId: `quest_${template.id}_${Date.now()}_${index}`,
      currentParticipants: Math.floor(Math.random() * template.maxParticipants),
      isRecommended: recs.recommendedTypes.includes(template.type),
      startTime: null,
    }))

    setQuests(activeQuests)
  }, [])

  const filteredQuests = quests.filter(quest => {
    if (filter === 'all') return true
    return quest.category === filter
  })

  const handleJoinQuest = (quest) => {
    navigate(`/lobby/${quest.instanceId}`, { state: { quest } })
  }

  const spotsLeft = (quest) => quest.maxParticipants - quest.currentParticipants

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
        {/* Quest Cards */}
        <div className="space-y-4">
          {filteredQuests.map((quest) => (
            <div
              key={quest.instanceId}
              className="pixel-card p-5 transition-all hover:border-pixel-blue"
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

        {filteredQuests.length === 0 && (
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
