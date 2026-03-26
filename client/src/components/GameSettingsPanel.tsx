import type {
  GameSettings,
  RoundConfig,
  RoundType,
  PuzzleDifficulty,
} from "shared/types";

interface GameSettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  isHost: boolean;
}

export default function GameSettingsPanel({
  settings,
  onChange,
  isHost,
}: GameSettingsPanelProps) {
  if (!isHost) {
    return (
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-gray-700">
          Spelinstellingen
        </h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
          <p>
            <strong>Rondes:</strong> {settings.rounds.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {settings.rounds.map((r, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded-lg text-xs font-medium
                ${
                  r.type === "connections"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                Ronde {i + 1}:{" "}
                {r.type === "connections" ? "Connections" : "Puzzelronde"}
                {" · "}
                {r.difficulty === "easy"
                  ? "Makkelijk"
                  : r.difficulty === "hard"
                    ? "Moeilijk"
                    : "Gemiddeld"}
              </span>
            ))}
          </div>
          <p>
            <strong>Pogingen:</strong>{" "}
            {settings.attemptsMode === "limited"
              ? `${settings.maxAttempts} levens`
              : "Onbeperkt"}
          </p>
          <p>
            <strong>Tijdslimiet:</strong>{" "}
            {settings.timeLimitSeconds
              ? `${settings.timeLimitSeconds}s`
              : "Geen"}
          </p>
          <p>
            <strong>Host:</strong>{" "}
            {settings.hostPlays ? "Speelt mee" : "Kijkt toe"}
          </p>
        </div>
        <p className="text-xs text-gray-400 italic">
          Alleen de host kan instellingen wijzigen.
        </p>
      </div>
    );
  }

  const updateRounds = (rounds: RoundConfig[]) => {
    onChange({ ...settings, rounds });
  };

  const addRound = () => {
    if (settings.rounds.length >= 5) return;
    updateRounds([
      ...settings.rounds,
      { type: "connections", difficulty: "medium" },
    ]);
  };

  const removeRound = () => {
    if (settings.rounds.length <= 1) return;
    updateRounds(settings.rounds.slice(0, -1));
  };

  const setRoundType = (index: number, type: RoundType) => {
    const newRounds = [...settings.rounds];
    newRounds[index] = { ...newRounds[index], type };
    updateRounds(newRounds);
  };

  const setRoundDifficulty = (index: number, difficulty: PuzzleDifficulty) => {
    const newRounds = [...settings.rounds];
    newRounds[index] = { ...newRounds[index], difficulty };
    updateRounds(newRounds);
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display font-bold text-lg text-gray-700">
        Spelinstellingen
      </h3>

      {/* Number of rounds */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Aantal rondes
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={removeRound}
            disabled={settings.rounds.length <= 1}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                       text-xl font-bold text-gray-600 disabled:opacity-30 transition-all"
          >
            −
          </button>
          <span className="font-display font-bold text-2xl text-brand-600 w-8 text-center">
            {settings.rounds.length}
          </span>
          <button
            onClick={addRound}
            disabled={settings.rounds.length >= 5}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                       text-xl font-bold text-gray-600 disabled:opacity-30 transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* Round types */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Type & moeilijkheid per ronde
        </label>
        <div className="space-y-3">
          {settings.rounds.map((round, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-bold text-gray-500 w-20">
                  Ronde {i + 1}
                </span>
                <div className="flex gap-1 flex-1">
                  <button
                    onClick={() => setRoundType(i, "connections")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${
                        round.type === "connections"
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    🔗 Connections
                  </button>
                  <button
                    onClick={() => setRoundType(i, "puzzelronde")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${
                        round.type === "puzzelronde"
                          ? "bg-purple-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    🧩 Puzzelronde
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-[5.5rem]">
                {(["easy", "medium", "hard"] as PuzzleDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setRoundDifficulty(i, d)}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all
                      ${
                        round.difficulty === d
                          ? d === "easy"
                            ? "bg-green-500 text-white shadow-md"
                            : d === "medium"
                              ? "bg-yellow-500 text-white shadow-md"
                              : "bg-red-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                  >
                    {d === "easy"
                      ? "Makkelijk"
                      : d === "medium"
                        ? "Gemiddeld"
                        : "Moeilijk"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attempts mode */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Pogingen
        </label>
        <div className="flex gap-2">
          <button
            onClick={() =>
              onChange({ ...settings, attemptsMode: "limited", maxAttempts: 4 })
            }
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all
              ${
                settings.attemptsMode === "limited"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            ❤️ {settings.maxAttempts} levens
          </button>
          <button
            onClick={() => onChange({ ...settings, attemptsMode: "unlimited" })}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all
              ${
                settings.attemptsMode === "unlimited"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            ♾️ Onbeperkt
          </button>
        </div>
      </div>

      {/* Time limit */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Tijdslimiet
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[null, 60, 90, 120, 180, 300].map((seconds) => (
            <button
              key={String(seconds)}
              onClick={() =>
                onChange({ ...settings, timeLimitSeconds: seconds })
              }
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all
                ${
                  settings.timeLimitSeconds === seconds
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {seconds === null
                ? "⏱️ Geen"
                : seconds < 60
                  ? `${seconds}s`
                  : `${seconds / 60}min`}
            </button>
          ))}
        </div>
      </div>

      {/* Host plays or spectates */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Host doet mee?
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...settings, hostPlays: true })}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all
              ${
                settings.hostPlays
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            🎮 Meespelen
          </button>
          <button
            onClick={() => onChange({ ...settings, hostPlays: false })}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all
              ${
                !settings.hostPlays
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            👀 Toekijken
          </button>
        </div>
      </div>
    </div>
  );
}
