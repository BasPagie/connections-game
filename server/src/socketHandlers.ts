import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  GameSettings,
  RoundResult,
} from '../../shared/types.js';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  getSocketMapping,
  getSocketIdForPlayer,
  updateSettings,
  isHost,
} from './rooms.js';
import {
  startRound,
  getPlayerRoundState,
  submitGroupGuess,
  submitAnswer,
  getPlayerProgress,
  isRoundComplete,
  forceEndRound,
  getRoundResult,
  getFinalResults,
  startTimer,
  cleanupGame,
} from './gameEngine.js';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Store round results per room for final results
const roomRoundResults = new Map<string, RoundResult[]>();

export function registerSocketHandlers(io: IOServer, socket: IOSocket): void {

  // ─── Create Room ─────────────────────────────────────
  socket.on('create-room', ({ nickname, avatarUrl }) => {
    const result = createRoom(socket.id, nickname, avatarUrl);
    socket.join(result.room.roomId);
    socket.emit('room-created', { roomId: result.room.roomId, player: result.player });
    console.log(`[Room] Aangemaakt: ${result.room.roomId} door ${nickname}`);
  });

  // ─── Join Room ───────────────────────────────────────
  socket.on('join-room', ({ roomId, nickname, avatarUrl }) => {
    const result = joinRoom(socket.id, roomId, nickname, avatarUrl);
    if (!result) {
      socket.emit('error', { message: 'Kamer niet gevonden of spel is al begonnen.' });
      return;
    }
    socket.join(roomId);
    socket.emit('room-joined', { room: result.room, player: result.player });
    socket.to(roomId).emit('player-joined', { player: result.player });
    console.log(`[Room] ${nickname} is toegetreden tot ${roomId}`);
  });

  // ─── Leave Room ──────────────────────────────────────
  socket.on('leave-room', () => {
    handleLeave(io, socket);
  });

  // ─── Update Settings ─────────────────────────────────
  socket.on('update-settings', (settings: GameSettings) => {
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    if (!isHost(mapping.roomId, mapping.playerId)) {
      socket.emit('error', { message: 'Alleen de host kan instellingen wijzigen.' });
      return;
    }

    const success = updateSettings(mapping.roomId, settings);
    if (success) {
      io.to(mapping.roomId).emit('settings-updated', settings);
    }
  });

  // ─── Update Score (Lobby) ────────────────────────────
  socket.on('update-score', ({ playerId, score }) => {
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    if (!isHost(mapping.roomId, mapping.playerId)) return;

    const room = getRoom(mapping.roomId);
    if (!room || room.status !== 'lobby') return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    player.score = score;
    io.to(mapping.roomId).emit('score-updated', { playerId, score });
  });

  // ─── Start Game ──────────────────────────────────────
  socket.on('start-game', () => {
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room) return;

    if (room.settings.hostControl && !isHost(mapping.roomId, mapping.playerId)) {
      socket.emit('error', { message: 'Alleen de host kan het spel starten.' });
      return;
    }

    if (room.players.length < 1) {
      socket.emit('error', { message: 'Er zijn niet genoeg spelers.' });
      return;
    }

    // Ensure at least one player is actually playing
    const activePlayers = room.players.filter(
      (p) => !(p.isHost && !room.settings.hostPlays)
    );
    if (activePlayers.length < 1) {
      socket.emit('error', { message: 'Er moet minstens 1 speler meedoen.' });
      return;
    }

    room.status = 'playing';
    room.currentRoundIndex = 0;
    roomRoundResults.set(room.roomId, []);

    io.to(room.roomId).emit('game-started');

    // Countdown 3-2-1-GO before starting the first round
    const roomId = room.roomId;
    let count = 3;
    // Emit first count immediately, then tick every second
    io.to(roomId).emit('countdown', { count });
    count--;
    const countdownInterval = setInterval(() => {
      if (count >= 0) {
        io.to(roomId).emit('countdown', { count });
        count--;
      } else {
        clearInterval(countdownInterval);
        startNewRound(io, roomId);
      }
    }, 1000);
  });

  // ─── Submit Group Guess ──────────────────────────────
  socket.on('submit-group', ({ words }) => {
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room || room.status !== 'playing') return;

    const result = submitGroupGuess(mapping.roomId, mapping.playerId, words, room);
    if (!result) return;

    // Get updated state for this player
    const roundState = getPlayerRoundState(mapping.roomId, mapping.playerId, room);
    if (!roundState) return;

    socket.emit('group-result', {
      correct: result.correct,
      group: result.group,
      roundState,
      hintWords: result.hintWords,
    });

    // Broadcast progress to all
    const progress = getPlayerProgress(mapping.roomId);
    io.to(mapping.roomId).emit('player-progress', progress);

    // Check if round is complete
    if (isRoundComplete(mapping.roomId)) {
      endCurrentRound(io, mapping.roomId);
    }
  });

  // ─── Submit Answer (Puzzelronde) ─────────────────────
  socket.on('submit-answer', ({ answer }) => {
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room || room.status !== 'playing') return;

    const result = submitAnswer(mapping.roomId, mapping.playerId, answer, room);
    if (!result) return;

    const roundState = getPlayerRoundState(mapping.roomId, mapping.playerId, room);
    if (!roundState) return;

    socket.emit('answer-result', {
      correct: result.correct,
      correctAnswer: result.correctAnswer,
      roundState,
    });

    // Broadcast progress
    const progress = getPlayerProgress(mapping.roomId);
    io.to(mapping.roomId).emit('player-progress', progress);

    if (isRoundComplete(mapping.roomId)) {
      endCurrentRound(io, mapping.roomId);
    }
  });

  // ─── Next Round ──────────────────────────────────────
  socket.on('next-round', () => {
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room) return;

    if (room.settings.hostControl && !isHost(mapping.roomId, mapping.playerId)) return;

    room.currentRoundIndex++;

    if (room.currentRoundIndex >= room.settings.rounds.length) {
      // Game over
      endGame(io, room.roomId);
    } else {
      startNewRound(io, room.roomId);
    }
  });

  // ─── Play Again ──────────────────────────────────────
  socket.on('play-again', () => {
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room) return;

    if (room.settings.hostControl && !isHost(mapping.roomId, mapping.playerId)) return;

    // Reset room
    room.status = 'lobby';
    room.currentRoundIndex = 0;
    for (const player of room.players) {
      player.score = 0;
    }
    roomRoundResults.delete(room.roomId);

    // Notify each player individually with their own player object
    for (const player of room.players) {
      const playerSocketId = getSocketIdForPlayer(room.roomId, player.id);
      if (playerSocketId) {
        io.to(playerSocketId).emit('room-joined', { room, player });
      }
    }
  });

  // ─── Disconnect ──────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[Socket] Verbinding verbroken: ${socket.id}`);
    handleLeave(io, socket);
  });
}

// ─── Helpers ───────────────────────────────────────────

function handleLeave(io: IOServer, socket: IOSocket): void {
  const result = leaveRoom(socket.id);
  if (!result) return;

  socket.leave(result.roomId);

  if (!result.roomDeleted) {
    io.to(result.roomId).emit('player-left', {
      playerId: result.playerId,
      newHostId: result.newHostId,
    });
  }

  console.log(`[Room] Speler ${result.playerId} has verlaten ${result.roomId}`);
}

function startNewRound(io: IOServer, roomId: string): void {
  const room = getRoom(roomId);
  if (!room) return;

  const result = startRound(room);
  if (!result) {
    io.to(roomId).emit('error', { message: 'Kon de ronde niet starten. Geen puzzels beschikbaar.' });
    return;
  }

  const roundConfig = room.settings.rounds[room.currentRoundIndex];

  // Send personalized round state to each player
  for (const player of room.players) {
    const playerState = getPlayerRoundState(roomId, player.id, room);
    if (playerState) {
      // Find the socket(s) for this player — we use the room broadcast
      io.to(roomId).emit('round-start', {
        roundIndex: room.currentRoundIndex,
        roundState: playerState,
        roundType: roundConfig.type,
      });
      break; // All players get same initial state
    }
  }

  // Start timer if configured
  if (room.settings.timeLimitSeconds) {
    startTimer(
      roomId,
      (timeRemainingMs) => {
        io.to(roomId).emit('time-update', { timeRemainingMs });
      },
      () => {
        forceEndRound(roomId);
        endCurrentRound(io, roomId);
      }
    );
  }
}

function endCurrentRound(io: IOServer, roomId: string): void {
  const room = getRoom(roomId);
  if (!room) return;

  const roundResult = getRoundResult(roomId, room);
  if (!roundResult) return;

  // Store round result
  const results = roomRoundResults.get(roomId) ?? [];
  results.push(roundResult);
  roomRoundResults.set(roomId, results);

  io.to(roomId).emit('round-end', roundResult);
}

function endGame(io: IOServer, roomId: string): void {
  const room = getRoom(roomId);
  if (!room) return;

  room.status = 'finished';

  const allResults = roomRoundResults.get(roomId) ?? [];
  const finalResults = getFinalResults(room, allResults);

  io.to(roomId).emit('game-end', finalResults);
  cleanupGame(roomId);
}
