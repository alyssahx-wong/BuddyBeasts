```
  ____            _     _       ____                  _
 | __ ) _   _  __| | __| |_   _| __ )  ___  __ _ ___| |_ ___
 |  _ \| | | |/ _` |/ _` | | | |  _ \ / _ \/ _` / __| __/ __|
 | |_) | |_| | (_| | (_| | |_| | |_) |  __/ (_| \__ \ |_\__ \
 |____/ \__,_|\__,_|\__,_|\__, |____/ \___|\__,_|___/\__|___/
                           |___/
```

# BuddyBeasts

### *Hatch friendships. Grow monsters. Fight loneliness — one quest at a time.*

> A mobile-first pixel RPG where **real-world social meetups** are the gameplay.
> Join a local hub, complete group quests IRL, and watch your pixel companion
> evolve as your community grows stronger.

```
 +-------------------------------------------------+
 |  THE QUIET PROBLEM                              |
 |                                                 |
 |  Many people go days without truly being seen.  |
 |  Loneliness is silently rising in digital,      |
 |  urban communities — affecting mental health    |
 |  and quality of life worldwide.                 |
 |                                                 |
 |  BuddyBeasts turns that around by making       |
 |  real connection feel like a game worth playing.|
 +-------------------------------------------------+
```

Built for **Problem Statement 2: Building Belonging Through Community Participation**

---

## WORLD MAP

```
  [Login] --> [Personality Quiz] --> [Hub Selection]
                                          |
              +---------------------------+---------------------------+
              |              |            |            |              |
          [Living Hub]  [Quest Board]  [Chat]    [Gallery]     [Profile]
              |              |                        |              |
              |        [Create Quest]                 |        [Monster Stats]
              |              |                        |        [Evolution]
              |         [Lobby] -----> [Check-In] ----+        [Item Shop]
              |                            |                   [Egg Shop]
              |                      [Group Photo]             [Insights]
              |                      [Reactions]
              |                      [Rewards!]
              +----------------------------------------------------+
```

---

## MONSTER CODEX — 9 Starter Beasts

Your monster is assigned through a **Personality Quiz** — 5 trait-scoring questions that reveal your social style.

| Type | Name | Sprite | Traits |
|------|------|--------|--------|
| 1 | **Penguin** | `penguin-penguin-dancing.gif` | Adventurous, Creative |
| 2 | **Seal** | `torp-the-seal.gif` | Calm, Creative |
| 3 | **Cleffa** | `pokemon-cleffa.gif` | Friendly, Gentle |
| 4 | **Duck** | `dancing-duck-karlo.gif` | Playful, Social |
| 5 | **Pixie** | `cute-pixel.gif` | Curious, Kind |
| 6 | **Follony** | `follony-side-1-yume-nikki.gif` | Mysterious, Thoughtful |
| 7 | **Hamster** | `hamster-hamtaro.gif` | Energetic, Loyal |
| 8 | **Pixie2** | `cute-pixel-2.gif` | Dreamy, Artistic |
| 9 | **Excited** | `excited-happy.gif` | Bold, Enthusiastic |

> 18 additional static monster sprites (`1.png` — `18.png`) are available for collection and display.

### EVOLUTION TREE

```
                          +---> [LEADER]   (group quest ratio > 70%)
                          |
  [BABY] --Lv5--> [TEEN] --Lv20--> [ADULT]    (default path)
                          |
                          +---> [SUPPORT]  (5+ volunteer quests)
```

- **Crystals** fuel leveling: `level = floor(crystals / 100) + 1`
- Evolution is **manual** — triggered from the Profile page when requirements are met
- Note:Only Penguin currently has unique evolved sprites; other beasts keep their base form. For future developments, all other creatures will have its own evolved animation.

---

## QUEST SCROLL — 27 Quest Types

Real-world activities designed for genuine human connection, not screen time.

| Quest | Duration | Party Size | Crystals | Vibe |
|-------|----------|------------|----------|------|
DEVELOPED:
| Coffee Chat | 20 min | 2–3 | 50 | casual, indoor |
| Study Jam | 60 min | 3–5 | 100 | productive, indoor |
| Sunset Walk | 30 min | 2–4 | 75 | outdoor, relaxing |
| Help a Neighbor | 15 min | 2 | 60 | volunteer, community |
| Lunch Crew | 45 min | 3–6 | 80 | food, social |
FUTURE DEVELOPMENT:
| Game Night | 90 min | 4–8 | 150 | fun, indoor |
| Morning Workout | 40 min | 2–6 | 90 | fitness, outdoor |
| Art Cafe | 60 min | 3–5 | 110 | creative, indoor |
| Board Game Night | 120 min | 3–6 | 150 | social, games |
| Cooking Together | 90 min | 2–4 | 125 | food, skill-building |
| Photography Walk | 60 min | 2–5 | 80 | outdoor, creative |
| Karaoke Session | 90 min | 3–8 | 110 | music, fun |
| Hiking Adventure | 180 min | 3–8 | 200 | nature, adventure |
| Book Club | 75 min | 3–8 | 95 | intellectual, reading |
| Movie Night | 150 min | 3–10 | 90 | entertainment |
| Beach Cleanup | 90 min | 4–12 | 140 | volunteer, environment |
| Group Yoga | 60 min | 3–10 | 85 | wellness, outdoor |
| Trivia Night | 120 min | 3–6 | 130 | competitive, intellectual |
| Poetry Slam | 75 min | 3–10 | 95 | creative, art |
| Group Bike Ride | 90 min | 3–8 | 115 | fitness, exploration |
| Picnic in the Park | 90 min | 3–10 | 85 | food, relaxing |
| Skill Swap Workshop | 60 min | 3–6 | 105 | skill-building, collaborative |
| Farmers Market Visit | 60 min | 2–6 | 70 | food, community |
| Meditation Circle | 45 min | 3–12 | 75 | wellness, mindfulness |
| Dance Class | 75 min | 4–12 | 110 | fitness, fun |
| Star Gazing Night | 90 min | 2–8 | 80 | nature, educational |
| Community Volunteering | 120 min | 4–15 | 160 | volunteer, meaningful |
| Pottery Workshop | 120 min | 3–8 | 135 | creative, art |

> Players can also **create custom quests** (requires Level 4+ and 100 coins).

---

## GAME MECHANICS

### Currency System

```
  +----------+     quest rewards     +----------+
  | CRYSTALS | <==================== | QUESTS   |
  | (primary)|    group bonus: 1.5x  | (IRL)    |
  +----------+                       +----------+

  +----------+
  |  COINS   | -----> Item Shop, Egg Shop, Quest Creation
  | (secondary)
  +----------+
```

### Quest Completion Flow

```
  1. JOIN QUEST          Party gathers in the lobby
         |
  2. READY UP            All members hit "Ready"
         |
  3. MEET IRL            Go do the activity together!
         |
  4. GROUP PHOTO         One person uploads, all can see it
         |
  5. REACTION MATCH      Everyone picks the same emoji to verify attendance(3 tries!)
         |
    [MATCHED?]
     /       \
   YES        NO
    |          |
  REWARDS!   Quest deleted, no crystals.
  Crystals + Coins awarded to all participants.
```

### Marketplace

| Shop | What You Get | Cost |
|------|-------------|------|
| **Item Shop** | Hats, outfits for your monster | Coins |
| **Egg Shop** | Mystery eggs that hatch new monsters | Coins |

---

## FEATURE LIST

### Authentication & Onboarding
- Google OAuth 2.0 login (with Drive scope for photo uploads)
- Demo mode — no account needed, restricted actions
- Personality Quiz — 5 questions assign your starter monster. Monster assigned based on traits!
- GPS-based hub auto-selection

### Living Hub
- Interactive pixel scene with animated monsters
- See other hub members roaming in real-time
- Float, pulse, walk sprite animations

### Quest System
- 27 seeded quest templates across all social categories
- Create custom quests (Level 4+, costs 100 coins)
- Data-driven recommendations (type, group size, time of day)
- Auto-expiring deadlines
- Host controls and quest deletion

### Lobby & Pre-Quest
- Real-time participant list with monster previews
- Ready-up system (all must confirm)
- Lobby chat and emote system
- Host management

### Quest Completion (Multi-Step Verification)
- Group photo capture (camera or file upload)
- Real-time photo sync across all participants
- Group reaction matching for attendance (3 attempts, must all pick the same)
- Success rewards or quest deletion on failure

### Monster Progression
- Crystal + coin dual-currency economy
- Level-up via crystals (`level = crystals/100 + 1`)
- 4-stage evolution: Baby -> Teen -> Adult -> Leader/Support
- 9 animated monster types + 18 collectible static sprites (Animated=rare)
- Monster renaming, collection, and switching
- Egg hatching with random evolution rolls

### Customization
- Item shop (hats, outfits)
- Equipment slots (hat + outfit)
- Skin system (unlock and equip)
- Egg shop (buy, hatch, collect)

### Gallery
- Group photo gallery from all completed quests
- Quest-scoped photo sharing (all quest participants can view)
- Lightbox view with quest details and uploader info
- Download and delete

### Social & Insights
- Connections list — track who you've met
- Social score (grows faster from group activities)
- Belonging survey with trend tracking over time
- Insights dashboard: personality radar, quest type breakdown, weekly activity chart, connections growth, belonging line chart

### Profile & Stats
- Monster card with animated sprite
- Stats: quests completed, crystals, level, social score, connections
- Quest history log
- Evolution trigger (manual, from profile page)

### Safety & Moderation
- Google account verification
- Report system for flagging behavior
- In-app notification system
- Public meet locations enforced by design

### Chat
- Lobby-based real-time messaging


## Reccomendation Engine by Collection of data

- Reccomends quests to users based on their personality trait.
- Suggest quest to work on areas of imporvement based on users personality trait.
- Personalised and tailored to each individual user based on the personality type.
- Self sustaining and continously works on a feedback loop as quests are completed and personality scores are updated, keeping reccomendation fresh and unique as user completes more quest!

## TECH STACK

```
 FRONTEND                          BACKEND
 +---------------------------+     +---------------------------+
 | React 18 + Vite 5         |     | FastAPI (Python)          |
 | TailwindCSS 3             |     | SQLAlchemy ORM            |
 | Zustand 4 (persist)       |     | PostgreSQL 17 (Neon)      |
 | React Router v6           |     | Google OAuth 2.0          |
 | @react-oauth/google       |     | Google Drive API          |
 | qrcode.react              |     | python-jose (JWT)         |
 | html5-qrcode              |     | httpx                     |
 | recharts (insights)       |     | uvicorn                   |
 +---------------------------+     +---------------------------+
              |                                 |
              +--------[ Docker Compose ]--------+
```

**Pixel Theme**: Custom TailwindCSS config with `pixel-purple`, `pixel-pink`, `pixel-blue`, `pixel-green`, `pixel-yellow`, `pixel-dark`, `pixel-light` color palette. Fonts: `Press Start 2P` (headers), `VT323` (body). All sprites use `image-rendering: pixelated`.

---

## GETTING STARTED

### Quick Start (Docker)

```bash
git clone <repo-url>
cd Gatherlings
```

Create `.env.local` in the project root:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=your_postgresql_connection_string
```

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Manual Setup

#### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- PostgreSQL database (e.g. Neon)

#### Frontend
```bash
npm install
npm run dev          # http://localhost:3000
```

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py       # http://localhost:8000
```

#### Production Build
```bash
npm run build
npm run preview
```

### Demo Mode

No Google account? No problem. Click **"Try Demo"** on the login screen to jump straight in with a temporary player.

---

## PROJECT STRUCTURE

```
Gatherlings/
+-- src/                              # Frontend (React + Vite)
|   +-- pages/                        # 12 route components
|   |   +-- Login.jsx                 #   Google OAuth + demo login
|   |   +-- PersonalityQuiz.jsx       #   5-question monster assignment
|   |   +-- CharacterCreation.jsx     #   Custom character setup
|   |   +-- HubSelection.jsx          #   GPS-based hub picker
|   |   +-- LivingHub.jsx             #   Interactive pixel scene
|   |   +-- QuestBoard.jsx            #   Browse & join quests
|   |   +-- CreateQuest.jsx           #   Create custom quests
|   |   +-- Lobby.jsx                 #   Pre-quest gathering
|   |   +-- QRCheckIn.jsx             #   Multi-step quest completion
|   |   +-- Chat.jsx                  #   Lobby messaging
|   |   +-- GroupPhotoGallery.jsx     #   Quest photo gallery
|   |   +-- Profile.jsx               #   Monster stats & evolution
|   +-- components/                   # Reusable UI
|   |   +-- PixelMonster.jsx          #   Monster sprite renderer
|   |   +-- NavigationBar.jsx         #   Fixed bottom nav (5 tabs)
|   |   +-- EvolutionOverlay.jsx      #   Evolution animation
|   |   +-- WelcomePopup.jsx          #   First-time welcome
|   |   +-- LoginBackground.jsx       #   Animated login backdrop
|   |   +-- insights/                 #   7 chart/stat components
|   +-- stores/                       # Zustand state (5 stores)
|   |   +-- authStore.js              #   User, token, hub
|   |   +-- monsterStore.js           #   Monster, inventory, photos
|   |   +-- hubStore.js               #   Online users, polling
|   |   +-- dataStore.js              #   Quest history, recommendations
|   |   +-- chatStore.js              #   Messages, conversations
|   +-- characters/                   # 11 animated GIF sprites
|   +-- monster_imgs/                 # 18 static PNG monster sprites
|   +-- icons/                        # Quest category icons
|   +-- utils/                        # Shared utilities
|   +-- App.jsx                       # Router + protected routes
|   +-- api.js                        # Axios instance with auth headers
|   +-- main.jsx                      # React entry point
|   +-- index.css                     # Tailwind + custom animations
+-- backend/                          # Backend (FastAPI + SQLAlchemy)
|   +-- main.py                       # All API endpoints + seed data
|   +-- models.py                     # 16 SQLAlchemy ORM models
|   +-- database.py                   # DB engine + session factory
|   +-- requirements.txt              # Python dependencies
|   +-- Dockerfile                    # Backend container
|   +-- neon_migration_*.sql          # DB migration scripts
+-- docker-compose.yaml               # Full stack in one command
+-- Dockerfile                        # Frontend container
+-- package.json                      # Node dependencies + scripts
+-- vite.config.js                    # Vite config (port 3000)
+-- tailwind.config.js                # Pixel theme + custom fonts
+-- postcss.config.js                 # PostCSS for Tailwind
+-- index.html                        # SPA entry point
```

---

## DATA & PRIVACY

### What We Track (Minimal & Ethical)
- Quest completions and drop-offs
- Preferred quest categories and group sizes
- Time-of-day participation patterns
- Repeat interaction metrics
- Optional 1-tap belonging score

### How We Use It
- Recommend quests you're likely to complete
- Suggest optimal group sizes to reduce friction
- Boost high-success quests in your hub
- Detect disengagement and offer lower-pressure options

> All frontend state persists client-side via Zustand. Backend persists to PostgreSQL (Neon).

---

## MEASURABLE IMPACT

```
 +---------------------+------------------------------------------+
 | KPI                 | What It Measures                         |
 +---------------------+------------------------------------------+
 | Weekly Active Quests| >= 1 quest/week per user                 |
 | Repeat Rate         | Returning to same group/hub              |
 | Group Quest Ratio   | Group vs solo activity balance           |
 | Belonging Score     | Self-reported trend over time            |
 | Connections Count   | Unique people met through quests         |
 | Social Score        | Cumulative social engagement weight      |
 +---------------------+------------------------------------------+
```

---

## WHY BUDDYBEASTS

```
 [x] Targets the root cause    -- lack of repeated, meaningful social participation
 [x] Gamification over guilt   -- makes reaching out fun, not scary
 [x] Data-driven matching      -- continuously learns what connects people
 [x] Online + offline          -- pixel hub presence + real-world GPS check-ins
 [x] Proof of presence         -- QR codes + photos + reaction matching
 [x] Sustainable by design     -- reinforces bonds through repeated interactions
 [x] Low barrier to entry      -- demo mode, 15-min quests, small groups
```

---

## ROADMAP

- [ ] WebSocket real-time updates (replace polling)
- [ ] Google Drive photo integration (upload quest photos to user's Drive)
- [ ] Push notifications for quest reminders
- [ ] Achievement system and leaderboards
- [ ] Hub creator tools
- [ ] LLM-powered dynamic quest descriptions and community summaries
- [ ] Advanced analytics dashboard

---

## CONTRIBUTING

This project was built for a hackathon. Fork it, extend it, build belonging in your own community.

## LICENSE

MIT License — use freely for community-building initiatives.

---

```
 +-------------------------------------------------------+
 |                                                       |
 |   "BuddyBeasts turns local social connection into    |
 |    a living pixel world -- where real-world group     |
 |    quests grow your monster, and data-driven          |
 |    recommendations help people show up again          |
 |    and again."                                        |
 |                                                       |
 +-------------------------------------------------------+

          Built with <3 for Building Belonging
                    Hackathon 2026
```
