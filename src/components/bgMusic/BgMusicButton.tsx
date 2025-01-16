"use client";

import { useEffect } from "react";

import { Volume2, VolumeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBgMusicStore } from "@/store/useBgMusicStore";

interface BgMusicButtonProps {
  position?: "left" | "right";
  chatOpen?: boolean;
}

export function BgMusicButton({
  position = "right",
  chatOpen = false,
}: BgMusicButtonProps) {
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
      // chatOpen이 true라면, 친구목록 단축키 무시
      if (chatOpen) return;
      // IME 입력(한글 조합 등) 중이면 단축키 무시
      if (event.isComposing) return;

      // input, textarea, contentEditable 포커스 시 단축키 무시
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInputFocused =
        tagName === "input" ||
        tagName === "textarea" ||
        (target as HTMLElement).isContentEditable;
      if (isInputFocused) return;

      if (event.key === "c" || event.key === "C" || event.key === "ㅊ") {
        handleToggleMusic();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, chatOpen]); // isPlaying이 바뀔 때마다 이벤트 콜백도 최신 값 유지

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
