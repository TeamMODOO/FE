import { Socket } from "socket.io-client";
import { create } from "zustand";

import { SocketState, SocketStore } from "@/model/socket";

const initialState: SocketState = {
  socket: null,
  isConnected: false,
  currentRoom: null,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createSocketStore = (set: any) => ({
  ...initialState,
  setSocket: (socket: Socket | null) => set({ socket }),
  setIsConnected: (isConnected: boolean) => set({ isConnected }),
  setCurrentRoom: (roomId: string | null) => set({ currentRoom: roomId }),
  reset: () => set(initialState),
});

const useSocketStore = create<SocketStore>()(createSocketStore);

export default useSocketStore;
