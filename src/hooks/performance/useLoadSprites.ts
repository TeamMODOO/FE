// src/hooks/useLoadSprites.ts
"use client"; // Next.js의 클라이언트 컴포넌트에서 사용한다면

import { useEffect, useState } from "react";

const SPRITE_PATHS = {
  body: "/sprites/body.png",
  eyes: "/sprites/eyes.png",
  clothes: "/sprites/clothes.png",
  hair: "/sprites/hair.png",
};

export const LAYER_ORDER = ["body", "eyes", "clothes", "hair"] as const;
export const FRAME_WIDTH = 32;
export const FRAME_HEIGHT = 32;

/**
 * 스프라이트 시트 로딩 훅
 * - 로드가 끝나면 { body, eyes, clothes, hair } 키로 Image 객체를 반환
 */
export default function useLoadSprites() {
  const [spriteImages, setSpriteImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  useEffect(() => {
    const loaded: Record<string, HTMLImageElement> = {};
    const entries = Object.entries(SPRITE_PATHS);
    let count = 0;

    entries.forEach(([layer, path]) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loaded[layer] = img;
        count++;
        if (count === entries.length) {
          setSpriteImages(loaded);
        }
      };
    });
  }, []);

  return spriteImages;
}
