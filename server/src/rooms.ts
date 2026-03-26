import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import type {
  GameRoom,
  Player,
  GameSettings,
} from '../../shared/types.js';

const MAX_PLAYERS_PER_ROOM = 20;

// In-memory room storage
const rooms = new Map<string, GameRoom>();

// Map socket.id → { roomId, playerId }
const socketToRoom = new Map<string, { roomId: string; playerId: string }>();

export function createRoom(socketId: string, nickname: string, avatarUrl: string): { room: GameRoom; player: Player } {
  const roomId = generateRoomId();
  const playerId = uuidv4();

  const player: Player = {
    id: playerId,
    nickname,
    avatarUrl,
    isHost: true,
    score: 0,
    connected: true,
  };

  const room: GameRoom = {
    roomId,
    players: [player],
    settings: {
      rounds: [
        { type: 'connections', difficulty: 'medium' },
        { type: 'puzzelronde', difficulty: 'medium' },
        { type: 'opendeur', difficulty: 'medium' },
      ],
      attemptsMode: 'limited',
      maxAttempts: 6,
      timeLimitSeconds: 120,
      hostControl: true,
      hostPlays: true,
    },
    status: 'lobby',
    currentRoundIndex: 0,
  };

  rooms.set(roomId, room);
  socketToRoom.set(socketId, { roomId, playerId });

  return { room, player };
}

export function joinRoom(socketId: string, roomId: string, nickname: string, avatarUrl: string): { room: GameRoom; player: Player } | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.status !== 'lobby') return null;
  if (room.players.length >= MAX_PLAYERS_PER_ROOM) return null;

  const playerId = uuidv4();
  const player: Player = {
    id: playerId,
    nickname,
    avatarUrl,
    isHost: false,
    score: 0,
    connected: true,
  };

  room.players.push(player);
  socketToRoom.set(socketId, { roomId, playerId });

  return { room, player };
}

export function leaveRoom(socketId: string): { roomId: string; playerId: string; newHostId?: string; roomDeleted: boolean } | null {
  const mapping = socketToRoom.get(socketId);
  if (!mapping) return null;

  const { roomId, playerId } = mapping;
  const room = rooms.get(roomId);
  if (!room) {
    socketToRoom.delete(socketId);
    return null;
  }

  room.players = room.players.filter((p) => p.id !== playerId);
  socketToRoom.delete(socketId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return { roomId, playerId, roomDeleted: true };
  }

  // Transfer host if the leaving player was host
  let newHostId: string | undefined;
  const wasHost = room.players.every((p) => !p.isHost);
  if (wasHost && room.players.length > 0) {
    room.players[0].isHost = true;
    newHostId = room.players[0].id;
  }

  return { roomId, playerId, newHostId, roomDeleted: false };
}

export function getRoom(roomId: string): GameRoom | undefined {
  return rooms.get(roomId);
}

export function getSocketMapping(socketId: string): { roomId: string; playerId: string } | undefined {
  return socketToRoom.get(socketId);
}

export function updateSettings(roomId: string, settings: GameSettings): boolean {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'lobby') return false;
  room.settings = settings;
  return true;
}

export function getPlayerInRoom(roomId: string, playerId: string): Player | undefined {
  const room = rooms.get(roomId);
  return room?.players.find((p) => p.id === playerId);
}

export function isHost(roomId: string, playerId: string): boolean {
  const player = getPlayerInRoom(roomId, playerId);
  return player?.isHost ?? false;
}

export function getSocketIdForPlayer(roomId: string, playerId: string): string | undefined {
  for (const [socketId, mapping] of socketToRoom) {
    if (mapping.roomId === roomId && mapping.playerId === playerId) {
      return socketId;
    }
  }
  return undefined;
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[randomInt(chars.length)];
  }
  // Ensure uniqueness (with retry limit)
  if (rooms.has(code)) {
    // In the astronomically unlikely event of collision, try once more
    return generateRoomId();
  }
  return code;
}
