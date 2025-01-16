"use client";

import { RefObject, useEffect, useRef } from "react";

import { techStackDataUrls } from "@/app/myroom/[google_id]/_constant";
import { MYROOM_COLLISION_ZONES } from "@/app/myroom/[google_id]/_constant";
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

/**
 * (A) '내 캐릭터' 한 명만 그리므로,
 *     보간(lerp) + 좌표 바뀔 때만 재렌더링
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
  // 1) techStack 아이콘 캐싱
  const stackImagesRef = useRef<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    const loadedImages: Record<string, HTMLImageElement> = {};
    const stackNames = Object.keys(techStackDataUrls);
    stackNames.forEach((name) => {
      const url = techStackDataUrls[name];
      const img = new Image();
      img.src = url;
      loadedImages[name] = img;
    });
    stackImagesRef.current = loadedImages;
  }, []);

  // 2) 실제 렌더링에 사용할 'draw' 좌표 + 보간 상태
  const drawUserRef = useRef<{
    x: number;
    y: number;
    direction: number;
    isMoving: boolean;
    frame: number;
    lastFrameTime: number;
    // 보간(lerp) 관련
    lerpStartTime: number;
    lerpDuration: number; // ms
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
  }>({
    x: myUser.x,
    y: myUser.y,
    direction: myUser.direction ?? 0,
    isMoving: false,
    frame: 0,
    lastFrameTime: performance.now(),
    // 보간 정보
    lerpStartTime: 0,
    lerpDuration: 0,
    startX: myUser.x,
    startY: myUser.y,
    targetX: myUser.x,
    targetY: myUser.y,
  });

  // 3) 캔버스 초기화 (resizing 대비)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
  }, [canvasSize, canvasRef]);

  // 4) '그리기' 함수. 보간 중 or 좌표 변경 시에만 호출
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // (가) 카메라 & 스케일
    const scale = canvas.height / MAP_HEIGHT; // 세로기준 스케일
    ctx.save();
    ctx.scale(scale, scale);

    const viewWidth = canvas.width / scale;
    const viewHeight = canvas.height / scale;

    // 현재 drawUserRef (보간값)
    const { x, y } = drawUserRef.current;
    const centerX = x + FRAME_WIDTH * charScale * 0.5;
    const centerY = y + FRAME_HEIGHT * charScale * 0.5;

    // 카메라 위치
    let camX = centerX - viewWidth / 2;
    let camY = centerY - viewHeight / 2;

    // 경계 클램핑
    if (camX < 0) camX = 0;
    if (camX > MAP_WIDTH - viewWidth) camX = MAP_WIDTH - viewWidth;
    if (camY < 0) camY = 0;
    if (camY > MAP_HEIGHT - viewHeight) camY = MAP_HEIGHT - viewHeight;

    ctx.translate(-camX, -camY);

    // (나) 배경
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
    }

    // (다) 가구/기술스택/포탈/방명록
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
      const textY = f.y + h + 28;

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
      // 텍스트
      const text = b.funiturename;
      ctx.font = "30px 'DungGeunMo'";
      ctx.textAlign = "center";
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = 30;
      const textX = b.x + w / 2;
      const textY = b.y + h + 15;
      ctx.fillStyle = "black";
      ctx.fillRect(
        textX - textWidth / 2,
        textY - textHeight + 5,
        textWidth,
        textHeight,
      );
      ctx.fillStyle = "yellow";
      ctx.fillText(text, textX, textY);
    });

    // 포탈
    const portalImg = furnitureImages["portal"] ?? null;
    if (portalImg) {
      ctx.drawImage(portalImg, portal.x, portal.y, portal.width, portal.height);
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
      ctx.fillStyle = "black";
      ctx.fillRect(
        textX - textWidth / 2,
        textY - textHeight + 5,
        textWidth,
        textHeight,
      );
      ctx.fillStyle = "yellow";
      ctx.fillText(text, textX, textY);
    }

    // (라) 캐릭터
    if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
      const now = performance.now();
      // 프레임 계산
      if (drawUserRef.current.isMoving) {
        const frameInterval = 200; // 이동 시 프레임 전환 속도
        const maxMovingFrame = 3;
        if (now - drawUserRef.current.lastFrameTime > frameInterval) {
          drawUserRef.current.frame++;
          if (drawUserRef.current.frame > maxMovingFrame) {
            drawUserRef.current.frame = 1;
          }
          drawUserRef.current.lastFrameTime = now;
        }
      } else {
        drawUserRef.current.frame = 0;
        drawUserRef.current.lastFrameTime = now;
      }
      const sx = drawUserRef.current.frame * FRAME_WIDTH;
      const sy = drawUserRef.current.direction * FRAME_HEIGHT;
      const scaledW = FRAME_WIDTH * charScale;
      const scaledH = FRAME_HEIGHT * charScale;
      LAYER_ORDER.forEach((layer) => {
        const img = spriteImages[layer];
        if (!img) return;
        ctx.drawImage(
          img,
          sx,
          sy,
          FRAME_WIDTH,
          FRAME_HEIGHT,
          x,
          y,
          scaledW,
          scaledH,
        );
      });

      // 닉네임
      const text = myUser.nickname;
      ctx.font = "30px 'DungGeunMo'";
      ctx.textAlign = "center";
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = 30;
      const textX = x + scaledW / 2;
      const textY = y + scaledH + 28;
      ctx.fillStyle = "black";
      ctx.fillRect(
        textX - textWidth / 2,
        textY - textHeight + 5,
        textWidth,
        textHeight,
      );
      ctx.fillStyle = "white";
      ctx.fillText(text, textX, textY);
    } else {
      // 스프라이트 준비 안됐으면 임시 사각형
      ctx.fillStyle = "blue";
      ctx.fillRect(x, y, 60, 120);
    }

    // 충돌 영역
    MYROOM_COLLISION_ZONES.forEach((zone) => {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Semi-transparent red
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    });

    ctx.restore();
  };

  /**
   * 5) 보간 애니메이션 진행 함수
   *    - myUser.x, y가 변할 때마다 (useEffect)에서 호출
   */
  const animateLerp = () => {
    const startTime = performance.now();

    const step = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      const { lerpDuration, startX, startY, targetX, targetY } =
        drawUserRef.current;

      // 0~1 progress
      const t = Math.min(1, elapsed / lerpDuration);
      // lerp
      drawUserRef.current.x = startX + (targetX - startX) * t;
      drawUserRef.current.y = startY + (targetY - startY) * t;

      drawCanvas(); // 매 프레임마다 한 번씩 그리기

      if (t < 1) {
        // 아직 보간 중
        requestAnimationFrame(step);
      } else {
        // 보간 완료
        drawUserRef.current.x = targetX;
        drawUserRef.current.y = targetY;
        drawCanvas(); // 마지막으로 한 번 더 그리기
      }
    };

    requestAnimationFrame(step);
  };

  /**
   * 6) myUser(외부) 좌표 바뀔 때 → 보간 애니메이션
   *    direction/isMoving도 동기화
   */
  useEffect(() => {
    // 만약 x,y가 이전과 동일하면(실제 변동 없음) → 그냥 drawCanvas()
    const prevX = drawUserRef.current.targetX;
    const prevY = drawUserRef.current.targetY;

    // direction/isMoving은 즉시 반영(스냅)
    drawUserRef.current.direction = myUser.direction ?? 0;
    drawUserRef.current.isMoving = myUser.isMoving ?? false;

    if (myUser.x === prevX && myUser.y === prevY) {
      // 위치가 같으면 보간 불필요
      drawCanvas();
      return;
    }

    // 위치가 달라진 경우 → 보간 세팅
    drawUserRef.current.lerpStartTime = performance.now();
    drawUserRef.current.lerpDuration = 250; // (예) 250ms
    drawUserRef.current.startX = drawUserRef.current.x; // 현재 그려지는 좌표
    drawUserRef.current.startY = drawUserRef.current.y;
    drawUserRef.current.targetX = myUser.x; // 새 목표 좌표
    drawUserRef.current.targetY = myUser.y;

    // 보간 시작
    animateLerp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUser.x, myUser.y, myUser.direction, myUser.isMoving]);

  // 초기 1회 그리기
  useEffect(() => {
    // 모든 필요한 이미지/데이터가 준비됐는지 확인
    if (!canvasRef.current) return;
    if (!backgroundImage) return;
    if (Object.keys(spriteImages).length < 1) return;
    if (Object.keys(furnitureImages).length < 1) return;

    // 배치된 가구들( resume/portfolio/techStack/board )도
    // 최소한 length가 0은 아니므로 그릴 내용이 맞는지?
    // => 0이어도 "빈 리스트"로서 그릴 게 없을 뿐, 호출은 문제없음.

    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canvasRef,
    canvasSize,
    backgroundImage,
    spriteImages,
    furnitureImages,
    resume,
    portfolio,
    technologyStack,
    board,
    portal,
  ]);
}
