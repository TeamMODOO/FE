"use client";

import { RefObject, useEffect, useRef } from "react";

import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import { Funiture } from "@/model/Funiture";
import { User } from "@/model/User";

// 맵 크기
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

  /** 가구(이력서/포폴/스택), 방명록, 포탈 등 이미지 */
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
  const userFrameRef = useRef<{ frame: number; lastFrameTime: number }>({
    frame: 0,
    lastFrameTime: performance.now(),
  });

  const cameraPosRef = useRef({ x: 0, y: 0 });

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

    // 캐릭터 애니메이션
    const frameInterval = 200;
    const maxMovingFrame = 3;

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // 화면 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 스케일 (세로기준)
        const scale = canvas.height / MAP_HEIGHT;
        const viewWidth = canvas.width / scale;
        const viewHeight = canvas.height / scale;

        // 카메라 타겟: 내 캐릭터 중앙
        const centerX = myUser.x + FRAME_WIDTH * charScale * 0.5;
        const centerY = myUser.y + FRAME_HEIGHT * charScale * 0.5;

        let targetCameraX = centerX - viewWidth / 2;
        let targetCameraY = centerY - viewHeight / 2;

        const maxCamX = MAP_WIDTH - viewWidth;
        const maxCamY = MAP_HEIGHT - viewHeight;
        if (targetCameraX < 0) targetCameraX = 0;
        if (targetCameraX > maxCamX) targetCameraX = maxCamX;
        if (targetCameraY < 0) targetCameraY = 0;
        if (targetCameraY > maxCamY) targetCameraY = maxCamY;

        // 부드러운 카메라
        const smoothing = 0.2;
        const camX = cameraPosRef.current.x;
        const camY = cameraPosRef.current.y;
        const newCamX = camX + (targetCameraX - camX) * smoothing;
        const newCamY = camY + (targetCameraY - camY) * smoothing;
        cameraPosRef.current = { x: newCamX, y: newCamY };

        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(-cameraPosRef.current.x, -cameraPosRef.current.y);

        // (1) 배경
        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
        }

        // (2) 가구/방명록/포탈
        const allFurniture = [...resume, ...portfolio, ...technologyStack];
        allFurniture.forEach((f) => {
          const img = furnitureImages[f.funitureType];
          if (!img || f.funitureType === "none") return;
          const w = f.width ?? 100;
          const h = f.height ?? 100;
          ctx.drawImage(img, f.x, f.y, w, h);
          ctx.font = "bold 20px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(f.funiturename, f.x + w / 2, f.y + h + 15);
        });

        // 방명록
        board.forEach((b) => {
          const img = furnitureImages[b.funitureType] ?? null;
          const w = b.width ?? 100;
          const h = b.height ?? 100;
          if (img) {
            ctx.drawImage(img, b.x, b.y, w, h);
          } else {
            ctx.fillStyle = "orange";
            ctx.fillRect(b.x, b.y, w, h);
          }
          ctx.font = "bold 20px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(b.funiturename, b.x + w / 2, b.y + h + 15);
        });

        // 포탈
        const portalImg = furnitureImages["portal"] ?? null;
        if (portalImg) {
          ctx.drawImage(
            portalImg,
            portal.x,
            portal.y,
            portal.width,
            portal.height,
          );
        } else {
          ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
        }
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
          portal.name,
          portal.x + portal.width / 2,
          portal.y + portal.height + 20,
        );

        // (추가) 충돌 박스 디버깅
        // MYROOM_COLLISION_ZONES.forEach((zone) => {
        //   ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        //   ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        //   ctx.strokeStyle = "red";
        //   ctx.lineWidth = 2;
        //   ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        // });

        // (3) 캐릭터
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          const uf = userFrameRef.current;
          const now2 = performance.now();

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
          const scaledW = FRAME_WIDTH * charScale;
          const scaledH = FRAME_HEIGHT * charScale;

          ctx.save();
          LAYER_ORDER.forEach((layer) => {
            const layerImg = spriteImages[layer];
            if (!layerImg) return;
            ctx.drawImage(
              layerImg,
              sx,
              sy,
              FRAME_WIDTH,
              FRAME_HEIGHT,
              myUser.x,
              myUser.y,
              scaledW,
              scaledH,
            );
          });
          ctx.restore();

          ctx.font = "bold 20px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            myUser.nickname,
            myUser.x + scaledW / 2,
            myUser.y + scaledH + 22,
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
