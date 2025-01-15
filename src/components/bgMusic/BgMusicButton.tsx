"use client";

import { useEffect } from "react";

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

  // 'c' 키 입력 시 handleToggleMusic 실행
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "c" || event.key === "C") {
        handleToggleMusic();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying]); // isPlaying이 바뀔 때마다 이벤트 콜백도 최신 값 유지

  return (
    <Button
      onClick={handleToggleMusic}
      title="배경음악 ON/OFF"
      className={`
        bg-color-none fixed top-6
        z-50 size-20 rounded-full
        border-2
        border-[rgba(111,99,98,1)]
        bg-gradient-to-b from-black/70 to-black/90
        text-[rgba(171,159,158,1)]
        hover:bg-[rgba(255,255,255,0.9)]
        ${buttonPositionClass}
      `}
    >
      {isPlaying ? (
        <Volume2 className="min-h-8 min-w-8" />
      ) : (
        <VolumeOff className="min-h-8 min-w-8" />
      )}
    </Button>
  );
}
