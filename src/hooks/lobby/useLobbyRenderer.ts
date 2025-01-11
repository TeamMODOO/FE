// hooks/lobby/useLobbyRenderer.ts
"use client";

import { RefObject, useEffect, useRef } from "react";

import { LOBBY_MAP_CONSTANTS } from "@/app/lobby/_constant";
import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { User } from "@/model/LobbyUser";
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";

/** 11:6 비율 (550×301) 고정 뷰포트 예시 */
const FIXED_VIEWPORT_WIDTH = 605;
const FIXED_VIEWPORT_HEIGHT = 330;

/** 파라미터 */
interface UseLobbyRendererParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;
  npcImages: Record<string, HTMLImageElement>;
  portalImage?: HTMLImageElement | null;
  spriteImages: Record<string, HTMLImageElement>;

  // [중요] usersRef
  usersRef: React.MutableRefObject<User[]>;

  localClientId: string;
  portals: PortalInfo[];
  npcs: NpcInfo[];
}

/**
 * (1) 30fps 고정 (frameDuration)
 * (2) usersRef.current로부터 유저 정보를 가져와 그리기
 * (3) 각 유저에 대해 drawX, drawY를 보간(lerp) 처리
 */
export function useLobbyRenderer({
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
}: UseLobbyRendererParams) {
  // 카메라 좌표
  const cameraPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
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

    // (캐릭터 애니메이션) frame 관리
    const userFrameMap: Record<
      string,
      { frame: number; lastFrameTime: number }
    > = {};
    const frameInterval = 200;
    const maxMovingFrame = 3;

    // 초기화(이미 있는 유저들에 대해)
    usersRef.current.forEach((u) => {
      userFrameMap[u.id] = { frame: 0, lastFrameTime: performance.now() };
    });

    /** rAF 렌더 함수 */
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

        // (A) 각 유저의 drawX, drawY 보간
        const now = performance.now();
        usersRef.current.forEach((user) => {
          const { lerpStartTime, lerpDuration } = user;
          if (lerpDuration > 0) {
            const progress = (now - lerpStartTime) / lerpDuration;
            if (progress >= 1) {
              // 목표지점 도달
              user.drawX = user.lerpTargetX;
              user.drawY = user.lerpTargetY;
            } else {
              // lerp
              user.drawX =
                user.lerpStartX +
                (user.lerpTargetX - user.lerpStartX) * progress;
              user.drawY =
                user.lerpStartY +
                (user.lerpTargetY - user.lerpStartY) * progress;
            }
          } else {
            // lerpDuration = 0이면 그냥 x,y
            user.drawX = user.lerpTargetX;
            user.drawY = user.lerpTargetY;
          }
        });

        // (B) 카메라 위치 결정
        const me = usersRef.current.find((u) => u.id === localClientId);
        let targetCameraX = 0;
        let targetCameraY = 0;
        if (me) {
          // 카메라는 drawX, drawY 기준으로 (캐릭터가 보간중이라면 중간지점 따라감)
          const centerX = me.drawX + LOBBY_MAP_CONSTANTS.IMG_WIDTH / 2;
          const centerY = me.drawY + LOBBY_MAP_CONSTANTS.IMG_HEIGHT / 2;
          const viewW = FIXED_VIEWPORT_WIDTH;
          const viewH = FIXED_VIEWPORT_HEIGHT;

          targetCameraX = centerX - viewW / 2;
          targetCameraY = centerY - viewH / 2;

          const maxCamX = LOBBY_MAP_CONSTANTS.MAP_WIDTH - viewW;
          const maxCamY = LOBBY_MAP_CONSTANTS.MAP_HEIGHT - viewH;
          targetCameraX = clamp(targetCameraX, 0, Math.max(0, maxCamX));
          targetCameraY = clamp(targetCameraY, 0, Math.max(0, maxCamY));
        }

        // (B-1) 카메라도 부드럽게 이동(lerp)
        const smoothing = 0.2;
        const camX = cameraPosRef.current.x;
        const camY = cameraPosRef.current.y;
        const newCamX = camX + (targetCameraX - camX) * smoothing;
        const newCamY = camY + (targetCameraY - camY) * smoothing;
        cameraPosRef.current.x = newCamX;
        cameraPosRef.current.y = newCamY;

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
          // 로딩 전 임시 표시
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
          if (!img) return;
          ctx.drawImage(img, npc.x, npc.y, npc.width, npc.height);

          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "yellow";
          ctx.textAlign = "center";
          ctx.fillText(
            npc.name,
            npc.x + npc.width / 2,
            npc.y + npc.height + 12,
          );
        });

        // (F) 캐릭터 스프라이트
        const storeUsers = usersRef.current;
        storeUsers.forEach((user) => {
          const { id, drawX, drawY, direction, isMoving, nickname } = user;

          // 스프라이트 애니메이션 frame
          if (!userFrameMap[id]) {
            userFrameMap[id] = { frame: 0, lastFrameTime: performance.now() };
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

          // 레이어 순서대로 그리기 (body, eyes, clothes, hair)
          ctx.save();
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
                FRAME_WIDTH,
                FRAME_HEIGHT,
              );
            });
          } else {
            // 혹은 미로딩이면 임시 표시
            ctx.fillStyle = "blue";
            ctx.fillRect(drawX, drawY, FRAME_WIDTH, FRAME_HEIGHT);
          }
          ctx.restore();

          // 닉네임
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            nickname,
            drawX + FRAME_WIDTH / 2,
            drawY + FRAME_HEIGHT + 12,
          );
        });

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    // rAF 시작
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
  ]);
}
