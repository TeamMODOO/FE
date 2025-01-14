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
 * [변경됨/추가됨]
 * - 카메라를 부드럽게 따라오도록 lerp 보간 로직 추가
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

  // [추가됨] 카메라 위치 보관용 ref
  const cameraPosRef = useRef({ x: 0, y: 0 });

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
    const maxMovingFrame = 3; // ex) 1→2→3→1...

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // (1) 화면 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // (2) 세로 기반 scale
        const scale = canvas.height / MAP_HEIGHT;

        // 뷰포트 크기 (월드 좌표계)
        const viewWidth = canvas.width / scale;
        const viewHeight = canvas.height / scale; // [추가] 필요 시 사용

        // 캐릭터 중심 (목표 카메라 위치)
        const centerX = myUser.x + FRAME_WIDTH * charScale * 0.5;
        const centerY = myUser.y + FRAME_HEIGHT * charScale * 0.5;

        // 목표 카메라
        let targetCameraX = centerX - viewWidth / 2;
        let targetCameraY = centerY - viewHeight / 2;

        // 맵 경계 보정
        const maxCamX = MAP_WIDTH - viewWidth;
        const maxCamY = MAP_HEIGHT - viewHeight;
        if (targetCameraX < 0) targetCameraX = 0;
        if (targetCameraX > maxCamX) targetCameraX = maxCamX;
        if (targetCameraY < 0) targetCameraY = 0;
        if (targetCameraY > maxCamY) targetCameraY = maxCamY;

        // [추가됨] 카메라 보간(lerp)
        const smoothing = 0.2; // 0에 가까울수록 천천히, 1에 가까울수록 즉시 따라감
        const camX = cameraPosRef.current.x;
        const camY = cameraPosRef.current.y;
        const newCamX = camX + (targetCameraX - camX) * smoothing;
        const newCamY = camY + (targetCameraY - camY) * smoothing;
        cameraPosRef.current = { x: newCamX, y: newCamY };

        // (3) transform
        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(-cameraPosRef.current.x, -cameraPosRef.current.y);

        // (4) 배경
        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
        }

        // (5) 가구/방명록/포탈 그리기
        // 1) 이력서/포트폴리오/기술스택
        const allFurniture = [...resume, ...portfolio, ...technologyStack];
        allFurniture.forEach((f) => {
          const img = furnitureImages[f.funitureType];
          if (!img || f.funitureType === "none") return;

          const w = f.width ?? 100;
          const h = f.height ?? 100;

          ctx.drawImage(img, f.x, f.y, w, h);

          // 가구 이름
          const text = f.funiturename;
          ctx.font = "30px 'DungGeunMo'";
          ctx.textAlign = "center";

          // 텍스트 폭/높이 측정
          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = 30; // 폰트 크기에 맞춰 적당히

          const textX = f.x + w / 2;
          const textY = f.y + h + 15;

          // 검은 사각형(배경)
          ctx.fillStyle = "black";
          ctx.fillRect(
            textX - textWidth / 2,
            textY - textHeight + 5,
            textWidth,
            textHeight,
          );

          // 노란색 텍스트
          ctx.fillStyle = "yellow";
          ctx.fillText(text, textX, textY);
        });

        // 2) 방명록
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

          // 방명록 이름
          const text = b.funiturename;
          ctx.font = "30px 'DungGeunMo'";
          ctx.textAlign = "center";

          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = 30;

          const textX = b.x + w / 2;
          const textY = b.y + h + 15;

          // 검은 사각형(배경)
          ctx.fillStyle = "black";
          ctx.fillRect(
            textX - textWidth / 2,
            textY - textHeight + 5,
            textWidth,
            textHeight,
          );

          // 노란색 텍스트
          ctx.fillStyle = "yellow";
          ctx.fillText(text, textX, textY);
        });

        // 3) 포탈
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

        // 포탈 이름
        {
          const text = portal.name;
          ctx.font = "30px 'DungGeunMo'";
          ctx.textAlign = "center";

          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = 30;

          const textX = portal.x + portal.width / 2;
          const textY = portal.y + portal.height + 20;

          // 검은 사각형(배경)
          ctx.fillStyle = "black";
          ctx.fillRect(
            textX - textWidth / 2,
            textY - textHeight + 5,
            textWidth,
            textHeight,
          );

          // 노란색 텍스트
          ctx.fillStyle = "yellow";
          ctx.fillText(text, textX, textY);
        }

        // (추가) 충돌 박스 디버깅
        // MYROOM_COLLISION_ZONES.forEach((zone) => {
        //   ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        //   ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        //   ctx.strokeStyle = "red";
        //   ctx.lineWidth = 2;
        //   ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        // });

        // (6) 캐릭터 스프라이트
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
              FRAME_WIDTH * charScale,
              FRAME_HEIGHT * charScale,
            );
          });
          ctx.restore();

          // 캐릭터 닉네임
          const text = myUser.nickname;
          ctx.font = "30px 'DungGeunMo'";
          ctx.textAlign = "center";

          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = 30;

          const textX = myUser.x + (FRAME_WIDTH * charScale) / 2;
          const textY = myUser.y + FRAME_HEIGHT * charScale + 22;

          // 검은 사각형(배경)
          ctx.fillStyle = "black";
          ctx.fillRect(
            textX - textWidth / 2,
            textY - textHeight + 5,
            textWidth,
            textHeight,
          );

          // 흰색 텍스트
          ctx.fillStyle = "white";
          ctx.fillText(text, textX, textY);
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
