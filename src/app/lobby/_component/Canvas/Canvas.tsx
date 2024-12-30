"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/performance/useThrottle";
// (1) 공통 소켓 연결
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/useLoadSprites";
import useLobbySocketEvents from "@/hooks/useLobbySocketEvents";
// (3) Zustand (유저 스토어)
import useUsersStore from "@/store/useUsersStore";

import { NoticeItem } from "../../_model/NoticeBoard";
import { NpcInfo } from "../../_model/Npc";
import { PortalInfo } from "../../_model/Portal";
import { QNA_LIST } from "../../data/qna";
import DailyProblemContent from "../DailyProblem/DailyProblemContent";
import { EnterMeetingRoom } from "../enter-meeting_room/enter-meeting_room";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import QnaContent from "../Qna/QnaContent";
import Style from "./Canvas.style";

const MAP_CONSTANTS = {
  // 아래 두 값은 초깃값(혹은 fallback)일 뿐,
  // 실제로는 컴포넌트 마운트 시점에 window.innerWidth / window.innerHeight로 재할당 해줄 예정
  CANVAS_WIDTH: 1400,
  CANVAS_HEIGHT: 800,

  // 캐릭터(등등) 사이즈
  IMG_WIDTH: 50,
  IMG_HEIGHT: 150,
  SPEED: 10,

  // 실제 맵 전체의 크기
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

function getTodayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 포탈 정보 */
const portals: PortalInfo[] = [
  {
    x: 720,
    y: 250,
    width: 50,
    height: 50,
    route: "/myroom/123",
    name: "마이룸",
  },
  {
    x: 450,
    y: 250,
    width: 50,
    height: 50,
    route: "/meetingroom/123", // (회의실)
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
    name: "NPC2", // ← QnA 기능 포함
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

const LobbyCanvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 소켓 연결
  useMainSocketConnect();

  // (로비 소켓 이벤트) - 좌표 이동
  const myUserId = "1";
  const clientId = localStorage.getItem("client_id") || "anonymous";
  const { emitMovement } = useLobbySocketEvents({
    roomId: "floor07",
    userId: clientId,
  });

  // --------------------------------------------------
  // 1) 화면 사이즈를 가져와, CANVAS_WIDTH / CANVAS_HEIGHT를 갱신
  // --------------------------------------------------
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({
    w: MAP_CONSTANTS.CANVAS_WIDTH,
    h: MAP_CONSTANTS.CANVAS_HEIGHT,
  });

  useEffect(() => {
    // 마운트 시점에 window 크기를 읽어서 고정
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCanvasSize({ w, h });
    // 리사이즈 이벤트는 등록하지 않음(요구사항대로)
  }, []);

  // --------------------------------------------------
  // 스프라이트 로딩
  // --------------------------------------------------
  const spriteImages = useLoadSprites();

  // --------------------------------------------------
  // 배경
  // --------------------------------------------------
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // --------------------------------------------------
  // 포탈 GIF
  // --------------------------------------------------
  const portalGifRef = useRef<HTMLImageElement | null>(null);

  // --------------------------------------------------
  // NPC 이미지
  // --------------------------------------------------
  const [npcImages, setNpcImages] = useState<Record<string, HTMLImageElement>>(
    {},
  );
  useEffect(() => {
    const temp: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const uniquePaths = Array.from(new Set(npcs.map((npc) => npc.image)));
    uniquePaths.forEach((path) => {
      const img = new Image();
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

  // --------------------------------------------------
  // 모달들
  // --------------------------------------------------
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  // NPC2 → QnA
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  // 공지사항 NPC
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
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

  // --------------------------------------------------
  // 데일리문제(NPC1) & QnA(NPC2)
  // --------------------------------------------------
  const [dailyProblem, setDailyProblem] = useState<{
    id: number;
    title: string;
    link: string;
  } | null>(null);
  const [isProblemSolved, setIsProblemSolved] = useState(false);
  const [dailySolvedUsers, setDailySolvedUsers] = useState<SolvedUser[]>([]);

  // NPC2 QnA
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);
  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    // 예시: 매번 랜덤 문제 or 특정 문제
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
    const me = users.find((u) => u.id === myUserId);
    if (me) {
      setDailySolvedUsers((prev) => [
        ...prev,
        {
          userId: myUserId,
          nickname: me.nickname,
          solvedProblemId: dailyProblem.id,
          solvedDate: getTodayString(),
        },
      ]);
    }
  };

  // --------------------------------------------------
  // 회의실 모달
  // --------------------------------------------------
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // --------------------------------------------------
  // 모달 열림 여부 -> 이동키 막기
  // --------------------------------------------------
  const isAnyModalOpen =
    npc1ModalOpen || npc2ModalOpen || noticeModalOpen || meetingModalOpen;

  // --------------------------------------------------
  // 포탈 / NPC 충돌 (스페이스바)
  // --------------------------------------------------
  function getPortalRouteIfOnPortal(): string | null {
    const { users } = useUsersStore.getState();
    const me = users.find((u) => u.id === myUserId);
    if (!me) return null;

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
        // 회의실 → 모달
        if (portal.route === "/meetingroom/123") {
          setMeetingModalOpen(true);
          return null;
        }
        return portal.route;
      }
    }
    return null;
  }

  function getNpcIndexIfOnNpc(): number | null {
    const { users } = useUsersStore.getState();
    const me = users.find((u) => u.id === myUserId);
    if (!me) return null;

    const [cl, cr, ct, cb] = [me.x, me.x + 32, me.y, me.y + 32];
    for (let i = 0; i < npcs.length; i++) {
      const npc = npcs[i];
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cl < nr && cr > nl && ct < nb && cb > nt;
      if (overlap) return i;
    }
    return null;
  }

  // --------------------------------------------------
  // 키 입력
  // --------------------------------------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      // 이동키/Space
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      // Space → 포탈/NPC
      if (e.key === " ") {
        const route = getPortalRouteIfOnPortal();
        if (route) {
          router.push(route);
          return;
        }
        const npcIndex = getNpcIndexIfOnNpc();
        if (npcIndex !== null) {
          if (npcIndex === 0) {
            setNpc1ModalOpen(true);
          } else if (npcIndex === 1) {
            setNpc2ModalOpen(true);
          } else if (npcIndex === 2) {
            setNoticeModalOpen(true);
          }
        }
      }

      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
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
  }, [isAnyModalOpen, router]);

  const throttledPressedKeys = useThrottle(pressedKeys, 100);

  // --------------------------------------------------
  // 이동 로직
  // --------------------------------------------------
  function getDirectionFromKeys(
    keys: Record<string, boolean>,
  ): Direction | null {
    if (keys["w"] || keys["W"] || keys["ㅈ"] || keys["ArrowUp"]) return 1; // Up
    if (keys["s"] || keys["S"] || keys["ㄴ"] || keys["ArrowDown"]) return 0; // Down
    if (keys["d"] || keys["D"] || keys["ㅇ"] || keys["ArrowRight"]) return 2; // Right
    if (keys["a"] || keys["A"] || keys["ㅁ"] || keys["ArrowLeft"]) return 3; // Left
    return null;
  }

  useEffect(() => {
    if (isAnyModalOpen) return;

    const { users, updateUserPosition } = useUsersStore.getState();
    const meIndex = users.findIndex((u) => u.id === myUserId);
    if (meIndex < 0) return;

    const me = users[meIndex];
    let { x, y } = me;

    const newDir = getDirectionFromKeys(throttledPressedKeys);
    if (newDir === null) {
      // 멈춤
      updateUserPosition(myUserId, x, y, me.direction, false);
      return;
    }

    let moved = false;
    if (newDir === 1 && y > 0) {
      // Up
      y -= MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (
      newDir === 0 &&
      y < MAP_CONSTANTS.MAP_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      // Down
      y += MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (
      newDir === 2 &&
      x < MAP_CONSTANTS.MAP_WIDTH - MAP_CONSTANTS.IMG_WIDTH
    ) {
      // Right
      x += MAP_CONSTANTS.SPEED;
      moved = true;
    } else if (newDir === 3 && x > 0) {
      // Left
      x -= MAP_CONSTANTS.SPEED;
      moved = true;
    }

    if (moved) {
      updateUserPosition(myUserId, x, y, newDir, true);
      emitMovement(x, y, newDir);
    } else {
      updateUserPosition(myUserId, x, y, newDir, false);
    }
  }, [throttledPressedKeys, isAnyModalOpen, emitMovement]);

  // --------------------------------------------------
  // requestAnimationFrame (배경, NPC, 포탈, 캐릭터 등)
  // --------------------------------------------------
  const zoomFactor = 2;
  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  useEffect(() => {
    // 매번 canvasSize 가 정해진 뒤에만 렌더 로직 수행
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // ★ 여기서 실제 canvas 픽셀 크기를 지정
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    // 렌더링 컨텍스트
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // FPS
    const fps = 30;
    const frameDuration = 1000 / fps;
    let lastTime = 0;
    let animationId = 0;

    // 캐릭터 애니메이션(Frame)
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

        // 1) Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2) 카메라
        const { users } = useUsersStore.getState();
        const me = users.find((u) => u.id === myUserId);

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

        // 3) 배경
        if (backgroundImage) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            MAP_CONSTANTS.MAP_WIDTH,
            MAP_CONSTANTS.MAP_HEIGHT,
          );
        }

        // 4) 포탈
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
            // fallback
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

        // 5) NPC
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
            // fallback
            ctx.fillStyle = "rgba(255,0,0,0.3)";
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
          }
        });

        // 6) 캐릭터
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
            const sy = direction * FRAME_HEIGHT;

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
  }, [backgroundImage, spriteImages, npcImages, canvasSize]);

  return (
    <>
      {/* 숨긴 포탈 GIF 로딩 */}
      <img
        ref={portalGifRef}
        src="/furniture/portal.gif"
        alt="portal"
        style={{ display: "none" }}
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

      {/*
        2) 화면을 “고정된 사이즈의 캔버스”로 만듦
           - 이후 화면 크기를 줄이거나 늘려도 캔버스는 변하지 않음
           - 넘치면 브라우저 스크롤
      */}
      <div
        className={Style.canvasContainerClass}
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "auto",
        }}
      >
        <PortalList portals={[]} />
        <NpcList npcs={[]} />
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default LobbyCanvas;
