import { Socket } from "socket.io-client";

export interface AudioSocketType {
  socket: Socket | null;
  isConnected: boolean;
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
}

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
