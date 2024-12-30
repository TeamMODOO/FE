// components/LobbyCanvas.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// (1) 공통 소켓 연결
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";
// (2) 로비 전용 소켓 로직 (emitMovement + 이벤트 구독)
import useLobbySocketEvents from "@/hooks/useLobbySocketEvents";
// (3) Zustand (유저 스토어)
import useUsersStore from "@/store/useUsersStore";

import { NoticeItem } from "../../_model/NoticeBoard";
import { NpcInfo } from "../../_model/Npc";
import { PortalInfo } from "../../_model/Portal";
import { QNA_LIST } from "../../data/qna";
import DailyProblemContent from "../DailyProblem/DailyProblemContent";
// 기타 import (모달, NPC, 포탈 등)
import { MAP_CONSTANTS } from "../MapConstants";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import QnaContent from "../Qna/QnaContent";
import SolvedUsersContent from "../SolvedUsers/SolvedUsersContent";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

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

  // 1) 공통 소켓 연결 (한 번만 있으면 되므로,
  //    _app.tsx나 Layout에 배치해도 OK. 여기선 예시로 사용)
  useMainSocketConnect();

  // 2) 로비 전용 이벤트 + emitMovement
  const myUserId = "1";
  const { emitMovement } = useLobbySocketEvents({
    roomId: "floor07",
    userId: myUserId,
  });

  // 3) 배경 / 캐릭터 이미지 로드
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [loadedCharacterImages, setLoadedCharacterImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  // -------- 모달/공지사항/QnA 관련 --------
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

  // -------- 일일 문제 & 풀이 유저 --------
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

  const fetchDataFromServer = async () => {
    // ex) 서버에서 문제/풀이 유저 불러오기
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

  const handleSolveDailyProblem = () => {
    if (!dailyProblem) return;
    setIsProblemSolved(true);
    alert(`문제 #${dailyProblem.id}를 푸셨군요!`);

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

  // 모달 열려있으면 이동 막기
  const isAnyModalOpen =
    npc1ModalOpen || npc2ModalOpen || npc3ModalOpen || noticeModalOpen;

  // -------- 포탈 / NPC 충돌 체크 --------
  const getPortalRouteIfOnPortal = (): string | null => {
    const { users } = useUsersStore.getState();
    const me = users.find((u) => u.id === myUserId);
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
    const { users } = useUsersStore.getState();
    const me = users.find((u) => u.id === myUserId);
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

  // -------- 키 입력 & 이동 --------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const [isFacingRight, setIsFacingRight] = useState(false);

  useEffect(() => {
    if (isAnyModalOpen) return;

    const { users, updateUserPosition } = useUsersStore.getState();
    const meIndex = users.findIndex((u) => u.id === myUserId);
    if (meIndex < 0) return;

    let { x, y } = users[meIndex];
    let moved = false;

    // 예시: w, a, s, d (대소문자 + 한글 자판), arrow
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
    if (
      pressedKeys["a"] ||
      pressedKeys["A"] ||
      pressedKeys["ㅁ"] ||
      pressedKeys["ArrowLeft"]
    ) {
      if (x > 0) {
        x -= MAP_CONSTANTS.SPEED;
        setIsFacingRight(false);
        moved = true;
      }
    }
    if (
      pressedKeys["s"] ||
      pressedKeys["S"] ||
      pressedKeys["ㄴ"] ||
      pressedKeys["ArrowDown"]
    ) {
      if (y < MAP_CONSTANTS.CANVAS_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT) {
        y += MAP_CONSTANTS.SPEED;
        moved = true;
      }
    }
    if (
      pressedKeys["d"] ||
      pressedKeys["D"] ||
      pressedKeys["ㅇ"] ||
      pressedKeys["ArrowRight"]
    ) {
      if (x < MAP_CONSTANTS.CANVAS_WIDTH - MAP_CONSTANTS.IMG_WIDTH) {
        x += MAP_CONSTANTS.SPEED;
        setIsFacingRight(true);
        moved = true;
      }
    }

    if (moved) {
      // 1) 로컬(전역 store) 위치 업데이트
      updateUserPosition(myUserId, x, y);
      // 2) 서버 emitMovement
      emitMovement(x, y);
    }
  }, [pressedKeys, isAnyModalOpen, emitMovement]);

  // -------- 스페이스바 -> 포탈/NPC --------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;

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

  // -------- 배경 & 캐릭터 이미지 로드 --------
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

  // -------- Canvas rAF 30fps --------
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
    let animationId: number;

    const render = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // 1) Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        // 3) 캐릭터 (전역 store)
        const { users } = useUsersStore.getState();
        users.forEach((user) => {
          const charImg = loadedCharacterImages[user.characterType];
          if (!charImg) return;

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

          // 닉네임 표시
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
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [backgroundImage, loadedCharacterImages, isFacingRight]);

  // -------- 리턴 (모달들 + NPC/포탈 + Canvas) --------
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

      <div className={Style.canvasContainerClass}>
        <PortalList portals={portals} />
        <NpcList npcs={npcs} />

        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default LobbyCanvas;
