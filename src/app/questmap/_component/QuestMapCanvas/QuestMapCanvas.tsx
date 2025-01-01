"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
import useQuestMapSocketEvents from "@/hooks/questmap/useQuestMapSocketEvents";

import { User } from "../../_model/User";
import { NpcModal } from "../Npc/NpcModal";
import RankingModal from "../RankingModal/RankingModal";
import Style from "./QuestMapCanvas.style";

/** NPC 정보 타입 */
type NpcInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  image: string;
  modalTitle: string;
};

/** 포탈 정보 타입 */
type PortalInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  image: string; // GIF 등
  route: string; // 이동 경로
};

/** 방향(0=Down,1=Up,2=Right,3=Left,null=멈춤) */
type Direction = 0 | 1 | 2 | 3 | null;

/** 캐릭터 이동 속도만 남김 */
const QUEST_MAP_SPEED = 20;

/** 캐릭터를 2배로 표시 */
const CHAR_SCALE = 2;

const QuestMapCanvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --------------------------------------------------
  // (1) 화면 크기 (마운트 시점에만 측정 → 고정)
  // --------------------------------------------------
  const [canvasSize, setCanvasSize] = useState({ w: 1400, h: 700 });
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCanvasSize({ w, h });
  }, []);

  // --------------------------------------------------
  // (2) 소켓 연결
  // --------------------------------------------------
  const { emitMovement } = useQuestMapSocketEvents({
    roomId: "questroom01",
    userId: "quest-user",
  });

  // --------------------------------------------------
  // (3) 스프라이트 로딩
  // --------------------------------------------------
  const spriteImages = useLoadSprites();

  // --------------------------------------------------
  // (4) 배경 이미지
  // --------------------------------------------------
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = "/background/quest_map.webp";
    img.onload = () => setBgImage(img);
  }, []);

  // --------------------------------------------------
  // (5) NPC (state로 변경)
  // --------------------------------------------------
  const [questNpcs, setQuestNpcs] = useState<NpcInfo[]>([
    {
      x: 580,
      y: 250,
      width: 200,
      height: 200,
      name: "퀘스트NPC1",
      image: "/character/npc4.webp",
      modalTitle: "퀘스트 NPC #1",
    },
    {
      x: 200,
      y: 300,
      width: 60,
      height: 90,
      name: "퀘스트NPC2",
      image: "/character/character2.png",
      modalTitle: "퀘스트 NPC #2",
    },
  ]);

  // --------------------------------------------------
  // (6) 포탈 (state로 변경)
  // --------------------------------------------------
  const [portals, setPortals] = useState<PortalInfo[]>([
    {
      x: 620,
      y: 50,
      width: 120,
      height: 120,
      name: "포탈1",
      image: "/furniture/portal.gif",
      route: "/lobby", // 스페이스바로 이동할 경로
    },
  ]);

  // --------------------------------------------------
  // (7) 화면 사이즈 결정 후, NPC/포탈 위치 재설정
  // --------------------------------------------------
  useEffect(() => {
    // 1) NPC1, NPC2 배치
    setQuestNpcs((prev) => {
      const newNpcs = [...prev];
      if (newNpcs[0]) {
        // NPC1: (가로 중앙, 세로 중앙)
        newNpcs[0].x = (canvasSize.w - newNpcs[0].width) / 2;
        newNpcs[0].y = (canvasSize.h - newNpcs[0].height) / 2;
      }
      if (newNpcs[1]) {
        // NPC2: (가로 시작=0, 세로 중앙)
        newNpcs[1].x = (canvasSize.w - newNpcs[0].width) / 4;
        newNpcs[1].y = (canvasSize.h - newNpcs[1].height) / 2;
      }
      return newNpcs;
    });

    // 2) 포탈: (가로 중앙, 세로 위=50)
    setPortals((prev) => {
      const newPortals = [...prev];
      if (newPortals[0]) {
        newPortals[0].x = (canvasSize.w - newPortals[0].width) / 2;
        newPortals[0].y = 50;
      }
      return newPortals;
    });
  }, [canvasSize]);

  // --------------------------------------------------
  // (8) NPC 이미지 로딩
  // --------------------------------------------------
  const [npcImages, setNpcImages] = useState<Record<string, HTMLImageElement>>(
    {},
  );
  useEffect(() => {
    const loaded: Record<string, HTMLImageElement> = {};
    let count = 0;
    questNpcs.forEach((npc) => {
      const { image } = npc;
      if (!loaded[image]) {
        const img = new Image();
        img.src = image;
        img.onload = () => {
          loaded[image] = img;
          count++;
          if (count === questNpcs.length) {
            setNpcImages({ ...loaded });
          }
        };
      }
    });
  }, [questNpcs]);

  // --------------------------------------------------
  // (9) 사용자 목록
  // --------------------------------------------------
  const [users, setUsers] = useState<User[]>([
    {
      id: "quest-user",
      x: 300,
      y: 300,
      nickname: "정글러1",
      characterType: "sprite1",
      direction: 0, // Down
      isMoving: false,
    },
  ]);

  // --------------------------------------------------
  // (10) NPC 모달 열림 상태
  // --------------------------------------------------
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);

  // --------------------------------------------------
  // (11) 키 입력 + 쓰로틀
  // --------------------------------------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledKeys = useThrottle(pressedKeys, 100);

  // --------------------------------------------------
  // (12) NPC 충돌 → 모달 표시
  // --------------------------------------------------
  const checkNpcInteraction = useCallback((): boolean => {
    const me = users.find((u) => u.id === "quest-user");
    if (!me) return false;

    // 캐릭터 크기 64×64
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];
    let foundOverlap = false;

    questNpcs.forEach((npc, idx) => {
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cr > nl && cl < nr && cb > nt && ct < nb;
      if (overlap) {
        foundOverlap = true;
        if (idx === 0) setNpc1ModalOpen(true);
        if (idx === 1) setNpc2ModalOpen(true);
      }
    });

    return foundOverlap;
  }, [users, questNpcs]);

  // --------------------------------------------------
  // (12-2) 포탈 충돌 체크
  // --------------------------------------------------
  const checkPortalOverlap = useCallback((): string | null => {
    const me = users.find((u) => u.id === "quest-user");
    if (!me) return null;

    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];
    for (const portal of portals) {
      const [pl, pr, pt, pb] = [
        portal.x,
        portal.x + portal.width,
        portal.y,
        portal.y + portal.height,
      ];
      const overlap = cr > pl && cl < pr && cb > pt && ct < pb;
      if (overlap) {
        return portal.route;
      }
    }
    return null;
  }, [users, portals]);

  // --------------------------------------------------
  // (12-3) 스페이스바 → NPC/포탈 상호작용
  // --------------------------------------------------
  const handleSpacebarPress = useCallback(() => {
    const npcOverlap = checkNpcInteraction();
    const portalRoute = checkPortalOverlap();

    // NPC가 겹치거나, 포탈이 겹치거나
    if (!npcOverlap && !portalRoute) return;
    if (portalRoute) {
      router.push(portalRoute);
    }
  }, [checkNpcInteraction, checkPortalOverlap, router]);

  // --------------------------------------------------
  // (13) 키 이벤트
  // --------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        handleSpacebarPress();
      }
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleSpacebarPress]);

  // --------------------------------------------------
  // (14) 방향 계산
  // --------------------------------------------------
  const getDirection = useCallback((): Direction => {
    if (
      throttledKeys["w"] ||
      throttledKeys["W"] ||
      throttledKeys["ㅈ"] ||
      throttledKeys["ArrowUp"]
    )
      return 1;
    if (
      throttledKeys["s"] ||
      throttledKeys["S"] ||
      throttledKeys["ㄴ"] ||
      throttledKeys["ArrowDown"]
    )
      return 0;
    if (
      throttledKeys["d"] ||
      throttledKeys["D"] ||
      throttledKeys["ㅇ"] ||
      throttledKeys["ArrowRight"]
    )
      return 2;
    if (
      throttledKeys["a"] ||
      throttledKeys["A"] ||
      throttledKeys["ㅁ"] ||
      throttledKeys["ArrowLeft"]
    )
      return 3;
    return null;
  }, [throttledKeys]);

  // --------------------------------------------------
  // (15) 이동 로직
  // --------------------------------------------------
  useEffect(() => {
    setUsers((prev) => {
      const newArr = [...prev];
      const meIdx = newArr.findIndex((u) => u.id === "quest-user");
      if (meIdx < 0) return prev;

      const me = newArr[meIdx];
      let { x, y } = me;
      let moved = false;

      const direction = getDirection();
      if (direction === 1 && y > 0) {
        // Up
        y -= QUEST_MAP_SPEED;
        moved = true;
      } else if (
        direction === 0 &&
        y < canvasSize.h - FRAME_HEIGHT * CHAR_SCALE
      ) {
        // Down
        y += QUEST_MAP_SPEED;
        moved = true;
      } else if (
        direction === 2 &&
        x < canvasSize.w - FRAME_WIDTH * CHAR_SCALE
      ) {
        // Right
        x += QUEST_MAP_SPEED;
        moved = true;
      } else if (direction === 3 && x > 0) {
        // Left
        x -= QUEST_MAP_SPEED;
        moved = true;
      }

      const finalDir = direction === null ? me.direction : direction;
      const isMoving = moved;
      const changed =
        me.x !== x ||
        me.y !== y ||
        me.direction !== finalDir ||
        me.isMoving !== isMoving;

      if (changed) {
        newArr[meIdx] = {
          ...me,
          x,
          y,
          direction: finalDir,
          isMoving,
        };
        if (moved) {
          emitMovement(x, y, finalDir);
        }
        return newArr;
      }
      return prev;
    });
  }, [getDirection, emitMovement, canvasSize]);

  // --------------------------------------------------
  // (16) rAF로 그리기
  // --------------------------------------------------
  const userFrameRef = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  // 초기화
  useEffect(() => {
    users.forEach((u) => {
      userFrameRef.current[u.id] = {
        frame: 0,
        lastFrameTime: performance.now(),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 캔버스에 그리기
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 여기서 픽셀 크기 고정
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;
    const frameInterval = 200;
    const maxMovingFrame = 3;

    const renderLoop = (time: number) => {
      if (!canvasRef.current) return;
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 배경
        if (bgImage) {
          ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        }

        // NPC
        questNpcs.forEach((npc) => {
          const npcImg = npcImages[npc.image];
          if (npcImg) {
            ctx.drawImage(npcImg, npc.x, npc.y, npc.width, npc.height);
            ctx.font = "12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(
              npc.name,
              npc.x + npc.width / 2,
              npc.y + npc.height + 12,
            );
          } else {
            ctx.fillStyle = "rgba(255,0,0,0.4)";
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
          }
        });

        // 캐릭터 스프라이트
        const now = performance.now();
        users.forEach((user) => {
          const uf = userFrameRef.current[user.id] || {
            frame: 0,
            lastFrameTime: now,
          };

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
          userFrameRef.current[user.id] = uf;

          // 스프라이트 로딩 확인
          if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
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
                FRAME_WIDTH * CHAR_SCALE,
                FRAME_HEIGHT * CHAR_SCALE,
              );
            });
            ctx.restore();

            // 닉네임
            ctx.font = "bold 14px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(
              user.nickname,
              user.x + (FRAME_WIDTH * CHAR_SCALE) / 2,
              user.y + FRAME_HEIGHT * CHAR_SCALE + 15,
            );
          }
        });
      }
      animationId = requestAnimationFrame(renderLoop);
    };
    animationId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [bgImage, npcImages, spriteImages, users, questNpcs, canvasSize]);

  // --------------------------------------------------
  // (17) 포탈 NextImage 표시 (DOM 요소)
  // --------------------------------------------------
  const renderPortalsAsDom = () => {
    return portals.map((portal, idx) => (
      <div
        key={idx}
        style={{
          position: "absolute",
          left: portal.x,
          top: portal.y,
          width: portal.width,
          height: portal.height,
          cursor: "pointer",
          overflow: "hidden",
        }}
        onClick={() => {
          // 원한다면 포탈 클릭으로도 이동
          // router.push(portal.route);
        }}
      >
        <NextImage
          src={portal.image}
          alt={portal.name}
          width={portal.width}
          height={portal.height}
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    ));
  };

  return (
    <>
      <div
        className={Style.canvasContainerClass}
        style={{
          // 디스플레이 전 크기로 고정
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* 게임 캔버스 */}
        <canvas ref={canvasRef} />

        {/* 포탈(NextImage) */}
        {renderPortalsAsDom()}
      </div>

      {/* NPC1 모달 (순위 랭킹 모달 예시) */}
      {npc1ModalOpen && (
        <RankingModal onClose={() => setNpc1ModalOpen(false)} />
      )}

      {/* NPC2 모달 */}
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        title="퀘스트 NPC2 대화"
      >
        <div>
          <h3>NPC2 대화내용</h3>
          <p>이곳에 퀘스트 NPC2 대사를 넣어보세요.</p>
        </div>
      </NpcModal>
    </>
  );
};

export default QuestMapCanvas;
