import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { useGame } from "../context/GameContext";
import { useSocketEvents } from "../hooks/useSocketEvents";
import PlayerList from "../components/PlayerList";
import GameSettingsPanel from "../components/GameSettingsPanel";
import type { GameSettings } from "shared/types";

export default function Lobby() {
  useSocketEvents();

  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const { state } = useGame();
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const inviteUrl = `${window.location.origin}/join/${roomId}`;
  const isPlayerHost = state.player?.isHost ?? false;

  // Navigate to game when game starts
  useEffect(() => {
    if ((state.phase === "playing" || state.phase === "countdown") && roomId) {
      navigate(`/game/${roomId}`);
    }
  }, [state.phase, roomId, navigate]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSettingsChange = (settings: GameSettings) => {
    if (!socket) return;
    socket.emit("update-settings", settings);
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit("start-game");
  };

  if (!state.room) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎲</div>
          <p className="text-gray-600 font-display">Laden...</p>
        </div>
      </div>
    );
  }

  const handleLeave = () => {
    if (socket) socket.emit("leave-room");
    navigate("/");
  };

  return (
    <div className="h-screen overflow-y-auto py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title row with back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center relative mb-3"
        >
          <button
            onClick={handleLeave}
            className="absolute left-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                       bg-gray-100 hover:bg-gray-200 text-gray-600 font-display font-bold text-xs transition-colors"
          >
            ← Terug
          </button>
          <h1
            className="font-display font-black text-3xl text-transparent bg-clip-text 
                        bg-gradient-to-r from-brand-500 to-orange-500"
          >
            Wachtkamer
          </h1>
          <button
            onClick={() => setShowInfo(true)}
            className="ml-3 px-3 py-1 rounded-full bg-brand-100 hover:bg-brand-200 text-brand-600 
                       font-display font-bold text-xs transition-colors"
          >
            📖 Uitleg
          </button>
        </motion.div>

        {/* Room code + invite | spelers klaar + start button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
        >
          {/* Left: room code + invite link */}
          <div className="flex items-center gap-2">
            <span
              className="bg-brand-100 text-brand-700 font-display font-bold 
                         px-3 py-1.5 rounded-full text-xs shrink-0"
            >
              {roomId}
            </span>
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 min-w-0 sm:w-40 lg:w-56 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 
                         text-xs font-mono text-gray-500 truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs transition-all shrink-0
                ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-brand-500 hover:bg-brand-600 text-white"
                }`}
            >
              {copied ? "✓" : "📋"}
            </button>
          </div>

          {/* Right: spelers klaar + start button */}
          <div className="flex items-center gap-3 justify-end">
            {isPlayerHost ? (
              <>
                <span className="text-sm text-gray-400 font-display whitespace-nowrap hidden sm:inline">
                  {state.room.players.length === 1
                    ? "Wacht op spelers..."
                    : `${state.room.players.length} spelers klaar!`}
                </span>
                <button
                  onClick={handleStartGame}
                  className="btn-primary text-base sm:text-lg px-6 sm:px-10 py-2.5 sm:py-3 whitespace-nowrap w-full sm:w-auto"
                >
                  🚀 Start Spel!
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500 font-display whitespace-nowrap">
                ⏳ Wachten op host...
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Players */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="font-display font-bold text-lg text-gray-700 mb-4">
              Spelers ({state.room.players.length})
            </h3>
            <PlayerList
              players={state.room.players}
              currentPlayerId={state.player?.id}
              isHost={isPlayerHost}
              hostPlays={state.room.settings.hostPlays}
              onUpdateScore={(playerId, score) => {
                if (!socket) return;
                socket.emit("update-score", { playerId, score });
              }}
            />
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <GameSettingsPanel
              settings={state.room.settings}
              onChange={handleSettingsChange}
              isHost={isPlayerHost}
            />
          </motion.div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display font-black text-xl text-gray-800 mb-4 text-center">
                📖 Hoe werkt het?
              </h2>

              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <GameModeCard
                  icon="🔗"
                  name="Connections"
                  color="blue"
                  short="16 woorden, 4 groepen. Ken je van de NYT."
                  long="Gebaseerd op het spel Connections van de New York Times. Je ziet 16 woorden en moet ze in 4 groepen van 4 verdelen. Tik 4 woorden aan en bevestig. 100 punten per goede groep, -25 bij fout. Zit je er bijna? Dan kleuren de goed gekozen woorden geel als hint."
                />

                <GameModeCard
                  icon="🧩"
                  name="Puzzelronde"
                  color="purple"
                  short="Groepjes maken + verbindend woord raden."
                  long="Spel die gespeeld wordt bij De Slimste Mens: 12 woorden in 3 groepen van 4. Eerst de groep selecteren, dan het verbindende woord typen. 100 punten per groep, 150 bonus voor het juiste woord. Typfoutjes mag."
                />

                <GameModeCard
                  icon="🚪"
                  name="Open Deur"
                  color="amber"
                  short="3 vragen, typ zoveel goede antwoorden als je kan."
                  long="Ook van De Slimste Mens! 3 vragen met elk 4 juiste antwoorden. Typ ze zo snel mogelijk — 50 punten per goed antwoord. Geen straf voor fout, dus gewoon proberen. Vraag overslaan kan ook."
                />

                <GameModeCard
                  icon="🟩"
                  name="Lingo"
                  color="green"
                  short="Raad het 5-letter woord in zo min mogelijk beurten."
                  long="Gebaseerd op het populaire TV-programma Lingo! Je krijgt de eerste letter als hint en hebt 5 pogingen om het woord te raden. Groene letter = juiste plek, gele letter = zit in het woord maar verkeerde plek, grijs = zit er niet in. 100 punten per geraden woord + 20 bonus per ongebruikte poging. 3 woorden per ronde."
                />

                <div className="border-t border-gray-100 pt-3">
                  <p className="font-display font-bold text-gray-700 mb-1.5">
                    💡 Goed om te weten
                  </p>
                  <ul className="space-y-1 text-gray-500">
                    <li>• Iedereen speelt tegelijk, dus snelheid telt</li>
                    <li>• Eerder klaar = bonuspunten</li>
                    <li>• Typfoutjes worden door de vingers gezien</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="btn-primary w-full mt-4"
              >
                Begrepen! 👍
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Expandable game mode card for the info modal ──────
const BG_COLORS: Record<string, string> = {
  blue: "bg-blue-50",
  purple: "bg-purple-50",
  amber: "bg-amber-50",
  green: "bg-green-50",
};
const TEXT_COLORS: Record<string, string> = {
  blue: "text-blue-700",
  purple: "text-purple-700",
  amber: "text-amber-700",
  green: "text-green-700",
};

function GameModeCard({
  icon,
  name,
  color,
  short,
  long,
}: {
  icon: string;
  name: string;
  color: string;
  short: string;
  long: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left rounded-xl p-3 transition-all ${BG_COLORS[color]}`}
    >
      <div className="flex gap-3 items-start">
        <span className="text-lg shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-display font-bold ${TEXT_COLORS[color]}`}>
              {name}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <p className="text-gray-600 mt-0.5">{short}</p>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-500 mt-2 overflow-hidden"
              >
                {long}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </button>
  );
}
