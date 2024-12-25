"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ------------ (원래 훅) -------------
import { useMovementSocket } from "@/hooks/useMovementSocket"; // 필요하다면 (예: emitMovement)
import useThrottle from "@/hooks/useThrottle"; // 필요하다면
// ------------ (Zustand) -------------
import useUsersStore from "@/store/useUsersStore";

// -----------------------------------
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
import characterImages from "./CharacterArray";

// -----------------------------------

/** 오늘 날짜 구하는 유틸 */
const getTodayString = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/** 포탈 정보 (예시) */
const portals: PortalInfo[] = [
  {
    x: 650,
    y: 250,
    width: 130,
    height: 130,
    route: "/myroom/123",
    name: "마이룸",
  },
  {
    x: 400,
    y: 250,
    width: 130,
    height: 130,
    route: "/meetingroom/123",
    name: "회의실",
  },
];

/** NPC 정보 (예시) */
const npcs: NpcInfo[] = [
  {
    x: 350,
    y: 600,
    width: 50,
    height: 80,
    image: "/character/npc1.png",
    modalTitle: "NPC1 대화",
    name: "NPC1",
  },
  {
    x: 800,
    y: 500,
    width: 50,
    height: 80,
    image: "/character/npc2.png",
    modalTitle: "NPC2 대화",
    name: "NPC2",
  },
  {
    x: 300,
    y: 300,
    width: 60,
    height: 90,
    image: "/character/npc3.png",
    modalTitle: "NPC3 대화",
    name: "NPC3",
  },
  {
    x: 490,
    y: 110,
    width: 200,
    height: 90,
    image: "/furniture/board.png",
    modalTitle: "공지사항 NPC",
    name: "공지사항",
  },
];

/** 오늘 문제를 푼 유저 타입 */
type SolvedUser = {
  userId: string;
  nickname: string;
  solvedProblemId: number;
  solvedDate: string;
};

const LobbyCanvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // -------------------------------------
  // 1) Zustand users (React 구독 x)
  // -------------------------------------
  const myUserId = "1";

  // -------------------------------------
  // 2) 소켓 훅 (필요하면 사용)
  // -------------------------------------
  const { movementLogs, emitMovement } = useMovementSocket({
    roomId: "floor07",
    userId: myUserId,
  });

  // -------------------------------------
  // 3) 배경 / 캐릭터 로드
  // -------------------------------------
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  const [loadedCharacterImages, setLoadedCharacterImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  // -------------------------------------
  // 4) 모달 제어 (NPC1,2,3 + Notice)
  // -------------------------------------
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

  // -------------------------------------
  // 5) 일일 문제, QnA, 풀이 유저
  // -------------------------------------
  const [dailyProblem, setDailyProblem] = useState<{
    id: number;
    title: string;
    link: string;
  } | null>(null);

  const [isProblemSolved, setIsProblemSolved] = useState(false);
  const [dailySolvedUsers, setDailySolvedUsers] = useState<SolvedUser[]>([]);
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);

  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  /** 공지사항 작성 */
  const handleAddNotice = () => {
    if (!writerName.trim() || !writerMessage.trim()) return;
    setNoticeList((prev) => [
      ...prev,
      { id: prev.length + 1, name: writerName, message: writerMessage },
    ]);
    setWriterName("");
    setWriterMessage("");
  };

  /** 서버에서 데이터 불러오기 (예시) */
  const fetchDataFromServer = async () => {
    setDailyProblem({
      id: 1018,
      title: "체스판 다시 칠하기",
      link: "https://www.acmicpc.net/problem/1018",
    });
    setDailySolvedUsers([
      {
        userId: "testUserA",
        nickname: "테스트유저A",
        solvedProblemId: 1018,
        solvedDate: getTodayString(),
      },
      {
        userId: "testUserB",
        nickname: "테스트유저B",
        solvedProblemId: 1018,
        solvedDate: getTodayString(),
      },
    ]);
  };

  useEffect(() => {
    fetchDataFromServer();
  }, []);

  /** 일일 문제 풀이 */
  const handleSolveDailyProblem = () => {
    if (!dailyProblem) return;
    setIsProblemSolved(true);
    alert(`우와~! 대단해요! 문제 #${dailyProblem.id}를 푸셨군요!`);

    // 현재 유저 id, nickname 가져오기 (Zustand에서)
    const usersState = useUsersStore.getState().users;
    const me = usersState.find((u) => u.id === myUserId);

    setDailySolvedUsers((prev) => [
      ...prev,
      {
        userId: myUserId,
        nickname: me?.nickname || "Unknown",
        solvedProblemId: dailyProblem.id,
        solvedDate: getTodayString(),
      },
    ]);
  };

  /** 모달이 하나라도 열려있나? */
  const isAnyModalOpen =
    npc1ModalOpen || npc2ModalOpen || npc3ModalOpen || noticeModalOpen;

  // -------------------------------------
  // 6) 포탈 / NPC 충돌 체크
  // -------------------------------------
  const getPortalRouteIfOnPortal = (): string | null => {
    const usersState = useUsersStore.getState().users;
    const me = usersState.find((u) => u.id === myUserId);
    if (!me) return null;

    const [cl, cr, ct, cb] = [me.x, me.x + 50, me.y, me.y + 150];
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
  };

  const getNpcIndexIfOnNpc = (): number | null => {
    const usersState = useUsersStore.getState().users;
    const me = usersState.find((u) => u.id === myUserId);
    if (!me) return null;

    const [cl, cr, ct, cb] = [me.x, me.x + 50, me.y, me.y + 150];
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
  };

  // -------------------------------------
  // 7) 키 입력 & 이동 (내 캐릭터만)
  // -------------------------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledPressedKeys = useThrottle(pressedKeys, 100);
  const [isFacingRight, setIsFacingRight] = useState(false);

  useEffect(() => {
    if (isAnyModalOpen) return;

    const usersState = useUsersStore.getState().users;
    const meIndex = usersState.findIndex((u) => u.id === myUserId);
    if (meIndex < 0) return;

    let { x, y } = usersState[meIndex];
    let moved = false;

    // Up
    if (
      throttledPressedKeys["w"] ||
      throttledPressedKeys["W"] ||
      throttledPressedKeys["ㅈ"] ||
      throttledPressedKeys["ArrowUp"]
    ) {
      if (y > 0) {
        y -= MAP_CONSTANTS.SPEED;
        moved = true;
      }
    }
    // Left
    if (
      throttledPressedKeys["a"] ||
      throttledPressedKeys["A"] ||
      throttledPressedKeys["ㅁ"] ||
      throttledPressedKeys["ArrowLeft"]
    ) {
      if (x > 0) {
        x -= MAP_CONSTANTS.SPEED;
        setIsFacingRight(false);
        moved = true;
      }
    }
    // Down
    if (
      throttledPressedKeys["s"] ||
      throttledPressedKeys["S"] ||
      throttledPressedKeys["ㄴ"] ||
      throttledPressedKeys["ArrowDown"]
    ) {
      if (y < MAP_CONSTANTS.CANVAS_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT) {
        y += MAP_CONSTANTS.SPEED;
        moved = true;
      }
    }
    // Right
    if (
      throttledPressedKeys["d"] ||
      throttledPressedKeys["D"] ||
      throttledPressedKeys["ㅇ"] ||
      throttledPressedKeys["ArrowRight"]
    ) {
      if (x < MAP_CONSTANTS.CANVAS_WIDTH - MAP_CONSTANTS.IMG_WIDTH) {
        x += MAP_CONSTANTS.SPEED;
        setIsFacingRight(true);
        moved = true;
      }
    }

    if (moved) {
      useUsersStore.getState().updateUserPosition(myUserId, x, y);
      emitMovement(x, y);
    }
  }, [throttledPressedKeys, isAnyModalOpen]);

  // -------------------------------------
  // 8) 스페이스바 → 포탈/NPC 상호작용
  // -------------------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;

      if (e.key === " ") {
        const portalRoute = getPortalRouteIfOnPortal();
        if (portalRoute) {
          router.push(portalRoute);
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

    const onKeyUp = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isAnyModalOpen]);

  // -------------------------------------
  // 9) 배경 / 캐릭터 이미지 로드
  // -------------------------------------
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  useEffect(() => {
    const entries = Object.entries(characterImages);
    if (entries.length === 0) return;

    const tempObj: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const total = entries.length;

    entries.forEach(([charType, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        tempObj[charType] = img;
        loadedCount++;
        if (loadedCount === total) {
          setLoadedCharacterImages(tempObj);
        }
      };
    });
  }, []);

  // -------------------------------------
  // 10) Canvas 렌더링 (requestAnimationFrame + 30fps 제한)
  // -------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 원하는 fps
    const fps = 30;
    const frameDuration = 1000 / fps;

    let lastTime = 0;
    let animationId: number;

    const render = (time: number) => {
      // time: requestAnimationFrame으로부터 넘겨받은 현재 시점 (ms)

      // delta 계산
      const delta = time - lastTime;

      // 'frameDuration'이상 지났다면 그리기
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // == 실제 그리기 로직 ==

        // 1) Clear
        ctx.clearRect(
          0,
          0,
          MAP_CONSTANTS.CANVAS_WIDTH,
          MAP_CONSTANTS.CANVAS_HEIGHT,
        );

        // 2) 배경
        if (backgroundImage) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            MAP_CONSTANTS.CANVAS_WIDTH,
            MAP_CONSTANTS.CANVAS_HEIGHT,
          );
        }

        // 3) 캐릭터들
        const { users } = useUsersStore.getState();
        users.forEach((user) => {
          const charImg = loadedCharacterImages[user.characterType];
          if (charImg) {
            const isMe = user.id === myUserId;
            const facingRight = isMe ? isFacingRight : false;

            ctx.save();
            if (facingRight) {
              ctx.translate(
                user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
                user.y + MAP_CONSTANTS.IMG_HEIGHT / 2,
              );
              ctx.scale(-1, 1);
              ctx.drawImage(
                charImg,
                -MAP_CONSTANTS.IMG_WIDTH / 2,
                -MAP_CONSTANTS.IMG_HEIGHT / 2,
                MAP_CONSTANTS.IMG_WIDTH,
                MAP_CONSTANTS.IMG_HEIGHT,
              );
            } else {
              ctx.drawImage(
                charImg,
                user.x,
                user.y,
                MAP_CONSTANTS.IMG_WIDTH,
                MAP_CONSTANTS.IMG_HEIGHT,
              );
            }
            ctx.restore();
          }

          // 닉네임
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            user.nickname,
            user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
            user.y + MAP_CONSTANTS.IMG_HEIGHT + 10,
          );
        });
      }

      // 다음 프레임 예약
      animationId = requestAnimationFrame(render);
    };

    // 최초 호출
    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [backgroundImage, loadedCharacterImages, isFacingRight]);

  // -------------------------------------
  // 리턴: 모달 + 지도 객체(NPC,포탈) + Canvas
  // -------------------------------------
  return (
    <>
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

      {/* 로비 화면 */}
      <div className={Style.canvasContainerClass}>
        <PortalList portals={portals} />
        <NpcList npcs={npcs} />

        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default LobbyCanvas;
