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
  TUTORIAL_LIST,
} from "@/app/lobby/_constant";
import RankingModal from "@/app/questmap/_components/RankingModal/RankingModal";
import MiniGameModal from "@/components/modal/MiniGame/MiniGameModal";
import NeedSignInModal from "@/components/modal/NeedSignIn/NeedSignInModal";
import useLobbyRenderer from "@/hooks/lobby/useLobbyRenderer";
import useLobbySocketEvents from "@/hooks/lobby/useLobbySocketEvents";
import { useLoadSprites } from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle"; // throttle 훅
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
import TutorialContent from "../Tutorial/TutorialContent";
import Style from "./Canvas.style";

interface LobbyCanvasProps {
  chatOpen: boolean;
  isJoin: boolean;
}

const LobbyCanvas: React.FC<LobbyCanvasProps> = ({ chatOpen, isJoin }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // (A) 소켓, 클라이언트 ID
  const { socket, isConnected } = useSocketStore();
  const { clientId } = useClientIdStore();

  // (B) 로컬 유저 목록
  const { usersRef, getUser, addUser, removeUser, updateUserPosition } =
    useUsersRef();

  const { emitMovement } = useLobbySocketEvents({
    userId: clientId ?? "",
    userNickname: session?.user?.name ?? "Guest",
    getUser,
    onAddUser: addUser,
    onUpdateUserPosition: updateUserPosition,
    onRemoveUser: removeUser,
  });

  // (E) Canvas 크기
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

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

  // div에 포커스
  useEffect(() => {
    canvasWrapperRef.current?.focus();
  }, []);

  // (F) 이미지 로딩
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

  // (J) 공지사항 & QnA
  const [noticeList, setNoticeList] = useState<NoticeItem[]>([]);
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

  const [selectedTutorialIndex, setSelectedTutorialIndex] = useState<
    number | null
  >(null);
  function handleTutorialClick(index: number) {
    setSelectedTutorialIndex((prev) => (prev === index ? null : index));
  }

  // (K) 포탈 이동
  const [isFadingOut, setIsFadingOut] = useState(false);
  function goMyRoom(userId: string) {
    playPortalEventSound();
    setIsFadingOut(true);
    setTimeout(() => router.push(`/myroom/${userId}`), 800);
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
      const pl = p.x;
      const pr = p.x + p.width;
      const pt = p.y;
      const pb = p.y + p.height;
      const overlap = cl < pr && cr > pl && ct < pb && cb > pt;

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
      const nl = npc.x;
      const nr = npc.x + npc.width;
      const nt = npc.y;
      const nb = npc.y + npc.height;

      const overlap = cl < nr && cr > nl && ct < nb && cb > nt;
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

  // 키다운/업 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatOpen || isAnyModalOpen) return;

      // 이동키 or Space
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ",
          "Space",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.key === " " || e.key === "Space") {
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
  }, [chatOpen, isAnyModalOpen, status, session]);

  // (O) 이동 + 쓰로틀 + emit
  // SC_USER_POSITION_INFO가 오기 전까지는 null
  const [rawMovement, setRawMovement] = useState<{
    x: number | null;
    y: number | null;
    direction: Direction;
  }>({
    x: null,
    y: null,
    direction: 0 as Direction,
  });

  // 0.05초(50ms)마다 좌표/방향만 갱신
  const throttledMovement = useThrottle(rawMovement, 50);

  // (★) 이전에 보낸 throttledMovement를 저장할 ref
  const prevThrottledRef = useRef<{
    x: number | null;
    y: number | null;
    direction: Direction;
  }>({
    x: null,
    y: null,
    direction: 0,
  });

  useEffect(() => {
    // 1) 기본 체크
    if (rawMovement.x === null || rawMovement.y === null) return;
    if (throttledMovement.x === null || throttledMovement.y === null) return;
    if (!clientId || !isConnected) return;
    if (chatOpen || isAnyModalOpen) return;

    // 2) throttledMovement가 이전 값이랑 같다면 emit 안 함
    if (
      throttledMovement.x === prevThrottledRef.current.x &&
      throttledMovement.y === prevThrottledRef.current.y &&
      throttledMovement.direction === prevThrottledRef.current.direction
    ) {
      return;
    }

    // 3) 실제 Emit
    emitMovement(
      throttledMovement.x,
      throttledMovement.y,
      throttledMovement.direction,
    );

    // 4) prev 갱신
    prevThrottledRef.current = {
      x: throttledMovement.x,
      y: throttledMovement.y,
      direction: throttledMovement.direction,
    };
  }, [
    rawMovement.x,
    rawMovement.y,
    throttledMovement,
    emitMovement,
    clientId,
    isConnected,
    chatOpen,
    isAnyModalOpen,
  ]);

  // (P) 15fps 이동 (로컬)
  useEffect(() => {
    const fps = 15;
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

      // 서버에서 받은 내 정보
      const me = usersRef.current.find((u) => u.id === clientId);
      if (!me) return; // 아직 서버에서 내 정보 안 받았다면 동작X

      const newDir = getDirection(pressedKeys);
      let { x, y } = me; // SC_USER_POSITION_INFO에서 세팅된 좌표

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

        // 로컬 렌더링용
        updateUserPosition(clientId, x, y, newDir, moved, me.nickname);

        if (moved) {
          playFootstepSound();
        }
      } else {
        // idle
        updateUserPosition(clientId, x, y, me.direction, false, me.nickname);
      }

      // (★) 최종 이동 값을 rawMovement에 세팅 (서버에는 throttledMovement로 emit)
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

  // (Q) 모달 열리면 내 캐릭터 idle
  useEffect(() => {
    if (!clientId) return;
    if (isAnyModalOpen) {
      const me = usersRef.current.find((u) => u.id === clientId);
      if (me && me.isMoving) {
        updateUserPosition(
          clientId,
          me.x,
          me.y,
          me.direction,
          false,
          me.nickname,
        );
      }
    }
  }, [isAnyModalOpen, clientId, updateUserPosition, usersRef]);

  // (R) 서버에 유저 정보 요청
  useEffect(() => {
    if (!isJoin) return;
    if (!clientId) return;
    if (status === "loading") return;
    if (!socket || !isConnected) return;

    socket.emit("CS_USER_POSITION", {
      client_id: clientId,
      room_id: "floor7",
    });
  }, [clientId, status, socket, isConnected, isJoin]);

  // (S) Canvas 렌더링
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

  // (T) 최종 렌더
  return (
    <>
      {/* 오디오 태그들 */}
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

      {/* 미리 로딩용 NextImage */}
      <NextImage
        src="/furniture/portal.png"
        alt="portal"
        width={1}
        height={1}
        style={{ display: "none" }}
        priority
      />

      {/* 모달들 */}
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
        title="정글 김코치"
      >
        <DailyProblemContent />
      </NpcModal>
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        imgSrc="/npc_event/npc2.png"
        title="정글 백코치"
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
        title="정글 김원장"
      >
        <TutorialContent
          tutorialList={TUTORIAL_LIST}
          selectedTutorialIndex={selectedTutorialIndex}
          handleTutorialClick={handleTutorialClick}
        />
      </NpcModal>

      {meetingModalOpen && (
        <EnterMeetingRoom
          open={meetingModalOpen}
          onOpenChange={setMeetingModalOpen}
        />
      )}

      {/* Canvas 영역에 tabIndex를 주고 ref 달기 */}
      <div
        ref={canvasWrapperRef}
        className={Style.canvasContainerClass}
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "hidden",
          outline: "none",
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* 화면 페이드 아웃 */}
      <div
        className={`fade-overlay duration-2000 pointer-events-none fixed inset-0 bg-black transition-opacity ${
          isFadingOut ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Alert 모달 */}
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
