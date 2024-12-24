"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle";

import { NoticeItem } from "../../_model/NoticeBoard";
import { NpcInfo } from "../../_model/Npc";
import { PortalInfo } from "../../_model/Portal";
import { User } from "../../_model/User";
// 문제 / QnA 는 서버에서 받아온다고 가정 (QNA_LIST는 예시)
import { QNA_LIST } from "../../data/qna";

// 오늘 날짜 헬퍼
const getTodayString = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// 컴포넌트 import
import LobbyCanvasSurface from "../LobbyCanvasSurface/LobbyCanvasSurface";
import { MAP_CONSTANTS } from "../MapConstants";
import NoticeBoardModal from "../NoticeBoardModal/NoticeBoardModal";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal";
import PortalList from "../Portal/PortalList";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

// ---------------------------
// 포탈 정보
// ---------------------------
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

// ---------------------------
// NPC 정보
// ---------------------------
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

// ---------------------------
// "오늘 문제를 푼 사람" 더미 타입
// ---------------------------
type SolvedUser = {
  userId: string;
  nickname: string;
  solvedProblemId: number;
  solvedDate: string; // YYYY-MM-DD
};

// ---------------------------
// 메인 로비 컴포넌트
// ---------------------------
const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  // 배경 / 캐릭터 이미지
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [loadedCharacterImages, setLoadedCharacterImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  // 유저 데이터
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      x: 850,
      y: 350,
      characterType: "character1",
      nickname: "정글러1",
    },
    {
      id: "2",
      x: 600,
      y: 500,
      characterType: "character2",
      nickname: "정글러2",
    },
    {
      id: "3",
      x: 700,
      y: 400,
      characterType: "character1",
      nickname: "정글러3",
    },
    {
      id: "4",
      x: 800,
      y: 300,
      characterType: "character2",
      nickname: "정글러4",
    },
  ]);
  const myCharacterIndex = 1;

  // 키 입력
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledPressedKeys = useThrottle(pressedKeys, 50);
  const [isFacingRight, setIsFacingRight] = useState(false);

  // ---------------------------
  // 모달 제어
  // ---------------------------
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false); // 오늘의 문제
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false); // 문제 푼 유저들
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false); // QnA
  const [noticeModalOpen, setNoticeModalOpen] = useState(false); // 공지사항

  // 공지사항(게시판)
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

  // 오늘의 문제 / 문제 푼 사람들
  const [dailyProblem, setDailyProblem] = useState<{
    id: number;
    title: string;
    link: string;
  } | null>(null);

  const [dailySolvedUsers, setDailySolvedUsers] = useState<SolvedUser[]>([]);
  const [isProblemSolved, setIsProblemSolved] = useState(false);

  // 모든 모달 닫힘 여부
  const isAnyModalOpen =
    npc1ModalOpen || npc2ModalOpen || npc3ModalOpen || noticeModalOpen;

  // ---------------------------
  // 서버에서 오늘 문제 / 문제 푼 사람들 불러오기 (예시)
  // ---------------------------
  const fetchDataFromServer = async () => {
    try {
      // (1) 오늘의 문제
      // 실제 API 예: const res = await fetch("/api/today-problem");
      // const data = await res.json();
      // setDailyProblem(data);

      // 예시로 하드코딩
      setDailyProblem({
        id: 1018,
        title: "체스판 다시 칠하기",
        link: "https://www.acmicpc.net/problem/1018",
      });

      // (2) 오늘 문제 푼 유저 리스트
      // 실제 API 예: const res2 = await fetch("/api/today-solved-users");
      // const solvedData = await res2.json();
      // setDailySolvedUsers(solvedData);

      // 예시로 하드코딩
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
    } catch (err) {
      // console.error("fetchDataFromServer error:", err);
    }
  };

  // 초기 로드 시 서버 데이터 불러옴
  useEffect(() => {
    fetchDataFromServer();
  }, []);

  // ---------------------------
  // "풀었어요" 버튼 눌렀을 때
  // ---------------------------
  const handleSolveDailyProblem = () => {
    if (!dailyProblem) return;
    setIsProblemSolved(true);
    alert(`우와~! 대단해요! 문제 #${dailyProblem.id}를 푸셨군요!`);

    // 서버에 "해결했다"를 알리는 API 호출이 가능
    // 여기서는 단순 클라이언트 state 업데이트 예시
    setDailySolvedUsers((prev) => [
      ...prev,
      {
        userId: users[myCharacterIndex].id,
        nickname: users[myCharacterIndex].nickname,
        solvedProblemId: dailyProblem.id,
        solvedDate: getTodayString(),
      },
    ]);
  };

  // ---------------------------
  // QnA
  // ---------------------------
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);
  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  // ---------------------------
  // 캐릭터 이동 & 포탈/NPC 충돌
  // ---------------------------
  const getPortalRouteIfOnPortal = (): string | null => {
    const myChar = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myChar.x,
      myChar.x + 50,
      myChar.y,
      myChar.y + 150,
    ];
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
    const myChar = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myChar.x,
      myChar.x + 50,
      myChar.y,
      myChar.y + 150,
    ];
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

  // 키 입력
  useEffect(() => {
    if (isAnyModalOpen) return;
    const updated = [...users];
    const me = updated[myCharacterIndex];

    // 상하좌우 이동
    if (
      (throttledPressedKeys["w"] || throttledPressedKeys["ArrowUp"]) &&
      me.y > 0
    ) {
      me.y -= MAP_CONSTANTS.SPEED;
    }
    if (
      (throttledPressedKeys["a"] || throttledPressedKeys["ArrowLeft"]) &&
      me.x > 0
    ) {
      me.x -= MAP_CONSTANTS.SPEED;
      setIsFacingRight(false);
    }
    if (
      (throttledPressedKeys["s"] || throttledPressedKeys["ArrowDown"]) &&
      me.y < MAP_CONSTANTS.CANVAS_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      me.y += MAP_CONSTANTS.SPEED;
    }
    if (
      (throttledPressedKeys["d"] || throttledPressedKeys["ArrowRight"]) &&
      me.x < MAP_CONSTANTS.CANVAS_WIDTH - MAP_CONSTANTS.IMG_WIDTH
    ) {
      me.x += MAP_CONSTANTS.SPEED;
      setIsFacingRight(true);
    }
    setUsers(updated);
  }, [throttledPressedKeys, isAnyModalOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));

      if (e.key === " ") {
        // 포탈
        const portalRoute = getPortalRouteIfOnPortal();
        if (portalRoute) {
          router.push(portalRoute);
          return;
        }
        // NPC
        const npcIndex = getNpcIndexIfOnNpc();
        if (npcIndex !== null) {
          if (npcIndex === 0) setNpc1ModalOpen(true);
          else if (npcIndex === 1) setNpc2ModalOpen(true);
          else if (npcIndex === 2) setNpc3ModalOpen(true);
          else if (npcIndex === 3) setNoticeModalOpen(true);
        }
      }
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

  // ---------------------------
  // 배경 & 캐릭터 로드
  // ---------------------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    // 배경
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

  // ---------------------------
  // CanvasSurface 렌더 함수
  // ---------------------------
  // --------------------------------------------------
  // (15) 실제 draw 로직 (LobbyCanvasSurface)
  // --------------------------------------------------
  const renderCanvas = (
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
  ) => {
    if (backgroundImage) {
      ctx.drawImage(
        backgroundImage,
        0,
        0,
        MAP_CONSTANTS.CANVAS_WIDTH,
        MAP_CONSTANTS.CANVAS_HEIGHT,
      );
    }
    users.forEach((user, idx) => {
      const charImg = loadedCharacterImages[user.characterType];
      if (!charImg) return;

      const facingRight = idx === myCharacterIndex ? isFacingRight : false;

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
  };

  // ---------------------------
  // NPC 모달 내부 내용
  // ---------------------------
  const questModalStyle: React.CSSProperties = {
    background: "#f3d8ae url('/images/quest-window-bg.png') repeat",
    border: "2px solid #8b4513",
    borderRadius: 8,
    padding: "16px",
    color: "#000",
    fontFamily: "MaplestoryOTFBold, sans-serif",
  };

  // (NPC1) 오늘의 문제
  const renderNpc1Content = () => {
    if (!dailyProblem) {
      return (
        <div style={questModalStyle}>
          <p>서버에서 오늘의 문제를 아직 받지 못했습니다.</p>
        </div>
      );
    }
    return (
      <div style={questModalStyle}>
        <h3>오늘의 문제</h3>
        <p>
          <strong>
            #{dailyProblem.id} : {dailyProblem.title}
          </strong>
        </p>
        <p>
          <a
            href={dailyProblem.link}
            target="_blank"
            rel="noreferrer"
            style={{ color: "blue" }}
          >
            문제 보러가기
          </a>
        </p>
        {!isProblemSolved ? (
          <button onClick={handleSolveDailyProblem}>풀었어요!</button>
        ) : (
          <p style={{ color: "green" }}>문제 해결 완료! 잘하셨어요!</p>
        )}
      </div>
    );
  };

  // (NPC2) 오늘 문제 푼 사람들
  const renderNpc2Content = () => {
    const today = getTodayString();
    const solvedToday = dailySolvedUsers.filter((s) => s.solvedDate === today);

    return (
      <div style={questModalStyle}>
        <h3>오늘 문제 푼 사람 명단</h3>
        {solvedToday.length === 0 ? (
          <p>아직 아무도 문제를 풀지 않았어요!</p>
        ) : (
          solvedToday.map((u, i) => (
            <p key={i}>
              {u.nickname} 님이 #{u.solvedProblemId} 문제를 해결!
            </p>
          ))
        )}
      </div>
    );
  };

  // (NPC3) QnA
  const renderNpc3Content = () => {
    return (
      <div style={questModalStyle}>
        <h3>QnA</h3>
        {QNA_LIST.map((item, index) => {
          const isOpen = selectedQnaIndex === index;
          return (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div
                onClick={() => handleQnaClick(index)}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: isOpen ? "blue" : "black",
                }}
              >
                Q. {item.question}
              </div>
              {isOpen && (
                <div style={{ marginLeft: "16px", marginTop: "4px" }}>
                  A. {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ---------------------------
  // 최종 렌더
  // ---------------------------
  return (
    <>
      {/* NPC1: 오늘의 문제 */}
      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="NPC1 대화"
      >
        {renderNpc1Content()}
      </NpcModal>

      {/* NPC2: 문제 푼 유저들 */}
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        title="NPC2 대화"
      >
        {renderNpc2Content()}
      </NpcModal>

      {/* NPC3: QnA */}
      <NpcModal
        isOpen={npc3ModalOpen}
        onClose={() => setNpc3ModalOpen(false)}
        title="NPC3 대화"
      >
        {renderNpc3Content()}
      </NpcModal>

      {/* 공지사항 게시판 */}
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

      {/* 실제 로비 화면 */}
      <div className={Style.canvasContainerClass}>
        <PortalList portals={portals} />
        <NpcList npcs={npcs} />
        <LobbyCanvasSurface
          canvasRef={canvasRef}
          renderCanvas={renderCanvas}
          users={users}
        />
      </div>
    </>
  );
};

export default LobbyCanvas;
