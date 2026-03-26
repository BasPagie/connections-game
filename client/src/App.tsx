import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Join from "./pages/Join";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/join/:roomId" element={<Join />} />
        <Route path="/lobby/:roomId" element={<Lobby />} />
        <Route path="/game/:roomId" element={<Game />} />
        <Route path="/results/:roomId" element={<Results />} />
      </Routes>
    </div>
  );
}
