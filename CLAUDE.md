# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BuddyBeasts (Gatherlings) is a mobile-first web game that reduces social isolation through gamified community participation. Users join GPS-based hubs, complete real-world group quests, and grow pixel monsters. Built for a hackathon — all state is client-side only (localStorage via Zustand persist).

## Commands

- `npm run dev` — Start Vite dev server at http://localhost:3000
- `npm run build` — Production build to `/dist`
- `npm run preview` — Preview production build

No test runner or linter is configured.

## Tech Stack

React 18 + Vite 5 + TailwindCSS 3 + Zustand 4 + React Router v6. Google OAuth for auth (with demo login fallback). QR code generation/scanning via qrcode.react and html5-qrcode.

## Architecture

### Routing (App.jsx)

All routes except `/login` are protected via `ProtectedRoute`. Flow: Login → PersonalityQuiz → HubSelection → protected app routes (`/hub`, `/quests`, `/lobby/:questId`, `/checkin/:questId`, `/chat`, `/gallery`, `/profile`).

### State Management (src/stores/)

Five Zustand stores, all using `persist` middleware to localStorage:

- **authStore** — User identity (Google OAuth or demo) and selected hub
- **monsterStore** — Monster progression, evolution, crystals/coins, inventory, skins, equipped items, group photos
- **hubStore** — Online users list with simulated polling via `setInterval`
- **dataStore** — Quest history, drop-off tracking, recommendation engine
- **chatStore** — Messages, conversations, quest participant tracking

### Pages (src/pages/)

Each page is a self-contained route component. Key pages: `LivingHub` (interactive pixel scene with monster movement), `QuestBoard` (quest listing + data-driven recommendations), `Lobby` (pre-quest gathering with campfire scene), `QRCheckIn` (multi-step verification: emotes → reactions → group memory → photo upload), `Profile` (monster stats, evolution, item/egg shop).

### Components (src/components/)

- `NavigationBar` — Fixed bottom nav (Hub, Quests, Chat, Gallery, Profile), included on all protected pages
- `PixelMonster` — Monster rendering with sprite images from `src/monster_imgs/` (18 types, numbered 1-18)
- `LoginBackground` — Animated login page background

### Styling

TailwindCSS with a custom pixel theme defined in `tailwind.config.js`:
- Colors: `pixel-purple`, `pixel-pink`, `pixel-blue`, `pixel-green`, `pixel-yellow`, `pixel-dark`, `pixel-light`
- Fonts: `font-pixel` (Press Start 2P) for headers, `font-game` (VT323) for body text
- Custom CSS animations in `index.css`: float, pulse, walk, emote-pop
- All sprites use `image-rendering: pixelated`

### Game Mechanics

- **Crystals**: Primary currency earned from quests (50-100+). 1.5x group bonus.
- **Coins**: Secondary currency (percentage of crystals), spent in item shop.
- **Evolution**: Baby → Teen (1000 crystals, level 10) → Adult (2000 crystals, level 20) → Leader (high group ratio) or Support (volunteer focus)
- **Monster types**: 18 types assigned via PersonalityQuiz (5 trait-scoring questions)

### Environment

`VITE_GOOGLE_CLIENT_ID` in `.env.local` for Google OAuth. Demo mode works without it.
