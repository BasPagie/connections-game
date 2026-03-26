import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type {
  Player,
  GameRoom,
  GameSettings,
  RoundState,
  PlayerProgress,
  RoundResult,
  FinalResults,
} from "shared/types";

// ─── State ─────────────────────────────────────────────
export interface GameState {
  player: Player | null;
  room: GameRoom | null;
  roundState: RoundState | null;
  hintWords: string[];
  playerProgress: PlayerProgress[];
  roundResults: RoundResult[];
  currentRoundResult: RoundResult | null;
  finalResults: FinalResults | null;
  countdown: number | null;
  phase: "idle" | "lobby" | "playing" | "countdown" | "round-end" | "finished";
}

const initialState: GameState = {
  player: null,
  room: null,
  roundState: null,
  hintWords: [],
  playerProgress: [],
  roundResults: [],
  currentRoundResult: null,
  finalResults: null,
  countdown: null,
  phase: "idle",
};

// ─── Actions ───────────────────────────────────────────
export type GameAction =
  | { type: "SET_PLAYER"; player: Player }
  | { type: "SET_ROOM"; room: GameRoom }
  | { type: "PLAYER_JOINED"; player: Player }
  | { type: "PLAYER_LEFT"; playerId: string; newHostId?: string }
  | { type: "SETTINGS_UPDATED"; settings: GameSettings }
  | { type: "GAME_STARTED" }
  | { type: "COUNTDOWN"; count: number }
  | { type: "SCORE_UPDATED"; playerId: string; score: number }
  | { type: "ROUND_START"; roundState: RoundState; roundIndex?: number }
  | { type: "UPDATE_ROUND_STATE"; roundState: RoundState; hintWords?: string[] }
  | { type: "PLAYER_PROGRESS"; progress: PlayerProgress[] }
  | { type: "ROUND_END"; result: RoundResult }
  | { type: "GAME_END"; results: FinalResults }
  | { type: "NEXT_ROUND" }
  | { type: "RESET" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PLAYER":
      return { ...state, player: action.player };

    case "SET_ROOM":
      return { ...state, room: action.room, phase: "lobby" };

    case "PLAYER_JOINED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: [...state.room.players, action.player],
        },
      };

    case "PLAYER_LEFT":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players
            .filter((p) => p.id !== action.playerId)
            .map((p) => ({
              ...p,
              isHost: action.newHostId ? p.id === action.newHostId : p.isHost,
            })),
        },
        player:
          state.player && action.newHostId === state.player.id
            ? { ...state.player, isHost: true }
            : state.player,
      };

    case "SETTINGS_UPDATED":
      if (!state.room) return state;
      return {
        ...state,
        room: { ...state.room, settings: action.settings },
      };

    case "GAME_STARTED":
      return {
        ...state,
        phase: "countdown",
        countdown: null,
        roundResults: [],
        finalResults: null,
      };

    case "COUNTDOWN":
      return {
        ...state,
        countdown: action.count,
      };

    case "SCORE_UPDATED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.id === action.playerId ? { ...p, score: action.score } : p,
          ),
        },
      };

    case "ROUND_START":
      return {
        ...state,
        roundState: action.roundState,
        hintWords: [],
        playerProgress: [],
        currentRoundResult: null,
        phase: "playing",
        room:
          state.room && action.roundIndex != null
            ? { ...state.room, currentRoundIndex: action.roundIndex }
            : state.room,
      };

    case "UPDATE_ROUND_STATE":
      return {
        ...state,
        roundState: action.roundState,
        hintWords: action.hintWords ?? [],
      };

    case "PLAYER_PROGRESS":
      return { ...state, playerProgress: action.progress };

    case "ROUND_END":
      return {
        ...state,
        currentRoundResult: action.result,
        roundResults: [...state.roundResults, action.result],
        phase: "round-end",
      };

    case "GAME_END":
      return {
        ...state,
        finalResults: action.results,
        phase: "finished",
      };

    case "NEXT_ROUND":
      return {
        ...state,
        roundState: null,
        currentRoundResult: null,
        phase: "playing",
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────
const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
