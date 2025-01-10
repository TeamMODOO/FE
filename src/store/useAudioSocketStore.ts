import { create } from "zustand";

import { AudioSocketType } from "@/model/socket";

const useAudioSocketStore = create<AudioSocketType>((set) => ({
  socket: null,
  isConnected: false,
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
}));

export default useAudioSocketStore;
