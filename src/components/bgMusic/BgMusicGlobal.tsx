// src/components/bgMusic/BgMusicGlobal.tsx
"use client";

import { useEffect, useRef } from "react";

import { useBgMusicStore } from "@/store/useBgMusicStore";

interface BgMusicGlobalProps {
  /** 재생할 BGM 파일 경로 */
  src: string;
}

/**
 * 페이지(앱) 전체에 걸쳐 재생되는 BGM 컴포넌트
 * - 실제 <audio>를 렌더링
 * - isPlaying이 true면 play(), false면 pause()
 */
export function BgMusicGlobal({ src }: BgMusicGlobalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isPlaying } = useBgMusicStore();

  // isPlaying이 바뀔 때마다 오디오를 재생/정지
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.volume = 0.7;
      audio.play();
    } else {
      audio.pause();
      // audio.currentTime = 0; // 필요 시 재생위치 초기화
    }
  }, [isPlaying]);

  return <audio ref={audioRef} src={src} loop style={{ display: "none" }} />;
}
