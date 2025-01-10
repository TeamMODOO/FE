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
// AlertModal 불러오기
import AlertModal from "@/components/alertModal/AlertModal";
import MiniGameModal from "@/components/modal/MiniGame/MiniGameModal";
import NeedSignInModal from "@/components/modal/NeedSignIn/NeedSignInModal";
import { useLobbyRenderer } from "@/hooks/lobby/useLobbyRenderer";
import useLobbySocketEvents from "@/hooks/lobby/useLobbySocketEvents";
import useLoadSprites from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
import { NoticeItem } from "@/model/NoticeBoard";
import { Direction } from "@/model/User";
import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";
import useUsersStore from "@/store/useUsersStore";

import DailyProblemContent from "../DailyProblem/DailyProblemContent";
import { EnterMeetingRoom } from "../EnterMeetingRoom/EnterMeetingRoom";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import QnaContent from "../Qna/QnaContent";
import Style from "./Canvas.style";

/** 컴포넌트 Props */
interface LobbyCanvasProps {
  chatOpen: boolean;
}

/**
 * 메인 로비 Canvas + 모달들
 */
const LobbyCanvas: React.FC<LobbyCanvasProps> = ({ chatOpen }) => {
  const router = useRouter();
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const [minigameModalOpen, setMinigameModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data: session, status } = useSession();

  // 유저 스토어
  const updateUserPosition = useUsersStore((s) => s.updateUserPosition);

  // 소켓 연동
  const { socket, isConnected } = useSocketStore();
  // 클라이언트 아이디
  const { clientId } = useClientIdStore();
  // 이동 소켓
  const { emitMovement } = useLobbySocketEvents({
    userId: clientId ?? "",
    userNickname: session?.user?.name ?? "Guest",
  });

  useEffect(() => {
    if (!clientId) return;
    if (status === "loading") return;

    // 소켓이 연결되었을 때만 emit
    if (!socket || !isConnected) return;
    // 아무 내용 없이 "CS_USER_POSITION_INFO" 보냄
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

  // 배경 이미지
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/lobby_image.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // (추가됨) 포탈 이미지(= portal.png) 로딩
  const [portalImage, setPortalImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = "/furniture/portal.png"; // public 폴더의 경로
    img.onload = () => {
      setPortalImage(img);
    };
  }, []);

  // NPC 이미지 로딩
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

  // 캐릭터 스프라이트
  const spriteImages = useLoadSprites();

  // ------------------ 모달 상태들 ------------------
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

  // 어떤 모달이라도 열려있는지
  const isAnyModalOpen =
    npc1ModalOpen ||
    npc2ModalOpen ||
    npc2ModalOpen ||
    npc3ModalOpen ||
    noticeModalOpen ||
    meetingModalOpen ||
    rankingModalOpen ||
    minigameModalOpen;
  // ------------------ AlertModal 관련 상태 추가 ------------------
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 알림 모달을 띄워주는 헬퍼
  const openAlertModal = (message: string) => {
    setAlertMessage(message);
    setAlertModalOpen(true);
  };

  // ------------------ 스페이스바 상호작용 ------------------
  function handleSpacebarInteraction() {
    const store = useUsersStore.getState();
    const me = store.users.find((u) => u.id === clientId);
    if (!me) return;

    const [cl, cr, ct, cb] = [me.x, me.x + 32, me.y, me.y + 32];

    // 1) 포탈
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
            // alert("세션 로딩중"); -> AlertModal로 교체
            openAlertModal("세션 로딩중");
            return;
          }
          if (!session?.user?.id) {
            setSignInModalOpen(true);
            return;
          }
          router.push(`/myroom/${session.user.id}`);
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

  // ------------------ 키 입력 처리 ------------------
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

  // ------------------ Collision Detection ------------------
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
    if (!clientId) return;
    const store = useUsersStore.getState();
    const me = store.users.find((u) => u.id === clientId);
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

    // 방향별 이동
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

    // 충돌 박스
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
    } else {
      // 못 움직여도 방향은 업데이트
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

  // ------------------ "useLobbyRenderer" 훅으로 실제 rAF 렌더링 ------------------
  useLobbyRenderer({
    canvasRef,
    canvasSize,
    backgroundImage,
    npcImages,
    portalImage, // (추가됨)
    spriteImages,
    localClientId: clientId!,
    portals: LOBBY_PORTALS,
    npcs: LOBBY_NPCS,
  });

  return (
    <>
      {/* 로그인 모달 */}
      {signInModalOpen && (
        <NeedSignInModal
          onClose={() => {
            setSignInModalOpen(false);
          }}
        />
      )}

      {/* (기존) 포탈 GIF 미리 로드용 NextImage */}
      <NextImage
        src="/furniture/portal.png"
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
        imgSrc="/npc_event/npc1.png"
        title="정글의 수석 코치"
      >
        <DailyProblemContent />
      </NpcModal>

      {/* NPC2 모달 */}
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

      {/* 공지사항 모달 */}
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

      {/* NPC3 모달 */}
      <NpcModal
        isOpen={npc3ModalOpen}
        onClose={() => setNpc3ModalOpen(false)}
        imgSrc="/npc_event/npc3.png"
        title="정글의 원장"
      >
        <div>어떻게, 좀 잘 되어가나요?</div>
      </NpcModal>

      {/* 회의실 모달 */}
      {meetingModalOpen && (
        <EnterMeetingRoom
          open={meetingModalOpen}
          onOpenChange={setMeetingModalOpen}
        />
      )}

      {/* (백준) 랭킹 출력 모달 */}
      {rankingModalOpen && (
        <RankingModal onClose={() => setRankingModalOpen(false)} />
      )}

      {minigameModalOpen && (
        <MiniGameModal onClose={() => setMinigameModalOpen(false)} />
      )}

      {/* AlertModal (대체된 alert) */}
      {alertModalOpen && (
        <AlertModal title="알림" onClose={() => setAlertModalOpen(false)}>
          {alertMessage}
        </AlertModal>
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
        {/* (포탈 리스트, NPC 리스트는 배치 UI 용도) */}
        <PortalList portals={[]} />
        <NpcList npcs={[]} />

        {/* 실제 캔버스 */}
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default LobbyCanvas;
