import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerBarProps {
  totalSeconds: number;
  timeRemainingMs: number | null;
}

export default function TimerBar({
  totalSeconds,
  timeRemainingMs,
}: TimerBarProps) {
  if (timeRemainingMs === null) return null;

  const totalMs = totalSeconds * 1000;
  const fraction = Math.max(0, Math.min(1, timeRemainingMs / totalMs));
  const seconds = Math.ceil(timeRemainingMs / 1000);
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-display font-bold text-gray-500">
          ⏱️ Tijd
        </span>
        <span
          className={`font-display font-black text-lg tabular-nums
          ${isCritical ? "text-red-500 animate-pulse" : isLow ? "text-orange-500" : "text-gray-700"}`}
        >
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-500
            ${isCritical ? "bg-red-500" : isLow ? "bg-orange-400" : "bg-brand-400"}`}
          style={{ width: `${fraction * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
