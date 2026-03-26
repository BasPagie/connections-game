# Connections Game

A Dutch word puzzle game for our weekly team quiz. Mixes NYT Connections with De Slimste Mens Puzzelronde. Multiplayer, real-time, runs in the browser.

## What it does

Two game modes:

- **Connections** — 16 words on screen, group them into 4 categories
- **Puzzelronde** — see clue words per group, guess the connecting word (compound words or associations)

The host creates a room, shares the link, and everyone joins on their own device. Host picks the rounds, difficulty, number of lives, etc. Results get revealed Kahoot-style at the end.

60 puzzles included (all Dutch), 3 difficulty levels, configurable timer and lives.

## Setup

```bash
npm run install:all
npm run dev
```

Client runs on `localhost:5173`, server on `localhost:3001`.

## Stack

- **Client**: React, TypeScript, Vite, Tailwind, Framer Motion
- **Server**: Node.js, Express, Socket.IO, TypeScript
- **Shared**: TypeScript types used by both client and server

## Project structure

```
client/src/
  components/    # game UI
  context/       # game state + socket
  pages/         # Landing, Join, Lobby, Game, Results

server/src/
  gameEngine.ts      # round logic, scoring
  puzzleStore.ts     # all 60 puzzles
  socketHandlers.ts  # socket events
  rooms.ts           # room management

shared/
  types.ts           # shared types
```
