import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL_ID = 'gemini-2.0-flash-lite'
const MAX_HISTORY_MESSAGES = 6

let genAI = null
let model = null

function getModel() {
  if (!API_KEY) return null
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY)
    model = genAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 0.8,
      },
    })
  }
  return model
}

export function isGeminiAvailable() {
  return !!API_KEY
}

const MOOD_TAG_REGEX = /\[MOOD:(\w+)\]/

export function extractMood(text) {
  const match = text.match(MOOD_TAG_REGEX)
  if (!match) return { cleanText: text, mood: null }
  return {
    cleanText: text.replace(MOOD_TAG_REGEX, '').trim(),
    mood: match[1],
  }
}

// Static app knowledge base — baked in so it doesn't need to be re-sent dynamically
const APP_KNOWLEDGE = `APP GUIDE (use when the user asks for help or when naturally relevant):
- Hub: Main page. See your monster and other online players. Tap others to chat.
- Quests: Browse and join group quests. Tap "Join" then go to the Lobby to wait for teammates. Complete quests to earn crystals.
- Chat: Message hub members, quest teams, or direct message friends.
- Gallery: View group photos taken during quest check-ins.
- Profile: See your monster stats, buy items/eggs in the Marketplace, equip items, hatch eggs, and switch active monsters.
- Evolution: Earn crystals from quests to level up. At level 5 your monster evolves from Baby to Teen. At level 20 it evolves again based on your play style.
- Crystals & Coins: Crystals are earned from quests (1.5x bonus for group quests). Coins come from crystals and are spent in the shop.
- Belonging Survey: On your Profile page, tap "Rate Your Belonging" to log how connected you feel.
- Insights: Profile > Insights tab shows personality radar, belonging trend, activity charts, and mood history.
You may occasionally suggest a feature when it fits the conversation naturally.`

export function buildSystemPrompt(monster) {
  const name = monster.name || 'Buddy'
  const traits = monster.traitScores || {}
  const evolution = monster.evolution || 'baby'

  const topTraits = Object.entries(traits)
    .filter(([key]) => key !== 'curious')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key)

  return `You are ${name}, a pixel monster companion in BuddyBeasts.
ALWAYS speak in 3rd person as "${name}". Refer to the user as "you".

Traits (1-10): curious ${traits.curious || 5}, social ${traits.social || 5}, creative ${traits.creative || 5}, adventurous ${traits.adventurous || 5}, calm ${traits.calm || 5}.
Top traits: ${topTraits.join(', ')}. Match your tone to them (calm=gentle, adventurous=excitable, social=warm, creative=imaginative, curious=inquisitive).

Evolution: ${evolution}. baby=simple/cute, teen=curious/articulate, adult+=wise/thoughtful.

Role: Check in on the user's feelings. Be empathetic and supportive. Keep replies to 1-2 sentences max. Never break character or mention AI.

${APP_KNOWLEDGE}

End every reply with [MOOD:value] where value is one of: happy, excited, calm, neutral, tired, stressed, sad, anxious, angry, lonely. This tag is hidden from the user.`
}

export async function sendMessage(systemPrompt, conversationHistory) {
  const m = getModel()
  if (!m) throw new Error('Gemini API key not configured')

  const lastMessage = conversationHistory[conversationHistory.length - 1]
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('Last message must be from user')
  }

  // Cap history to last N messages (excluding the one we're about to send)
  let priorMessages = conversationHistory.slice(0, -1).slice(-MAX_HISTORY_MESSAGES)

  // Gemini requires history to start with a 'user' role — drop leading model messages
  while (priorMessages.length > 0 && priorMessages[0].role === 'monster') {
    priorMessages = priorMessages.slice(1)
  }

  const chat = m.startChat({
    history: priorMessages.map((msg) => ({
      role: msg.role === 'monster' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    })),
    systemInstruction: { parts: [{ text: systemPrompt }] },
  })

  const result = await chat.sendMessage(lastMessage.text)
  const response = result.response.text()
  return extractMood(response)
}

export async function generateGreeting(systemPrompt) {
  const m = getModel()
  if (!m) throw new Error('Gemini API key not configured')

  const chat = m.startChat({
    history: [],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  })

  const result = await chat.sendMessage(
    'Greet the user in 1 sentence and ask how they feel. Stay in character.'
  )
  const response = result.response.text()
  return extractMood(response)
}
