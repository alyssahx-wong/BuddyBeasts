// Comprehensive profanity filter
const profanityList = [
  // Common profanity (add more as needed)
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap',
  'bastard', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut',
  'piss', 'asshole', 'fag', 'retard', 'nigger', 'nigga',
  // Variations with numbers/symbols
  'f*ck', 'sh*t', 'b*tch', 'a$$', 'f_ck', 'sh_t',
  // Add leetspeak variations
  'fuk', 'shyt', 'azz', 'biatch', 'wtf', 'stfu',
]

// Create regex patterns for each word (case insensitive, with word boundaries)
const profanityPatterns = profanityList.map(word => ({
  pattern: new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
  word
}))

/**
 * Filters profanity from text by replacing with asterisks
 * @param {string} text - The text to filter
 * @returns {string} - The filtered text with profanity replaced by asterisks
 */
export function filterProfanity(text) {
  if (!text) return text
  
  let filteredText = text
  
  profanityPatterns.forEach(({ pattern, word }) => {
    filteredText = filteredText.replace(pattern, (match) => {
      // Replace each character with asterisk, keeping first letter
      return match.charAt(0) + '*'.repeat(Math.max(match.length - 1, 1))
    })
  })
  
  return filteredText
}

/**
 * Checks if text contains profanity
 * @param {string} text - The text to check
 * @returns {boolean} - True if profanity is detected
 */
export function containsProfanity(text) {
  if (!text) return false
  
  return profanityPatterns.some(({ pattern }) => pattern.test(text))
}

/**
 * Get severity level of profanity (for potential reporting)
 * @param {string} text - The text to analyze
 * @returns {string} - 'none', 'mild', 'moderate', 'severe'
 */
export function getProfanitySeverity(text) {
  if (!text) return 'none'
  
  const severeProfanity = ['fuck', 'cunt', 'nigger', 'nigga', 'fag']
  const moderateProfanity = ['shit', 'bitch', 'dick', 'cock', 'pussy', 'whore', 'slut', 'asshole']
  const mildProfanity = ['ass', 'damn', 'hell', 'crap', 'piss', 'bastard']
  
  const lowerText = text.toLowerCase()
  
  if (severeProfanity.some(word => lowerText.includes(word))) return 'severe'
  if (moderateProfanity.some(word => lowerText.includes(word))) return 'moderate'
  if (mildProfanity.some(word => lowerText.includes(word))) return 'mild'
  
  return 'none'
}
