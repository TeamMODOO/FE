import { create } from "zustand";

import { SocketStoreType } from "@/model/socket";

const useMainSocketStore = create<SocketStoreType>((set) => ({
  socket: null,
  isConnected: false,
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
}));

export default useMainSocketStore;
