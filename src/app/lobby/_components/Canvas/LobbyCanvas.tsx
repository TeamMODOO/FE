// src/app/lobby/_components/Canvas/LobbyCanvas.tsx

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
// AlertModal 불러오기
import NeedSignInModal from "@/components/modal/NeedSignIn/NeedSignInModal";
import { useLobbyRenderer } from "@/hooks/lobby/useLobbyRenderer";
import useLobbySocketEvents from "@/hooks/lobby/useLobbySocketEvents";
import useLoadSprites from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
import { NoticeItem } from "@/model/NoticeBoard";
import { Direction } from "@/model/User";
import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";
// [추가] ref 방식의 user store
import useUsersRef from "@/store/useUsersRef";

import DailyProblemContent from "../DailyProblem/DailyProblemContent";
import { EnterMeetingRoom } from "../EnterMeetingRoom/EnterMeetingRoom";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import QnaContent from "../Qna/QnaContent";
import Style from "./Canvas.style";

interface LobbyCanvasProps {
  chatOpen: boolean;
}

const LobbyCanvas: React.FC<LobbyCanvasProps> = ({ chatOpen }) => {
  // [1] 걷기 효과음 ----------------------
  const walkAudioRef = useRef<HTMLAudioElement | null>(null);

  const footstepSounds = ["/sounds/walk01.wav", "/sounds/walk02.wav"];
  const stepIndexRef = useRef(0);

  function getNextFootstepSound() {
    const idx = stepIndexRef.current;
    const src = footstepSounds[idx];
    stepIndexRef.current = (idx + 1) % footstepSounds.length;
    return src;
  }

  // 최소 발소리 간격 (ms)
  const FOOTSTEP_INTERVAL = 250;
  const lastFootstepTime = useRef(0);

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

    walkAudioRef.current.play().catch(() => {
      /* 브라우저 정책 등에 의해 블록될 수 있음 */
    });
  }
  // --------------------------------------

  // 모달 이벤트 효과음 ----------------
  const modalEventAudioRef = useRef<HTMLAudioElement | null>(null);
  const portalEventAudioRef = useRef<HTMLAudioElement | null>(null);

  function playModalEventSound() {
    if (!modalEventAudioRef.current) return;
    modalEventAudioRef.current.currentTime = 0;
    modalEventAudioRef.current.play().catch(() => {});
  }

  // 포탈 이벤트 효과음 ----------------
  function playPortalEventSound() {
    if (!portalEventAudioRef.current) return;
    portalEventAudioRef.current.currentTime = 0;
    portalEventAudioRef.current.play().catch(() => {});
  }

  // 페이드아웃 상태
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 실제로 “마이룸” 이동을 수행하는 함수
  function goMyRoom(userId: string) {
    // 1) 사운드 재생
    playPortalEventSound();

    // 2) 페이드아웃 트리거
    setIsFadingOut(true);

    // 3) 2초 뒤 router.push()
    setTimeout(() => {
      router.push(`/myroom/${userId}`);
    }, 800);
  }
  // ---------------------------------------

  const router = useRouter();
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const [minigameModalOpen, setMinigameModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data: session, status } = useSession();

  // [변경] useUsersRef 사용
  const { usersRef, updateUserPosition, addUser, removeUser } = useUsersRef();

  // 소켓 연동
  const { socket, isConnected } = useSocketStore();
  // 클라이언트 아이디
  const { clientId } = useClientIdStore();

  // 이동 소켓
  const { emitMovement } = useLobbySocketEvents({
    userId: clientId ?? "",
    userNickname: session?.user?.name ?? "Guest",

    onAddUser: addUser,
    onUpdateUserPosition: updateUserPosition,
    onRemoveUser: removeUser,
  });

  useEffect(() => {
    if (!clientId) return;
    if (status === "loading") return;
    if (!socket || !isConnected) return;
    socket.emit("CS_USER_POSITION_INFO", {});
  }, [clientId, status, socket, isConnected]);

  // 화면 사이즈
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

  // 배경, 포탈, NPC 이미지 로딩
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
    img.onload = () => {
      setPortalImage(img);
    };
  }, []);

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

  // 모달들...
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // 공지사항
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

  // QnA (NPC2)
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);
  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  // 모달 오픈 여부
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const openAlertModal = (message: string) => {
    setAlertMessage(message);
    setAlertModalOpen(true);
  };

  // "어떤 모달이라도 열려있는지"
  const isAnyModalOpen =
    npc1ModalOpen ||
    npc2ModalOpen ||
    npc3ModalOpen ||
    noticeModalOpen ||
    meetingModalOpen ||
    rankingModalOpen ||
    minigameModalOpen;

  // 스페이스바 상호작용
  function handleSpacebarInteraction() {
    const me = usersRef.current.find((u) => u.id === clientId);
    if (!me) return;

    const [cl, cr, ct, cb] = [me.x, me.x + 32, me.y, me.y + 32];

    // 1) 포탈
    for (const p of LOBBY_PORTALS) {
      const [pl, pr, pt, pb] = [p.x, p.x + p.width, p.y, p.y + p.height];
      const overlap = cr > pl && cl < pr && cb > pt && ct < pb;
      if (overlap) {
        if (p.name === "회의실") {
          // 모달 사운드 재생
          playPortalEventSound();
          setMeetingModalOpen(true);
          return;
        }
        if (p.name === "마이룸") {
          if (status === "loading") {
            // 모달 사운드 재생
            playPortalEventSound();
            openAlertModal("세션 로딩중");
            return;
          }
          if (!session?.user?.id) {
            setSignInModalOpen(true);
            return;
          }
          // router.push(`/myroom/${session.user.id}`);
          goMyRoom(session.user.id);
          return;
        }
      }
    }

    // 2) NPC
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
        playModalEventSound();
        if (i === 0) setNpc1ModalOpen(true);
        if (i === 1) setNpc2ModalOpen(true);
        if (i === 2) setNoticeModalOpen(true);
        if (i == 3) setNpc3ModalOpen(true);
        if (i == 4) setRankingModalOpen(true);
        if (i == 5) setMinigameModalOpen(true);
        return;
      }
    }
  }

  // 키 입력 처리
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (isAnyModalOpen) setPressedKeys({});
  }, [isAnyModalOpen]);

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

  // 충돌 검사
  function doRectsOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
  ): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect1.x >= rect2.x + rect2.width ||
      rect1.y + rect1.height <= rect2.y ||
      rect1.y >= rect2.y + rect2.height
    );
  }

  // 이동 로직
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
    if (!clientId) return;

    const me = usersRef.current.find((u) => u.id === clientId);
    if (!me) return;

    let { x, y } = me;
    const newDir = getDirection(throttledPressedKeys);

    if (newDir === null) {
      updateUserPosition(clientId, x, y, me.direction, false);
      return;
    }

    let moved = false;
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

    const newBoundingBox = {
      x: newX,
      y: newY,
      width: LOBBY_MAP_CONSTANTS.IMG_WIDTH,
      height: LOBBY_MAP_CONSTANTS.IMG_HEIGHT,
    };

    let collision = false;
    for (const zone of LOBBY_COLLISION_ZONES) {
      if (doRectsOverlap(newBoundingBox, zone)) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      x = newX;
      y = newY;
      moved = true;
    }

    if (moved) {
      updateUserPosition(clientId, x, y, newDir, true);
      emitMovement(x, y, newDir);
      playFootstepSound();
    } else {
      updateUserPosition(clientId, x, y, newDir, false);
    }
  }, [
    throttledPressedKeys,
    chatOpen,
    isAnyModalOpen,
    clientId,
    emitMovement,
    updateUserPosition,
  ]);

  // 캔버스 렌더링 (30fps)
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

  return (
    <>
      {/* (1) 걷기 효과음용 <audio> */}
      <audio ref={walkAudioRef} src="" />

      {/* (2) 모달 이벤트 사운드용 <audio> */}
      <audio
        ref={modalEventAudioRef}
        src="/sounds/modalEvent.wav"
        style={{ display: "none" }}
      />

      {/* (3) 포탈 이벤트 사운드용 <audio> */}
      <audio
        ref={portalEventAudioRef}
        src="/sounds/portalEvent.wav"
        style={{ display: "none" }}
      />

      {/* 로그인 모달 */}
      {signInModalOpen && (
        <NeedSignInModal
          onClose={() => {
            setSignInModalOpen(false);
          }}
        />
      )}

      {/* 랭킹 모달 */}
      {rankingModalOpen && (
        <RankingModal onClose={() => setRankingModalOpen(false)} />
      )}

      {/* 미니게임 모달 */}
      {minigameModalOpen && (
        <MiniGameModal onClose={() => setMinigameModalOpen(false)} />
      )}

      {/* 숨겨진 포탈 이미지를 미리 로드 */}
      <NextImage
        src="/furniture/portal.png"
        alt="portal"
        width={1}
        height={1}
        style={{ display: "none" }}
        priority
      />

      {/* NPC 모달들 */}
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
          onClose={() => {
            setNoticeModalOpen(false);
          }}
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

      {/* Canvas 영역 */}
      <div
        className={Style.canvasContainerClass}
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "hidden",
        }}
      >
        <PortalList portals={[]} />
        <NpcList npcs={[]} />

        <canvas ref={canvasRef} />
      </div>

      {/* 포탈 이동 시를 위한 검은색 페이드 오버레이 */}
      <div
        className={`fade-overlay duration-2000 pointer-events-none fixed inset-0 bg-black transition-opacity
            ${isFadingOut ? "opacity-100" : "opacity-0"}
          `}
      />
    </>
  );
};

export default LobbyCanvas;
