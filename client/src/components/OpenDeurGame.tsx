import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OpenDeurRoundState } from "shared/types";

interface OpenDeurGameProps {
  roundState: OpenDeurRoundState;
  onSubmitAnswer: (answer: string) => void;
  onSkipQuestion: () => void;
}

export default function OpenDeurGame({
  roundState,
  onSubmitAnswer,
  onSkipQuestion,
}: OpenDeurGameProps) {
  const [answer, setAnswer] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrongCountRef = useRef(0);

  // Focus input on mount and question change
  useEffect(() => {
    inputRef.current?.focus();
  }, [roundState.currentQuestionIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    wrongCountRef.current++;
    onSubmitAnswer(answer.trim());
    setAnswer("");
  };

  // Track found answers to detect new ones (flash) or wrong answers (shake)
  const prevFoundRef = useRef<string[]>([]);
  useEffect(() => {
    const prev = prevFoundRef.current;
    if (roundState.foundAnswers.length > prev.length) {
      // Correct answer: reset wrong counter, flash
      wrongCountRef.current = 0;
      const newAnswer =
        roundState.foundAnswers[roundState.foundAnswers.length - 1];
      setFlash(newAnswer);
      setTimeout(() => setFlash(null), 600);
    } else if (
      roundState.foundAnswers.length === prev.length &&
      wrongCountRef.current > 0
    ) {
      // Server responded but no new answer found = wrong
      setShake(true);
      wrongCountRef.current = 0;
      setTimeout(() => setShake(false), 400);
    }
    prevFoundRef.current = roundState.foundAnswers;
  }, [roundState.foundAnswers, roundState.currentQuestionIndex]);

  const answersRemaining =
    roundState.totalAnswers - roundState.foundAnswers.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question progress */}
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: roundState.totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < roundState.currentQuestionIndex
                ? "bg-green-400"
                : i === roundState.currentQuestionIndex
                  ? "bg-brand-500 scale-125"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <motion.div
        key={roundState.currentQuestionIndex}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="font-display font-black text-2xl md:text-3xl text-gray-800">
          {roundState.question}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Vraag {roundState.currentQuestionIndex + 1} van{" "}
          {roundState.totalQuestions} — nog {answersRemaining}{" "}
          {answersRemaining === 1 ? "antwoord" : "antwoorden"}
        </p>
      </motion.div>

      {/* Found answers grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Array.from({ length: roundState.totalAnswers }).map((_, i) => {
          const found = roundState.foundAnswers[i];
          const isFlashing = found && flash === found;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={
                isFlashing
                  ? { scale: [1, 1.05, 1], backgroundColor: "#dcfce7" }
                  : {}
              }
              className={`h-14 rounded-xl flex items-center justify-center font-display font-bold text-lg
                transition-all duration-300
                ${
                  found
                    ? "bg-green-100 text-green-800 border-2 border-green-300"
                    : "bg-gray-100 text-gray-300 border-2 border-dashed border-gray-300"
                }`}
            >
              {found ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                >
                  {found}
                </motion.span>
              ) : (
                "?"
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Typ een antwoord..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-400
                       focus:outline-none font-display text-lg transition-colors"
            autoComplete="off"
          />
        </motion.div>
        <button
          type="submit"
          disabled={!answer.trim()}
          className="px-6 py-3 rounded-xl bg-brand-500 text-white font-display font-bold
                     hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ✓
        </button>
      </form>

      {/* Skip button */}
      <div className="text-center">
        <button
          onClick={onSkipQuestion}
          className="text-sm text-gray-400 hover:text-gray-600 font-display font-medium
                     transition-colors underline-offset-2 hover:underline"
        >
          Vraag overslaan →
        </button>
      </div>
    </div>
  );
}
