// socketProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { io, Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";

interface SocketContextType {
  mainSocket: Socket | null;
  isConnected: boolean;
  currentRoom: string | null;
  joinRoom: (roomId: string, roomType: string) => void;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [mainSocket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    let clientId = localStorage.getItem("client_id");
    if (!clientId) {
      clientId = session?.user?.id ? `Y${session.user.id}` : `N${uuid()}`;
      localStorage.setItem("client_id", clientId);
    }
    const ROOM_TYPE = "floor";
    const ROOM_ID = "floor7";

    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL!, {
      path: "/sio/sockets",
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
      query: {
        client_id: clientId,
        user_name: session?.user?.name || "Guest",
        room_id: ROOM_ID,
        room_type: ROOM_TYPE,
      },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [status]);

  const joinRoom = (roomId: string, roomType: string) => {
    if (!mainSocket || !isConnected) return;

    if (currentRoom) {
      mainSocket.emit("leave_room", { roomId: currentRoom });
    }

    mainSocket.emit("join_room", { roomId, roomType });
    setCurrentRoom(roomId);
  };

  const leaveRoom = () => {
    if (!mainSocket || !currentRoom) return;

    mainSocket.emit("leave_room", { roomId: currentRoom });
    setCurrentRoom(null);
  };

  return (
    <SocketContext.Provider
      value={{
        mainSocket,
        isConnected,
        currentRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// 커스텀 훅
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
