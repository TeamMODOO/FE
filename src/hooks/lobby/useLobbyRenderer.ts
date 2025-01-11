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
import { User } from "@/model/User";

/** 11:6 비율 (550×301) 고정 뷰포트 예시 */
const FIXED_VIEWPORT_WIDTH = 605;
const FIXED_VIEWPORT_HEIGHT = 330;

/**
 * 이 훅의 params
 */
interface UseLobbyRendererParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;
  npcImages: Record<string, HTMLImageElement>;
  portalImage?: HTMLImageElement | null;
  spriteImages: Record<string, HTMLImageElement>;

  // [중요] usersRef를 인자로 직접 받아옴
  usersRef: React.MutableRefObject<User[]>;

  localClientId: string;
  portals: PortalInfo[];
  npcs: NpcInfo[];
}

/**
 * (1) 30fps 고정
 * (2) usersRef.current로부터 유저 정보를 가져와 그리기
 * (3) ref 기반으로 렌더링하므로, usersRef가 변경되어도 React는 리렌더링되지 않음
 */
export function useLobbyRenderer({
  canvasRef,
  canvasSize,
  backgroundImage,
  npcImages,
  portalImage,
  spriteImages,
  usersRef, // ★ 추가
  localClientId,
  portals,
  npcs,
}: UseLobbyRendererParams) {
  // 카메라 좌표를 ref로 저장 (매 프레임 보간)
  const cameraPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 픽셀 사이즈
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    // 편의 함수
    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    // 30fps 고정
    const fps = 30;
    const frameDuration = 1000 / fps;
    let lastTime = 0;
    let animationId = 0;

    // 캐릭터 frame 관리용
    const userFrameMap: Record<
      string,
      { frame: number; lastFrameTime: number }
    > = {};
    const frameInterval = 200;
    const maxMovingFrame = 3;

    // 초기화: 현재 usersRef
    usersRef.current.forEach((u) => {
      userFrameMap[u.id] = { frame: 0, lastFrameTime: performance.now() };
    });

    /**
     * 실제 렌더 함수 (rAF)
     */
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

        // (C) 현재 유저(나) 찾아서 카메라 중앙에 맞추기
        const me = usersRef.current.find((u) => u.id === localClientId);

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

        // 보간 (lerp) 로 카메라 부드럽게 이동
        const smoothing = 0.2;
        const camX = cameraPosRef.current.x;
        const camY = cameraPosRef.current.y;
        const newCamX = camX + (targetCameraX - camX) * smoothing;
        const newCamY = camY + (targetCameraY - camY) * smoothing;

        cameraPosRef.current.x = newCamX;
        cameraPosRef.current.y = newCamY;

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

        // (E) 포탈
        if (portalImage && portalImage.complete) {
          portals.forEach((p) => {
            ctx.drawImage(portalImage, p.x, p.y, p.width, p.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(p.name, p.x + p.width / 2, p.y + p.height + 12);
          });
        } else {
          // 포탈 이미지 없거나 로딩 전
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

        // (G) 캐릭터들
        const now = performance.now();
        const storeUsers = usersRef.current;

        // 스프라이트 레이어가 다 로딩됐는지 체크
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          storeUsers.forEach((user) => {
            const { id, x, y, direction, isMoving, nickname } = user;

            if (!userFrameMap[id]) {
              userFrameMap[id] = { frame: 0, lastFrameTime: now };
            }
            const uf = userFrameMap[id];

            // 움직이는 중이라면 프레임 애니메이션
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

        // (H) restore
        ctx.restore();
      }

      // 다음 프레임
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
    usersRef, // ref 객체
    localClientId,
    portals,
    npcs,
  ]);
}
