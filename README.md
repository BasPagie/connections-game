# Connections Game

A Dutch multiplayer word puzzle game for our weekly team quiz. Mixes NYT Connections with De Slimste Mens. Real-time, runs in the browser.

## Game modes

Three game modes, freely mixable per round:

- **🔗 Connections** — 16 words on screen, group them into 4 categories of 4. 100 pts per group, −25 for wrong guesses. Partial-match hints highlight words that belong together.
- **🧩 Puzzelronde** — 12 words in 3 groups. Find the groups, then type the connecting word. 100 pts per group + 150 bonus for the correct connecting word. Fuzzy matching accepts small typos.
- **🚪 Open Deur** — 3 questions, each with 4 correct answers. Type as many as you can. 50 pts per answer, no penalty for wrong guesses. Skip questions if you're stuck.

## How it works

The host creates a room and shares the invite link. Everyone joins on their own device. The host configures:

- Which game modes and difficulty per round (up to 5 rounds)
- Lives (1–10) or unlimited attempts
- Timer (1–5 min or no limit)
- Whether the host plays or spectates

Everyone plays simultaneously. Speed bonus for finishing early. Results are revealed after each round with rankings.

90 puzzles included (30 per mode, all Dutch), 3 difficulty levels.

## Setup

```bash
npm run install:all
npm run dev
```

Client runs on `localhost:5173`, server on `localhost:3001`.

## Stack

- **Client**: React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion
- **Server**: Node.js, Express, Socket.IO, TypeScript
- **Shared**: TypeScript types used by both client and server

## Project structure

```
client/src/
  components/    # game UI (ConnectionsGame, PuzzelrondeGame, OpenDeurGame, ...)
  context/       # game state (GameContext) + socket (SocketContext)
  hooks/         # useSocketEvents
  pages/         # Landing, Join, Lobby, Game, Results

server/src/
  gameEngine.ts      # round logic, scoring, fuzzy matching
  puzzleStore.ts     # all 90 puzzles
  socketHandlers.ts  # socket events, rate limiting
  rooms.ts           # room management

shared/
  types.ts           # shared types + socket event contracts
```
