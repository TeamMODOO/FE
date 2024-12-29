"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// (1) 스프라이트 로딩 훅
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/useLoadSprites";
// (2) 소켓 연결 훅
import useMainSocketConnect from "@/hooks/useMainSocketConnect";
// (3) 퀘스트맵 소켓 이벤트 훅
import useQuestMapSocketEvents from "@/hooks/useQuestMapSocketEvents";
// (4) 키 입력 쓰로틀
import useThrottle from "@/hooks/useThrottle";

// (5) 로컬 user 모델
import { User } from "../../_model/User";
// NPC 모달
import { NpcModal } from "../Npc/NpcModal";
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

/** 퀘스트 맵에 표시될 NPC들 */
const questNpcs: NpcInfo[] = [
  {
    x: 200,
    y: 350,
    width: 100,
    height: 100,
    name: "퀘스트NPC1",
    image: "/character/npc4.webp",
    modalTitle: "퀘스트 NPC #1",
  },
  {
    x: 500,
    y: 300,
    width: 100,
    height: 100,
    name: "퀘스트NPC2",
    image: "/character/npc4.webp",
    modalTitle: "퀘스트 NPC #2",
  },
];

/** 방향(0=Down,1=Up,2=Right,3=Left) */
type Direction = 0 | 1 | 2 | 3;

/** 맵 상수 */
const QUEST_MAP_CONSTANTS = {
  WIDTH: 1400,
  HEIGHT: 700,
  SPEED: 20, // 캐릭터 이동 속도
};

/** 캐릭터를 2배 크기로 */
const CHAR_SCALE = 2;

const QuestMapCanvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --------------------------------------------------
  // (A) 공통 소켓 연결
  // --------------------------------------------------
  useMainSocketConnect();

  // --------------------------------------------------
  // (B) 퀘스트맵 소켓 이벤트 (emitMovement)
  // --------------------------------------------------
  const { emitMovement } = useQuestMapSocketEvents({
    roomId: "questroom01",
    userId: "quest-user",
  });

  // --------------------------------------------------
  // (C) 스프라이트 로딩
  // --------------------------------------------------
  const spriteImages = useLoadSprites();

  // --------------------------------------------------
  // (D) 배경 이미지
  // --------------------------------------------------
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = "/background/QuestMap.webp";
    img.onload = () => {
      setBgImage(img);
    };
  }, []);

  // --------------------------------------------------
  // (E) NPC 이미지
  // --------------------------------------------------
  const [npcImages, setNpcImages] = useState<Record<string, HTMLImageElement>>(
    {},
  );
  useEffect(() => {
    const loaded: Record<string, HTMLImageElement> = {};
    let count = 0;
    questNpcs.forEach((npc) => {
      if (!loaded[npc.image]) {
        const img = new Image();
        img.src = npc.image;
        img.onload = () => {
          loaded[npc.image] = img;
          count++;
          if (count === questNpcs.length) {
            setNpcImages({ ...loaded });
          }
        };
      }
    });
  }, []);

  // --------------------------------------------------
  // (F) 로컬 사용자 목록
  // --------------------------------------------------
  const [users, setUsers] = useState<User[]>([
    {
      id: "quest-user",
      x: 300,
      y: 300,
      nickname: "퀘스트유저",
      characterType: "sprite1",
      direction: 0,
      isMoving: false,
    },
  ]);

  // --------------------------------------------------
  // (G) NPC 모달 상태
  // --------------------------------------------------
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);

  // --------------------------------------------------
  // (H) 키 입력 + 쓰로틀
  // --------------------------------------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledKeys = useThrottle(pressedKeys, 100);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 스페이스 → NPC 상호작용
      if (e.key === " ") {
        e.preventDefault();
        checkNpcInteraction();
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
  }, []);

  // --------------------------------------------------
  // (I) NPC 상호작용 (★ NPC 박스 확장 예시)
  // --------------------------------------------------
  const checkNpcInteraction = () => {
    const me = users.find((u) => u.id === "quest-user");
    if (!me) return;

    // 캐릭터 크기(64x64)
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];

    // 박스 확장용 offset (NPC 범위를 넉넉히)
    const offset = 10; // 예: 10px 확장

    questNpcs.forEach((npc, idx) => {
      const [nl, nr, nt, nb] = [
        npc.x - offset,
        npc.x + npc.width + offset,
        npc.y - offset,
        npc.y + npc.height + offset,
      ];

      const overlap = cr > nl && cl < nr && cb > nt && ct < nb;
      if (overlap) {
        // NPC가 겹치면 모달
        if (idx === 0) setNpc1ModalOpen(true);
        if (idx === 1) setNpc2ModalOpen(true);
      }
    });
  };

  // --------------------------------------------------
  // (J) 방향 계산
  // --------------------------------------------------
  function getDirection(usersList: User[]): Direction | null {
    const me = usersList.find((u) => u.id === "quest-user");
    if (!me) return null;

    if (
      pressedKeys["w"] ||
      pressedKeys["W"] ||
      pressedKeys["ㅈ"] ||
      pressedKeys["ArrowUp"]
    ) {
      return 1; // Up
    }
    if (
      pressedKeys["s"] ||
      pressedKeys["S"] ||
      pressedKeys["ㄴ"] ||
      pressedKeys["ArrowDown"]
    ) {
      return 0; // Down
    }
    if (
      pressedKeys["d"] ||
      pressedKeys["D"] ||
      pressedKeys["ㅇ"] ||
      pressedKeys["ArrowRight"]
    ) {
      return 2; // Right
    }
    if (
      pressedKeys["a"] ||
      pressedKeys["A"] ||
      pressedKeys["ㅁ"] ||
      pressedKeys["ArrowLeft"]
    ) {
      return 3; // Left
    }
    return null; // 멈춤
  }

  // --------------------------------------------------
  // (K) 이동 로직
  // --------------------------------------------------
  useEffect(() => {
    setUsers((prev) => {
      const newUsers = [...prev];
      const meIndex = newUsers.findIndex((u) => u.id === "quest-user");
      if (meIndex < 0) return prev;

      const me = newUsers[meIndex];
      let { x, y } = me;
      let moved = false;

      const newDir = getDirection(newUsers);
      if (newDir !== null) {
        if (newDir === 1 && y > 0) {
          // Up
          y -= QUEST_MAP_CONSTANTS.SPEED;
          moved = true;
        } else if (
          newDir === 0 &&
          y < QUEST_MAP_CONSTANTS.HEIGHT - FRAME_HEIGHT * CHAR_SCALE
        ) {
          // Down
          y += QUEST_MAP_CONSTANTS.SPEED;
          moved = true;
        } else if (
          newDir === 2 &&
          x < QUEST_MAP_CONSTANTS.WIDTH - FRAME_WIDTH * CHAR_SCALE
        ) {
          // Right
          x += QUEST_MAP_CONSTANTS.SPEED;
          moved = true;
        } else if (newDir === 3 && x > 0) {
          // Left
          x -= QUEST_MAP_CONSTANTS.SPEED;
          moved = true;
        }
      }

      const finalDir = newDir ?? me.direction;
      const isMoving = moved;

      // 값이 바뀌었는지 판단
      const changed =
        me.x !== x ||
        me.y !== y ||
        me.direction !== finalDir ||
        me.isMoving !== isMoving;

      if (changed) {
        newUsers[meIndex] = {
          ...me,
          x,
          y,
          direction: finalDir,
          isMoving,
        };
        // 소켓 emitMovement
        if (moved) {
          emitMovement(x, y, finalDir);
        }
        return newUsers;
      } else {
        return prev;
      }
    });
  }, [throttledKeys, emitMovement]);

  // --------------------------------------------------
  // (L) rAF로 그리기
  // --------------------------------------------------
  const userFrameRef = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  useEffect(() => {
    // 초기화
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
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = QUEST_MAP_CONSTANTS.WIDTH;
    canvasRef.current.height = QUEST_MAP_CONSTANTS.HEIGHT;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;

    const frameInterval = 200;
    const maxMovingFrame = 3;

    const loop = (time: number) => {
      if (!canvasRef.current) return;

      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // 1) Clear
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // 2) 배경
        if (bgImage) {
          ctx.drawImage(
            bgImage,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
        }

        // 3) NPC
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
            ctx.fillStyle = "rgba(255,0,0,0.3)";
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
          }
        });

        // 4) 캐릭터 스프라이트
        const now = performance.now();
        users.forEach((user) => {
          if (!userFrameRef.current[user.id]) {
            userFrameRef.current[user.id] = {
              frame: 0,
              lastFrameTime: now,
            };
          }
          const uf = userFrameRef.current[user.id];

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

          const sx = uf.frame * FRAME_WIDTH;
          const sy = user.direction * FRAME_HEIGHT;

          // 스프라이트가 모두 로딩된 상태
          if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
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
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [bgImage, npcImages, spriteImages, users]);

  // --------------------------------------------------
  // (M) 리턴
  // --------------------------------------------------
  return (
    <>
      <div className={Style.canvasContainerClass}>
        <canvas ref={canvasRef} />
      </div>

      {/* NPC1 모달 */}
      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="퀘스트 NPC1 대화"
      >
        <div>
          <h3>NPC1 대화내용</h3>
          <p>여기에 퀘스트 NPC1 관련 대사를 넣어보세요.</p>
        </div>
      </NpcModal>

      {/* NPC2 모달 */}
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        title="퀘스트 NPC2 대화"
      >
        <div>
          <h3>NPC2 대화내용</h3>
          <p>여기에 퀘스트 NPC2 관련 대사를 넣어보세요.</p>
        </div>
      </NpcModal>
    </>
  );
};

export default QuestMapCanvas;
