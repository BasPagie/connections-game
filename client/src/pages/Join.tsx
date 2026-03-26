import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { useSocketEvents } from "../hooks/useSocketEvents";
import AvatarPicker from "../components/AvatarPicker";
import { PREMADE_AVATARS } from "shared/types";

export default function Join() {
  useSocketEvents();

  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(
    PREMADE_AVATARS[Math.floor(Math.random() * PREMADE_AVATARS.length)],
  );
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!socket || !nickname.trim() || !roomId) return;
    setJoining(true);
    setError("");

    socket.emit("join-room", {
      roomId,
      nickname: nickname.trim(),
      avatarUrl: avatar,
    });

    // Listen for error
    socket.once("error", ({ message }) => {
      setError(message);
      setJoining(false);
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1
          className="font-display font-black text-4xl sm:text-5xl text-transparent bg-clip-text 
                        bg-gradient-to-r from-brand-500 via-orange-500 to-pink-500 mb-2"
        >
          Woordspel
        </h1>
        <p className="text-lg text-gray-600 font-display">
          Je bent uitgenodigd! 🎉
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card w-full max-w-md"
      >
        <div className="text-center mb-4">
          <span
            className="inline-block bg-brand-100 text-brand-700 font-display font-bold 
                           px-4 py-1.5 rounded-full text-sm"
          >
            Kamer: {roomId}
          </span>
        </div>

        <h2 className="font-display font-bold text-2xl text-gray-800 mb-6 text-center">
          Doe Mee!
        </h2>

        <div className="flex flex-col items-center gap-6">
          <AvatarPicker value={avatar} onChange={setAvatar} />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Jouw naam
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Voer je naam in..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-400 
                         focus:ring-2 focus:ring-brand-200 outline-none transition-all text-lg font-display"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-xl w-full text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleJoin}
            disabled={!nickname.trim() || !socket || joining}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {joining ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Deelnemen...
              </span>
            ) : (
              "🎮 Doe Mee!"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
