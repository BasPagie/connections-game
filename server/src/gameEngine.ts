import type {
  GameRoom,
  ConnectionsPuzzle,
  PuzzelrondePuzzle,
  OpenDeurPuzzle,
  Puzzle,
  RoundState,
  ConnectionsRoundState,
  PuzzelrondeRoundState,
  OpenDeurRoundState,
  PlayerProgress,
  PlayerRoundResult,
  RoundResult,
  FinalResults,
  ConnectionsGroup,
  OpenDeurQuestion,
} from '../../shared/types.js';
import { getConnectionsPuzzles, getPuzzelrondePuzzles, getOpenDeurPuzzles } from './puzzleStore.js';

// ─── Per-player round tracking ─────────────────────────
interface PlayerRoundTracker {
  playerId: string;
  solvedGroups: number[];    // indices of solved groups
  wrongGuesses: number;
  correctAnswers: number;    // puzzelronde connecting words correct
  finished: boolean;
  startTime: number;
  endTime: number | null;
  score: number;
  pendingGroupIndex: number | null; // puzzelronde: group just solved, waiting for answer
  answerResults: Map<number, boolean>; // puzzelronde: groupIndex → was answer correct
  // Open Deur tracking
  currentQuestionIndex: number;
  foundAnswersPerQuestion: Map<number, string[]>;
}

// ─── Game instance per room ────────────────────────────
interface GameInstance {
  roomId: string;
  puzzle: Puzzle;
  playerTrackers: Map<string, PlayerRoundTracker>;
  timer: ReturnType<typeof setInterval> | null;
  roundStartTime: number;
  timeRemainingMs: number | null;
  roundEnding: boolean;
}

const activeGames = new Map<string, GameInstance>();

// Track used puzzle IDs per room to avoid repeats
const usedPuzzles = new Map<string, Set<string>>();

// ─── Shuffle array ─────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Start a round ─────────────────────────────────────
export function startRound(room: GameRoom): { roundState: RoundState; puzzle: Puzzle } | null {
  const roundConfig = room.settings.rounds[room.currentRoundIndex];
  if (!roundConfig) return null;

  let puzzle: Puzzle;

  if (roundConfig.customPuzzle) {
    puzzle = roundConfig.customPuzzle;
  } else if (roundConfig.puzzleId) {
    const allPuzzles: Puzzle[] = roundConfig.type === 'connections'
      ? getConnectionsPuzzles()
      : roundConfig.type === 'puzzelronde'
        ? getPuzzelrondePuzzles()
        : getOpenDeurPuzzles();
    const found = allPuzzles.find((p) => p.id === roundConfig.puzzleId);
    if (!found) return null;
    puzzle = found;
  } else {
    // Random puzzle filtered by difficulty
    const allPuzzles: Puzzle[] = roundConfig.type === 'connections'
      ? getConnectionsPuzzles()
      : roundConfig.type === 'puzzelronde'
        ? getPuzzelrondePuzzles()
        : getOpenDeurPuzzles();
    const filtered = allPuzzles.filter((p) => p.difficulty === roundConfig.difficulty);
    const pool = filtered.length > 0 ? filtered : allPuzzles;
    // Exclude previously used puzzles in this game
    const used = usedPuzzles.get(room.roomId) ?? new Set();
    const available = pool.filter((p) => !used.has(p.id));
    const finalPool = available.length > 0 ? available : pool;
    if (finalPool.length === 0) return null;
    puzzle = finalPool[Math.floor(Math.random() * finalPool.length)];
  }

  // Track this puzzle as used for this room
  const used = usedPuzzles.get(room.roomId) ?? new Set();
  used.add(puzzle.id);
  usedPuzzles.set(room.roomId, used);

  // Initialize player trackers
  const playerTrackers = new Map<string, PlayerRoundTracker>();
  for (const player of room.players) {
    // Skip host if they are spectating
    if (player.isHost && !room.settings.hostPlays) continue;
    playerTrackers.set(player.id, {
      playerId: player.id,
      solvedGroups: [],
      wrongGuesses: 0,
      correctAnswers: 0,
      finished: false,
      startTime: Date.now(),
      endTime: null,
      score: 0,
      pendingGroupIndex: null,
      answerResults: new Map(),
      currentQuestionIndex: 0,
      foundAnswersPerQuestion: new Map(),
    });
  }

  const timeRemainingMs = room.settings.timeLimitSeconds
    ? room.settings.timeLimitSeconds * 1000
    : null;

  const instance: GameInstance = {
    roomId: room.roomId,
    puzzle,
    playerTrackers,
    timer: null,
    roundStartTime: Date.now(),
    timeRemainingMs,
    roundEnding: false,
  };

  activeGames.set(room.roomId, instance);

  // Build initial round state
  const roundState = buildRoundState(instance, room);

  return { roundState, puzzle };
}

// ─── Build round state for a player (generic view) ────
function buildRoundState(instance: GameInstance, room: GameRoom): RoundState {
  const puzzle = instance.puzzle;
  const attemptsLeft = room.settings.attemptsMode === 'limited' ? room.settings.maxAttempts : null;
  const timeRemainingMs = instance.timeRemainingMs;

  if (puzzle.type === 'connections') {
    const words = shuffle(puzzle.groups.flatMap((g) => g.words));
    return {
      type: 'connections',
      words,
      solvedGroups: [],
      attemptsLeft,
      timeRemainingMs,
    };
  } else if (puzzle.type === 'puzzelronde') {
    const words = shuffle(puzzle.groups.flatMap((g) => g.words));
    return {
      type: 'puzzelronde',
      words,
      solvedGroups: [],
      pendingAnswer: false,
      attemptsLeft,
      timeRemainingMs,
    };
  } else {
    return {
      type: 'opendeur',
      currentQuestionIndex: 0,
      question: puzzle.questions[0].question,
      foundAnswers: [],
      totalAnswers: puzzle.questions[0].answers.length,
      totalQuestions: puzzle.questions.length,
      timeRemainingMs,
    };
  }
}

// ─── Build player-specific round state ─────────────────
export function getPlayerRoundState(roomId: string, playerId: string, room: GameRoom): RoundState | null {
  const instance = activeGames.get(roomId);
  if (!instance) return null;

  const tracker = instance.playerTrackers.get(playerId);
  if (!tracker) return null;

  const puzzle = instance.puzzle;
  const attemptsLeft = room.settings.attemptsMode === 'limited'
    ? room.settings.maxAttempts - tracker.wrongGuesses
    : null;
  const timeRemainingMs = instance.timeRemainingMs;

  if (puzzle.type === 'connections') {
    const solvedGroups = tracker.solvedGroups.map((i) => puzzle.groups[i]);
    const solvedWords = new Set(solvedGroups.flatMap((g) => g.words));
    const remainingWords = shuffle(
      puzzle.groups.flatMap((g) => g.words).filter((w) => !solvedWords.has(w))
    );

    return {
      type: 'connections',
      words: remainingWords,
      solvedGroups,
      attemptsLeft,
      timeRemainingMs,
    };
  } else if (puzzle.type === 'puzzelronde') {
    const solvedGroups = tracker.solvedGroups.map((i) => ({
      words: puzzle.groups[i].words,
      answerCorrect: tracker.answerResults.get(i) ?? null,
    }));
    const solvedWords = new Set(tracker.solvedGroups.flatMap((i) => puzzle.groups[i].words));
    const remainingWords = shuffle(
      puzzle.groups.flatMap((g) => g.words).filter((w) => !solvedWords.has(w))
    );

    return {
      type: 'puzzelronde',
      words: remainingWords,
      solvedGroups,
      pendingAnswer: tracker.pendingGroupIndex !== null,
      attemptsLeft,
      timeRemainingMs,
    };
  } else {
    const qIdx = tracker.currentQuestionIndex;
    const question = puzzle.questions[qIdx];
    const found = tracker.foundAnswersPerQuestion.get(qIdx) ?? [];

    return {
      type: 'opendeur',
      currentQuestionIndex: qIdx,
      question: question.question,
      foundAnswers: found,
      totalAnswers: question.answers.length,
      totalQuestions: puzzle.questions.length,
      timeRemainingMs,
    };
  }
}

// ─── Submit a group guess ──────────────────────────────
export interface GroupGuessResult {
  correct: boolean;
  groupIndex?: number;
  group?: ConnectionsGroup | { words: string[] };
  playerFinished: boolean;
  playerEliminated: boolean;
  hintWords?: string[]; // words from the guess that DO belong to the same group (partial match hint)
}

export function submitGroupGuess(
  roomId: string,
  playerId: string,
  guessedWords: string[],
  room: GameRoom
): GroupGuessResult | null {
  const instance = activeGames.get(roomId);
  if (!instance) return null;

  // Open Deur doesn't use group guesses
  if (instance.puzzle.type === 'opendeur') return null;

  const tracker = instance.playerTrackers.get(playerId);
  if (!tracker || tracker.finished) return null;

  // For puzzelronde, if there's a pending answer, don't allow new group guess
  if (tracker.pendingGroupIndex !== null) return null;

  const puzzle = instance.puzzle;
  const normalizedGuess = new Set(guessedWords.map((w) => w.trim().toLowerCase()));

  // Check against each group
  for (let i = 0; i < puzzle.groups.length; i++) {
    if (tracker.solvedGroups.includes(i)) continue;

    const groupWords = new Set(puzzle.groups[i].words.map((w) => w.toLowerCase()));
    if (normalizedGuess.size === groupWords.size && [...normalizedGuess].every((w) => groupWords.has(w))) {
      // Correct!
      tracker.solvedGroups.push(i);
      tracker.score += 100;

      const totalGroups = puzzle.groups.length;
      let playerFinished = false;

      if (puzzle.type === 'puzzelronde') {
        // In puzzelronde, after finding a group, player must guess the connecting word
        tracker.pendingGroupIndex = i;
      }

      if (tracker.solvedGroups.length === totalGroups) {
        if (puzzle.type === 'connections') {
          tracker.finished = true;
          tracker.endTime = Date.now();
          playerFinished = true;
          // Speed bonus
          const timeTaken = tracker.endTime - tracker.startTime;
          if (room.settings.timeLimitSeconds) {
            const bonus = Math.max(0, Math.floor((room.settings.timeLimitSeconds * 1000 - timeTaken) / 1000) * 2);
            tracker.score += bonus;
          }
        }
        // puzzelronde: not finished until all connecting words are answered
      }

      return {
        correct: true,
        groupIndex: i,
        group: puzzle.type === 'connections' ? puzzle.groups[i] : { words: puzzle.groups[i].words },
        playerFinished,
        playerEliminated: false,
      };
    }
  }

  // Wrong guess — check for partial matches (hint: which guessed words belong together)
  let hintWords: string[] | undefined;
  let bestOverlap = 0;
  for (let i = 0; i < puzzle.groups.length; i++) {
    if (tracker.solvedGroups.includes(i)) continue;
    const groupWords = new Set(puzzle.groups[i].words.map((w) => w.toLowerCase()));
    const matching = guessedWords.filter((w) => groupWords.has(w.trim().toLowerCase()));
    if (matching.length > bestOverlap && matching.length >= 2 && matching.length < groupWords.size) {
      bestOverlap = matching.length;
      // Return the original-cased words from the guess
      hintWords = matching;
    }
  }

  tracker.wrongGuesses++;
  const playerEliminated = room.settings.attemptsMode === 'limited' &&
    tracker.wrongGuesses >= room.settings.maxAttempts;

  if (playerEliminated) {
    tracker.finished = true;
    tracker.endTime = Date.now();
    tracker.score -= 25; // penalty for last wrong guess
  } else if (room.settings.attemptsMode === 'limited') {
    tracker.score -= 25;
  }

  return {
    correct: false,
    playerFinished: false,
    playerEliminated,
    hintWords,
  };
}

// ─── Submit connecting word answer (puzzelronde) ──────
export interface AnswerResult {
  correct: boolean;
  correctAnswer?: string;
  playerFinished: boolean;
}

export function submitAnswer(
  roomId: string,
  playerId: string,
  answer: string,
  room: GameRoom
): AnswerResult | null {
  const instance = activeGames.get(roomId);
  if (!instance || instance.puzzle.type !== 'puzzelronde') return null;

  const tracker = instance.playerTrackers.get(playerId);
  if (!tracker || tracker.finished || tracker.pendingGroupIndex === null) return null;

  const puzzle = instance.puzzle as PuzzelrondePuzzle;
  const group = puzzle.groups[tracker.pendingGroupIndex];
  const correctAnswer = group.answer;

  const isCorrect = fuzzyMatch(answer, correctAnswer);

  if (isCorrect) {
    tracker.correctAnswers++;
    tracker.score += 150;
  }

  tracker.answerResults.set(tracker.pendingGroupIndex, isCorrect);
  tracker.pendingGroupIndex = null;

  // Check if all groups solved and all answers given
  const allGroupsSolved = tracker.solvedGroups.length === puzzle.groups.length;
  let playerFinished = false;

  if (allGroupsSolved) {
    tracker.finished = true;
    tracker.endTime = Date.now();
    playerFinished = true;
    // Speed bonus
    const timeTaken = tracker.endTime - tracker.startTime;
    if (room.settings.timeLimitSeconds) {
      const bonus = Math.max(0, Math.floor((room.settings.timeLimitSeconds * 1000 - timeTaken) / 1000) * 2);
      tracker.score += bonus;
    }
  }

  return {
    correct: isCorrect,
    correctAnswer: isCorrect ? undefined : correctAnswer,
    playerFinished,
  };
}

// ─── Submit Open Deur answer ───────────────────────────
export interface OpenDeurAnswerResult {
  correct: boolean;
  matchedAnswer?: string;
  playerFinished: boolean;
  questionComplete: boolean;
  previousAnswers?: string[]; // all answers for the completed question
}

export function submitOpenDeurAnswer(
  roomId: string,
  playerId: string,
  answer: string,
): OpenDeurAnswerResult | null {
  const instance = activeGames.get(roomId);
  if (!instance || instance.puzzle.type !== 'opendeur') return null;

  const tracker = instance.playerTrackers.get(playerId);
  if (!tracker || tracker.finished) return null;

  const puzzle = instance.puzzle as OpenDeurPuzzle;
  const qIdx = tracker.currentQuestionIndex;
  const question = puzzle.questions[qIdx];
  if (!question) return null;

  const found = tracker.foundAnswersPerQuestion.get(qIdx) ?? [];

  // Check if answer matches any of the remaining correct answers
  for (const correctAnswer of question.answers) {
    // Skip already found answers
    if (found.some((f) => f.toLowerCase() === correctAnswer.toLowerCase())) continue;

    if (fuzzyMatch(answer, correctAnswer)) {
      found.push(correctAnswer);
      tracker.foundAnswersPerQuestion.set(qIdx, found);
      tracker.correctAnswers++;
      tracker.score += 50;

      const questionComplete = found.length >= question.answers.length;

      // Auto-advance if all answers found
      if (questionComplete) {
        const isLastQuestion = qIdx >= puzzle.questions.length - 1;
        if (isLastQuestion) {
          tracker.finished = true;
          tracker.endTime = Date.now();
        } else {
          tracker.currentQuestionIndex++;
        }
      }

      return {
        correct: true,
        matchedAnswer: correctAnswer,
        playerFinished: tracker.finished,
        questionComplete,
      };
    }
  }

  // Wrong answer — no penalty for opendeur
  return {
    correct: false,
    playerFinished: false,
    questionComplete: false,
  };
}

// ─── Skip Open Deur question ───────────────────────────
export function skipOpenDeurQuestion(
  roomId: string,
  playerId: string,
): { playerFinished: boolean; previousAnswers: string[] } | null {
  const instance = activeGames.get(roomId);
  if (!instance || instance.puzzle.type !== 'opendeur') return null;

  const tracker = instance.playerTrackers.get(playerId);
  if (!tracker || tracker.finished) return null;

  const puzzle = instance.puzzle as OpenDeurPuzzle;
  const qIdx = tracker.currentQuestionIndex;
  const previousAnswers = puzzle.questions[qIdx].answers;
  const isLastQuestion = qIdx >= puzzle.questions.length - 1;

  if (isLastQuestion) {
    tracker.finished = true;
    tracker.endTime = Date.now();
  } else {
    tracker.currentQuestionIndex++;
  }

  return {
    playerFinished: tracker.finished,
    previousAnswers,
  };
}

// ─── Fuzzy matching ────────────────────────────────────
function fuzzyMatch(input: string, target: string): boolean {
  const a = input.trim().toLowerCase();
  const b = target.trim().toLowerCase();

  if (a === b) return true;

  // Levenshtein distance ≤ 1 for short words, ≤ 2 for longer words (6+ chars)
  const maxDist = b.length >= 6 ? 2 : 1;
  if (Math.abs(a.length - b.length) > maxDist) return false;
  return levenshtein(a, b) <= maxDist;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

// ─── Get player progress (for broadcasting) ───────────
export function getPlayerProgress(roomId: string): PlayerProgress[] {
  const instance = activeGames.get(roomId);
  if (!instance) return [];

  const progress: PlayerProgress[] = [];
  for (const [playerId, tracker] of instance.playerTrackers) {
    let solvedCount = tracker.solvedGroups.length;
    // For opendeur, count total answers found across all questions
    if (instance.puzzle.type === 'opendeur') {
      solvedCount = 0;
      for (const answers of tracker.foundAnswersPerQuestion.values()) {
        solvedCount += answers.length;
      }
    }
    progress.push({
      playerId,
      solvedCount,
      finished: tracker.finished,
      score: tracker.score,
    });
  }
  return progress;
}

// ─── Check if round is complete (all players finished) ─
export function isRoundComplete(roomId: string): boolean {
  const instance = activeGames.get(roomId);
  if (!instance || instance.roundEnding) return false;

  for (const tracker of instance.playerTrackers.values()) {
    if (!tracker.finished) return false;
  }
  return true;
}

// ─── Force end round (timer expired) ──────────────────
export function forceEndRound(roomId: string): void {
  const instance = activeGames.get(roomId);
  if (!instance) return;

  for (const tracker of instance.playerTrackers.values()) {
    if (!tracker.finished) {
      tracker.finished = true;
      tracker.endTime = Date.now();
    }
  }
}

// ─── Get round result ──────────────────────────────────
export function getRoundResult(roomId: string, room: GameRoom): RoundResult | null {
  const instance = activeGames.get(roomId);
  if (!instance || instance.roundEnding) return null;

  instance.roundEnding = true;

  const results: PlayerRoundResult[] = [];

  for (const player of room.players) {
    const tracker = instance.playerTrackers.get(player.id);
    if (!tracker) continue;

    let groupsFound = tracker.solvedGroups.length;
    let correctAnswers = tracker.correctAnswers;
    // For opendeur, groupsFound = number of questions where all answers found
    if (instance.puzzle.type === 'opendeur') {
      const puzzle = instance.puzzle as OpenDeurPuzzle;
      groupsFound = 0;
      for (let q = 0; q < puzzle.questions.length; q++) {
        const found = tracker.foundAnswersPerQuestion.get(q) ?? [];
        if (found.length >= puzzle.questions[q].answers.length) {
          groupsFound++;
        }
      }
    }

    results.push({
      playerId: player.id,
      nickname: player.nickname,
      avatarUrl: player.avatarUrl,
      groupsFound,
      correctAnswers,
      wrongGuesses: tracker.wrongGuesses,
      timeUsedMs: (tracker.endTime ?? Date.now()) - tracker.startTime,
      roundScore: tracker.score,
    });

    // Add round score to player's total
    player.score += tracker.score;
  }

  // Sort by score descending
  results.sort((a, b) => b.roundScore - a.roundScore);

  const roundResult: RoundResult = {
    roundIndex: room.currentRoundIndex,
    roundType: instance.puzzle.type,
    results,
    correctGroups: instance.puzzle.type === 'opendeur'
      ? (instance.puzzle as OpenDeurPuzzle).questions
      : instance.puzzle.type === 'connections'
        ? (instance.puzzle as ConnectionsPuzzle).groups
        : (instance.puzzle as PuzzelrondePuzzle).groups,
  };

  // Clean up game instance
  if (instance.timer) clearInterval(instance.timer);
  activeGames.delete(roomId);

  return roundResult;
}

// ─── Get final results ─────────────────────────────────
export function getFinalResults(room: GameRoom, allRoundResults: RoundResult[]): FinalResults {
  const activePlayers = room.players.filter(
    (p) => !(p.isHost && !room.settings.hostPlays)
  );
  const playerScores = activePlayers
    .map((p) => ({
      playerId: p.id,
      nickname: p.nickname,
      avatarUrl: p.avatarUrl,
      totalScore: p.score,
      roundScores: allRoundResults.map(
        (rr) => rr.results.find((r) => r.playerId === p.id)?.roundScore ?? 0
      ),
      rank: 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  playerScores.forEach((p, i) => {
    p.rank = i + 1;
  });

  return {
    players: playerScores,
    roundResults: allRoundResults,
  };
}

// ─── Timer management ──────────────────────────────────
export function startTimer(
  roomId: string,
  onTick: (timeRemainingMs: number) => void,
  onExpire: () => void
): void {
  const instance = activeGames.get(roomId);
  if (!instance || instance.timeRemainingMs === null) return;

  const startTime = Date.now();
  const totalMs = instance.timeRemainingMs;

  instance.timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, totalMs - elapsed);
    instance.timeRemainingMs = remaining;

    onTick(remaining);

    if (remaining <= 0) {
      if (instance.timer) clearInterval(instance.timer);
      instance.timer = null;
      onExpire();
    }
  }, 1000);
}

export function cleanupGame(roomId: string): void {
  const instance = activeGames.get(roomId);
  if (instance?.timer) clearInterval(instance.timer);
  activeGames.delete(roomId);
  usedPuzzles.delete(roomId);
}
