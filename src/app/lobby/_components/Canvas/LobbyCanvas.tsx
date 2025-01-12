"use client";

import React, { useEffect, useRef, useState } from "react";

import NextImage from "next/image";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import {
  LOBBY_COLLISION_ZONES,
  LOBBY_MAP_CONSTANTS,
  LOBBY_NPCS,
  LOBBY_PORTALS,
  QNA_LIST,
} from "@/app/lobby/_constant";
import RankingModal from "@/app/questmap/_components/RankingModal/RankingModal";
import MiniGameModal from "@/components/modal/MiniGame/MiniGameModal";
import NeedSignInModal from "@/components/modal/NeedSignIn/NeedSignInModal";
import useLobbyRenderer from "@/hooks/lobby/useLobbyRenderer";
// [수정] getUser 추가
import useLobbySocketEvents from "@/hooks/lobby/useLobbySocketEvents";
import { useLoadSprites } from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
import { NoticeItem } from "@/model/NoticeBoard";
import { Direction } from "@/model/User";
import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";
import useUsersRef from "@/store/useUsersRef";

import DailyProblemContent from "../DailyProblem/DailyProblemContent";
import { EnterMeetingRoom } from "../EnterMeetingRoom/EnterMeetingRoom";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import { NpcModal } from "../Npc/NpcModal";
import QnaContent from "../Qna/QnaContent";
import Style from "./Canvas.style";

interface LobbyCanvasProps {
  chatOpen: boolean;
}

const LobbyCanvas: React.FC<LobbyCanvasProps> = ({ chatOpen }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // (A) 소켓, 클라이언트ID
  const { socket, isConnected } = useSocketStore();
  const { clientId } = useClientIdStore();

  // (B) 로컬 유저 목록
  const { usersRef, getUser, addUser, removeUser, updateUserPosition } =
    useUsersRef();

  // (D) 소켓 이벤트
  const { emitMovement } = useLobbySocketEvents({
    userId: clientId ?? "",
    userNickname: session?.user?.name ?? "Guest",
    // [수정] getUser 추가
    getUser,
    onAddUser: addUser,
    onUpdateUserPosition: updateUserPosition,
    onRemoveUser: removeUser,
  });

  // (E) Canvas 크기
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({
    w: LOBBY_MAP_CONSTANTS.CANVAS_WIDTH,
    h: LOBBY_MAP_CONSTANTS.CANVAS_HEIGHT,
  });
  useEffect(() => {
    function handleResize() {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // (F) 로딩 이미지들
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [portalImage, setPortalImage] = useState<HTMLImageElement | null>(null);
  const [npcImages, setNpcImages] = useState<Record<string, HTMLImageElement>>(
    {},
  );
  const spriteImages = useLoadSprites();

  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/lobby_image.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/furniture/portal.png";
    img.onload = () => setPortalImage(img);
  }, []);

  useEffect(() => {
    const temp: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const uniquePaths = Array.from(new Set(LOBBY_NPCS.map((npc) => npc.image)));
    uniquePaths.forEach((path) => {
      const i = new Image();
      i.src = path;
      i.onload = () => {
        temp[path] = i;
        loadedCount++;
        if (loadedCount === uniquePaths.length) {
          setNpcImages({ ...temp });
        }
      };
    });
  }, []);

  // (G) 사운드
  const walkAudioRef = useRef<HTMLAudioElement | null>(null);
  const modalEventAudioRef = useRef<HTMLAudioElement | null>(null);
  const portalEventAudioRef = useRef<HTMLAudioElement | null>(null);

  const footstepSounds = ["/sounds/walk01.wav", "/sounds/walk02.wav"];
  const stepIndexRef = useRef(0);
  const FOOTSTEP_INTERVAL = 250;
  const lastFootstepTime = useRef(0);

  function getNextFootstepSound() {
    const idx = stepIndexRef.current;
    const src = footstepSounds[idx];
    stepIndexRef.current = (idx + 1) % footstepSounds.length;
    return src;
  }

  function playFootstepSound() {
    if (!walkAudioRef.current) return;
    const now = Date.now();
    if (now - lastFootstepTime.current < FOOTSTEP_INTERVAL) {
      return;
    }
    lastFootstepTime.current = now;
    const nextSrc = getNextFootstepSound();
    walkAudioRef.current.src = nextSrc;
    walkAudioRef.current.currentTime = 0;
    walkAudioRef.current.play().catch(() => {});
  }

  function playModalEventSound() {
    if (!modalEventAudioRef.current) return;
    modalEventAudioRef.current.currentTime = 0;
    modalEventAudioRef.current.play().catch(() => {});
  }

  function playPortalEventSound() {
    if (!portalEventAudioRef.current) return;
    portalEventAudioRef.current.currentTime = 0;
    portalEventAudioRef.current.play().catch(() => {});
  }

  // (H) 모달 상태
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const [minigameModalOpen, setMinigameModalOpen] = useState(false);
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // (I) Alert 모달
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  function openAlertModal(msg: string) {
    setAlertMessage(msg);
    setAlertModalOpen(true);
  }

  const isAnyModalOpen =
    signInModalOpen ||
    rankingModalOpen ||
    minigameModalOpen ||
    npc1ModalOpen ||
    npc2ModalOpen ||
    npc3ModalOpen ||
    noticeModalOpen ||
    meetingModalOpen ||
    alertModalOpen;

  // (J) 공지사항 & QnA
  const [noticeList, setNoticeList] = useState<NoticeItem[]>([
    { id: 1, name: "운영자", message: "처음 오신 분들 환영합니다!" },
    { id: 2, name: "Alice", message: "안녕하세요! 반갑습니다." },
  ]);
  const [writerName, setWriterName] = useState("");
  const [writerMessage, setWriterMessage] = useState("");

  function handleAddNotice() {
    if (!writerName.trim() || !writerMessage.trim()) return;
    setNoticeList((prev) => [
      ...prev,
      { id: prev.length + 1, name: writerName, message: writerMessage },
    ]);
    setWriterName("");
    setWriterMessage("");
  }

  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);
  function handleQnaClick(index: number) {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  }

  // (K) 포탈 이동
  const [isFadingOut, setIsFadingOut] = useState(false);
  function goMyRoom(userId: string) {
    playPortalEventSound();
    setIsFadingOut(true);
    setTimeout(() => router.push(`/myroom/${userId}`), 800);
  }

  // (L) 충돌 판정 (사용 안 해도 됨: 참고용)
  function doRectsOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
  ) {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect1.x >= rect2.x + rect2.width ||
      rect1.y + rect1.height <= rect2.y ||
      rect1.y >= rect2.y + rect2.height
    );
  }

  // (M) 방향 계산
  function getDirection(keys: Record<string, boolean>): Direction | null {
    if (keys["w"] || keys["W"] || keys["ㅈ"] || keys["ArrowUp"]) return 1; // Up
    if (keys["s"] || keys["S"] || keys["ㄴ"] || keys["ArrowDown"]) return 0; // Down
    if (keys["d"] || keys["D"] || keys["ㅇ"] || keys["ArrowRight"]) return 2; // Right
    if (keys["a"] || keys["A"] || keys["ㅁ"] || keys["ArrowLeft"]) return 3; // Left
    return null;
  }

  // (N) 키보드 입력
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (isAnyModalOpen) {
      setPressedKeys({});
    }
  }, [isAnyModalOpen]);

  function handleSpacebarInteraction() {
    const me = usersRef.current.find((u) => u.id === clientId);
    if (!me) return;

    const cl = me.drawX;
    const cr = me.drawX + 32;
    const ct = me.drawY;
    const cb = me.drawY + 32;

    // 포탈 충돌
    for (const p of LOBBY_PORTALS) {
      const [pl, pr, pt, pb] = [p.x, p.x + p.width, p.y, p.y + p.height];
      const overlap = cr > pt && ct < pb && cr > pt && cl < pr;
      if (overlap) {
        if (p.name === "회의실") {
          playPortalEventSound();
          setMeetingModalOpen(true);
          return;
        }
        if (p.name === "마이룸") {
          if (status === "loading") {
            openAlertModal("세션 로딩중입니다. 잠시 후 다시 시도해주세요.");
            return;
          }
          if (!session?.user?.id) {
            setSignInModalOpen(true);
            return;
          }
          goMyRoom(session.user.id);
          return;
        }
      }
    }

    // NPC 충돌
    for (let i = 0; i < LOBBY_NPCS.length; i++) {
      const npc = LOBBY_NPCS[i];
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cr > nt && ct < nb && cl < nr && cr > nt;
      if (overlap) {
        playModalEventSound();
        if (i === 0) setNpc1ModalOpen(true);
        if (i === 1) setNpc2ModalOpen(true);
        if (i === 2) setNoticeModalOpen(true);
        if (i === 3) setNpc3ModalOpen(true);
        if (i === 4) setRankingModalOpen(true);
        if (i === 5) setMinigameModalOpen(true);
        return;
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatOpen || isAnyModalOpen) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
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
  }, [chatOpen, isAnyModalOpen]);

  // ─────────────────────────────────────────────────────────────────────────────
  // (O) "실시간 이동" + "소켓 emit 쓰로틀" 방식
  // ─────────────────────────────────────────────────────────────────────────────

  // ① rawMovement: 매 프레임마다 내 위치/방향을 최신으로 저장 (로컬)
  const [rawMovement, setRawMovement] = useState({
    x: 500,
    y: 500,
    direction: 0 as Direction,
  });

  // ② 100ms 간격으로만 전송
  const throttledMovement = useThrottle(rawMovement, 100);

  // ③ throttledMovement가 바뀔 때만 서버로 emitMovement
  useEffect(() => {
    if (!clientId) return;
    if (!isConnected) return;
    if (chatOpen || isAnyModalOpen) return;

    emitMovement(
      throttledMovement.x,
      throttledMovement.y,
      throttledMovement.direction,
    );
  }, [
    throttledMovement,
    emitMovement,
    clientId,
    isConnected,
    chatOpen,
    isAnyModalOpen,
  ]);

  // 30fps 이동 처리 (로컬)
  useEffect(() => {
    const fps = 30;
    const frameDuration = 1000 / fps;
    let lastTime = 0;
    let moveTimer = 0;

    function loop(time: number) {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);
        doMove();
      }
      moveTimer = requestAnimationFrame(loop);
    }

    function doMove() {
      if (!clientId) return;
      if (chatOpen || isAnyModalOpen) return;

      const me = usersRef.current.find((u) => u.id === clientId);
      if (!me) return;

      const newDir = getDirection(pressedKeys);

      let { x, y } = me;
      let moved = false;

      if (newDir !== null) {
        let newX = x;
        let newY = y;

        if (newDir === 1 && y > 0) {
          newY -= LOBBY_MAP_CONSTANTS.SPEED;
        } else if (
          newDir === 0 &&
          y < LOBBY_MAP_CONSTANTS.MAP_HEIGHT - LOBBY_MAP_CONSTANTS.IMG_HEIGHT
        ) {
          newY += LOBBY_MAP_CONSTANTS.SPEED;
        } else if (
          newDir === 2 &&
          x < LOBBY_MAP_CONSTANTS.MAP_WIDTH - LOBBY_MAP_CONSTANTS.IMG_WIDTH
        ) {
          newX += LOBBY_MAP_CONSTANTS.SPEED;
        } else if (newDir === 3 && x > 0) {
          newX -= LOBBY_MAP_CONSTANTS.SPEED;
        }

        // 충돌 체크
        const newBB = {
          x: newX,
          y: newY,
          width: LOBBY_MAP_CONSTANTS.IMG_WIDTH,
          height: LOBBY_MAP_CONSTANTS.IMG_HEIGHT,
        };
        let collision = false;
        for (const zone of LOBBY_COLLISION_ZONES) {
          const overlap =
            newBB.x + newBB.width > zone.x &&
            newBB.x < zone.x + zone.width &&
            newBB.y + newBB.height > zone.y &&
            newBB.y < zone.y + zone.height;
          if (overlap) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          x = newX;
          y = newY;
          moved = true;
        }

        updateUserPosition(clientId, x, y, newDir, moved);

        // 걸음 소리
        if (moved) {
          playFootstepSound();
        }
      } else {
        // 방향키가 안 눌리면 idle
        updateUserPosition(clientId, x, y, me.direction, false);
      }

      setRawMovement({
        x,
        y,
        direction: newDir !== null ? newDir : me.direction,
      });
    }

    moveTimer = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(moveTimer);
    };
  }, [
    clientId,
    chatOpen,
    isAnyModalOpen,
    pressedKeys,
    usersRef,
    updateUserPosition,
  ]);

  // (P) 모달 열리면 내 캐릭터 idle
  useEffect(() => {
    if (!clientId) return;
    if (isAnyModalOpen) {
      const me = usersRef.current.find((u) => u.id === clientId);
      if (me && me.isMoving) {
        updateUserPosition(clientId, me.x, me.y, me.direction, false);
      }
    }
  }, [isAnyModalOpen, clientId, updateUserPosition, usersRef]);

  // (Q) 로비 접속 시 서버에 유저 정보 요청
  useEffect(() => {
    if (!clientId) return;
    if (status === "loading") return;
    if (!socket || !isConnected) return;
    socket.emit("CS_USER_POSITION_INFO", {});
  }, [clientId, status, socket, isConnected]);

  // (R) useLobbyRenderer로 캔버스 렌더링
  useLobbyRenderer({
    canvasRef,
    canvasSize,
    backgroundImage,
    npcImages,
    portalImage,
    spriteImages,
    usersRef,
    localClientId: clientId ?? "",
    portals: LOBBY_PORTALS,
    npcs: LOBBY_NPCS,
  });

  // (S) 최종 렌더
  return (
    <>
      <audio ref={walkAudioRef} src="" />
      <audio
        ref={modalEventAudioRef}
        src="/sounds/modalEvent.wav"
        style={{ display: "none" }}
      />
      <audio
        ref={portalEventAudioRef}
        src="/sounds/portalEvent.wav"
        style={{ display: "none" }}
      />

      <NextImage
        src="/furniture/portal.png"
        alt="portal"
        width={1}
        height={1}
        style={{ display: "none" }}
        priority
      />

      {signInModalOpen && (
        <NeedSignInModal onClose={() => setSignInModalOpen(false)} />
      )}
      {rankingModalOpen && (
        <RankingModal onClose={() => setRankingModalOpen(false)} />
      )}
      {minigameModalOpen && (
        <MiniGameModal onClose={() => setMinigameModalOpen(false)} />
      )}

      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        imgSrc="/npc_event/npc1.png"
        title="정글의 수석 코치"
      >
        <DailyProblemContent />
      </NpcModal>

      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        imgSrc="/npc_event/npc2.png"
        title="정글의 게임 전문 코치"
      >
        <QnaContent
          qnaList={QNA_LIST}
          selectedQnaIndex={selectedQnaIndex}
          handleQnaClick={handleQnaClick}
        />
      </NpcModal>

      {noticeModalOpen && (
        <NoticeBoardModal
          open={noticeModalOpen}
          onClose={() => setNoticeModalOpen(false)}
          noticeList={noticeList}
          writerName={writerName}
          writerMessage={writerMessage}
          setWriterName={setWriterName}
          setWriterMessage={setWriterMessage}
          handleAddNotice={handleAddNotice}
        />
      )}
      <NpcModal
        isOpen={npc3ModalOpen}
        onClose={() => setNpc3ModalOpen(false)}
        imgSrc="/npc_event/npc3.png"
        title="정글의 원장"
      >
        <div>어떻게, 좀 잘 되어가나요?</div>
      </NpcModal>

      {meetingModalOpen && (
        <EnterMeetingRoom
          open={meetingModalOpen}
          onOpenChange={setMeetingModalOpen}
        />
      )}

      <div
        className={Style.canvasContainerClass}
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "hidden",
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      <div
        className={`fade-overlay duration-2000 pointer-events-none fixed inset-0 bg-black transition-opacity ${
          isFadingOut ? "opacity-100" : "opacity-0"
        }`}
      />

      {alertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded bg-white p-4">
            <p>{alertMessage}</p>
            <button onClick={() => setAlertModalOpen(false)}>확인</button>
          </div>
        </div>
      )}
    </>
  );
};

export default LobbyCanvas;
