import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PuzzelrondeRoundState } from "shared/types";

interface PuzzelrondeGameProps {
  roundState: PuzzelrondeRoundState;
  onSubmitGroup: (words: string[]) => void;
  onSubmitAnswer: (answer: string) => void;
  hintWords?: string[];
}

export default function PuzzelrondeGame({
  roundState,
  onSubmitGroup,
  onSubmitAnswer,
  hintWords = [],
}: PuzzelrondeGameProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    correct: boolean;
    correctAnswer?: string;
  } | null>(null);

  const handleTileClick = useCallback(
    (word: string) => {
      if (roundState.pendingAnswer) return; // Can't select while waiting for answer
      setSelected((prev) => {
        if (prev.includes(word)) return prev.filter((w) => w !== word);
        if (prev.length >= 4) return prev;
        return [...prev, word];
      });
    },
    [roundState.pendingAnswer],
  );

  const handleSubmitGroup = () => {
    if (selected.length !== 4) return;
    onSubmitGroup(selected);
    setTimeout(() => setSelected([]), 600);
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    onSubmitAnswer(answer.trim());
    setAnswer("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Instruction */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500 font-display">
          {roundState.pendingAnswer
            ? "💡 Typ het woord dat de 4 geselecteerde woorden verbindt!"
            : "🧩 Selecteer 4 woorden die bij elkaar horen, en raad het verbindende woord!"}
        </p>
      </div>

      {/* Solved groups */}
      <AnimatePresence>
        {roundState.solvedGroups.map((group, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
            className={`rounded-2xl p-4 text-center border-2
              ${
                group.answerCorrect === true
                  ? "bg-green-100 border-green-400"
                  : group.answerCorrect === false
                    ? "bg-orange-100 border-orange-400"
                    : "bg-purple-100 border-purple-300"
              }`}
          >
            <p className="font-display font-medium text-sm text-gray-700">
              {group.words.join(", ")}
            </p>
            {group.answerCorrect !== null && (
              <p
                className={`font-display font-bold text-xs mt-1
                ${group.answerCorrect ? "text-green-600" : "text-orange-600"}`}
              >
                {group.answerCorrect ? "✓ Goed geraden!" : "✗ Helaas, verkeerd"}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Answer input (when pending) */}
      {roundState.pendingAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-purple-50 rounded-2xl p-5 border-2 border-purple-200"
        >
          <p className="font-display font-bold text-purple-800 mb-3">
            🤔 Wat is het verbindende woord?
          </p>
          {lastAnswerResult && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm mb-2 font-medium
                ${lastAnswerResult.correct ? "text-green-600" : "text-red-500"}`}
            >
              {lastAnswerResult.correct
                ? "✓ Correct!"
                : `✗ Helaas! Het juiste antwoord was: "${lastAnswerResult.correctAnswer}"`}
            </motion.p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Typ je antwoord..."
              maxLength={50}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400
                         focus:ring-2 focus:ring-purple-200 outline-none font-display text-lg"
              onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
              autoFocus
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim()}
              className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white
                         font-display font-bold shadow-md transition-all
                         disabled:opacity-30 active:scale-95"
            >
              Antwoord
            </button>
          </div>
        </motion.div>
      )}

      {/* Hint message */}
      {hintWords.length > 0 && !roundState.pendingAnswer && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center"
        >
          <p className="text-sm text-amber-700 font-display font-medium">
            💡 Bijna! De gemarkeerde woorden horen bij elkaar — je mist er nog{" "}
            {4 - hintWords.length}!
          </p>
        </motion.div>
      )}

      {/* Word grid (3x4) */}
      {!roundState.pendingAnswer && roundState.words.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-4">
          <AnimatePresence>
            {roundState.words.map((word) => {
              const isSelected = selected.includes(word);
              const isHinted = hintWords
                .map((w) => w.toLowerCase())
                .includes(word.toLowerCase());
              return (
                <motion.button
                  key={word}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => handleTileClick(word)}
                  className={
                    isSelected
                      ? "word-tile-selected"
                      : isHinted
                        ? "word-tile-hinted"
                        : "word-tile-default"
                  }
                >
                  {word}
                  {isHinted && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Controls (only when not in answer mode) */}
      {!roundState.pendingAnswer && roundState.words.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          {roundState.attemptsLeft !== null && (
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xl transition-all duration-300
                    ${i < (roundState.attemptsLeft ?? 0) ? "opacity-100" : "opacity-20 grayscale"}`}
                >
                  ❤️
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600
                         font-display font-bold text-sm transition-all disabled:opacity-30"
            >
              Wissen
            </button>
            <button
              onClick={handleSubmitGroup}
              disabled={selected.length !== 4}
              className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white
                         font-display font-bold text-sm shadow-md transition-all
                         disabled:opacity-30 active:scale-95"
            >
              Controleer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
