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

  return (
    <div className="h-screen overflow-y-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Title centered */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-3"
        >
          <h1
            className="font-display font-black text-3xl text-transparent bg-clip-text 
                        bg-gradient-to-r from-brand-500 to-orange-500"
          >
            Wachtkamer
          </h1>
          <button
            onClick={() => setShowInfo(true)}
            className="ml-2 w-8 h-8 rounded-full bg-brand-100 hover:bg-brand-200 text-brand-600 
                       font-display font-bold text-sm transition-colors flex items-center justify-center"
            title="Speluitleg"
          >
            ?
          </button>
        </motion.div>

        {/* Room code + invite | spelers klaar + start button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between gap-3 mb-4"
        >
          {/* Left: room code + invite link */}
          <div className="flex items-center gap-2">
            <span
              className="bg-brand-100 text-brand-700 font-display font-bold 
                         px-3 py-1.5 rounded-full text-xs"
            >
              {roomId}
            </span>
            <input
              readOnly
              value={inviteUrl}
              className="w-40 lg:w-56 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 
                         text-xs font-mono text-gray-500 truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs transition-all
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
          <div className="flex items-center gap-3">
            {isPlayerHost ? (
              <>
                <span className="text-sm text-gray-400 font-display whitespace-nowrap">
                  {state.room.players.length === 1
                    ? "Wacht op spelers..."
                    : `${state.room.players.length} spelers klaar!`}
                </span>
                <button
                  onClick={handleStartGame}
                  className="btn-primary text-lg px-10 py-3 whitespace-nowrap"
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

        <div className="grid md:grid-cols-2 gap-6">
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
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display font-black text-2xl text-gray-800 mb-6 text-center">
                📖 Speluitleg
              </h2>

              <div className="space-y-5">
                <div>
                  <h3 className="font-display font-bold text-lg text-blue-600 mb-2">
                    🔗 Connections
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Je ziet 16 woorden op het scherm. Deze woorden zijn verdeeld
                    in <strong>4 groepen van 4</strong> die iets met elkaar
                    gemeen hebben. Selecteer 4 woorden die volgens jou bij
                    dezelfde groep horen en bevestig je keuze. Je krijgt punten
                    voor elke correct gevonden groep, maar verliest punten bij
                    een foute gok!
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-purple-600 mb-2">
                    🧩 Puzzelronde
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Geïnspireerd door De Slimste Mens! Je ziet 12 woorden
                    verdeeld in <strong>3 groepen van 4</strong>. Selecteer
                    eerst 4 woorden die bij elkaar horen — en raad dan het{" "}
                    <strong>verbindende woord</strong> dat de groep beschrijft.
                    Je krijgt extra punten als je het verbindende woord goed
                    raadt!
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-orange-600 mb-2">
                    ⚡ Tips
                  </h3>
                  <ul className="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
                    <li>Iedereen speelt tegelijk — snelheid telt!</li>
                    <li>
                      Bij een bijna-goed antwoord krijg je een hint (geel
                      gemarkeerde woorden)
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="btn-primary w-full mt-6"
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
