// hooks/lobby/useLobbyRenderer.ts
"use client";

import { RefObject, useEffect, useRef } from "react";

import { LOBBY_MAP_CONSTANTS } from "@/app/lobby/_constant";
// import { LOBBY_COLLISION_ZONES } from "@/app/lobby/_constant";
import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import useUsersStore from "@/store/useUsersStore";

/** 11:6 비율 (550×301) 고정 뷰포트 예시 */
const FIXED_VIEWPORT_WIDTH = 605;
const FIXED_VIEWPORT_HEIGHT = 330;

interface UseLobbyRendererParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;

  /** NPC & 포탈 이미지를 이미 로딩해둔 상태로 넘김 */
  npcImages: Record<string, HTMLImageElement>;
  /** 단일 포탈 이미지 (예: portal.png) */
  portalImage?: HTMLImageElement | null;

  spriteImages: Record<string, HTMLImageElement>;
  localClientId: string;
  portals: PortalInfo[];
  npcs: NpcInfo[];
}

/**
 * rAF로 배경/포탈/NPC/캐릭터를 그려주는 훅
 * - 고정 뷰포트(FIXED_VIEWPORT_WIDTH × FIXED_VIEWPORT_HEIGHT)
 * - 사용자의 실제 화면에 맞춰 scale
 * - NPC & 포탈도 함께 렌더링
 *
 * [추가됨/변경됨]
 * - "카메라( cameraX, cameraY )" 좌표를 유저 위치로 즉시 이동하지 않고,
 *   매 프레임마다 조금씩 보간(lerp)하여 부드럽게 이동하도록 구현
 */
export function useLobbyRenderer({
  canvasRef,
  canvasSize,
  backgroundImage,
  npcImages,
  portalImage,
  spriteImages,
  localClientId,
  portals,
  npcs,
}: UseLobbyRendererParams) {
  // [추가됨] 카메라 좌표를 ref로 관리 (re-render 유발 방지)
  const cameraPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1) 캔버스 픽셀 사이즈 설정
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    // 편의 함수
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

    // 초기화 (현재 users)
    const { users } = useUsersStore.getState();
    users.forEach((u) => {
      userFrameMap[u.id] = { frame: 0, lastFrameTime: performance.now() };
    });

    const render = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // (A) 화면 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // (B) 고정 뷰포트 대비 현재 화면 스케일 계산
        const scaleX = canvas.width / FIXED_VIEWPORT_WIDTH;
        const scaleY = canvas.height / FIXED_VIEWPORT_HEIGHT;
        const baseScale = Math.min(scaleX, scaleY);

        ctx.save();
        ctx.scale(baseScale, baseScale);

        // (C) 카메라 위치 결정
        const store = useUsersStore.getState();
        const me = store.users.find((u) => u.id === localClientId);

        // [변경됨] 기존 즉시 이동 -> lerp
        let targetCameraX = 0;
        let targetCameraY = 0;
        if (me) {
          const centerX = me.x + LOBBY_MAP_CONSTANTS.IMG_WIDTH / 2;
          const centerY = me.y + LOBBY_MAP_CONSTANTS.IMG_HEIGHT / 2;

          const viewWidth = FIXED_VIEWPORT_WIDTH;
          const viewHeight = FIXED_VIEWPORT_HEIGHT;

          targetCameraX = centerX - viewWidth / 2;
          targetCameraY = centerY - viewHeight / 2;

          const maxCamX = LOBBY_MAP_CONSTANTS.MAP_WIDTH - viewWidth;
          const maxCamY = LOBBY_MAP_CONSTANTS.MAP_HEIGHT - viewHeight;

          targetCameraX = clamp(targetCameraX, 0, Math.max(0, maxCamX));
          targetCameraY = clamp(targetCameraY, 0, Math.max(0, maxCamY));
        }

        // [추가됨] 카메라를 부드럽게 따라가도록 보간(lerp) 처리
        const smoothing = 0.2; // 0~1 사이 값 (클수록 더 빨리 따라감)
        const camX = cameraPosRef.current.x;
        const camY = cameraPosRef.current.y;
        const newCamX = camX + (targetCameraX - camX) * smoothing;
        const newCamY = camY + (targetCameraY - camY) * smoothing;

        cameraPosRef.current = { x: newCamX, y: newCamY };

        // 카메라 이동 반영
        ctx.translate(-cameraPosRef.current.x, -cameraPosRef.current.y);

        // (D) 배경
        if (backgroundImage) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            LOBBY_MAP_CONSTANTS.MAP_WIDTH,
            LOBBY_MAP_CONSTANTS.MAP_HEIGHT,
          );
        }

        // (E) 포탈 그리기
        if (portalImage && portalImage.complete) {
          portals.forEach((p) => {
            ctx.drawImage(portalImage, p.x, p.y, p.width, p.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(p.name, p.x + p.width / 2, p.y + p.height + 12);
          });
        } else {
          // 포탈 이미지가 없거나 로딩 전이라면, 임시 사각형 표시
          portals.forEach((p) => {
            ctx.fillStyle = "rgba(0,255,255,0.3)";
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(p.name, p.x + p.width / 2, p.y + p.height + 12);
          });
        }

        // (F) NPC
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

        // (G) 캐릭터(유저) 스프라이트
        const now = performance.now();
        const storeUsers = useUsersStore.getState().users;

        // 스프라이트 레이어가 다 로딩됐는지 체크
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          storeUsers.forEach((user) => {
            const { id, x, y, direction, isMoving, nickname } = user;

            if (!userFrameMap[id]) {
              userFrameMap[id] = { frame: 0, lastFrameTime: now };
            }
            const uf = userFrameMap[id];

            // 이동 중이라면 애니메이션 frame 업데이트
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

            // 레이어 순서대로 그리기
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

        // (H) 스케일/카메라 해제
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
    localClientId,
    portals,
    npcs,
  ]);
}
