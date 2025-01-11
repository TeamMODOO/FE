// src/components/bgMusic/BgMusicButton.tsx
"use client";

import { Volume2, VolumeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBgMusicStore } from "@/store/useBgMusicStore";

interface BgMusicButtonProps {
  position?: "left" | "right";
}

export function BgMusicButton({ position = "right" }: BgMusicButtonProps) {
  const { isPlaying, setIsPlaying } = useBgMusicStore();

  // 버튼 위치 (왼쪽/오른쪽)
  const buttonPositionClass = position === "left" ? "left-4" : "right-4";

  // 토글 핸들러
  const handleToggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Button
      onClick={handleToggleMusic}
      className={`
        fixed top-6 z-50
        size-20 rounded-full border-2
        border-[rgba(111,99,98,1)]
        bg-gradient-to-b from-black/70 to-black/90
        text-[rgba(171,159,158,1)]
        hover:bg-[rgba(255,255,255,0.9)]
        ${buttonPositionClass}
      `}
    >
      {isPlaying ? (
        <VolumeOff className="min-h-8 min-w-8" />
      ) : (
        <Volume2 className="min-h-8 min-w-8" />
      )}
    </Button>
  );
}
