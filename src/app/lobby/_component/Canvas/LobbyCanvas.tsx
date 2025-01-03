"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

// 소켓 훅
import useLobbySocketEvents from "@/hooks/lobby/useLobbySocketEvents";
// 스프라이트/성능 훅
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
// 모델
import { NoticeItem } from "@/model/NoticeBoard";
import { Direction } from "@/model/User";
// Zustand(User)
import useUsersStore from "@/store/useUsersStore";

// 상수/데이터 (맵 상수, 포탈, NPC)
import {
  LOBBY_MAP_CONSTANTS,
  LOBBY_NPCS,
  LOBBY_PORTALS,
  QNA_LIST,
} from "../../_constant";
// 컴포넌트들
import DailyProblemContent from "../DailyProblem/DailyProblemContent";
import { EnterMeetingRoom } from "../EnterMeetingRoom/EnterMeetingRoom";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import QnaContent from "../Qna/QnaContent";
// 스타일
import Style from "./Canvas.style";

interface LobbyCanvasProps {
  chatOpen: boolean; // 채팅창 열림 여부
}

const LobbyCanvas: React.FC<LobbyCanvasProps> = ({ chatOpen }) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ------------------ [NextAuth] 세션 ------------------
  const { data: session, status } = useSession();

  // ------------------ 로컬스토리지 client_id ------------------
  const [localClientId, setLocalClientId] = useState<string>("anonymous");
  useEffect(() => {
    const stored = localStorage.getItem("client_id");
    if (stored) {
      setLocalClientId(stored);
    } else {
      const newId = uuid();
      localStorage.setItem("client_id", newId);
      setLocalClientId(newId);
    }
  }, []);

  // ------------------ 소켓 연결 ------------------
  const { emitMovement } = useLobbySocketEvents({
    roomId: "floor07",
    userId: localClientId,
    userNickname: session?.user?.name || "Guest",
  });

  // ------------------ 유저 스토어 ------------------
  const addUser = useUsersStore((s) => s.addUser);
  const updateUserPosition = useUsersStore((s) => s.updateUserPosition);

  // 스토어 등록
  useEffect(() => {
    if (!localClientId) return;
    if (status === "loading") return; // 세션이 로딩 중이면 대기

    const nickname =
      status === "authenticated" && session?.user?.name
        ? session.user.name
        : "Guest";
    addUser(localClientId, nickname);
  }, [localClientId, status, session, addUser]);

  // ------------------ 화면 사이즈 (동적) ------------------
  const [canvasSize, setCanvasSize] = useState({
    w: LOBBY_MAP_CONSTANTS.CANVAS_WIDTH,
    h: LOBBY_MAP_CONSTANTS.CANVAS_HEIGHT,
  });
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setCanvasSize({ w, h });
    }
    handleResize(); // 초기에 한 번 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ------------------ 배경 이미지 ------------------
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // ------------------ 포탈 GIF (숨김 로딩) ------------------
  const portalGifRef = useRef<HTMLImageElement | null>(null);

  // ------------------ NPC 이미지 ------------------
  const [npcImages, setNpcImages] = useState<Record<string, HTMLImageElement>>(
    {},
  );
  useEffect(() => {
    const temp: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const uniquePaths = Array.from(new Set(LOBBY_NPCS.map((npc) => npc.image)));
    uniquePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        temp[path] = img;
        loadedCount++;
        if (loadedCount === uniquePaths.length) {
          setNpcImages({ ...temp });
        }
      };
    });
  }, []);

  // ------------------ 캐릭터 스프라이트 로딩 ------------------
  const spriteImages = useLoadSprites();

  // ------------------ 모달들 (NPC/공지/회의실) ------------------
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // ------------------ 공지사항 ------------------
  const [noticeList, setNoticeList] = useState<NoticeItem[]>([
    { id: 1, name: "운영자", message: "처음 오신 분들 환영합니다!" },
    { id: 2, name: "Alice", message: "안녕하세요! 반갑습니다." },
  ]);
  const [writerName, setWriterName] = useState("");
  const [writerMessage, setWriterMessage] = useState("");
  const handleAddNotice = () => {
    if (!writerName.trim() || !writerMessage.trim()) return;
    setNoticeList((prev) => [
      ...prev,
      { id: prev.length + 1, name: writerName, message: writerMessage },
    ]);
    setWriterName("");
    setWriterMessage("");
  };

  // ------------------ NPC2 (QnA) ------------------
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);
  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  // ------------------ 모달 열림 여부 ------------------
  const isAnyModalOpen =
    npc1ModalOpen || npc2ModalOpen || noticeModalOpen || meetingModalOpen;

  // ------------------ 키 입력 상태 ------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (isAnyModalOpen) {
      setPressedKeys({});
    }
  }, [isAnyModalOpen]);

  // ------------------ 스페이스바 처리 ------------------
  function handleSpacebarInteraction() {
    const store = useUsersStore.getState();
    const me = store.users.find((u) => u.id === localClientId);
    if (!me) return;

    // 캐릭터 충돌 범위 32×32 가정
    const [cl, cr, ct, cb] = [me.x, me.x + 32, me.y, me.y + 32];

    // (1) 포탈
    for (const p of LOBBY_PORTALS) {
      const [pl, pr, pt, pb] = [p.x, p.x + p.width, p.y, p.y + p.height];
      const overlap = cr > pl && cl < pr && cb > pt && ct < pb;
      if (overlap) {
        if (p.name === "회의실") {
          setMeetingModalOpen(true);
          return;
        }
        if (p.name === "마이룸") {
          if (status === "loading") {
            alert("세션 로딩중");
            return;
          }
          if (!session?.user?.id) {
            alert("로그인 필요");
            return;
          }
          router.push(`/myroom/${session.user.id}`);
          return;
        }
      }
    }

    // (2) NPC
    for (let i = 0; i < LOBBY_NPCS.length; i++) {
      const npc = LOBBY_NPCS[i];
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cr > nl && cl < nr && cb > nt && ct < nb;
      if (overlap) {
        if (i === 0) setNpc1ModalOpen(true);
        if (i === 1) setNpc2ModalOpen(true);
        if (i === 2) setNoticeModalOpen(true);
        return;
      }
    }
  }

  // ------------------ 키 다운/업 ------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatOpen || isAnyModalOpen) return;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.key === " ") {
        handleSpacebarInteraction();
      }
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (chatOpen || isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };
    const handleBlur = () => {
      setPressedKeys({});
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [chatOpen, isAnyModalOpen, router, session, status]);

  // ------------------ 이동 로직 ------------------
  function getDirection(keys: Record<string, boolean>): Direction | null {
    if (keys["w"] || keys["W"] || keys["ㅈ"] || keys["ArrowUp"]) return 1; // Up
    if (keys["s"] || keys["S"] || keys["ㄴ"] || keys["ArrowDown"]) return 0; // Down
    if (keys["d"] || keys["D"] || keys["ㅇ"] || keys["ArrowRight"]) return 2; // Right
    if (keys["a"] || keys["A"] || keys["ㅁ"] || keys["ArrowLeft"]) return 3; // Left
    return null;
  }

  const throttledPressedKeys = useThrottle(pressedKeys, 100);
  useEffect(() => {
    if (chatOpen || isAnyModalOpen) return;

    const store = useUsersStore.getState();
    const me = store.users.find((u) => u.id === localClientId);
    if (!me) return;

    let { x, y } = me;
    const newDir = getDirection(throttledPressedKeys);

    if (newDir === null) {
      updateUserPosition(localClientId, x, y, me.direction, false);
      return;
    }

    let moved = false;
    if (newDir === 1 && y > 0) {
      y -= LOBBY_MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (
      newDir === 0 &&
      y < LOBBY_MAP_CONSTANTS.MAP_HEIGHT - LOBBY_MAP_CONSTANTS.IMG_HEIGHT
    ) {
      y += LOBBY_MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (
      newDir === 2 &&
      x < LOBBY_MAP_CONSTANTS.MAP_WIDTH - LOBBY_MAP_CONSTANTS.IMG_WIDTH
    ) {
      x += LOBBY_MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (newDir === 3 && x > 0) {
      x -= LOBBY_MAP_CONSTANTS.SPEED;
      moved = true;
    }

    if (moved) {
      updateUserPosition(localClientId, x, y, newDir, true);
      emitMovement(x, y, newDir);
    } else {
      updateUserPosition(localClientId, x, y, newDir, false);
    }
  }, [
    throttledPressedKeys,
    chatOpen,
    isAnyModalOpen,
    localClientId,
    emitMovement,
    updateUserPosition,
  ]);

  // ------------------ rAF 렌더링 ------------------
  const zoomFactor = 2;
  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fps = 30;
    const frameDuration = 1000 / fps;
    let lastTime = 0;
    let animationId = 0;

    // 캐릭터 애니
    const userFrameMap: Record<
      string,
      { frame: number; lastFrameTime: number }
    > = {};
    const frameInterval = 200;
    const maxMovingFrame = 3;

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const store = useUsersStore.getState();
        const me = store.users.find((u) => u.id === localClientId);

        // 카메라
        let cameraX = 0;
        let cameraY = 0;
        if (me) {
          const centerX = me.x + LOBBY_MAP_CONSTANTS.IMG_WIDTH / 2;
          const centerY = me.y + LOBBY_MAP_CONSTANTS.IMG_HEIGHT / 2;

          const viewWidth = canvas.width / zoomFactor;
          const viewHeight = canvas.height / zoomFactor;

          const maxCamX = LOBBY_MAP_CONSTANTS.MAP_WIDTH - viewWidth;
          const maxCamY = LOBBY_MAP_CONSTANTS.MAP_HEIGHT - viewHeight;

          if (maxCamX < 0) {
            cameraX = -(maxCamX / 2);
          } else {
            cameraX = centerX - viewWidth / 2;
            cameraX = clamp(cameraX, 0, maxCamX);
          }

          if (maxCamY < 0) {
            cameraY = -(maxCamY / 2);
          } else {
            cameraY = centerY - viewHeight / 2;
            cameraY = clamp(cameraY, 0, maxCamY);
          }
        }

        ctx.save();
        ctx.scale(zoomFactor, zoomFactor);
        ctx.translate(-cameraX, -cameraY);

        // 배경
        if (backgroundImage) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            LOBBY_MAP_CONSTANTS.MAP_WIDTH,
            LOBBY_MAP_CONSTANTS.MAP_HEIGHT,
          );
        }

        // 포탈
        if (portalGifRef.current && portalGifRef.current.complete) {
          LOBBY_PORTALS.forEach((p) => {
            ctx.drawImage(portalGifRef.current!, p.x, p.y, p.width, p.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(p.name, p.x + p.width / 2, p.y + p.height + 12);
          });
        } else {
          LOBBY_PORTALS.forEach((p) => {
            ctx.fillStyle = "rgba(0,255,255,0.3)";
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText(p.name, p.x + p.width / 2, p.y + p.height + 12);
          });
        }

        // NPC
        LOBBY_NPCS.forEach((npc) => {
          const npcImg = npcImages[npc.image];
          if (npcImg && npcImg.complete) {
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

        // 캐릭터 스프라이트
        const now = performance.now();
        const spriteKeys = Object.keys(spriteImages);
        const loadedSpriteCount = spriteKeys.length;

        store.users.forEach((user) => {
          if (!userFrameMap[user.id]) {
            userFrameMap[user.id] = { frame: 0, lastFrameTime: now };
          }
          const uf = userFrameMap[user.id];

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
          const sy = (user.direction ?? 0) * FRAME_HEIGHT;

          if (loadedSpriteCount === LAYER_ORDER.length) {
            ctx.save();
            LAYER_ORDER.forEach((layerName) => {
              const layerImg = spriteImages[layerName];
              if (!layerImg) return;
              ctx.drawImage(
                layerImg,
                sx,
                sy,
                FRAME_WIDTH,
                FRAME_HEIGHT,
                user.x,
                user.y,
                FRAME_WIDTH,
                FRAME_HEIGHT,
              );
            });
            ctx.restore();
          } else {
            ctx.fillStyle = "rgba(0,0,255,0.3)";
            ctx.fillRect(
              user.x,
              user.y,
              LOBBY_MAP_CONSTANTS.IMG_WIDTH,
              LOBBY_MAP_CONSTANTS.IMG_HEIGHT,
            );
          }

          // 닉네임
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            user.nickname,
            user.x + LOBBY_MAP_CONSTANTS.IMG_WIDTH / 2,
            user.y + LOBBY_MAP_CONSTANTS.IMG_HEIGHT + 12,
          );
        });

        ctx.restore();
      }
      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [backgroundImage, npcImages, spriteImages, canvasSize, localClientId]);

  return (
    <>
      {/* 숨긴 포탈 GIF */}
      <NextImage
        ref={portalGifRef as React.RefObject<HTMLImageElement>}
        src="/furniture/portal.gif"
        alt="portal"
        width={1}
        height={1}
        style={{ display: "none" }}
        priority
      />

      {/* NPC1 모달 */}
      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="NPC1 대화"
      >
        <DailyProblemContent />
      </NpcModal>

      {/* NPC2 모달 */}
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        title="NPC2 대화"
      >
        <QnaContent
          qnaList={QNA_LIST}
          selectedQnaIndex={selectedQnaIndex}
          handleQnaClick={handleQnaClick}
        />
      </NpcModal>

      {/* 공지사항 모달 */}
      <NoticeBoardModal
        open={noticeModalOpen}
        onClose={setNoticeModalOpen}
        noticeList={noticeList}
        writerName={writerName}
        writerMessage={writerMessage}
        setWriterName={setWriterName}
        setWriterMessage={setWriterMessage}
        handleAddNotice={handleAddNotice}
      />

      {/* 회의실 모달 */}
      <EnterMeetingRoom
        open={meetingModalOpen}
        onOpenChange={setMeetingModalOpen}
      />

      {/* 동적 사이즈 캔버스 컨테이너 */}
      <div
        className={Style.canvasContainerClass}
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "hidden",
        }}
      >
        {/* 포탈/NPC를 DOM 렌더하지 않고, Canvas에서 그림 */}
        <PortalList portals={[]} />
        <NpcList npcs={[]} />

        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default LobbyCanvas;
