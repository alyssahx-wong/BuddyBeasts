# PRD: Monster Companion Chat

**Feature Name:** Monster Companion Chat (Gemini-Powered)
**Status:** Draft
**Date:** 2026-02-12
**Author:** Claude Code

---

## 1. Overview

Add an AI-powered conversational companion feature where the user's pixel monster talks to them in 3rd person via a floating chat bubble. The monster checks in on the user's mood, stores mood history, and speaks with a personality shaped by its trait scores and type. Powered by Google Gemini Flash 2.0.

**Example interaction:**
> **Spark:** Spark is so happy to see you! How has your day been? 🔥
>
> **User:** Kinda stressed from exams
>
> **Spark:** Spark can tell you've been working hard! Spark thinks you deserve a break. Maybe a fun quest with friends would help you recharge?

---

## 2. Goals

- **Reduce social isolation** — The monster acts as an always-available emotional check-in companion
- **Increase engagement** — Proactive greetings encourage return visits and emotional investment in the monster
- **Mood tracking** — Collect mood data over time for the Insights tab, helping users reflect on emotional patterns
- **Deepen monster bond** — Trait-driven personality makes each monster feel unique and personal

---

## 3. User Stories

| # | Story | Priority |
|---|-------|----------|
| 1 | As a user, I can tap a floating chat bubble on any page to talk to my monster | P0 |
| 2 | As a user, my monster greets me proactively when I open the chat bubble | P0 |
| 3 | As a user, my monster speaks in 3rd person with a personality matching its traits | P0 |
| 4 | As a user, my monster asks how I'm feeling and responds empathetically | P0 |
| 5 | As a user, my mood is detected and logged from conversations | P0 |
| 6 | As a user, I can view my mood history over time in the Insights tab | P1 |
| 7 | As a user, the chat bubble doesn't block the bottom navigation bar | P0 |

---

## 4. Design Specification

### 4.1 Floating Chat Bubble (Collapsed State)

- **Position:** Fixed, bottom-right corner, above the NavigationBar (~80px from bottom)
- **Appearance:** Circular button (48x48px) showing the monster's sprite (mini PixelMonster)
- **Animation:** Gentle `animate-float` bounce to draw attention
- **Badge:** Small dot indicator when the monster has an unseen proactive greeting
- **Z-index:** Above page content, below any modals

### 4.2 Chat Overlay (Expanded State)

- **Position:** Fixed overlay anchored to bottom-right, above NavigationBar
- **Size:** ~320px wide x ~420px tall on mobile (full width minus padding), max 400px wide on desktop
- **Header:**
  - Monster name + type (e.g., "Spark the Adventurer")
  - Monster sprite (small, 32px)
  - Close (X) button
  - Pixel-styled header bar matching `pixel-purple` theme
- **Message area:**
  - Scrollable message list
  - Monster messages: Left-aligned, styled with `pixel-pink` background, pixel font
  - User messages: Right-aligned, styled with `pixel-blue` background
  - Timestamps on messages (relative: "just now", "2m ago")
- **Input area:**
  - Text input with `font-game` styling
  - Send button with pixel styling
  - Enter key to send
- **Styling:** Matches existing pixel-art aesthetic — `pixel-card` borders, `pixel-dark` background, custom pixel fonts

### 4.3 Page Integration

- The `<MonsterChatBubble />` component is rendered globally inside the app layout (alongside `<NavigationBar />`) on all protected routes
- It does NOT render on `/login`, `/quiz`, or `/hub-selection`
- The bubble sits to the right of the navigation bar, positioned so it doesn't overlap nav items

---

## 5. Technical Architecture

### 5.1 Gemini API Integration

**Model:** Gemini Flash 2.0 (`gemini-2.0-flash`)
**API Key:** Client-side via `VITE_GEMINI_API_KEY` in `.env.local`
**SDK:** `@google/generative-ai` npm package

```
Client (React) → Gemini Flash 2.0 API (direct)
```

**Rate limiting:** Client-side throttle — max 1 request per 2 seconds to prevent spam.

### 5.2 System Prompt Construction

The system prompt is dynamically built from the monster's data:

```
You are {monsterName}, a {monsterType} pixel monster companion in the game BuddyBeasts.
You ALWAYS speak in 3rd person, referring to yourself as "{monsterName}".
You refer to the user as "you" or "your".

Your personality traits (scale 1-10):
- Curious: {traitScores.curious}
- Social: {traitScores.social}
- Creative: {traitScores.creative}
- Adventurous: {traitScores.adventurous}
- Calm: {traitScores.calm}

Your dominant traits are: {topTraits}. Let these shape your tone:
- High calm → gentle, soothing, uses soft language
- High adventurous → excitable, uses action words, suggests trying new things
- High social → warm, asks about friends, encourages group activities
- High creative → imaginative, uses metaphors, suggests creative outlets
- High curious → inquisitive, asks follow-up questions, wants to learn more

Your evolution stage is: {evolution}
- baby: simple vocabulary, very cute, lots of enthusiasm
- teen: more articulate, curious, asks deeper questions
- adult/leader/support: wise, thoughtful, gives nuanced advice

Your primary role is to check in on the user's emotional wellbeing.
Ask how they're feeling. Be empathetic. Be supportive.
If they share something difficult, validate their feelings.
If they share something positive, celebrate with them.

Keep responses SHORT (1-3 sentences max). You're a cute pixel monster, not a therapist.
Never break character. Never mention being an AI or LLM.

After understanding the user's mood, internally classify it as one of:
happy, excited, calm, neutral, tired, stressed, sad, anxious, angry, lonely

Include the mood classification at the very end of your response in this exact format:
[MOOD:mood_value]
This tag will be stripped before displaying to the user.
```

### 5.3 New Zustand Store: `companionStore`

**File:** `src/stores/companionStore.js`

```javascript
{
  // Chat state (session only — NOT persisted)
  messages: [],          // { id, role: 'user'|'monster', text, timestamp }
  isOpen: false,         // chat overlay visibility
  isLoading: false,      // waiting for Gemini response
  hasGreeted: false,     // proactive greeting sent this session

  // Mood history (persisted to localStorage)
  moodHistory: [         // { mood, timestamp, source: 'chat' }
    { mood: 'happy', timestamp: 1707700000000 },
    { mood: 'stressed', timestamp: 1707600000000 },
  ],

  // Actions
  toggleChat(),
  sendMessage(text),
  addMonsterMessage(text),
  addMoodEntry(mood),
  clearSessionMessages(),
  getMoodHistory(days),   // filter by time range
}
```

**Persistence config:** Only `moodHistory` is persisted via Zustand `persist` middleware with a `partialize` option. Chat messages are session-only (cleared on page refresh).

### 5.4 Conversation Flow

```
1. User taps chat bubble
   → isOpen = true
   → If !hasGreeted:
       → Build system prompt from monsterStore data
       → Send initial prompt to Gemini: "Generate a greeting and ask how the user is feeling"
       → Display monster's greeting
       → hasGreeted = true

2. User sends a message
   → Append to messages[]
   → Send conversation history + system prompt to Gemini
   → Parse response, extract [MOOD:xxx] tag if present
   → Strip mood tag, display clean response
   → If mood detected: addMoodEntry({ mood, timestamp })

3. User closes chat or navigates
   → isOpen = false
   → Messages persist in memory for the session
   → On app refresh/close: messages cleared, hasGreeted reset
```

### 5.5 Mood History Integration (Insights Tab)

Extend the existing Insights tab on the Profile page:

- **New section:** "Mood Timeline" — a simple timeline/chart showing mood entries over the past 7/30 days
- **Visualization:** Color-coded dots or emoji on a horizontal timeline
  - happy/excited → `pixel-green`
  - calm/neutral → `pixel-blue`
  - tired/stressed → `pixel-yellow`
  - sad/anxious/angry/lonely → `pixel-pink`
- **Data source:** `companionStore.moodHistory`

---

## 6. New Files

| File | Purpose |
|------|---------|
| `src/stores/companionStore.js` | Zustand store for chat messages + mood history |
| `src/components/MonsterChatBubble.jsx` | Floating bubble + expanded chat overlay |
| `src/services/geminiService.js` | Gemini API client, system prompt builder, response parser |

---

## 7. Modified Files

| File | Change |
|------|--------|
| `src/App.jsx` | Add `<MonsterChatBubble />` to protected route layout |
| `src/pages/Profile.jsx` | Add mood timeline section to Insights tab |
| `.env.local` | Add `VITE_GEMINI_API_KEY` |
| `package.json` | Add `@google/generative-ai` dependency |

---

## 8. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Gemini API key missing | Chat bubble hidden, console warning |
| Gemini API rate limit / error | Show "Spark is thinking too hard... try again in a moment!" styled message |
| No monster data (pre-quiz) | Chat bubble not rendered (same as non-protected routes) |
| Very long user message | Truncate to 500 chars before sending to API |
| Gemini returns no mood tag | No mood entry logged, conversation continues normally |
| Network offline | Show "Spark can't reach you right now..." message |
| Multiple rapid sends | Client-side debounce, disable send button while `isLoading` |

---

## 9. Privacy & Safety

- **No server storage:** All mood data stays in localStorage on the user's device
- **No PII sent to Gemini:** Only the user's message text and monster metadata are sent — no name, email, or profile data
- **Content safety:** Gemini has built-in safety filters. Additionally, the system prompt instructs the monster to stay in character and not provide medical/professional advice
- **API key exposure:** Acceptable tradeoff for hackathon. For production, move to backend proxy

---

## 10. Future Enhancements (Out of Scope)

- Monster suggests quests based on detected mood (adaptive recommendations)
- Monster animations change based on mood (sad → droopy, happy → bouncing)
- Voice chat / text-to-speech for monster responses
- Multi-turn memory across sessions (persistent conversation history)
- Backend proxy for API key security
- Mood-based hub environment changes (weather, lighting)

---

## 11. Success Metrics

- **Engagement:** % of sessions where users interact with the companion chat
- **Mood logging:** Average mood entries per user per week
- **Retention:** Compare return rates of users who use companion chat vs. those who don't
- **Sentiment:** User feedback on monster personality accuracy and helpfulness

---

## 12. Implementation Estimate

| Phase | Scope |
|-------|-------|
| Phase 1 | Gemini service + companionStore + basic chat bubble (core chat works) |
| Phase 2 | Trait-driven system prompt + 3rd person persona + proactive greeting |
| Phase 3 | Mood extraction + mood history storage |
| Phase 4 | Mood timeline visualization in Insights tab |
| Phase 5 | Polish — animations, error states, mobile responsiveness |
