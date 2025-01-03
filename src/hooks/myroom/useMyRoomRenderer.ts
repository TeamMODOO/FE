"use client";

import { RefObject, useEffect, useRef } from "react";

import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { User } from "@/model/User";

interface MyRoomRendererProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;

  spriteImages: Record<string, HTMLImageElement>;
  users: User[];

  charScale: number;
  emitMovement: (x: number, y: number, direction: number) => void;
  mapSpeed: number;
  myUserId: string;
}

/**
 * rAF로 배경 + 캐릭터를 그려주는 훅
 * (가구, 게시판 등은 DOM으로 표시)
 */
export function useMyRoomRenderer({
  canvasRef,
  canvasSize,
  backgroundImage,
  spriteImages,
  users,
  charScale,
  emitMovement,
  mapSpeed,
  myUserId,
}: MyRoomRendererProps) {
  // 캐릭터 애니메이션용 ref
  const userFrameMap = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  // users가 바뀔 때마다 frame 정보 초기화
  useEffect(() => {
    users.forEach((u) => {
      userFrameMap.current[u.id] = {
        frame: 0,
        lastFrameTime: performance.now(),
      };
    });
  }, [users]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = canvasSize.w;
    canvasRef.current.height = canvasSize.h;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;
    const frameInterval = 200;
    const maxMovingFrame = 3;

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // 1) Clear
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

        // 2) 배경
        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, canvasSize.w, canvasSize.h);
        }

        // 3) 캐릭터
        const now = performance.now();
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          users.forEach((user) => {
            const uf = userFrameMap.current[user.id];
            if (!uf) {
              userFrameMap.current[user.id] = {
                frame: 0,
                lastFrameTime: now,
              };
              return;
            }

            // 이동중이면 frame++
            if (user.isMoving) {
              if (now - uf.lastFrameTime > frameInterval) {
                uf.frame++;
                if (uf.frame > maxMovingFrame) uf.frame = 1;
                uf.lastFrameTime = now;
              }
            } else {
              uf.frame = 0;
              uf.lastFrameTime = now;
            }

            const sx = uf.frame * FRAME_WIDTH;
            const sy = (user.direction ?? 0) * FRAME_HEIGHT;

            // 레이어 순서대로
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
                user.x,
                user.y,
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
              user.nickname,
              user.x + (FRAME_WIDTH * charScale) / 2,
              user.y + FRAME_HEIGHT * charScale + 15,
            );
          });
        }
      }
      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [canvasRef, canvasSize, backgroundImage, spriteImages, users, charScale]);
}
