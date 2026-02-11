import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMonsterStore } from '../stores/monsterStore'
import api from '../api'

const CHARACTER_QUESTIONS = [
  {
    id: 'color',
    question: 'What color best represents your spirit?',
    icon: '🎨',
    answers: [
      { text: 'Fiery Red / Orange', value: 'red-orange', emoji: '🔴' },
      { text: 'Cool Blue / Purple', value: 'blue-purple', emoji: '🔵' },
      { text: 'Fresh Green / Teal', value: 'green-teal', emoji: '🟢' },
      { text: 'Warm Yellow / Gold', value: 'yellow-gold', emoji: '🟡' },
      { text: 'Soft Pink / Lavender', value: 'pink-lavender', emoji: '🩷' },
    ],
  },
  {
    id: 'element',
    question: 'Which element do you feel most connected to?',
    icon: '✨',
    answers: [
      { text: 'Fire — Passionate & Bold', value: 'fire', emoji: '🔥' },
      { text: 'Water — Calm & Flowing', value: 'water', emoji: '💧' },
      { text: 'Earth — Grounded & Strong', value: 'earth', emoji: '🌿' },
      { text: 'Wind — Free & Playful', value: 'wind', emoji: '🌬️' },
      { text: 'Star — Dreamy & Mysterious', value: 'star', emoji: '⭐' },
    ],
  },
  {
    id: 'vibe',
    question: 'What vibe does your character give off?',
    icon: '💫',
    answers: [
      { text: 'Cute & Cuddly', value: 'cute-cuddly', emoji: '🧸' },
      { text: 'Cool & Mysterious', value: 'cool-mysterious', emoji: '😎' },
      { text: 'Silly & Playful', value: 'silly-playful', emoji: '🤪' },
      { text: 'Brave & Heroic', value: 'brave-heroic', emoji: '🦸' },
      { text: 'Wise & Gentle', value: 'wise-gentle', emoji: '🦉' },
    ],
  },
  {
    id: 'creature',
    question: 'What creature inspires your character?',
    icon: '🐾',
    answers: [
      { text: 'Dragon / Reptile', value: 'dragon', emoji: '🐉' },
      { text: 'Cat / Fox', value: 'cat-fox', emoji: '🦊' },
      { text: 'Bird / Phoenix', value: 'bird-phoenix', emoji: '🐦' },
      { text: 'Bear / Bunny', value: 'bear-bunny', emoji: '🐰' },
      { text: 'Spirit / Ghost', value: 'spirit-ghost', emoji: '👻' },
    ],
  },
  {
    id: 'accessory',
    question: 'What special feature should your character have?',
    icon: '🎀',
    answers: [
      { text: 'Glowing eyes or aura', value: 'glowing-aura', emoji: '✨' },
      { text: 'Tiny wings or tail', value: 'wings-tail', emoji: '🪽' },
      { text: 'A scarf or cape', value: 'scarf-cape', emoji: '🧣' },
      { text: 'A cute hat or crown', value: 'hat-crown', emoji: '👑' },
      { text: 'Magical runes or markings', value: 'runes-markings', emoji: '🔮' },
    ],
  },
]

function buildPrompt(answers, personalityScores) {
  const colorMap = {
    'red-orange': 'warm red and orange colored',
    'blue-purple': 'cool blue and purple colored',
    'green-teal': 'fresh green and teal colored',
    'yellow-gold': 'warm yellow and gold colored',
    'pink-lavender': 'soft pink and lavender colored',
  }
  const elementMap = {
    fire: 'fire-themed with small flames',
    water: 'water-themed with droplets',
    earth: 'nature-themed with tiny leaves',
    wind: 'wind-themed with swirl patterns',
    star: 'cosmic-themed with tiny stars',
  }
  const vibeMap = {
    'cute-cuddly': 'cute round friendly',
    'cool-mysterious': 'sleek mysterious confident',
    'silly-playful': 'goofy happy energetic',
    'brave-heroic': 'strong brave determined',
    'wise-gentle': 'calm wise serene',
  }
  const creatureMap = {
    dragon: 'small dragon creature',
    'cat-fox': 'small cat-fox hybrid creature',
    'bird-phoenix': 'small bird phoenix creature',
    'bear-bunny': 'small bear-bunny hybrid creature',
    'spirit-ghost': 'small floating spirit creature',
  }
  const accessoryMap = {
    'glowing-aura': 'with glowing eyes and subtle aura',
    'wings-tail': 'with tiny wings and a curled tail',
    'scarf-cape': 'wearing a flowing scarf',
    'hat-crown': 'wearing a small cute crown',
    'runes-markings': 'with magical glowing rune markings on body',
  }

  // Build personality flavor from quiz scores
  let personalityFlavor = ''
  if (personalityScores) {
    const sorted = Object.entries(personalityScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([trait]) => trait)
    const traitDescriptions = {
      social: 'friendly expressive',
      creative: 'artistic whimsical',
      adventurous: 'bold dynamic',
      calm: 'peaceful serene',
      nurturing: 'warm caring',
    }
    personalityFlavor = sorted.map((t) => traitDescriptions[t] || '').join(' ')
  }

  const color = colorMap[answers.color] || ''
  const element = elementMap[answers.element] || ''
  const vibe = vibeMap[answers.vibe] || ''
  const creature = creatureMap[answers.creature] || ''
  const accessory = accessoryMap[answers.accessory] || ''

  return `low-res pixel art, 8-bit style, 32x32px scale, character sprite, front view only, ${vibe} ${creature}, ${color}, ${element}, ${accessory}, ${personalityFlavor}, flat colors, clean edges, solid white background`
}

export default function CharacterCreation() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { monster, setGeneratedCharacter } = useMonsterStore()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [questionsComplete, setQuestionsComplete] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)
  const [characterName, setCharacterName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [saving, setSaving] = useState(false)

  const generationSteps = [
    'Mixing magical colors... 🎨',
    'Channeling elemental energy... ✨',
    'Shaping your creature... 🐾',
    'Adding special features... 🎀',
    'Bringing your character to life... 💫',
  ]

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // If already fully onboarded, go to hub
    if (monster?.customCharacterUrl) {
      navigate('/hub-selection', { replace: true })
      return
    }
    // If user hasn't done the personality quiz, send them there first
    if (!monster?.personalityScores) {
      navigate('/quiz', { replace: true })
    }
  }, [user, monster?.personalityScores, monster?.customCharacterUrl, navigate])

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentQuestion < CHARACTER_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuestionsComplete(true)
      generateCharacter(newAnswers)
    }
  }

  // Helper: convert an image URL to a base64 data URI
  const imageUrlToBase64 = async (url) => {
    try {
      const resp = await fetch(url)
      const blob = await resp.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  const generateCharacter = async (finalAnswers) => {
    setGenerating(true)
    setError(null)

    // Animate through generation steps
    let stepIndex = 0
    const stepInterval = setInterval(() => {
      if (stepIndex < generationSteps.length) {
        setGenerationStep(generationSteps[stepIndex])
        stepIndex++
      }
    }, 2000)

    setGenerationStep(generationSteps[0])

    try {
      const prompt = buildPrompt(finalAnswers, monster?.personalityScores)

      const response = await api.post('/api/generate-character', {
        prompt,
        answers: finalAnswers,
        personalityScores: monster?.personalityScores,
      })

      clearInterval(stepInterval)

      if (response.data?.imageUrl) {
        setGeneratedImage(response.data.imageUrl)
        setShowNameInput(true)
        setGenerationStep('Your character is ready! ✨')
      } else {
        throw new Error('No image returned')
      }
    } catch (err) {
      clearInterval(stepInterval)
      console.error('Character generation error:', err)

      // Fallback: assign a random existing monster image
      const fallbackId = Math.floor(Math.random() * 18) + 1
      setGeneratedImage(`/src/monster_imgs/${fallbackId}.png`)
      setShowNameInput(true)
      setGenerationStep('We used a pre-made character for now! 🎮')
      setError('AI generation is unavailable — we picked a character for you!')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    const name = characterName.trim() || 'Buddy'
    setSaving(true)

    try {
      // Convert the generated image to base64 for upload to Google Drive
      let imageData = generatedImage
      if (generatedImage && !generatedImage.startsWith('data:')) {
        const base64 = await imageUrlToBase64(generatedImage)
        if (base64) imageData = base64
      }

      // Upload to Google Drive via backend and save on monster record
      const response = await api.post('/api/generate-character/save', {
        imageData,
        name,
      })

      const savedUrl = response.data?.customCharacterUrl || generatedImage

      setGeneratedCharacter({
        name,
        imageUrl: generatedImage,
        customCharacterUrl: savedUrl,
        answers,
      })
    } catch (err) {
      console.error('Save error:', err)
      // Still save locally even if Drive upload fails
      setGeneratedCharacter({
        name,
        imageUrl: generatedImage,
        customCharacterUrl: generatedImage,
        answers,
      })
    } finally {
      setSaving(false)
      navigate('/hub-selection')
    }
  }

  const handleRegenerate = () => {
    setGeneratedImage(null)
    setShowNameInput(false)
    setError(null)
    generateCharacter(answers)
  }

  if (!user) return null

  const progress = questionsComplete
    ? 100
    : Math.round(((currentQuestion + 1) / CHARACTER_QUESTIONS.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
            ✨ Create Your Character
          </h1>
          <p className="text-xs font-game text-pixel-light mt-1 opacity-70">
            Design a unique companion based on your personality
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Phase 1: Character Questions */}
        {!questionsComplete && (
          <div className="pixel-card p-6 mb-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-game text-pixel-light">
                  Question {currentQuestion + 1} of {CHARACTER_QUESTIONS.length}
                </p>
                <p className="text-xs font-game text-pixel-blue">{progress}%</p>
              </div>
              <div className="w-full bg-pixel-dark border-2 border-pixel-purple h-4">
                <div
                  className="bg-pixel-yellow h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Icon */}
            <div className="text-center mb-4">
              <span className="text-4xl">
                {CHARACTER_QUESTIONS[currentQuestion].icon}
              </span>
            </div>

            {/* Question */}
            <h2 className="font-pixel text-base text-pixel-yellow mb-6 text-center">
              {CHARACTER_QUESTIONS[currentQuestion].question}
            </h2>

            {/* Answers */}
            <div className="space-y-3">
              {CHARACTER_QUESTIONS[currentQuestion].answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleAnswer(CHARACTER_QUESTIONS[currentQuestion].id, answer.value)
                  }
                  className="w-full pixel-card p-4 text-left hover:border-pixel-yellow transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-125 transition-transform">
                      {answer.emoji}
                    </span>
                    <p className="text-sm font-game text-pixel-light">{answer.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 2: Generation */}
        {questionsComplete && generating && (
          <div className="pixel-card p-8 text-center">
            {/* Animated sparkles */}
            <div className="mb-6">
              <div className="text-6xl animate-float">🧙‍♂️</div>
            </div>

            <h2 className="font-pixel text-lg text-pixel-yellow mb-4">
              Creating Your Character...
            </h2>

            {/* Generation step text */}
            <p className="text-sm font-game text-pixel-blue mb-6 animate-pulse">
              {generationStep}
            </p>

            {/* Loading bar */}
            <div className="w-full bg-pixel-dark border-2 border-pixel-purple h-4 mb-4">
              <div
                className="bg-pixel-yellow h-full transition-all duration-1000"
                style={{
                  width: `${Math.min(
                    ((generationSteps.indexOf(generationStep) + 1) /
                      generationSteps.length) *
                      100,
                    95
                  )}%`,
                }}
              />
            </div>

            <p className="text-xs font-game text-pixel-light opacity-60">
              This may take a moment — your character is being crafted by AI ✨
            </p>
          </div>
        )}

        {/* Phase 3: Result */}
        {questionsComplete && !generating && generatedImage && (
          <div className="text-center">
            <div className="pixel-card p-8 mb-6 bg-pixel-purple bg-opacity-20">
              <p className="text-6xl mb-4 animate-float">🎉</p>
              <h2 className="font-pixel text-xl text-pixel-yellow mb-4">
                {generationStep}
              </h2>

              {/* Generated Character Image */}
              <div className="pixel-card p-6 bg-pixel-dark mb-6 flex justify-center">
                <img
                  src={generatedImage}
                  alt="Your generated character"
                  className="h-48 w-48 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Error notice */}
              {error && (
                <div className="pixel-card p-3 bg-pixel-yellow bg-opacity-20 mb-4">
                  <p className="text-xs font-game text-pixel-yellow">{error}</p>
                </div>
              )}

              {/* Summary of choices */}
              <div className="pixel-card p-4 bg-pixel-blue bg-opacity-10 mb-6">
                <p className="text-xs text-pixel-blue font-game mb-3">Your Choices</p>
                <div className="grid grid-cols-2 gap-2 text-left">
                  {CHARACTER_QUESTIONS.map((q) => {
                    const chosen = q.answers.find((a) => a.value === answers[q.id])
                    return chosen ? (
                      <div key={q.id} className="flex items-center gap-2">
                        <span>{chosen.emoji}</span>
                        <span className="text-xs font-game text-pixel-light truncate">
                          {chosen.text}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>

              {/* Name Input */}
              {showNameInput && (
                <div className="pixel-card p-4 bg-pixel-dark mb-6">
                  <p className="text-xs text-pixel-blue font-game mb-3">
                    Name Your Character
                  </p>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter a name..."
                    maxLength={20}
                    className="w-full bg-pixel-dark border-2 border-pixel-purple text-pixel-light font-game text-center text-lg p-3 focus:border-pixel-yellow outline-none transition-colors"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={saving}
                  className="pixel-button bg-pixel-purple text-white flex-1 py-4 disabled:opacity-50"
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="pixel-button bg-pixel-blue text-white flex-1 py-4 disabled:opacity-50"
                >
                  {saving ? '💾 Saving...' : '✅ Let\'s Go!'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
