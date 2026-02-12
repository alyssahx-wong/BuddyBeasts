import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'

export default function PersonalityQuiz() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchMonster, saveTraitScores } = useMonsterStore()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState({
    curious: null,
    social: null,
    creative: null,
    adventurous: null,
    calm: null,
  })
  const [quizComplete, setQuizComplete] = useState(false)
  const [assignedMonster, setAssignedMonster] = useState(null)
  const [loading, setLoading] = useState(true)

  const MONSTERS = [
    { id: 1, name: 'Spark', traits: ['adventurous', 'creative'] },
    { id: 2, name: 'Whisper', traits: ['calm', 'creative'] },
    { id: 3, name: 'Bounce', traits: ['social', 'adventurous'] },
    { id: 4, name: 'Echo', traits: ['calm', 'social'] },
    { id: 5, name: 'Flame', traits: ['adventurous', 'adventurous'] },
    { id: 6, name: 'Drift', traits: ['calm', 'calm'] },
    { id: 7, name: 'Pulse', traits: ['creative', 'creative'] },
    { id: 8, name: 'Nova', traits: ['social', 'social'] },
    { id: 9, name: 'Ember', traits: ['adventurous', 'creative'] },
    { id: 10, name: 'Glow', traits: ['calm', 'creative'] },
    { id: 11, name: 'Dash', traits: ['social', 'adventurous'] },
    { id: 12, name: 'Seraph', traits: ['calm', 'social'] },
    { id: 13, name: 'Blaze', traits: ['adventurous', 'adventurous'] },
    { id: 14, name: 'Hush', traits: ['calm', 'calm'] },
    { id: 15, name: 'Twirl', traits: ['creative', 'creative'] },
    { id: 16, name: 'Zest', traits: ['social', 'social'] },
    { id: 17, name: 'Frost', traits: ['calm', 'adventurous'] },
    { id: 18, name: 'Zephyr', traits: ['creative', 'social'] },
  ]

  const TRAIT_KEYS = ['curious', 'social', 'creative', 'adventurous', 'calm']

  const QUIZ_QUESTIONS = [
    {
      trait: 'curious',
      question: 'How eager are you to explore new ideas and learn new things?',
      lowLabel: 'Not very curious',
      highLabel: 'Extremely curious',
    },
    {
      trait: 'social',
      question: 'How much do you enjoy being around others and meeting new people?',
      lowLabel: 'Prefer solitude',
      highLabel: 'Love socializing',
    },
    {
      trait: 'creative',
      question: 'How often do you express yourself through art, ideas, or imagination?',
      lowLabel: 'Rarely creative',
      highLabel: 'Always creating',
    },
    {
      trait: 'adventurous',
      question: 'How willing are you to try risky or unfamiliar experiences?',
      lowLabel: 'Play it safe',
      highLabel: 'Thrill seeker',
    },
    {
      trait: 'calm',
      question: 'How easily do you find peace and stay relaxed under pressure?',
      lowLabel: 'Often stressed',
      highLabel: 'Very calm',
    },
  ]

  // On mount: check if returning user already has trait scores
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const data = await fetchMonster()
        if (data && data.traitScores) {
          navigate('/hub-selection', { replace: true })
          return
        }
      } catch {
        // continue to quiz
      }
      setLoading(false)
    }
    checkExisting()
  }, [])

  const handleScore = (value) => {
    const trait = QUIZ_QUESTIONS[currentQuestion].trait
    const newScores = { ...scores, [trait]: value }
    setScores(newScores)

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz(newScores)
    }
  }

  const completeQuiz = (finalScores) => {
    // Find top 2 traits (excluding 'curious' which has no monster mapping)
    const matchableTraits = ['social', 'creative', 'adventurous', 'calm']
    const sortedTraits = matchableTraits
      .sort((a, b) => finalScores[b] - finalScores[a])
      .slice(0, 2)

    // Find a monster that matches the top traits
    const matchingMonsters = MONSTERS.filter((monster) =>
      sortedTraits.every((trait) => monster.traits.includes(trait))
    )

    const monster =
      matchingMonsters.length > 0
        ? matchingMonsters[Math.floor(Math.random() * matchingMonsters.length)]
        : MONSTERS[Math.floor(Math.random() * MONSTERS.length)]

    setAssignedMonster(monster)
    setQuizComplete(true)
  }

  const handleContinue = async () => {
    if (!assignedMonster) return
    await saveTraitScores(scores, assignedMonster.id, assignedMonster.name)
    navigate('/hub-selection')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark flex items-center justify-center">
        <p className="font-game text-pixel-light animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
            Meet Your Monster
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {!quizComplete ? (
          <div className="pixel-card p-6 mb-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-game text-pixel-light">
                  Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
                </p>
                <p className="text-xs font-game text-pixel-blue">
                  {Math.round(((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100)}%
                </p>
              </div>
              <div className="w-full bg-pixel-dark border-2 border-pixel-purple h-4">
                <div
                  className="bg-pixel-blue h-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="font-pixel text-base text-pixel-yellow mb-2">
              {QUIZ_QUESTIONS[currentQuestion].question}
            </h2>

            {/* Low/High Labels */}
            <div className="flex justify-between text-xs font-game text-pixel-light opacity-70 mb-4">
              <span>{QUIZ_QUESTIONS[currentQuestion].lowLabel}</span>
              <span>{QUIZ_QUESTIONS[currentQuestion].highLabel}</span>
            </div>

            {/* 1-10 Scale Buttons */}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleScore(value)}
                  className={`
                    w-full aspect-square rounded font-game text-lg
                    transition-all hover:scale-110
                    ${scores[QUIZ_QUESTIONS[currentQuestion].trait] === value
                      ? 'bg-pixel-yellow text-pixel-dark'
                      : 'bg-pixel-purple text-pixel-light hover:bg-pixel-pink'
                    }
                  `}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="pixel-card p-8 mb-6 bg-pixel-purple bg-opacity-20">
              <p className="text-6xl mb-4 animate-float">✨</p>
              <h2 className="font-pixel text-xl text-pixel-yellow mb-4">
                Meet Your Monster!
              </h2>

              {/* Monster Image */}
              <div className="pixel-card p-6 bg-pixel-dark mb-6 flex justify-center">
                <img
                  src={`/src/monster_imgs/${assignedMonster.id}.png`}
                  alt="Your monster"
                  className="h-32 object-contain"
                />
              </div>

              <div className="pixel-card p-4 bg-pixel-blue bg-opacity-20 mb-6">
                <p className="text-xs text-pixel-blue font-game mb-2">Your Companion</p>
                <p className="font-pixel text-lg text-pixel-light">
                  {assignedMonster.name}
                </p>
              </div>

              <p className="text-xs text-pixel-light font-game mb-6">
                This monster was created just for you based on your personality. Grow together
                as you complete quests and create memories.
              </p>

              <button
                onClick={handleContinue}
                className="pixel-button bg-pixel-blue text-white w-full py-4"
              >
                Let's Go! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
