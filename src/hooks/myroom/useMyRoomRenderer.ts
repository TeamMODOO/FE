// hooks/myroom/useMyRoomRenderer.ts
"use client";

import { RefObject, useEffect, useRef } from "react";

import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { User } from "@/model/User";

/** 원본 배경 크기 */
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 900;

interface MyRoomRendererProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;

  /** 스프라이트 시트들 */
  spriteImages: Record<string, HTMLImageElement>;

  /** "한 명"만 그릴 경우 → myUser */
  myUser: User;

  /** 캐릭터 확대 배율 */
  charScale: number;
}

/**
 * rAF로 배경 + (내 캐릭터만) 카메라/스크롤 적용
 */
export function useMyRoomRenderer({
  canvasRef,
  canvasSize,
  backgroundImage,
  spriteImages,
  myUser,
  charScale,
}: MyRoomRendererProps) {
  // 단일 캐릭터 애니메이션 frame
  const userFrameRef = useRef<{ frame: number; lastFrameTime: number }>({
    frame: 0,
    lastFrameTime: performance.now(),
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;

    const frameInterval = 200; // 이동중 frame 전환 주기
    const maxMovingFrame = 3; // 1→2→3→1...

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // (A) 화면 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // (B) 세로 꽉 → scale = canvas.height / 900
        const scale = canvas.height / MAP_HEIGHT;

        // 뷰포트 크기(월드 좌표): w=canvas.width/scale, h=900
        const viewWidth = canvas.width / scale;

        // 카메라
        let cameraX = 0;
        const cameraY = 0; // 세로 스크롤 안함

        // 캐릭터 중심
        const centerX = myUser.x + (FRAME_WIDTH * charScale) / 2;
        cameraX = centerX - viewWidth / 2;

        // 맵 경계 보정
        const maxCamX = MAP_WIDTH - viewWidth;
        if (cameraX < 0) cameraX = 0;
        if (cameraX > maxCamX) cameraX = maxCamX;

        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(-cameraX, -cameraY);

        // (C) 배경
        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
        }

        // (D) 캐릭터 스프라이트
        // 로딩 완료인지 체크
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          const now2 = performance.now();
          const uf = userFrameRef.current;

          if (myUser.isMoving) {
            if (now2 - uf.lastFrameTime > frameInterval) {
              uf.frame++;
              if (uf.frame > maxMovingFrame) uf.frame = 1;
              uf.lastFrameTime = now2;
            }
          } else {
            uf.frame = 0;
            uf.lastFrameTime = now2;
          }

          const sx = uf.frame * FRAME_WIDTH;
          const sy = (myUser.direction ?? 0) * FRAME_HEIGHT;

          ctx.save();
          LAYER_ORDER.forEach((layer) => {
            const img = spriteImages[layer];
            if (!img) return;
            ctx.drawImage(
              img,
              sx,
              sy,
              FRAME_WIDTH,
              FRAME_HEIGHT,
              myUser.x,
              myUser.y,
              FRAME_WIDTH * charScale,
              FRAME_HEIGHT * charScale,
            );
          });
          ctx.restore();

          // 닉네임
          ctx.font = "bold 14px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            myUser.nickname,
            myUser.x + (FRAME_WIDTH * charScale) / 2,
            myUser.y + FRAME_HEIGHT * charScale + 15,
          );
        }

        ctx.restore();
      }
      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [canvasRef, canvasSize, backgroundImage, spriteImages, myUser, charScale]);
}
