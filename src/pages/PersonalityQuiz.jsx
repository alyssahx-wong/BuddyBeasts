import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'

export default function PersonalityQuiz() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { monster, initializeMonster } = useMonsterStore()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState({ social: 0, creative: 0, adventurous: 0, calm: 0, nurturing: 0 })
  const [quizComplete, setQuizComplete] = useState(false)
  const [assignedMonsterId, setAssignedMonsterId] = useState(null)

  // Skip quiz if user already completed onboarding
  useEffect(() => {
    // customCharacterUrl is backend-persisted — the authoritative onboarding check
    if (monster?.customCharacterUrl) {
      navigate('/hub-selection', { replace: true })
    }
    // If they have local personalityScores but no character yet,
    // let them stay on the quiz page (they can redo it) or continue
  }, [monster?.customCharacterUrl, navigate])

  const MONSTERS = [
    { id: 1, name: 'Spark', traits: ['adventurous', 'creative'] },
    { id: 2, name: 'Whisper', traits: ['calm', 'creative'] },
    { id: 3, name: 'Bounce', traits: ['social', 'adventurous'] },
    { id: 4, name: 'Echo', traits: ['calm', 'nurturing'] },
    { id: 5, name: 'Flame', traits: ['adventurous', 'adventurous'] },
    { id: 6, name: 'Drift', traits: ['calm', 'calm'] },
    { id: 7, name: 'Pulse', traits: ['creative', 'creative'] },
    { id: 8, name: 'Nova', traits: ['social', 'social'] },
    { id: 9, name: 'Ember', traits: ['adventurous', 'creative'] },
    { id: 10, name: 'Glow', traits: ['calm', 'creative'] },
    { id: 11, name: 'Dash', traits: ['social', 'adventurous'] },
    { id: 12, name: 'Seraph', traits: ['nurturing', 'social'] },
    { id: 13, name: 'Blaze', traits: ['adventurous', 'adventurous'] },
    { id: 14, name: 'Hush', traits: ['calm', 'calm'] },
    { id: 15, name: 'Twirl', traits: ['creative', 'creative'] },
    { id: 16, name: 'Zest', traits: ['social', 'social'] },
    { id: 17, name: 'Frost', traits: ['calm', 'adventurous'] },
    { id: 18, name: 'Zephyr', traits: ['creative', 'social'] },
  ]

  const QUIZ_QUESTIONS = [
    {
      question: 'How do you spend a weekend?',
      answers: [
        { text: 'Out exploring new places', trait: 'adventurous', points: 1 },
        { text: 'With friends at a gathering', trait: 'social', points: 1 },
        { text: 'Creating or making something', trait: 'creative', points: 1 },
        { text: 'Relaxing and recharging', trait: 'calm', points: 1 },
        { text: 'Helping others and making them feel welcome', trait: 'nurturing', points: 1 },
      ],
    },
    {
      question: 'What activity energizes you the most?',
      answers: [
        { text: 'Trying something new and risky', trait: 'adventurous', points: 1 },
        { text: 'Being around people and connecting', trait: 'social', points: 1 },
        { text: 'Expressing yourself artistically', trait: 'creative', points: 1 },
        { text: 'Finding peace and stillness', trait: 'calm', points: 1 },
        { text: 'Supporting someone through a tough time', trait: 'nurturing', points: 1 },
      ],
    },
    {
      question: 'When faced with a challenge, you:',
      answers: [
        { text: 'Jump in headfirst and learn as you go', trait: 'adventurous', points: 1 },
        { text: 'Ask others for their perspective', trait: 'social', points: 1 },
        { text: 'Think of unique, unconventional solutions', trait: 'creative', points: 1 },
        { text: 'Take time to analyze and plan carefully', trait: 'calm', points: 1 },
        { text: 'Making sure everyone feels included', trait: 'nurturing', points: 1 },
      ],
    },
    {
      question: 'What do you value most in friendships?',
      answers: [
        { text: 'Going on adventures together', trait: 'adventurous', points: 1 },
        { text: 'Being part of a connected community', trait: 'social', points: 1 },
        { text: 'Inspiring each other creatively', trait: 'creative', points: 1 },
        { text: 'Deep, calm conversations', trait: 'calm', points: 1 },
        { text: 'Being there for each other no matter what', trait: 'nurturing', points: 1 },
      ],
    },
    {
      question: 'In a group, you tend to be the one who:',
      answers: [
        { text: 'Suggests exciting things to try', trait: 'adventurous', points: 1 },
        { text: 'Brings people together and connects them', trait: 'social', points: 1 },
        { text: 'Shares new ideas and perspectives', trait: 'creative', points: 1 },
        { text: 'Listens deeply and offers perspective', trait: 'calm', points: 1 },
        { text: 'Checks in on everyone and lifts spirits', trait: 'nurturing', points: 1 },
      ],
    },
  ]

  const handleAnswer = (trait, points) => {
    const newScores = { ...scores }
    newScores[trait] += points
    setScores(newScores)

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz(newScores)
    }
  }

  const completeQuiz = (finalScores) => {
    // Find the top 2 traits
    const sortedTraits = Object.entries(finalScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([trait]) => trait)

    // Find a monster that matches the top traits
    const matchingMonsters = MONSTERS.filter((monster) =>
      sortedTraits.every((trait) => monster.traits.includes(trait))
    )

    const assignedMonster =
      matchingMonsters.length > 0
        ? matchingMonsters[Math.floor(Math.random() * matchingMonsters.length)]
        : MONSTERS[Math.floor(Math.random() * MONSTERS.length)]

    setAssignedMonsterId(assignedMonster.id)
    setQuizComplete(true)

    // Initialize the monster in the store
    initializeMonster(user?.id, {
      name: assignedMonster.name,
      monsterId: assignedMonster.id,
      personalityScores: finalScores,
    })
  }

  const handleContinue = () => {
    navigate('/create-character')
  }

  if (!user) {
    navigate('/login')
    return null
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
            <h2 className="font-pixel text-base text-pixel-yellow mb-6">
              {QUIZ_QUESTIONS[currentQuestion].question}
            </h2>

            {/* Answers */}
            <div className="space-y-3">
              {QUIZ_QUESTIONS[currentQuestion].answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(answer.trait, answer.points)}
                  className="w-full pixel-card p-4 text-left hover:border-pixel-yellow transition-all"
                >
                  <p className="text-sm font-game text-pixel-light">{answer.text}</p>
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
                  src={`/src/monster_imgs/${assignedMonsterId}.png`}
                  alt="Your monster"
                  className="h-32 object-contain"
                />
              </div>

              <div className="pixel-card p-4 bg-pixel-blue bg-opacity-20 mb-6">
                <p className="text-xs text-pixel-blue font-game mb-2">Your Companion</p>
                <p className="font-pixel text-lg text-pixel-light">
                  {MONSTERS.find((m) => m.id === assignedMonsterId)?.name}
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
