"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BgMusicStoreState {
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
}

/**
 * persist 미들웨어로 감싸면,
 * name = "bg-music-store" 라는 key로 localStorage에 저장됩니다.
 */
export const useBgMusicStore = create<BgMusicStoreState>()(
  persist(
    (set) => ({
      isPlaying: false,
      setIsPlaying: (value) => set({ isPlaying: value }),
    }),
    {
      name: "bg-music-store", // 로컬 스토리지 key
    },
  ),
);
