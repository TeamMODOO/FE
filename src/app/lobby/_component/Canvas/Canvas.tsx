"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/useLoadSprites";
import useLobbySocketEvents from "@/hooks/useLobbySocketEvents";
import useMainSocketConnect from "@/hooks/useMainSocketConnect";
import useUsersStore from "@/store/useUsersStore";

import { NoticeItem } from "../../_model/NoticeBoard";
import { NpcInfo } from "../../_model/Npc";
import { PortalInfo } from "../../_model/Portal";
import { QNA_LIST } from "../../data/qna";
import DailyProblemContent from "../DailyProblem/DailyProblemContent";
import { MAP_CONSTANTS } from "../MapConstants";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import QnaContent from "../Qna/QnaContent";
import SolvedUsersContent from "../SolvedUsers/SolvedUsersContent";
import Style from "./Canvas.style";

/** 스프라이트/이동에 사용하는 타입들 */
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
    x: 650,
    y: 250,
    width: 50,
    height: 50,
    route: "/myroom/123",
    name: "마이룸",
  },
  {
    x: 400,
    y: 250,
    width: 50,
    height: 50,
    route: "/meetingroom/123",
    name: "회의실",
  },
];

/** NPC 정보 */
const npcs: NpcInfo[] = [
  {
    x: 300,
    y: 400,
    width: 20,
    height: 35,
    image: "/character/npc1.png",
    modalTitle: "NPC1 대화",
    name: "NPC1",
  },
  {
    x: 330,
    y: 300,
    width: 20,
    height: 35,
    image: "/character/npc2.png",
    modalTitle: "NPC2 대화",
    name: "NPC2",
  },
  {
    x: 250,
    y: 300,
    width: 25,
    height: 35,
    image: "/character/npc3.png",
    modalTitle: "NPC3 대화",
    name: "NPC3",
  },
  {
    x: 490,
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

  // 1) 공통 소켓 연결
  useMainSocketConnect();

  // 2) 로비 소켓 이벤트
  const myUserId = "1";
  const { emitMovement } = useLobbySocketEvents({
    roomId: "floor07",
    userId: "user_id",
  });

  // ★ 스프라이트 로딩 훅 호출
  const spriteImages = useLoadSprites();

  // ------------------ 배경 이미지 ------------------
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // ------------------ 포탈 GIF ------------------
  const portalGifRef = useRef<HTMLImageElement | null>(null);

  // ------------------ NPC 이미지 ------------------
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

  // ------------------ 모달/공지/QnA ------------------
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false);
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

  const [dailyProblem, setDailyProblem] = useState<{
    id: number;
    title: string;
    link: string;
  } | null>(null);
  const [isProblemSolved, setIsProblemSolved] = useState(false);
  const [dailySolvedUsers, setDailySolvedUsers] = useState<SolvedUser[]>([]);
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);

  useEffect(() => {
    // 예시
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

  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  const isAnyModalOpen =
    npc1ModalOpen || npc2ModalOpen || npc3ModalOpen || noticeModalOpen;

  // ------------------ 포탈 / NPC 충돌 ------------------
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
      if (overlap) return portal.route;
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

  // ------------------ 키 입력 & 이동 상태 ------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState<Direction>(0);
  const [isMoving, setIsMoving] = useState(false);

  // ------------------------------
  // 모달 닫힘 감지하여 pressedKeys 초기화
  // ------------------------------
  useEffect(() => {
    if (!isAnyModalOpen) {
      // 모든 모달이 닫힌 경우 → 키 상태 리셋
      setPressedKeys({});
    }
  }, [isAnyModalOpen]);

  // 키 이벤트 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      const blocked = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
      if (blocked.includes(e.key)) {
        e.preventDefault();
      }

      // 스페이스 → 포탈 or NPC
      if (e.key === " ") {
        const route = getPortalRouteIfOnPortal();
        if (route) {
          router.push(route);
          return;
        }
        const npcIndex = getNpcIndexIfOnNpc();
        if (npcIndex !== null) {
          if (npcIndex === 0) setNpc1ModalOpen(true);
          else if (npcIndex === 1) setNpc2ModalOpen(true);
          else if (npcIndex === 2) setNpc3ModalOpen(true);
          else if (npcIndex === 3) setNoticeModalOpen(true);
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

  // 방향 계산
  function handleDirectionKeys(): Direction {
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
    return direction; // 기존 유지
  }

  // 이동 로직
  useEffect(() => {
    if (isAnyModalOpen) return;

    const { users, updateUserPosition } = useUsersStore.getState();
    const meIndex = users.findIndex((u) => u.id === myUserId);
    if (meIndex < 0) return;

    let { x, y } = users[meIndex];
    let moved = false;

    const newDir = handleDirectionKeys();
    setDirection(newDir);

    // 상
    if (
      pressedKeys["w"] ||
      pressedKeys["W"] ||
      pressedKeys["ㅈ"] ||
      pressedKeys["ArrowUp"]
    ) {
      if (y > 0) {
        y -= MAP_CONSTANTS.SPEED;
        moved = true;
      }
    }
    // 하
    if (
      pressedKeys["s"] ||
      pressedKeys["S"] ||
      pressedKeys["ㄴ"] ||
      pressedKeys["ArrowDown"]
    ) {
      if (y < MAP_CONSTANTS.MAP_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT) {
        y += MAP_CONSTANTS.SPEED;
        moved = true;
      }
    }
    // 우
    if (
      pressedKeys["d"] ||
      pressedKeys["D"] ||
      pressedKeys["ㅇ"] ||
      pressedKeys["ArrowRight"]
    ) {
      if (x < MAP_CONSTANTS.MAP_WIDTH - MAP_CONSTANTS.IMG_WIDTH) {
        x += MAP_CONSTANTS.SPEED;
        moved = true;
      }
    }
    // 좌
    if (
      pressedKeys["a"] ||
      pressedKeys["A"] ||
      pressedKeys["ㅁ"] ||
      pressedKeys["ArrowLeft"]
    ) {
      if (x > 0) {
        x -= MAP_CONSTANTS.SPEED;
        moved = true;
      }
    }

    // 실제로 이동했다면
    if (moved) {
      updateUserPosition(myUserId, x, y, newDir, true);
      emitMovement(x, y, newDir);
      setIsMoving(true);
    } else {
      // 안 움직임
      updateUserPosition(myUserId, x, y, newDir, false);
      setIsMoving(false);
    }
  }, [pressedKeys, isAnyModalOpen, emitMovement]);

  // ------------------ 카메라/줌 & rAF 그리기 ------------------
  const zoomFactor = 2;
  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fps = 30;
    const frameDuration = 1000 / fps;
    let lastTime = 0;
    let animationId = 0;

    // user별 애니메이션 프레임
    const userFrameMap: Record<
      string,
      { frame: number; lastFrameTime: number }
    > = {};
    const frameInterval = 200; // 이동시 프레임 전환 속도
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
            ctx.fillStyle = "rgba(255,0,0,0.3)";
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
          }
        });

        // 6) 캐릭터(유저) 스프라이트
        const now = performance.now();
        if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
          // 스프라이트가 모두 로딩된 경우에만 그림
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

            // ★ 분리된 스프라이트 로딩 훅에서 가져온 spriteImages 활용
            ctx.save();
            LAYER_ORDER.forEach((layer) => {
              const img = spriteImages[layer];
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
  }, [backgroundImage, spriteImages, npcImages]);

  // ------------------ 리턴 ------------------
  return (
    <>
      {/* 숨긴 포탈 GIF */}
      <img
        ref={portalGifRef}
        src="/furniture/portal.gif"
        alt="portal"
        style={{ display: "none" }}
      />

      {/* NPC1 모달 */}
      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="NPC1 대화"
      >
        <DailyProblemContent
          dailyProblem={dailyProblem}
          isProblemSolved={isProblemSolved}
          handleSolveDailyProblem={handleSolveDailyProblem}
        />
      </NpcModal>

      {/* NPC2 모달 */}
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        title="NPC2 대화"
      >
        <SolvedUsersContent
          dailySolvedUsers={dailySolvedUsers}
          getTodayString={getTodayString}
        />
      </NpcModal>

      {/* NPC3 모달 */}
      <NpcModal
        isOpen={npc3ModalOpen}
        onClose={() => setNpc3ModalOpen(false)}
        title="NPC3 대화"
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

      <div className={Style.canvasContainerClass}>
        <PortalList portals={[]} />
        <NpcList npcs={[]} />
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default LobbyCanvas;
