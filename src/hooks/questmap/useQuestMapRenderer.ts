// components/QuestMapCanvas/hooks/useQuestMapRenderer.ts
"use client";

import { RefObject, useEffect, useRef } from "react";

import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import { User } from "@/model/User";

/** 렌더러 Props */
interface RendererProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };

  users: User[];
  npcList: NpcInfo[];
  portalList: PortalInfo[];

  spriteImages: Record<string, HTMLImageElement>;
  charScale: number;
  backgroundUrl?: string; // 배경 경로
}

/**
 * rAF 로직: 배경 / NPC / 캐릭터 등을 Canvas에 그려주는 훅
 *  - DOM 으로 표시하고 싶은 요소(포탈 등)는 여기서 그리지 말거나,
 *    portalList에 아예 안 넘기면 됨.
 */
export function useQuestMapRenderer({
  canvasRef,
  canvasSize,
  users,
  npcList,
  portalList,
  spriteImages,
  charScale,
  backgroundUrl = "/background/quest_map.webp",
}: RendererProps) {
  const userFrameMap = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  // (A) 초기화
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 픽셀 크기
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;

    // 캐릭터 애니메이션
    const frameInterval = 200;
    const maxMovingFrame = 3;

    // 배경 이미지
    const bg = new Image();
    bg.src = backgroundUrl;

    // (B) NPC 이미지 캐싱
    const npcImgMap: Record<string, HTMLImageElement> = {};
    npcList.forEach((npc) => {
      if (!npcImgMap[npc.image]) {
        const tmp = new Image();
        tmp.src = npc.image;
        npcImgMap[npc.image] = tmp;
      }
    });

    // (C) 포탈 이미지 캐싱 (필요없다면 안 해도 됨)
    const portalImgMap: Record<string, HTMLImageElement> = {};
    portalList.forEach((p) => {
      if (!portalImgMap[p.image]) {
        const tmp = new Image();
        tmp.src = p.image;
        portalImgMap[p.image] = tmp;
      }
    });

    const loop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // Clear
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

        // (1) 배경
        if (bg.complete) {
          ctx.drawImage(bg, 0, 0, canvasSize.w, canvasSize.h);
        }

        // (2) 포탈(캔버스에 그리고 싶다면)
        //     만약 DOM 으로 표시할 거면 아래 코드 주석처리
        portalList.forEach((portal) => {
          const pi = portalImgMap[portal.image];
          if (pi && pi.complete) {
            ctx.drawImage(pi, portal.x, portal.y, portal.width, portal.height);
          } else {
            // 로딩 안 됐다면 임시 사각형
            ctx.fillStyle = "rgba(0,255,255,0.3)";
            ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
          }
        });

        // (3) NPC
        npcList.forEach((npc) => {
          const ni = npcImgMap[npc.image];
          if (ni && ni.complete) {
            ctx.drawImage(ni, npc.x, npc.y, npc.width, npc.height);
            // 이름
            ctx.font = "12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(
              npc.name,
              npc.x + npc.width / 2,
              npc.y + npc.height + 12,
            );
          } else {
            ctx.fillStyle = "rgba(255,0,0,0.3)";
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
          }
        });

        // (4) 캐릭터
        const now = performance.now();
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          users.forEach((user) => {
            const uf = userFrameMap.current[user.id];
            if (!uf) return;

            // 이동 중이면 프레임++
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

            // 스프라이트 draw
            const sx = uf.frame * FRAME_WIDTH;
            const sy = (user.direction ?? 0) * FRAME_HEIGHT;

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
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [canvasRef, canvasSize, npcList, portalList, spriteImages, charScale]);
}
