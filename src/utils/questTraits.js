export const QUEST_TRAIT_MAP = {
  coffee_chat:     { social: 4, creative: 1, adventurous: 1, calm: 3, nurturing: 2 },
  study_jam:       { social: 2, creative: 2, adventurous: 0, calm: 5, nurturing: 1 },
  sunset_walk:     { social: 2, creative: 1, adventurous: 5, calm: 3, nurturing: 1 },
  help_neighbor:   { social: 3, creative: 1, adventurous: 2, calm: 1, nurturing: 5 },
  lunch_crew:      { social: 5, creative: 1, adventurous: 1, calm: 3, nurturing: 3 },
  game_night:      { social: 5, creative: 2, adventurous: 3, calm: 1, nurturing: 1 },
  morning_workout: { social: 3, creative: 0, adventurous: 5, calm: 1, nurturing: 1 },
  art_cafe:        { social: 1, creative: 5, adventurous: 1, calm: 3, nurturing: 1 },
}

const TRAITS = ['social', 'creative', 'adventurous', 'calm', 'nurturing']

export function euclideanDistance(userTraits, questTraits) {
  let sum = 0
  for (const t of TRAITS) {
    const diff = (userTraits[t] ?? 0) - (questTraits[t] ?? 0)
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

export function getRecommendedQuests(quests, personalityScores) {
  if (!personalityScores) return []
  const scored = quests
    .filter((q) => QUEST_TRAIT_MAP[q.type])
    .map((q) => {
      const questTraits = QUEST_TRAIT_MAP[q.type]
      const distance = euclideanDistance(personalityScores, questTraits)
      const matching = TRAITS
        .filter((t) => (personalityScores[t] ?? 0) >= 3 && (questTraits[t] ?? 0) >= 3)
        .sort((a, b) => Math.min(questTraits[b], personalityScores[b]) - Math.min(questTraits[a], personalityScores[a]))
      return { ...q, matchScore: distance, matchingTraits: matching }
    })
  scored.sort((a, b) => a.matchScore - b.matchScore)
  return scored
}

export function getComfortZoneQuests(quests, personalityScores) {
  if (!personalityScores) return []
  const scored = quests
    .filter((q) => QUEST_TRAIT_MAP[q.type])
    .map((q) => {
      const questTraits = QUEST_TRAIT_MAP[q.type]
      const distance = euclideanDistance(personalityScores, questTraits)
      const stretched = TRAITS
        .filter((t) => (personalityScores[t] ?? 0) <= 2 && (questTraits[t] ?? 0) >= 4)
        .sort((a, b) => (questTraits[b] ?? 0) - (personalityScores[b] ?? 0) - ((questTraits[a] ?? 0) - (personalityScores[a] ?? 0)))
      return { ...q, comfortZoneDistance: distance, stretchedTraits: stretched }
    })
    .filter((q) => q.stretchedTraits.length > 0)
  scored.sort((a, b) => b.comfortZoneDistance - a.comfortZoneDistance)
  return scored
}

/**
 * NEW: Categorizes quests by prioritizing Comfort Zone (Growth) first,
 * then filling Recommended with the remaining quests.
 */
export function getCategorizedQuests(quests, personalityScores, limit = 3) {
  if (!personalityScores) return { comfortZone: [], recommended: [] }

  // 1. Get specialized Growth/Comfort Zone quests first
  const allComfortZone = getComfortZoneQuests(quests, personalityScores)
  const comfortZone = allComfortZone.slice(0, limit)
  
  // Create a Set of IDs to exclude these from recommended
  const comfortZoneIds = new Set(comfortZone.map(q => q.id))

  // 2. Get Recommended and filter out what is already in Comfort Zone
  const allRecommended = getRecommendedQuests(quests, personalityScores)
  const recommended = allRecommended
    .filter(q => !comfortZoneIds.has(q.id))
    .slice(0, limit)

  return { comfortZone, recommended }
}