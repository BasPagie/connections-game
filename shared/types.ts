// ─── Player ────────────────────────────────────────────
export interface Player {
  id: string;
  nickname: string;
  avatarUrl: string; // base64 data URL or path to pre-made avatar
  isHost: boolean;
  score: number;
  connected: boolean;
}

// ─── Game Settings ─────────────────────────────────────
export type RoundType = 'connections' | 'puzzelronde';
export type AttemptsMode = 'limited' | 'unlimited';
export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface RoundConfig {
  type: RoundType;
  difficulty: PuzzleDifficulty;
  puzzleId?: string; // undefined = random
  customPuzzle?: ConnectionsPuzzle | PuzzelrondePuzzle;
}

export interface GameSettings {
  rounds: RoundConfig[];
  attemptsMode: AttemptsMode;
  maxAttempts: number; // only used when attemptsMode = 'limited'
  timeLimitSeconds: number | null; // null = no limit
  hostControl: boolean; // true = host controls, false = democratic
  hostPlays: boolean; // false = host spectates instead of playing
}

export const DEFAULT_SETTINGS: GameSettings = {
  rounds: [
    { type: 'connections', difficulty: 'medium' },
    { type: 'puzzelronde', difficulty: 'medium' },
    { type: 'connections', difficulty: 'medium' },
  ],
  attemptsMode: 'limited',
  maxAttempts: 4,
  timeLimitSeconds: 120,
  hostControl: true,
  hostPlays: true,
};

// ─── Room ──────────────────────────────────────────────
export type RoomStatus = 'lobby' | 'playing' | 'finished';

export interface GameRoom {
  roomId: string;
  players: Player[];
  settings: GameSettings;
  status: RoomStatus;
  currentRoundIndex: number;
}

// ─── Puzzles ───────────────────────────────────────────
export interface ConnectionsGroup {
  label: string;
  words: string[];
  difficulty: 1 | 2 | 3 | 4; // 1=easiest(yellow), 4=hardest(purple)
}

export interface ConnectionsPuzzle {
  id: string;
  type: 'connections';
  difficulty: PuzzleDifficulty;
  groups: [ConnectionsGroup, ConnectionsGroup, ConnectionsGroup, ConnectionsGroup];
}

export interface PuzzelrondeGroup {
  words: string[];
  answer: string; // the connecting word players must guess
}

export interface PuzzelrondePuzzle {
  id: string;
  type: 'puzzelronde';
  difficulty: PuzzleDifficulty;
  groups: [PuzzelrondeGroup, PuzzelrondeGroup, PuzzelrondeGroup];
}

export type Puzzle = ConnectionsPuzzle | PuzzelrondePuzzle;

// ─── Round State (sent to clients) ────────────────────
export interface ConnectionsRoundState {
  type: 'connections';
  words: string[]; // shuffled 16 words
  solvedGroups: ConnectionsGroup[];
  attemptsLeft: number | null; // null = unlimited
  timeRemainingMs: number | null;
}

export interface PuzzelrondeRoundState {
  type: 'puzzelronde';
  words: string[]; // shuffled 12 words
  solvedGroups: { words: string[]; answerCorrect: boolean | null }[];
  pendingAnswer: boolean; // waiting for player to type connecting word
  attemptsLeft: number | null;
  timeRemainingMs: number | null;
}

export type RoundState = ConnectionsRoundState | PuzzelrondeRoundState;

// ─── Player Progress (shown to other players) ─────────
export interface PlayerProgress {
  playerId: string;
  solvedCount: number;
  finished: boolean;
  score: number;
}

// ─── Round Results ─────────────────────────────────────
export interface PlayerRoundResult {
  playerId: string;
  nickname: string;
  avatarUrl: string;
  groupsFound: number;
  correctAnswers: number; // puzzelronde: correct connecting words
  wrongGuesses: number;
  timeUsedMs: number;
  roundScore: number;
}

export interface RoundResult {
  roundIndex: number;
  roundType: RoundType;
  results: PlayerRoundResult[];
  correctGroups: ConnectionsGroup[] | PuzzelrondeGroup[];
}

// ─── Final Results ─────────────────────────────────────
export interface FinalResults {
  players: {
    playerId: string;
    nickname: string;
    avatarUrl: string;
    totalScore: number;
    roundScores: number[];
    rank: number;
  }[];
  roundResults: RoundResult[];
}

// ─── Socket Events ─────────────────────────────────────
export interface ClientToServerEvents {
  'create-room': (data: { nickname: string; avatarUrl: string }) => void;
  'join-room': (data: { roomId: string; nickname: string; avatarUrl: string }) => void;
  'leave-room': () => void;
  'update-settings': (settings: GameSettings) => void;
  'start-game': () => void;
  'submit-group': (data: { words: string[] }) => void;
  'submit-answer': (data: { answer: string }) => void;
  'next-round': () => void;
  'play-again': () => void;
  'update-score': (data: { playerId: string; score: number }) => void;
}

export interface ServerToClientEvents {
  'room-created': (data: { roomId: string; player: Player }) => void;
  'room-joined': (data: { room: GameRoom; player: Player }) => void;
  'player-joined': (data: { player: Player }) => void;
  'player-left': (data: { playerId: string; newHostId?: string }) => void;
  'settings-updated': (settings: GameSettings) => void;
  'game-started': () => void;
  'countdown': (data: { count: number }) => void;
  'round-start': (data: { roundIndex: number; roundState: RoundState; roundType: RoundType }) => void;
  'group-result': (data: { correct: boolean; group?: ConnectionsGroup | { words: string[] }; roundState: RoundState; hintWords?: string[] }) => void;
  'answer-result': (data: { correct: boolean; correctAnswer?: string; roundState: RoundState }) => void;
  'player-progress': (data: PlayerProgress[]) => void;
  'time-update': (data: { timeRemainingMs: number }) => void;
  'round-end': (data: RoundResult) => void;
  'game-end': (data: FinalResults) => void;
  'score-updated': (data: { playerId: string; score: number }) => void;
  'error': (data: { message: string }) => void;
  'room-closed': () => void;
}

// ─── Pre-made Avatars ──────────────────────────────────
export const PREMADE_AVATARS = [
  '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵',
  '🦄', '🐙', '🦋', '🐢', '🦜', '🐳', '🦩', '🐘',
  '🎃', '🤖', '👽', '🎭',
];
