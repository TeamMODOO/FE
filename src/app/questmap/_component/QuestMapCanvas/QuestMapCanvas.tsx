"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/performance/useThrottle";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/useLoadSprites";
import useQuestMapSocketEvents from "@/hooks/useQuestMapSocketEvents";

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

/** NPC 목록 */
const questNpcs: NpcInfo[] = [
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
];

/** 포탈 목록 (NextImage로 표시) */
const portals: PortalInfo[] = [
  {
    x: 620,
    y: 50,
    width: 120,
    height: 120,
    name: "포탈1",
    image: "/furniture/portal.gif",
    route: "/lobby", // 스페이스바로 이동할 경로
  },
];

/** 방향(0=Down,1=Up,2=Right,3=Left,null=멈춤) */
type Direction = 0 | 1 | 2 | 3 | null;

/** 맵 상수 */
const QUEST_MAP_CONSTANTS = {
  WIDTH: 1400,
  HEIGHT: 700,
  SPEED: 20, // 캐릭터 이동 속도
};

/** 캐릭터를 2배로 표시 */
const CHAR_SCALE = 2;

const QuestMapCanvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // (A) 공통 소켓 연결 (연결 안 돼 있어도 상관 없음)
  useMainSocketConnect();

  // (B) 퀘스트맵 소켓 이벤트 (emitMovement) - 연결 안 돼 있어도 상관 없음
  const { emitMovement } = useQuestMapSocketEvents({
    roomId: "questroom01",
    userId: "quest-user",
  });

  // (C) 캐릭터 스프라이트 로딩
  const spriteImages = useLoadSprites();

  // (D) 배경 이미지
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = "/background/QuestMap.webp";
    img.onload = () => setBgImage(img);
  }, []);

  // (E) NPC 이미지 로딩
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
  }, []);

  // (F) 로컬 사용자 목록
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

  // (G) NPC 모달 열림 상태
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);

  // (H) 키 입력 + 쓰로틀
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledKeys = useThrottle(pressedKeys, 100);

  /**
   * (I) NPC 상호작용 체크
   */
  const checkNpcInteraction = useCallback((): boolean => {
    const me = users.find((u) => u.id === "quest-user");
    if (!me) return false;

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
  }, [users]);

  /**
   * (I2) 포탈 충돌 체크
   */
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
  }, [users]);

  /**
   * (H1) 스페이스바 핸들러
   */
  const handleSpacebarPress = useCallback(() => {
    const npcOverlap = checkNpcInteraction();
    const portalRoute = checkPortalOverlap();

    if (!npcOverlap && !portalRoute) return;
    if (portalRoute) {
      router.push(portalRoute);
    }
  }, [checkNpcInteraction, checkPortalOverlap, router]);

  /**
   * (키 이벤트 등록)
   */
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

  // (J) 방향 계산
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

  // (K) 이동 로직
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
        y -= QUEST_MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (
        direction === 0 &&
        y < QUEST_MAP_CONSTANTS.HEIGHT - FRAME_HEIGHT * CHAR_SCALE
      ) {
        y += QUEST_MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (
        direction === 2 &&
        x < QUEST_MAP_CONSTANTS.WIDTH - FRAME_WIDTH * CHAR_SCALE
      ) {
        x += QUEST_MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (direction === 3 && x > 0) {
        x -= QUEST_MAP_CONSTANTS.SPEED;
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
  }, [getDirection, emitMovement]);

  // (L) rAF로 그리기
  const userFrameRef = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  useEffect(() => {
    users.forEach((u) => {
      userFrameRef.current[u.id] = {
        frame: 0,
        lastFrameTime: performance.now(),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = QUEST_MAP_CONSTANTS.WIDTH;
    canvas.height = QUEST_MAP_CONSTANTS.HEIGHT;

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
  }, [bgImage, npcImages, spriteImages, users]);

  // (M) 포탈 NextImage 표시 (DOM 요소)
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
      <div className={Style.canvasContainerClass}>
        {/* 게임 캔버스 */}
        <canvas ref={canvasRef} />

        {/* 포탈(NextImage) */}
        {renderPortalsAsDom()}
      </div>

      {/* NPC1 모달 */}
      {/* <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="퀘스트 NPC1 대화"
      >
        <div>
          <h3>NPC1 대화내용</h3>
          <p>이곳에 퀘스트 NPC1 대사를 넣어보세요.</p>
        </div>
      </NpcModal> */}
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
