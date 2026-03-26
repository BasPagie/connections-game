# Connections Game 🎯

A multiplayer Dutch word puzzle game combining **NYT Connections** and **De Slimste Mens Puzzelronde**, built for weekly team quizzes.

## Features

- **Two game modes**: Connections (group 16 words into 4 categories) and Puzzelronde (find the connecting word for groups of clue words)
- **Real-time multiplayer** via Socket.IO — play on any device in the same room
- **Host controls** — the host manages rounds, can spectate or play along
- **Difficulty levels** — Easy, Medium, and Hard puzzles for both game modes
- **60 built-in puzzles** — 30 Connections + 30 Puzzelronde, all in Dutch
- **Mixed puzzle styles** — compound word puzzles and associative clue puzzles (De Slimste Mens style)
- **Suspenseful results** — Kahoot-style reveal at the end of each game
- **Countdown timer** — configurable time limit per round
- **Score editing** — host can adjust scores in the lobby
- **Mobile-friendly** — responsive design with Tailwind CSS

## Tech Stack

| Layer   | Tech |
|---------|------|
| Client  | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Server  | Node.js, Express, Socket.IO, TypeScript |
| Shared  | Shared TypeScript types between client and server |

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Start both server and client in dev mode
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

## Project Structure

```
connections-game/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/  # Game UI components
│       ├── context/     # React context (game state, socket)
│       ├── hooks/       # Socket event handlers
│       └── pages/       # Landing, Join, Lobby, Game, Results
├── server/          # Express + Socket.IO backend
│   └── src/
│       ├── gameEngine.ts      # Core game logic & scoring
│       ├── puzzleStore.ts     # All 60 puzzles
│       ├── socketHandlers.ts  # Socket event handling
│       └── rooms.ts           # Room management
└── shared/          # Shared TypeScript types
    └── types.ts
```

## How to Play

1. One player creates a room from the landing page
2. Share the room link with other players
3. The host configures rounds (game mode, difficulty) and starts the game
4. **Connections**: Select 4 words that belong together — find all 4 groups
5. **Puzzelronde**: Look at the clue words and guess the connecting word
6. Points are awarded for correct answers, with speed bonuses
