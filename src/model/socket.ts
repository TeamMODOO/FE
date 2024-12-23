import { Socket } from "socket.io-client";

export interface SocketStoreType {
  socket: Socket | null;
  isConnected: boolean;
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
}
