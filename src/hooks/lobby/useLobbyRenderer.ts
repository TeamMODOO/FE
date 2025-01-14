"use client";

import { RefObject, useEffect, useRef } from "react";

import { LOBBY_MAP_CONSTANTS } from "@/app/lobby/_constant";
import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import { LobbyUser } from "@/store/useUsersRef";

/** 예: 11:6 비율 (550×301)에 가깝게 가정 */
const FIXED_VIEWPORT_WIDTH = 605;
const FIXED_VIEWPORT_HEIGHT = 330;

interface UseLobbyRendererParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;
  npcImages: Record<string, HTMLImageElement>;
  portalImage?: HTMLImageElement | null;
  spriteImages: Record<string, HTMLImageElement>;

  usersRef: React.MutableRefObject<LobbyUser[]>;
  localClientId: string;
  portals: PortalInfo[];
  npcs: NpcInfo[];
  characterScale: number;
}

export default function useLobbyRenderer({
  canvasRef,
  canvasSize,
  backgroundImage,
  npcImages,
  portalImage,
  spriteImages,
  usersRef,
  localClientId,
  portals,
  npcs,
  characterScale,
}: UseLobbyRendererParams) {
  const cameraPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    const fps = 30;
    const frameDuration = 1000 / fps;
    let lastTime = 0;
    let animationId = 0;

    // 스프라이트 애니메이션 프레임 관리
    const userFrameMap: Record<
      string,
      { frame: number; lastFrameTime: number }
    > = {};
    const frameInterval = 100; // 100ms마다 프레임 전환
    const maxMovingFrame = 3; // 이동시 1~3 프레임

    // 초기 설정
    usersRef.current.forEach((u) => {
      userFrameMap[u.id] = { frame: 0, lastFrameTime: performance.now() };
    });

    const render = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 화면 스케일
        const scaleX = canvas.width / FIXED_VIEWPORT_WIDTH;
        const scaleY = canvas.height / FIXED_VIEWPORT_HEIGHT;
        const baseScale = Math.min(scaleX, scaleY);

        ctx.save();
        ctx.scale(baseScale, baseScale);

        // (A) 보간
        const now = performance.now();
        usersRef.current.forEach((user) => {
          if (user.lerpDuration > 0) {
            const progress = (now - user.lerpStartTime) / user.lerpDuration;
            if (progress >= 1) {
              user.drawX = user.lerpTargetX;
              user.drawY = user.lerpTargetY;
            } else {
              user.drawX =
                user.lerpStartX +
                (user.lerpTargetX - user.lerpStartX) * progress;
              user.drawY =
                user.lerpStartY +
                (user.lerpTargetY - user.lerpStartY) * progress;
            }
          } else {
            user.drawX = user.lerpTargetX;
            user.drawY = user.lerpTargetY;
          }
        });

        // (B) 카메라
        const me = usersRef.current.find((u) => u.id === localClientId);
        let targetX = 0;
        let targetY = 0;
        if (me) {
          const centerX =
            me.drawX + (LOBBY_MAP_CONSTANTS.IMG_WIDTH * characterScale) / 2;
          const centerY =
            me.drawY + (LOBBY_MAP_CONSTANTS.IMG_HEIGHT * characterScale) / 2;
          targetX = centerX - FIXED_VIEWPORT_WIDTH / 2;
          targetY = centerY - FIXED_VIEWPORT_HEIGHT / 2;

          const maxCamX = LOBBY_MAP_CONSTANTS.MAP_WIDTH - FIXED_VIEWPORT_WIDTH;
          const maxCamY =
            LOBBY_MAP_CONSTANTS.MAP_HEIGHT - FIXED_VIEWPORT_HEIGHT;
          targetX = clamp(targetX, 0, Math.max(0, maxCamX));
          targetY = clamp(targetY, 0, Math.max(0, maxCamY));
        }

        const smoothing = 0.3; // 카메라 부드럽게
        cameraPosRef.current.x +=
          (targetX - cameraPosRef.current.x) * smoothing;
        cameraPosRef.current.y +=
          (targetY - cameraPosRef.current.y) * smoothing;
        ctx.translate(-cameraPosRef.current.x, -cameraPosRef.current.y);

        // (C) 배경
        if (backgroundImage) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            LOBBY_MAP_CONSTANTS.MAP_WIDTH,
            LOBBY_MAP_CONSTANTS.MAP_HEIGHT,
          );
        }

        // (D) 포탈
        if (portalImage && portalImage.complete) {
          portals.forEach((p) => {
            ctx.drawImage(portalImage, p.x, p.y, p.width, p.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(p.name, p.x + p.width / 2, p.y + p.height + 12);
          });
        } else {
          portals.forEach((p) => {
            ctx.fillStyle = "rgba(0,255,255,0.3)";
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(p.name, p.x + p.width / 2, p.y + p.height + 12);
          });
        }

        // (E) NPC
        npcs.forEach((npc) => {
          const img = npcImages[npc.image];
          if (img) {
            ctx.drawImage(img, npc.x, npc.y, npc.width, npc.height);
          }
          // 이름
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "yellow";
          ctx.textAlign = "center";
          ctx.fillText(
            npc.name,
            npc.x + npc.width / 2,
            npc.y + npc.height + 12,
          );
        });

        // (F) 캐릭터
        usersRef.current.forEach((user) => {
          const { id, drawX, drawY, direction, isMoving, nickname } = user;

          if (!userFrameMap[id]) {
            userFrameMap[id] = { frame: 0, lastFrameTime: now };
          }
          const uf = userFrameMap[id];

          // 이동중이라면 애니메이션 재생, 멈춰있다면 frame=0
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

          // 스프라이트 시트에서 잘라낼 위치
          const sx = uf.frame * FRAME_WIDTH;
          const sy = (direction ?? 0) * FRAME_HEIGHT;

          const scaledW = FRAME_WIDTH * characterScale;
          const scaledH = FRAME_HEIGHT * characterScale;

          ctx.save();
          // LAYER_ORDER 순서대로 그리기
          if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
            LAYER_ORDER.forEach((layer) => {
              const spr = spriteImages[layer];
              if (!spr) return;
              ctx.drawImage(
                spr,
                sx,
                sy,
                FRAME_WIDTH,
                FRAME_HEIGHT,
                drawX,
                drawY,
                scaledW,
                scaledH,
              );
            });
          } else {
            // 미로딩 시 임시
            ctx.fillStyle = "blue";
            ctx.fillRect(drawX, drawY, scaledW, scaledH);
          }
          ctx.restore();

          // 닉네임
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(nickname, drawX + scaledW / 2, drawY + scaledH + 12);
        });

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
    portalImage,
    spriteImages,
    usersRef,
    localClientId,
    portals,
    npcs,
    characterScale,
  ]);
}
