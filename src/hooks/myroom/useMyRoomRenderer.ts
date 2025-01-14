"use client";

import { RefObject, useEffect, useRef } from "react";

import { techStackDataUrls } from "@/app/myroom/[google_id]/_constant";
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

  const stackImagesRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const loadedImages: Record<string, HTMLImageElement> = {};
    const stackNames = Object.keys(techStackDataUrls); // ["Java", "React", ...]

    stackNames.forEach((name) => {
      const url = techStackDataUrls[name]; // data:image/svg+xml;base64,...
      const img = new Image();
      img.src = url;
      // onload -> 별도 처리할 필요가 있으면 해도 됨
      loadedImages[name] = img;
    });

    // 최종 할당
    stackImagesRef.current = loadedImages;
  }, []);

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
          const w = f.width ?? 100;
          const h = f.height ?? 100;

          // 기본 텍스트
          let textToRender = f.funiturename;

          // 기술스택인지 확인
          if (f.funitureType.startsWith("technologyStack/")) {
            const stackName = f.data?.stack; // 예: "Vue.js", "Git", ...
            if (!stackName) return;

            // (4) 위에서 캐싱해둔 이미지 객체
            const iconImg = stackImagesRef.current[stackName];

            if (iconImg) {
              // 캐싱된 이미지가 로드되어 있으면 draw
              ctx.drawImage(iconImg, f.x, f.y, w, h);
            } else {
              // 아직 이미지가 없거나 로드 중이면 임시 사각형
              ctx.fillStyle = "lightblue";
              ctx.fillRect(f.x, f.y, w, h);
            }

            // 스택 이름을 표시 (funiturename 대신)
            textToRender = stackName;
          } else {
            // 기술스택이 아닌 일반 가구
            if (!furnitureImages[f.funitureType] || f.funitureType === "none")
              return;
            ctx.drawImage(furnitureImages[f.funitureType], f.x, f.y, w, h);
          }

          // (텍스트 표시)
          ctx.font = "30px 'DungGeunMo'";
          ctx.textAlign = "center";

          const metrics = ctx.measureText(textToRender);
          const textWidth = metrics.width;
          const textHeight = 30;
          const textX = f.x + w / 2;
          const textY = f.y + h + 15;

          ctx.fillStyle = "black";
          ctx.fillRect(
            textX - textWidth / 2,
            textY - textHeight + 5,
            textWidth,
            textHeight,
          );

          ctx.fillStyle = "yellow";
          ctx.fillText(textToRender, textX, textY);
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

          // 캐릭터 닉네임
          const text = myUser.nickname;
          ctx.font = "30px 'DungGeunMo'";
          ctx.textAlign = "center";

          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = 30;

          const textX = myUser.x + (FRAME_WIDTH * charScale) / 2;
          const textY = myUser.y + FRAME_HEIGHT * charScale + 28;

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
