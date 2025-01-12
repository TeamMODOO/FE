// hooks/performance/useLoadSprites.ts
"use client";

import { useEffect, useState } from "react";

export const FRAME_WIDTH = 32;
export const FRAME_HEIGHT = 32;
/** 스프라이트 레이어 순서: 예) body → eyes → clothes → hair */
export const LAYER_ORDER = ["body", "eyes", "clothes", "hair"];

/**
 * 각 레이어별 스프라이트 시트를 로딩
 */
export function useLoadSprites() {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const layers = LAYER_ORDER;
    const temp: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;

    layers.forEach((layer) => {
      const img = new Image();
      img.src = `/sprites/${layer}.png`; // 실제 스프라이트 경로
      img.onload = () => {
        temp[layer] = img;
        loadedCount++;
        if (loadedCount === layers.length) {
          setImages({ ...temp });
        }
      };
    });
  }, []);

  return images;
}
