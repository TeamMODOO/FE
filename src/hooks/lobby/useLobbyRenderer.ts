// hooks/lobby/useLobbyRenderer.ts
"use client";

import { RefObject, useEffect } from "react";

import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import useUsersStore from "@/store/useUsersStore";

/** 맵 상수 */
const MAP_CONSTANTS = {
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 700,
  IMG_WIDTH: 32,
  IMG_HEIGHT: 32,
};

interface UseLobbyRendererParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;
  npcImages: Record<string, HTMLImageElement>;
  spriteImages: Record<string, HTMLImageElement>;
  localClientId: string;
  portals: PortalInfo[];
  npcs: NpcInfo[];
}

/**
 * rAF로 배경/포탈/NPC/캐릭터를 그려주는 훅
 */
export function useLobbyRenderer({
  canvasRef,
  canvasSize,
  backgroundImage,
  npcImages,
  spriteImages,
  localClientId,
  portals,
  npcs,
}: UseLobbyRendererParams) {
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const zoomFactor = 2;
    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    const fps = 30;
    const frameDuration = 1000 / fps;
    let lastTime = 0;
    let animationId = 0;

    // 캐릭터 frame 관리
    const userFrameMap: Record<
      string,
      { frame: number; lastFrameTime: number }
    > = {};
    const frameInterval = 200;
    const maxMovingFrame = 3;

    // 초기화
    const { users } = useUsersStore.getState();
    users.forEach((u) => {
      userFrameMap[u.id] = {
        frame: 0,
        lastFrameTime: performance.now(),
      };
    });

    const render = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 카메라
        const { users } = useUsersStore.getState();
        const me = users.find((u) => u.id === localClientId);

        let cameraX = 0;
        let cameraY = 0;
        if (me) {
          const centerX = me.x + MAP_CONSTANTS.IMG_WIDTH / 2;
          const centerY = me.y + MAP_CONSTANTS.IMG_HEIGHT / 2;
          const viewWidth = canvas.width / zoomFactor;
          const viewHeight = canvas.height / zoomFactor;
          cameraX = centerX - viewWidth / 2;
          cameraY = centerY - viewHeight / 2;
          cameraX = clamp(cameraX, 0, MAP_CONSTANTS.MAP_WIDTH - viewWidth);
          cameraY = clamp(cameraY, 0, MAP_CONSTANTS.MAP_HEIGHT - viewHeight);
        }

        ctx.save();
        ctx.scale(zoomFactor, zoomFactor);
        ctx.translate(-cameraX, -cameraY);

        // 배경
        if (backgroundImage) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            MAP_CONSTANTS.MAP_WIDTH,
            MAP_CONSTANTS.MAP_HEIGHT,
          );
        }

        // NPC
        npcs.forEach((npc) => {
          const img = npcImages[npc.image];
          if (img) {
            ctx.drawImage(img, npc.x, npc.y, npc.width, npc.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(
              npc.name,
              npc.x + npc.width / 2,
              npc.y + npc.height + 12,
            );
          }
        });

        // 캐릭터
        const now = performance.now();
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          users.forEach((user) => {
            const { id, x, y, direction, isMoving, nickname } = user;
            if (!userFrameMap[id]) {
              userFrameMap[id] = { frame: 0, lastFrameTime: now };
            }
            const uf = userFrameMap[id];

            if (isMoving) {
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
            const sy = (direction ?? 0) * FRAME_HEIGHT;

            ctx.save();
            LAYER_ORDER.forEach((layer) => {
              const spr = spriteImages[layer];
              if (!spr) return;
              ctx.drawImage(
                spr,
                sx,
                sy,
                FRAME_WIDTH,
                FRAME_HEIGHT,
                x,
                y,
                FRAME_WIDTH,
                FRAME_HEIGHT,
              );
            });
            ctx.restore();

            // 닉네임
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(nickname, x + FRAME_WIDTH / 2, y + FRAME_HEIGHT + 12);
          });
        }

        ctx.restore();
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    canvasRef,
    canvasSize,
    backgroundImage,
    npcImages,
    spriteImages,
    localClientId,
    portals,
    npcs,
  ]);
}
