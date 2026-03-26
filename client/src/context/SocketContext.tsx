import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "shared/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SocketContext = createContext<GameSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<GameSocket | null>(null);

  useEffect(() => {
    const s: GameSocket = io(
      window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : window.location.origin,
      {
        transports: ["websocket", "polling"],
      },
    );

    s.on("connect", () => {
      console.log("[Socket] Verbonden:", s.id);
    });

    s.on("disconnect", () => {
      console.log("[Socket] Verbinding verbroken");
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): GameSocket | null {
  return useContext(SocketContext);
}
