"use client";

import { create } from "zustand";

interface useIsConnectionsStoreState {
  isConnections: boolean;
  setIsConnections: (value: boolean) => void;
}

export const useIsConnectionsStore = create<useIsConnectionsStoreState>(
  (set) => ({
    isConnections: false,
    setIsConnections: (value: boolean) => set({ isConnections: value }),
  }),
);
