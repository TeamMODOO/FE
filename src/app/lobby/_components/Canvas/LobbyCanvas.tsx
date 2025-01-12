"use client";

import React, { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import {
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
  // [수정] getUser를 추가로 넘겨줍니다.
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

  // (G) 사운드 (생략)

  // (H) 모달 상태 ...
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const [minigameModalOpen, setMinigameModalOpen] = useState(false);
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // Alert 모달 ...
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

  // (J) 공지사항 & QnA ...
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

  // (K) 포탈 이동 ...
  const [isFadingOut, setIsFadingOut] = useState(false);
  function goMyRoom(userId: string) {
    // playPortalEventSound();
    setIsFadingOut(true);
    setTimeout(() => router.push(`/myroom/${userId}`), 800);
  }

  // (L) 충돌 판정 (생략)

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
    // ...
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

  // (O) rawMovement → throttle → emitMovement
  const [rawMovement, setRawMovement] = useState({
    x: 500,
    y: 500,
    direction: 0 as Direction,
  });
  const throttledMovement = useThrottle(rawMovement, 50);

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

        // 충돌 체크 ...
        // (생략)

        x = newX;
        y = newY;
        moved = true;

        updateUserPosition(clientId, x, y, newDir, moved);
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

  // (R) useLobbyRenderer
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
      {/* 생략 : audio, NextImage 등 */}
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
