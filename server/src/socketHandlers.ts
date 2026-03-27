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
  submitOpenDeurAnswer,
  skipOpenDeurQuestion,
  submitLingoGuess,
  getPlayerProgress,
  isRoundComplete,
  forceEndRound,
  getRoundResult,
  getFinalResults,
  startTimer,
  cleanupGame,
} from './gameEngine.js';
import { PREMADE_AVATARS } from '../../shared/types.js';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Store round results per room for final results
const roomRoundResults = new Map<string, RoundResult[]>();

// Store countdown intervals per room for cleanup
const roomCountdowns = new Map<string, ReturnType<typeof setInterval>>();

// Simple per-socket rate limiter
const socketEventTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_EVENTS = 10;

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const timestamps = socketEventTimestamps.get(socketId) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  socketEventTimestamps.set(socketId, recent);
  return recent.length > RATE_LIMIT_MAX_EVENTS;
}

const MAX_NICKNAME_LENGTH = 20;

function sanitizeNickname(raw: string): string {
  return raw.trim().slice(0, MAX_NICKNAME_LENGTH).replace(/[<>&"']/g, '');
}

const MAX_AVATAR_BYTES = 100_000; // ~100KB max for custom avatar images

function isValidAvatar(raw: string): boolean {
  if (typeof raw !== 'string') return false;
  if (PREMADE_AVATARS.includes(raw)) return true;
  // Allow base64 data URL images (JPEG/PNG/WebP) up to size limit
  if (raw.startsWith('data:image/') && raw.length <= MAX_AVATAR_BYTES) return true;
  return false;
}

export function registerSocketHandlers(io: IOServer, socket: IOSocket): void {

  // ─── Create Room ─────────────────────────────────────
  socket.on('create-room', ({ nickname, avatarUrl }) => {
    const safeName = sanitizeNickname(nickname);
    if (!safeName || !isValidAvatar(avatarUrl)) {
      socket.emit('error', { message: 'Ongeldige naam of avatar.' });
      return;
    }
    const result = createRoom(socket.id, safeName, avatarUrl);
    socket.join(result.room.roomId);
    socket.emit('room-created', { room: result.room, player: result.player });
    console.log(`[Room] Aangemaakt: ${result.room.roomId} door ${safeName}`);
  });

  // ─── Join Room ───────────────────────────────────────
  socket.on('join-room', ({ roomId, nickname, avatarUrl }) => {
    const safeName = sanitizeNickname(nickname);
    if (!safeName || !isValidAvatar(avatarUrl)) {
      socket.emit('error', { message: 'Ongeldige naam of avatar.' });
      return;
    }
    const result = joinRoom(socket.id, roomId, safeName, avatarUrl);
    if (!result) {
      socket.emit('error', { message: 'Kamer niet gevonden, vol, of spel is al begonnen.' });
      return;
    }
    socket.join(roomId);
    socket.emit('room-joined', { room: result.room, player: result.player });
    socket.to(roomId).emit('player-joined', { player: result.player });
    console.log(`[Room] ${safeName} is toegetreden tot ${roomId}`);
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

    const clampedScore = Math.max(0, Math.min(10000, Math.round(score)));
    player.score = clampedScore;
    io.to(mapping.roomId).emit('score-updated', { playerId, score: clampedScore });
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
      // Stop if room was deleted during countdown
      if (!getRoom(roomId)) {
        clearInterval(countdownInterval);
        roomCountdowns.delete(roomId);
        return;
      }
      if (count >= 0) {
        io.to(roomId).emit('countdown', { count });
        count--;
      } else {
        clearInterval(countdownInterval);
        roomCountdowns.delete(roomId);
        startNewRound(io, roomId);
      }
    }, 1000);
    roomCountdowns.set(roomId, countdownInterval);
  });

  // ─── Submit Group Guess ──────────────────────────────
  socket.on('submit-group', ({ words }) => {
    if (isRateLimited(socket.id)) return;
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
    if (isRateLimited(socket.id)) return;
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

  // ─── Submit Open Deur Answer ─────────────────────────
  socket.on('submit-opendeur-answer', ({ answer }) => {
    if (isRateLimited(socket.id)) return;
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room || room.status !== 'playing') return;

    const result = submitOpenDeurAnswer(mapping.roomId, mapping.playerId, answer);
    if (!result) return;

    const roundState = getPlayerRoundState(mapping.roomId, mapping.playerId, room);
    if (!roundState) return;

    if (result.correct && result.questionComplete) {
      // Question complete — send next question state or finish
      socket.emit('opendeur-next-question', {
        roundState,
        previousAnswers: [], // client already knows found answers
      });
    } else {
      socket.emit('opendeur-result', {
        correct: result.correct,
        matchedAnswer: result.matchedAnswer,
        roundState,
      });
    }

    // Broadcast progress
    const progress = getPlayerProgress(mapping.roomId);
    io.to(mapping.roomId).emit('player-progress', progress);

    if (isRoundComplete(mapping.roomId)) {
      endCurrentRound(io, mapping.roomId);
    }
  });

  // ─── Skip Open Deur Question ─────────────────────────
  socket.on('skip-question', () => {
    if (isRateLimited(socket.id)) return;
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room || room.status !== 'playing') return;

    const result = skipOpenDeurQuestion(mapping.roomId, mapping.playerId);
    if (!result) return;

    const roundState = getPlayerRoundState(mapping.roomId, mapping.playerId, room);
    if (!roundState) return;

    socket.emit('opendeur-next-question', {
      roundState,
      previousAnswers: result.previousAnswers,
    });

    // Broadcast progress
    const progress = getPlayerProgress(mapping.roomId);
    io.to(mapping.roomId).emit('player-progress', progress);

    if (isRoundComplete(mapping.roomId)) {
      endCurrentRound(io, mapping.roomId);
    }
  });

  // ─── Submit Lingo Guess ──────────────────────────────
  socket.on('submit-lingo-guess', ({ guess }) => {
    if (isRateLimited(socket.id)) return;
    const mapping = getSocketMapping(socket.id);
    if (!mapping) return;

    const room = getRoom(mapping.roomId);
    if (!room || room.status !== 'playing') return;

    const result = submitLingoGuess(mapping.roomId, mapping.playerId, guess, room);
    if (!result) return;

    const roundState = getPlayerRoundState(mapping.roomId, mapping.playerId, room);
    if (!roundState) return;

    if (result.wordComplete && result.previousWord && !result.playerFinished) {
      // Word complete, advancing to next word
      socket.emit('lingo-next-word', {
        roundState,
        previousWord: result.previousWord,
      });
    } else {
      socket.emit('lingo-result', {
        correct: result.correct,
        feedback: result.feedback,
        roundState,
      });
    }

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
    socketEventTimestamps.delete(socket.id);
    handleLeave(io, socket);
  });
}

// ─── Helpers ───────────────────────────────────────────

function handleLeave(io: IOServer, socket: IOSocket): void {
  const result = leaveRoom(socket.id);
  if (!result) return;

  socket.leave(result.roomId);

  if (result.roomDeleted) {
    // Clean up all resources for this room
    cleanupGame(result.roomId);
    roomRoundResults.delete(result.roomId);
    const countdown = roomCountdowns.get(result.roomId);
    if (countdown) {
      clearInterval(countdown);
      roomCountdowns.delete(result.roomId);
    }
  } else {
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
    if (!playerState) continue;
    const sid = getSocketIdForPlayer(roomId, player.id);
    if (sid) {
      io.to(sid).emit('round-start', {
        roundIndex: room.currentRoundIndex,
        roundState: playerState,
        roundType: roundConfig.type,
      });
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
