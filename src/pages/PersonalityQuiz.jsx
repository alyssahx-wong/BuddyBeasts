import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import boxShaking from '../characters/box-shaking.gif'
import boxOpening from '../characters/box-opening.gif'

export default function PersonalityQuiz() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchMonster, saveTraitScores, generateMonsterImage } = useMonsterStore()

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

  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [generatedPrompt, setGeneratedPrompt] = useState(null)
  const [generationError, setGenerationError] = useState(null)
  const [variationSeed, setVariationSeed] = useState(0)
  const [namingStep, setNamingStep] = useState(false)
  const [monsterName, setMonsterName] = useState('')
  const [showBoxOpen, setShowBoxOpen] = useState(false)

  // Customization state
  const [customizationStep, setCustomizationStep] = useState(-1) // -1 = not started, 0-3 = picking
  const [customization, setCustomization] = useState({
    animal: null,
    colour: null,
    element: null,
    accessory: null,
  })

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

  const CUSTOMIZATION_STEPS = [
    {
      key: 'animal',
      title: 'Choose Your Creature',
      subtitle: 'What animal inspires your monster?',
      options: [
        { value: 'cat', emoji: '🐱', label: 'Cat' },
        { value: 'dragon', emoji: '🐉', label: 'Dragon' },
        { value: 'bunny', emoji: '🐰', label: 'Bunny' },
        { value: 'fox', emoji: '🦊', label: 'Fox' },
        { value: 'wolf', emoji: '🐺', label: 'Wolf' },
        { value: 'bear', emoji: '🐻', label: 'Bear' },
        { value: 'owl', emoji: '🦉', label: 'Owl' },
        { value: 'turtle', emoji: '🐢', label: 'Turtle' },
        { value: 'axolotl', emoji: '🦎', label: 'Axolotl' },
        { value: 'penguin', emoji: '🐧', label: 'Penguin' },
      ],
    },
    {
      key: 'colour',
      title: 'Pick a Colour Theme',
      subtitle: 'What palette fits your monster?',
      options: [
        { value: 'sunset', emoji: '🌅', label: 'Sunset' },
        { value: 'ocean', emoji: '🌊', label: 'Ocean' },
        { value: 'forest', emoji: '🌿', label: 'Forest' },
        { value: 'galaxy', emoji: '🌌', label: 'Galaxy' },
        { value: 'candy', emoji: '🍬', label: 'Candy' },
        { value: 'ember', emoji: '🔥', label: 'Ember' },
        { value: 'arctic', emoji: '❄️', label: 'Arctic' },
        { value: 'shadow', emoji: '🌑', label: 'Shadow' },
      ],
    },
    {
      key: 'element',
      title: 'Choose an Element',
      subtitle: 'What power surrounds your monster?',
      options: [
        { value: 'fire', emoji: '🔥', label: 'Fire' },
        { value: 'water', emoji: '💧', label: 'Water' },
        { value: 'nature', emoji: '🌱', label: 'Nature' },
        { value: 'electric', emoji: '⚡', label: 'Electric' },
        { value: 'cosmic', emoji: '✨', label: 'Cosmic' },
        { value: 'ice', emoji: '🧊', label: 'Ice' },
        { value: 'shadow', emoji: '👤', label: 'Shadow' },
        { value: 'crystal', emoji: '💎', label: 'Crystal' },
      ],
    },
    {
      key: 'accessory',
      title: 'Pick an Accessory',
      subtitle: 'What does your monster wear?',
      options: [
        { value: 'tiny crown', emoji: '👑', label: 'Crown' },
        { value: 'scarf', emoji: '🧣', label: 'Scarf' },
        { value: 'goggles', emoji: '🥽', label: 'Goggles' },
        { value: 'flower wreath', emoji: '🌸', label: 'Flowers' },
        { value: 'bow tie', emoji: '🎀', label: 'Bow Tie' },
        { value: 'bandana', emoji: '🏴', label: 'Bandana' },
        { value: 'star earring', emoji: '⭐', label: 'Earring' },
        { value: 'crystal necklace', emoji: '📿', label: 'Necklace' },
        { value: 'cape', emoji: '🦸', label: 'Cape' },
        { value: 'none', emoji: '❌', label: 'None' },
      ],
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

  const completeQuiz = async (finalScores) => {
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
    setMonsterName(monster.name)
    setQuizComplete(true)
    setCustomizationStep(0) // Start customization flow
  }

  const handleCustomizationPick = (value) => {
    const step = CUSTOMIZATION_STEPS[customizationStep]
    setCustomization((prev) => ({ ...prev, [step.key]: value }))
    if (customizationStep < CUSTOMIZATION_STEPS.length - 1) {
      setCustomizationStep(customizationStep + 1)
    } else {
      setCustomizationStep(-1)
      setNamingStep(true)
    }
  }

  const handleNameSubmit = () => {
    if (!monsterName.trim()) return
    setNamingStep(false)
    generateImage(scores, assignedMonster, 0)
  }

  const generateImage = async (finalScores, monster, seed) => {
    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedImageUrl(null)

    try {
      const result = await generateMonsterImage(
        finalScores,
        monster.id,
        monsterName.trim(),
        seed,
        customization
      )
      if (result && result.monsterImageUrl) {
        setGeneratedImageUrl(result.monsterImageUrl)
        setGeneratedPrompt(result.monsterPrompt)
        setShowBoxOpen(true)
        setTimeout(() => setShowBoxOpen(false), 1500)
      } else {
        setGenerationError('Generation returned no image. You can continue with the default monster.')
      }
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error'
      const isTimeout = err?.code === 'ECONNABORTED' || detail === 'Network Error'
      const msg = isTimeout
        ? 'AI generation timed out. The server may be busy — try again!'
        : `AI generation failed: ${detail}`
      setGenerationError(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    const nextSeed = variationSeed + 1
    setVariationSeed(nextSeed)
    generateImage(scores, assignedMonster, nextSeed)
  }

  const handleContinue = async () => {
    if (!assignedMonster) return
    // If generation failed, save trait scores with the fallback method
    if (!generatedImageUrl) {
      await saveTraitScores(scores, assignedMonster.id, monsterName.trim())
    }
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
        {quizComplete && customizationStep >= 0 ? (
          /* Customization Step */
          <div className="text-center">
            <div className="pixel-card p-6 mb-6">
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {CUSTOMIZATION_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === customizationStep
                        ? 'bg-pixel-yellow scale-125'
                        : i < customizationStep
                        ? 'bg-pixel-blue'
                        : 'bg-pixel-purple'
                    }`}
                  />
                ))}
              </div>

              <h2 className="font-pixel text-base text-pixel-yellow mb-2">
                {CUSTOMIZATION_STEPS[customizationStep].title}
              </h2>
              <p className="font-game text-sm text-pixel-light mb-6">
                {CUSTOMIZATION_STEPS[customizationStep].subtitle}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CUSTOMIZATION_STEPS[customizationStep].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleCustomizationPick(opt.value)}
                    className={`
                      p-4 rounded border-2 transition-all hover:scale-105 active:scale-95
                      ${customization[CUSTOMIZATION_STEPS[customizationStep].key] === opt.value
                        ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-20'
                        : 'border-pixel-purple bg-pixel-dark hover:border-pixel-pink'
                      }
                    `}
                  >
                    <span className="text-2xl block mb-1">{opt.emoji}</span>
                    <span className="font-game text-sm text-pixel-light">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : !quizComplete ? (
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
        ) : namingStep ? (
          /* Naming Step */
          <div className="text-center">
            <div className="pixel-card p-8 mb-6 bg-pixel-purple bg-opacity-20">
              <p className="text-6xl mb-4 animate-float">✨</p>
              <h2 className="font-pixel text-lg text-pixel-yellow mb-4">
                Name Your Monster!
              </h2>
              <p className="font-game text-sm text-pixel-light mb-6">
                Give your new companion a name
              </p>
              <input
                type="text"
                value={monsterName}
                onChange={(e) => setMonsterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                maxLength={20}
                placeholder="Enter a name..."
                className="w-full px-4 py-3 mb-6 bg-pixel-dark border-2 border-pixel-purple rounded text-center font-game text-lg text-pixel-light focus:border-pixel-yellow focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                disabled={!monsterName.trim()}
                className="pixel-button bg-pixel-blue text-white w-full py-4 disabled:opacity-40"
              >
                Create Monster!
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="pixel-card p-8 mb-6 bg-pixel-purple bg-opacity-20">
              {/* Generating State — box shaking while AI works */}
              {isGenerating && (
                <>
                  <h2 className="font-pixel text-lg text-pixel-yellow mb-2">
                    Creating Your Monster...
                  </h2>
                  <p className="font-game text-sm text-pixel-light mb-6">
                    Our AI is crafting a unique companion just for you
                  </p>
                  <div className="flex justify-center mb-4">
                    <img
                      src={boxShaking}
                      alt="Box shaking"
                      className="w-32 h-32 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </>
              )}

              {/* Box opening — briefly shown after AI returns image */}
              {!isGenerating && showBoxOpen && (
                <>
                  <h2 className="font-pixel text-lg text-pixel-yellow mb-2">
                    Your Monster Appears!
                  </h2>
                  <div className="flex justify-center mb-4">
                    <img
                      src={boxOpening}
                      alt="Box opening"
                      className="w-32 h-32 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </>
              )}

              {/* Reveal State - AI image generated successfully */}
              {!isGenerating && !showBoxOpen && generatedImageUrl && (
                <>
                  <p className="text-6xl mb-4 animate-float">✨</p>
                  <h2 className="font-pixel text-xl text-pixel-yellow mb-4">
                    Meet Your Monster!
                  </h2>

                  {/* AI-Generated Monster Image */}
                  <div className="pixel-card p-6 bg-pixel-dark mb-6 flex justify-center">
                    <img
                      src={generatedImageUrl}
                      alt="Your AI-generated monster"
                      className="h-40 w-40 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>

                  <div className="pixel-card p-4 bg-pixel-blue bg-opacity-20 mb-4">
                    <p className="text-xs text-pixel-blue font-game mb-2">Your Companion</p>
                    <p className="font-pixel text-lg text-pixel-light">
                      {monsterName}
                    </p>
                  </div>

                  {/* Collapsible prompt details */}
                  {generatedPrompt && (
                    <details className="mb-4 text-left">
                      <summary className="font-game text-xs text-pixel-light opacity-60 cursor-pointer hover:opacity-100">
                        View AI prompt used
                      </summary>
                      <p className="font-game text-xs text-pixel-light opacity-50 mt-2 p-3 bg-pixel-dark rounded">
                        {generatedPrompt}
                      </p>
                    </details>
                  )}

                  <p className="text-xs text-pixel-light font-game mb-6">
                    This monster was created just for you by AI based on your personality.
                    Grow together as you complete quests and create memories.
                  </p>

                  <button
                    onClick={handleContinue}
                    className="pixel-button bg-pixel-blue text-white w-full py-4 mb-3"
                  >
                    Let's Go!
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="pixel-button bg-pixel-purple text-pixel-light w-full py-3 text-sm"
                  >
                    Regenerate Monster
                  </button>
                </>
              )}

              {/* Error State - fallback to static PNG */}
              {!isGenerating && generationError && !generatedImageUrl && (
                <>
                  <p className="text-6xl mb-4 animate-float">✨</p>
                  <h2 className="font-pixel text-xl text-pixel-yellow mb-4">
                    Meet Your Monster!
                  </h2>

                  {/* Fallback Static Image */}
                  <div className="pixel-card p-6 bg-pixel-dark mb-6 flex justify-center">
                    <img
                      src={`/src/monster_imgs/${assignedMonster.id}.png`}
                      alt="Your monster"
                      className="h-32 object-contain"
                    />
                  </div>

                  <div className="pixel-card p-4 bg-pixel-blue bg-opacity-20 mb-4">
                    <p className="text-xs text-pixel-blue font-game mb-2">Your Companion</p>
                    <p className="font-pixel text-lg text-pixel-light">
                      {monsterName}
                    </p>
                  </div>

                  <p className="text-xs text-pixel-yellow font-game mb-4">
                    {generationError}
                  </p>

                  <button
                    onClick={handleContinue}
                    className="pixel-button bg-pixel-blue text-white w-full py-4 mb-3"
                  >
                    Continue with Default
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="pixel-button bg-pixel-purple text-pixel-light w-full py-3 text-sm"
                  >
                    Retry AI Generation
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
