"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
// ------------------ [NextAuth] ------------------
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import useLobbySocketEvents from "@/hooks/lobby/useLobbySocketEvents";
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";
// (3) Zustand (유저 스토어)
import useUsersStore from "@/store/useUsersStore";

import { NoticeItem } from "../../_model/NoticeBoard";
import { NpcInfo } from "../../_model/Npc";
import { PortalInfo } from "../../_model/Portal";
import { QNA_LIST } from "../../data/qna";
import DailyProblemContent from "../DailyProblem/DailyProblemContent";
import { EnterMeetingRoom } from "../EnterMeetingRoom/EnterMeetingRoom";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import QnaContent from "../Qna/QnaContent";
import Style from "./Canvas.style";

// ------------------ 맵 상수 ------------------
const MAP_CONSTANTS = {
  CANVAS_WIDTH: 1400,
  CANVAS_HEIGHT: 800,
  IMG_WIDTH: 50,
  IMG_HEIGHT: 150,
  SPEED: 10,
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 700,
};

type Direction = 0 | 1 | 2 | 3; // 0=Down,1=Up,2=Right,3=Left

type SolvedUser = {
  userId: string;
  nickname: string;
  solvedProblemId: number;
  solvedDate: string;
};

/** 포탈 정보 */
const portals: PortalInfo[] = [
  {
    x: 720,
    y: 250,
    width: 50,
    height: 50,
    route: "/myroom",
    name: "마이룸",
  },
  {
    x: 450,
    y: 250,
    width: 50,
    height: 50,
    route: "/meetingroom",
    name: "회의실",
  },
];

/** NPC 정보 */
const npcs: NpcInfo[] = [
  {
    x: 500,
    y: 400,
    width: 20,
    height: 35,
    image: "/character/npc1.png",
    modalTitle: "NPC1 대화",
    name: "NPC1",
  },
  {
    x: 730,
    y: 380,
    width: 20,
    height: 35,
    image: "/character/npc2.png",
    modalTitle: "NPC2 대화",
    name: "NPC2", // QnA
  },
  {
    x: 560,
    y: 110,
    width: 100,
    height: 50,
    image: "/furniture/board.png",
    modalTitle: "공지사항 NPC",
    name: "공지사항",
  },
];

interface LobbyCanvasProps {
  // 채팅창 열림 여부
  chatOpen: boolean;
}

const LobbyCanvas: React.FC<LobbyCanvasProps> = ({ chatOpen }) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ------------------ 세션 정보 (NextAuth) ------------------
  // status: "loading" | "authenticated" | "unauthenticated"
  const { data: session, status } = useSession();

  // 로컬 클라이언트 ID (소켓용)
  const [clientId, setClientId] = useState<string>("anonymous");
  useEffect(() => {
    const storedClientId = localStorage.getItem("client_id");
    if (storedClientId) {
      setClientId(storedClientId);
    }
  }, []);

  // 소켓 연결
  useMainSocketConnect();
  const { emitMovement } = useLobbySocketEvents({
    roomId: "floor07",
    userId: clientId,
  });

  // 상태: 캔버스 크기
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({
    w: MAP_CONSTANTS.CANVAS_WIDTH,
    h: MAP_CONSTANTS.CANVAS_HEIGHT,
  });
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCanvasSize({ w, h });
  }, []);

  // 스프라이트 (캐릭터 레이어)
  const spriteImages = useLoadSprites();

  // 배경
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new window.Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // 포탈 GIF
  const portalGifRef = useRef<HTMLImageElement | null>(null);

  // NPC 이미지 로드
  const [npcImages, setNpcImages] = useState<Record<string, HTMLImageElement>>(
    {},
  );
  useEffect(() => {
    const temp: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const uniquePaths = Array.from(new Set(npcs.map((npc) => npc.image)));
    uniquePaths.forEach((path) => {
      const img = new window.Image();
      img.src = path;
      img.onload = () => {
        temp[path] = img;
        loadedCount++;
        if (loadedCount === uniquePaths.length) {
          setNpcImages(temp);
        }
      };
    });
  }, []);

  // 모달들
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
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

  // 데일리문제 (NPC1)
  const [dailyProblem, setDailyProblem] = useState<{
    id: number;
    title: string;
    link: string;
  } | null>(null);
  const [isProblemSolved, setIsProblemSolved] = useState(false);
  const [dailySolvedUsers, setDailySolvedUsers] = useState<SolvedUser[]>([]);

  useEffect(() => {
    setDailyProblem({
      id: 1018,
      title: "체스판 다시 칠하기",
      link: "https://www.acmicpc.net/problem/1018",
    });
    setDailySolvedUsers([]);
  }, []);

  const handleSolveDailyProblem = () => {
    if (!dailyProblem) return;
    setIsProblemSolved(true);
    alert(`문제 #${dailyProblem.id}를 푸셨군요!`);

    const { users } = useUsersStore.getState();
    const me = users.find((u) => u.id === "1");
    if (me) {
      setDailySolvedUsers((prev) => [
        ...prev,
        {
          userId: "1",
          nickname: me.nickname,
          solvedProblemId: dailyProblem.id,
          solvedDate: new Date().toISOString().split("T")[0],
        },
      ]);
    }
  };

  // QnA (NPC2)
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);
  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  // 모달 열림 여부
  const isAnyModalOpen =
    npc1ModalOpen || npc2ModalOpen || noticeModalOpen || meetingModalOpen;

  // 키 입력 상태 (pressedKeys)
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  // 모달 열릴 때 이동키 초기화
  useEffect(() => {
    if (isAnyModalOpen) {
      setPressedKeys({});
    }
  }, [isAnyModalOpen]);

  // ★ 포탈/NPC 스페이스바 처리
  function handleSpacebarInteraction() {
    const { users } = useUsersStore.getState();
    const me = users.find((u) => u.id === "1");
    if (!me) return;

    // 1) 포탈 충돌
    const [cl, cr, ct, cb] = [me.x, me.x + 32, me.y, me.y + 32];
    for (const portal of portals) {
      const [pl, pr, pt, pb] = [
        portal.x,
        portal.x + portal.width,
        portal.y,
        portal.y + portal.height,
      ];
      const overlap = cl < pr && cr > pl && ct < pb && cb > pt;

      if (overlap) {
        // "회의실"
        if (portal.name === "회의실") {
          setMeetingModalOpen(true);
          return;
        }

        // "마이룸"
        if (portal.name === "마이룸") {
          // 세션 status 확인
          if (status === "loading") {
            alert("세션 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
          }
          if (status === "unauthenticated" || !session?.user?.id) {
            alert("로그인이 필요합니다.");
            return;
          }
          // 이동
          router.push(`/myroom/${session.user.id}`);
          return;
        }
      }
    }

    // 2) NPC 충돌
    for (let i = 0; i < npcs.length; i++) {
      const npc = npcs[i];
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cl < nr && cr > nl && ct < nb && cb > nt;
      if (overlap) {
        // 모달 열기
        if (i === 0) setNpc1ModalOpen(true); // NPC1
        if (i === 1) setNpc2ModalOpen(true); // NPC2
        if (i === 2) setNoticeModalOpen(true); // 공지사항
        return;
      }
    }
  }

  // 키 다운/업 등록
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
  }, [chatOpen, isAnyModalOpen, status, session, router]);

  // 이동 로직
  function getDirectionFromKeys(
    keys: Record<string, boolean>,
  ): Direction | null {
    if (keys["w"] || keys["W"] || keys["ㅈ"] || keys["ArrowUp"]) return 1;
    if (keys["s"] || keys["S"] || keys["ㄴ"] || keys["ArrowDown"]) return 0;
    if (keys["d"] || keys["D"] || keys["ㅇ"] || keys["ArrowRight"]) return 2;
    if (keys["a"] || keys["A"] || keys["ㅁ"] || keys["ArrowLeft"]) return 3;
    return null;
  }

  const throttledPressedKeys = useThrottle(pressedKeys, 100);

  useEffect(() => {
    // 모달/채팅 열림 시 이동X
    if (chatOpen || isAnyModalOpen) return;

    const { users, updateUserPosition } = useUsersStore.getState();
    const meIndex = users.findIndex((u) => u.id === "1");
    if (meIndex < 0) return;

    const me = users[meIndex];
    let { x, y } = me;
    const newDir = getDirectionFromKeys(throttledPressedKeys);

    if (newDir === null) {
      updateUserPosition("1", x, y, me.direction, false);
      return;
    }

    let moved = false;
    if (newDir === 1 && y > 0) {
      y -= MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (
      newDir === 0 &&
      y < MAP_CONSTANTS.MAP_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      y += MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (
      newDir === 2 &&
      x < MAP_CONSTANTS.MAP_WIDTH - MAP_CONSTANTS.IMG_WIDTH
    ) {
      x += MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (newDir === 3 && x > 0) {
      x -= MAP_CONSTANTS.SPEED;
      moved = true;
    }

    if (moved) {
      updateUserPosition("1", x, y, newDir, true);
      emitMovement(x, y, newDir);
    } else {
      updateUserPosition("1", x, y, newDir, false);
    }
  }, [throttledPressedKeys, isAnyModalOpen, chatOpen, emitMovement]);

  // rAF로 캔버스 렌더
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

    const userFrameMap: Record<
      string,
      { frame: number; lastFrameTime: number }
    > = {};
    const frameInterval = 200;
    const maxMovingFrame = 3;

    const render = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 카메라
        const { users } = useUsersStore.getState();
        const me = users.find((u) => u.id === "1");

        let cameraX = 0;
        let cameraY = 0;
        if (me) {
          const centerX = me.x + MAP_CONSTANTS.IMG_WIDTH / 2;
          const centerY = me.y + MAP_CONSTANTS.IMG_HEIGHT / 2;
          const viewWidth = canvas.width / zoomFactor;
          const viewHeight = canvas.height / zoomFactor;
          cameraX = centerX - viewWidth / 2;
          cameraY = centerY - viewHeight / 2;
          cameraX = clamp(cameraX, 0, MAP_CONSTANTS.MAP_WIDTH - viewWidth);
          cameraY = clamp(cameraY, 0, MAP_CONSTANTS.MAP_HEIGHT - viewHeight);
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
            MAP_CONSTANTS.MAP_WIDTH,
            MAP_CONSTANTS.MAP_HEIGHT,
          );
        }

        // 포탈
        portals.forEach((portal) => {
          if (portalGifRef.current) {
            ctx.drawImage(
              portalGifRef.current,
              portal.x,
              portal.y,
              portal.width,
              portal.height,
            );
          } else {
            ctx.fillStyle = "rgba(0,0,255,0.3)";
            ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
          }
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "yellow";
          ctx.textAlign = "center";
          ctx.fillText(
            portal.name,
            portal.x + portal.width / 2,
            portal.y + portal.height + 12,
          );
        });

        // NPC
        npcs.forEach((npc) => {
          const npcImg = npcImages[npc.image];
          if (npcImg) {
            ctx.drawImage(npcImg, npc.x, npc.y, npc.width, npc.height);
            ctx.font = "bold 12px Arial";
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

        // 캐릭터
        const now = performance.now();
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          users.forEach((user) => {
            const { id, x, y, direction, isMoving, nickname } = user;
            if (!userFrameMap[id]) {
              userFrameMap[id] = { frame: 0, lastFrameTime: now };
            }
            const uf = userFrameMap[id];

            if (isMoving) {
              if (now - uf.lastFrameTime > frameInterval) {
                uf.lastFrameTime = now;
                uf.frame++;
                if (uf.frame > maxMovingFrame) {
                  uf.frame = 1;
                }
              }
            } else {
              uf.frame = 0;
              uf.lastFrameTime = now;
            }

            const sx = uf.frame * FRAME_WIDTH;
            const sy = (direction ?? 0) * FRAME_HEIGHT;

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
                x,
                y,
                FRAME_WIDTH,
                FRAME_HEIGHT,
              );
            });
            ctx.restore();

            // 닉네임
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(nickname, x + FRAME_WIDTH / 2, y + FRAME_HEIGHT + 12);
          });
        }

        ctx.restore();
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [backgroundImage, npcImages, spriteImages, canvasSize]);

  return (
    <>
      {/* 숨긴 포탈 GIF 로딩 */}
      <Image
        ref={portalGifRef as React.RefObject<HTMLImageElement>}
        src="/furniture/portal.gif"
        alt="portal"
        width={1}
        height={1}
        style={{ display: "none" }}
        priority
      />
      {/* NPC1 모달 (데일리문제) */}
      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="NPC1 대화"
      >
        <DailyProblemContent />
      </NpcModal>
      {/* NPC2 모달 (QnA) */}
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
      {/* 고정된 사이즈로 캔버스 */}
      <div
        className={Style.canvasContainerClass}
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "auto",
        }}
      >
        {/* (포탈 / NPC) 렌더는 Canvas 내에서 처리 → DOM 컴포넌트는 숨김 */}
        <PortalList portals={[]} />
        <NpcList npcs={[]} />

        {/* Canvas */}
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default LobbyCanvas;
