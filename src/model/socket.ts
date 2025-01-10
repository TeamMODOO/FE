import { Socket } from "socket.io-client";

export interface SocketStoreType {
  socket: Socket | null;
  isConnected: boolean;
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
}

// 수정된 타입(임시)
export interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: string | null;
}

export interface SocketActions {
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setCurrentRoom: (roomId: string | null) => void;
  reset: () => void;
}

export type SocketStore = SocketState & SocketActions;
