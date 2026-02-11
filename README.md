# BuddyBeasts - Pixel Monster Community Quest Game

> **Turn local social connection into a living pixel world** – where real-world group quests grow your monster, and data-driven recommendations help people show up again and again.

Built for **Problem Statement 2: Building Belonging Through Community Participation**

## 🎮 What is BuddyBeasts?

A GPS-based, community-centered mobile-first web game that reduces isolation by turning real-world social participation into a shared, playful experience. Users join nearby hubs, complete in-person group quests, and grow pixelated monsters together.

## ✨ Core Features

### 1. **Google OAuth Login**
- Fast, low-friction authentication
- Secure user verification for safe meetups

### 2. **GPS-Based Hub System**
- Automatically assigns users to nearby community hubs
- Manual hub selection available if GPS is unavailable
- Real-time view of active users in each hub

### 3. **Living Pixel Hub**
- Interactive pixel-art "town" scene
- Your monster walks around with animations
- See other users' monsters roaming in real-time
- Tap monsters to interact or join lobbies

### 4. **Quest Board**
- Social, location-based quests designed for real connection:
  - ☕ Coffee Chat (2-3 people, 20 min)
  - 📚 Study Jam (3 people, 60 min)
  - 🌅 Sunset Walk (2-4 people, 30 min)
  - 🤝 Help a Neighbor (2 people, 15 min)
  - And more!
- Data-driven quest recommendations based on your preferences
- Difficulty levels and crystal rewards

### 5. **Lobby System**
- Online-to-offline bridge
- Monsters gather around a pixel campfire
- Simple icebreaker actions (wave, cheer, ready button)
- Real-time participant tracking

### 6. **QR Code Check-In**
- Verify in-person meetups with a group photo
- Attendance confirmed via matching emoji reactions
- Encourages real participation, not solo grinding
- Promotes safe, public meetups

### 7. **Monster Evolution System**
- Earn crystals by completing quests
- Monster evolution reflects social growth:
  - **Baby** → **Teen** → **Adult**
  - Special evolutions: **Leader** (group quests) or **Support** (volunteer quests)
- Traits earned through repeated participation

### 8. **Data-Driven Personalization**
- Tracks quest completions, preferences, and patterns
- Recommends quests you'll actually enjoy and complete
- Suggests optimal group sizes to reduce friction
- Optional weekly "belonging score" tracking

## 🎯 Measurable Impact

BuddyBeasts tracks meaningful outcomes:

### Primary KPIs
- Weekly active social participation (≥1 quest/week)
- Repeat interaction rate (returning to same group/hub)
- Group vs solo quest ratio
- Belonging score changes over time

## 🛡️ Safety & Trust

- Verified Google accounts
- Public meet locations only
- Small group defaults for first interactions
- Report/block features built-in
- Moderation tools for hubs and quests

## 🚀 Getting Started

### Quick Start (Docker)

The fastest way to run the full stack (frontend + backend):

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Gatherlings
   ```

2. **Set up environment variables**

   Create a `.env.local` file in the project root:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   DATABASE_URL=your_postgresql_connection_string_here
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker compose up --build
   ```

4. **Open in browser**
   - Frontend: `http://localhost:3000`
   - Backend API docs: `http://localhost:8000/docs`
   - Backend health check: `http://localhost:8000/api/health`

   To run in the background, add `-d`:
   ```bash
   docker compose up --build -d
   ```

   To stop:
   ```bash
   docker compose down
   ```

### Manual Setup (Without Docker)

#### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- A PostgreSQL database (e.g. Neon)

#### Frontend

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the dev server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

#### Backend

1. **Create a virtual environment and install dependencies**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run the backend**
   ```bash
   python main.py
   ```
   Runs at `http://localhost:8000` (API docs at `/docs`)

### Building for Production

```bash
npm run build
npm run preview
```

## 🎨 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: FastAPI (Python) with 39 REST endpoints
- **Database**: PostgreSQL 17 (Neon) via SQLAlchemy ORM
- **Styling**: TailwindCSS with custom pixel art theme
- **State Management**: Zustand (with persistence)
- **Authentication**: Google OAuth 2.0
- **QR Codes**: qrcode.react
- **Routing**: React Router v6
- **Containerization**: Docker + Docker Compose
- **Fonts**: Press Start 2P (pixel), VT323 (game)

## 📱 Mobile-First Design

BuddyBeasts is optimized for mobile devices:
- Touch-friendly interface
- Responsive layouts (320px - 768px+)
- PWA-ready structure
- GPS integration for location services
- Optimized animations for mobile performance

## 🎯 Demo Mode

The app includes a **Demo Login** option that works without Google OAuth setup, perfect for:
- Quick testing
- Hackathon demos
- Local development

Simply click "Try Demo" on the login page!

## 📊 Data & Privacy

### What We Track (Minimal & Ethical)
- Quest completions and drop-offs
- Preferred quest categories and group sizes
- Time-of-day patterns
- Repeat participation metrics
- Optional 1-tap belonging score

### How We Use It
- Recommend quests you're likely to complete
- Suggest optimal group sizes
- Boost high-success quests in your hub
- Detect disengagement and offer lower-pressure options

**Frontend stores data client-side via Zustand persist. Backend persists all data to PostgreSQL (Neon).**

## 🔮 Future Enhancements (Phase 2)

- Frontend-backend API integration (backend is ready, frontend calls pending)
- WebSocket for true real-time updates
- LLM integration (via Emergent API) for:
  - Dynamic quest descriptions
  - Welcoming messages
  - Community summaries
- Push notifications for quest reminders
- Achievement system and leaderboards
- Hub creator tools
- Advanced analytics dashboard

## 🏆 Why BuddyBeasts Wins

✅ **Targets the root cause**: Lack of repeated, meaningful social participation  
✅ **Gamification lowers barriers**: Makes reaching out fun, not scary  
✅ **Data-driven improvement**: Continuously learns what connects people  
✅ **Both online & offline**: Living hub presence + real-world GPS check-ins  
✅ **Sustainable design**: Reinforces community bonds through repeated interactions  

## 📝 Project Structure

```
Gatherlings/
├── src/                       # Frontend (React)
│   ├── components/            # Reusable UI components
│   │   ├── NavigationBar.jsx
│   │   └── PixelMonster.jsx
│   ├── pages/                 # Main application pages
│   │   ├── Login.jsx
│   │   ├── HubSelection.jsx
│   │   ├── LivingHub.jsx
│   │   ├── QuestBoard.jsx
│   │   ├── Lobby.jsx
│   │   ├── QRCheckIn.jsx
│   │   └── Profile.jsx
│   ├── stores/                # Zustand state management
│   │   ├── authStore.js
│   │   ├── monsterStore.js
│   │   ├── hubStore.js
│   │   └── dataStore.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/                   # Backend (FastAPI + SQLAlchemy)
│   ├── main.py                # 39 API endpoints
│   ├── models.py              # 16 SQLAlchemy ORM models
│   ├── database.py            # DB engine, session, dependency
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
├── docker-compose.yaml        # Run full stack with one command
├── Dockerfile                 # Frontend container
├── .env.local                 # Environment variables (not in git)
├── .gitignore
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🤝 Contributing

This project was built for a hackathon. Feel free to fork and extend it!

## 📄 License

MIT License - feel free to use this project for your own community-building initiatives!

## 🌟 One-Line Pitch

**"BuddyBeasts turns local social connection into a living pixel world—where real-world group quests grow your monster, and data-driven recommendations help people show up again and again."**

---

Built with 💙 for Building Belonging | Hackathon 2026
