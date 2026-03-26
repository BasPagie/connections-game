import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { useGame } from "../context/GameContext";
import { useSocketEvents } from "../hooks/useSocketEvents";
import ConnectionsGame from "../components/ConnectionsGame";
import PuzzelrondeGame from "../components/PuzzelrondeGame";
import TimerBar from "../components/TimerBar";
import ProgressSidebar from "../components/ProgressSidebar";
import RoundEndOverlay from "../components/RoundEndOverlay";
import type {
  ConnectionsRoundState,
  PuzzelrondeRoundState,
} from "shared/types";

export default function Game() {
  useSocketEvents();

  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const { state } = useGame();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Listen for time updates
  useEffect(() => {
    if (!socket) return;
    const handler = ({ timeRemainingMs }: { timeRemainingMs: number }) => {
      setTimeRemaining(timeRemainingMs);
    };
    socket.on("time-update", handler);
    return () => {
      socket.off("time-update", handler);
    };
  }, [socket]);

  // Navigate to results when game ends
  useEffect(() => {
    if (state.phase === "finished" && roomId) {
      navigate(`/results/${roomId}`);
    }
  }, [state.phase, roomId, navigate]);

  const handleSubmitGroup = (words: string[]) => {
    if (!socket) return;
    socket.emit("submit-group", { words });
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!socket) return;
    socket.emit("submit-answer", { answer });
  };

  const handleNextRound = () => {
    if (!socket) return;
    socket.emit("next-round");
  };

  // Show countdown overlay
  if (
    state.phase === "countdown" ||
    (!state.roundState && state.countdown !== null)
  ) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          {state.countdown !== null && state.countdown > 0 ? (
            <motion.div
              key={state.countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="text-9xl font-display font-black text-white"
            >
              {state.countdown}
            </motion.div>
          ) : state.countdown === 0 ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="font-display font-black text-6xl text-transparent bg-clip-text 
                          bg-gradient-to-r from-yellow-400 to-orange-500"
            >
              GO!
            </motion.div>
          ) : (
            <div className="text-6xl animate-bounce">🎮</div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!state.roundState || !state.room) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="font-display font-bold text-xl text-gray-600">
            Ronde wordt geladen...
          </p>
        </motion.div>
      </div>
    );
  }

  const roundConfig = state.room.settings.rounds[state.room.currentRoundIndex];
  const totalRounds = state.room.settings.rounds.length;
  const currentRound = state.room.currentRoundIndex + 1;
  const totalGroups = state.roundState.type === "connections" ? 4 : 3;
  const isLastRound = state.room.currentRoundIndex >= totalRounds - 1;
  const isSpectating = state.player?.isHost && !state.room.settings.hostPlays;

  return (
    <div className="h-screen flex flex-col overflow-hidden px-4 py-3">
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-display font-bold
              ${
                roundConfig?.type === "connections"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {roundConfig?.type === "connections"
                ? "🔗 Connections"
                : "🧩 Puzzelronde"}
            </span>
            <span className="text-sm text-gray-400 font-display">
              Ronde {currentRound} van {totalRounds}
            </span>
            {isSpectating && (
              <span className="px-3 py-1 rounded-full text-sm font-display font-bold bg-orange-100 text-orange-700">
                👀 Toeschouwer
              </span>
            )}
          </div>
        </motion.div>

        <div className="flex gap-6 flex-1 min-h-0 items-center">
          {/* Main game area */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Timer */}
            <TimerBar
              totalSeconds={state.room.settings.timeLimitSeconds ?? 120}
              timeRemainingMs={
                timeRemaining ?? state.roundState.timeRemainingMs
              }
            />

            {isSpectating ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">👀</div>
                <p className="font-display font-bold text-xl text-gray-500">
                  Je kijkt toe als host
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Wacht tot de spelers klaar zijn...
                </p>
              </motion.div>
            ) : (
              <>
                {/* Game component */}
                {state.roundState.type === "connections" ? (
                  <ConnectionsGame
                    roundState={state.roundState as ConnectionsRoundState}
                    onSubmitGroup={handleSubmitGroup}
                    hintWords={state.hintWords}
                  />
                ) : (
                  <PuzzelrondeGame
                    roundState={state.roundState as PuzzelrondeRoundState}
                    onSubmitGroup={handleSubmitGroup}
                    onSubmitAnswer={handleSubmitAnswer}
                    hintWords={state.hintWords}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <ProgressSidebar
              progress={state.playerProgress}
              players={state.room.players}
              currentPlayerId={state.player?.id}
              totalGroups={totalGroups}
            />
          </div>
        </div>

        {/* Mobile progress bar (bottom) */}
        <div className="md:hidden py-2 flex-shrink-0">
          <ProgressSidebar
            progress={state.playerProgress}
            players={state.room.players}
            currentPlayerId={state.player?.id}
            totalGroups={totalGroups}
          />
        </div>
      </div>

      {/* Round End Overlay */}
      {state.phase === "round-end" && state.currentRoundResult && (
        <RoundEndOverlay
          result={state.currentRoundResult}
          currentPlayerId={state.player?.id}
          isHost={state.player?.isHost ?? false}
          isLastRound={isLastRound}
          onNextRound={handleNextRound}
        />
      )}
    </div>
  );
}
