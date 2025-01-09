"use client";

import { RefObject, useEffect, useRef } from "react";

import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { Funiture } from "@/model/Funiture";
import { User } from "@/model/User";

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 900;

interface MyRoomRendererProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: { w: number; h: number };
  backgroundImage: HTMLImageElement | null;

  /** 캐릭터 스프라이트 시트들 */
  spriteImages: Record<string, HTMLImageElement>;

  /** "한 명"만 그릴 경우 → myUser */
  myUser: User;

  /** 캐릭터 확대 배율 */
  charScale: number;

  /** 가구 (이력서/포폴/스택), 방명록, 포탈 등 이미지 */
  furnitureImages: Record<string, HTMLImageElement>;

  resume: Funiture[];
  portfolio: Funiture[];
  technologyStack: Funiture[];
  board: Funiture[];
  portal: {
    x: number;
    y: number;
    width: number;
    height: number;
    route: string;
    name: string;
  };
}

/**
 * rAF로 배경 + (내 캐릭터만) + (가구/포탈/방명록) 카메라/스크롤 적용하여 그리는 훅
 */
export function useMyRoomRenderer({
  canvasRef,
  canvasSize,
  backgroundImage,
  spriteImages,
  myUser,
  charScale,
  furnitureImages,
  resume,
  portfolio,
  technologyStack,
  board,
  portal,
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

    // 캔버스 사이즈
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30; // FPS
    const frameDuration = 1000 / fps;

    const frameInterval = 200; // 이동중 캐릭터 frame 전환 주기
    const maxMovingFrame = 3; // 1→2→3→1...

    // 매 프레임 그리는 함수
    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // (A) 화면 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // (B) 세로 기반 scale
        const scale = canvas.height / MAP_HEIGHT;

        // 뷰포트 크기 (월드 좌표계)
        const viewWidth = canvas.width / scale;
        // 세로 스크롤 안함
        let cameraX = 0;
        const cameraY = 0;

        // 캐릭터 중심
        const centerX = myUser.x + (FRAME_WIDTH * charScale) / 2;
        cameraX = centerX - viewWidth / 2;

        // 맵 경계 보정
        const maxCamX = MAP_WIDTH - viewWidth;
        if (cameraX < 0) cameraX = 0;
        if (cameraX > maxCamX) cameraX = maxCamX;

        // (C) 월드 좌표 → 화면에 그릴때 transform
        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(-cameraX, -cameraY);

        // (D) 배경
        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
        }

        // (E) 가구/방명록/포탈 그리기
        // 필요한 너비/높이 (임의)
        const FURNITURE_SIZE = 100;
        const BOARD_SIZE = 100; // 방명록
        const PORTAL_WIDTH = portal.width;
        const PORTAL_HEIGHT = portal.height;

        // 1) 이력서/포트폴리오/기술스택
        const allFurniture = [...resume, ...portfolio, ...technologyStack];
        allFurniture.forEach((f) => {
          const img = furnitureImages[f.funitureType];
          if (!img) return;

          // 이미지
          ctx.drawImage(img, f.x, f.y, FURNITURE_SIZE, FURNITURE_SIZE);

          // 텍스트(가구 이름)
          ctx.font = "bold 14px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            f.funiturename,
            f.x + FURNITURE_SIZE / 2,
            f.y + FURNITURE_SIZE + 15,
          );
        });

        // 2) 방명록
        board.forEach((b) => {
          const img = furnitureImages[b.funitureType] ?? null;
          if (img) {
            ctx.drawImage(img, b.x, b.y, BOARD_SIZE, BOARD_SIZE);
          } else {
            // 없는 경우 임시 표시
            ctx.fillStyle = "orange";
            ctx.fillRect(b.x, b.y, BOARD_SIZE, BOARD_SIZE);
          }

          // 방명록 이름
          ctx.font = "bold 14px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            b.funiturename,
            b.x + BOARD_SIZE / 2,
            b.y + BOARD_SIZE + 15,
          );
        });

        // 3) 포탈
        // 포탈 이미지를 furnitureImages["portal"] 등으로 접근해도 되고,
        // 로딩 안되어 있으면 기본 사각형
        const portalImg = furnitureImages["portal"] ?? null;
        if (portalImg) {
          ctx.drawImage(
            portalImg,
            portal.x,
            portal.y,
            PORTAL_WIDTH,
            PORTAL_HEIGHT,
          );
        } else {
          ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          ctx.fillRect(portal.x, portal.y, PORTAL_WIDTH, PORTAL_HEIGHT);
        }

        // 포탈 이름
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
          portal.name,
          portal.x + PORTAL_WIDTH / 2,
          portal.y + PORTAL_HEIGHT + 15,
        );

        // (F) 캐릭터 그리기 (스프라이트)
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          const now2 = performance.now();
          const uf = userFrameRef.current;

          // 이동중이면 frame 애니메이션
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

          // 캐릭터 닉네임
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
  }, [
    canvasRef,
    canvasSize,
    backgroundImage,
    spriteImages,
    myUser,
    charScale,
    furnitureImages,
    resume,
    portfolio,
    technologyStack,
    board,
    portal,
  ]);
}
