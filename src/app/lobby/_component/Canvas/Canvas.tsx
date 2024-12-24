"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle";

import { NpcInfo } from "../../_model/Npc";
import { PortalInfo } from "../../_model/Portal";
import { User } from "../../_model/User";
// ---------------------------
// 아래 추가: solved.ac 문제들, QnA 데이터 임포트
// ---------------------------
import { QNA_LIST } from "../../data/qna";
import { SOLVEDAC_CLASS_2_3_4_5 } from "../../data/solvedacProblems";
import LobbyCanvasSurface from "../LobbyCanvasSurface/LobbyCanvasSurface";
import { MAP_CONSTANTS } from "../MapConstants";
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
    y: 180,
    width: 130,
    height: 130,
    route: "/myroom/123",
    name: "마이룸",
  },
  {
    x: 400,
    y: 180,
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
    modalTitle: "NPC1 대화", // 일일 문제 NPC
  },
  {
    x: 800,
    y: 500,
    width: 50,
    height: 80,
    image: "/character/npc2.png",
    modalTitle: "NPC2 대화", // 문제 푼 유저 리스트 확인
  },
  {
    x: 300,
    y: 300,
    width: 60,
    height: 90,
    image: "/character/npc3.png",
    modalTitle: "NPC3 대화", // QnA NPC
  },
];

// ---------------------------
// 임의로 "오늘 문제를 푼 사람"을 저장할 더미 데이터
// 실제로는 서버나 전역 상태관리 (redux, recoil 등)에 연결 가능
// ---------------------------
type SolvedUser = {
  userId: string;
  nickname: string;
  solvedProblemId: number;
  solvedDate: string; // YYYY-MM-DD
};

// 오늘 날짜 (YYYY-MM-DD)
const getTodayString = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// ---------------------------
// 메인 로비 캔버스 컴포넌트
// ---------------------------
const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  // 배경 이미지
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // 캐릭터 이미지들
  const [loadedCharacterImages, setLoadedCharacterImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  // 유저 데이터(내 캐릭터 포함)
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

  // 좌우 방향
  const [isFacingRight, setIsFacingRight] = useState(false);

  // ---------------------------
  // NPC 모달 제어 State
  // ---------------------------
  // 기존 모달 3개 대신, 새로 기능을 나눈 모달 3개
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false); // 일일 문제
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false); // 문제 푼 유저들
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false); // QnA

  const isAnyModalOpen = npc1ModalOpen || npc2ModalOpen || npc3ModalOpen;

  // ---------------------------
  // [NPC 1] 오늘의 문제 관련 로직
  // ---------------------------
  const [dailyProblem, setDailyProblem] = useState<{
    id: number;
    title: string;
    link: string; // 백준 링크 등
  } | null>(null);

  const [isProblemSolved, setIsProblemSolved] = useState(false);

  // 이미 추천된 문제 목록 (id)
  const [usedProblemIds, setUsedProblemIds] = useState<number[]>([]);

  // 오늘 문제를 가져오는 함수 (매일 자정에 갱신)
  const fetchDailyProblem = () => {
    // 1) 아직 사용하지 않은 문제들만 필터링
    const candidates = SOLVEDAC_CLASS_2_3_4_5.filter(
      (p) => !usedProblemIds.includes(p.id),
    );

    if (candidates.length === 0) {
      // 더 이상 추천할 문제가 없다면 null 처리 (또는 기타 예외 처리)
      setDailyProblem(null);
      return;
    }
    // 2) 랜덤으로 한 문제 고르기 (또는 원하는 방식)
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex];

    setDailyProblem({
      id: chosen.id,
      title: chosen.title,
      link: `https://www.acmicpc.net/problem/${chosen.id}`,
    });
    setUsedProblemIds((prev) => [...prev, chosen.id]);
  };

  // "풀었어요" 버튼 누르면
  const handleSolveDailyProblem = () => {
    setIsProblemSolved(true);

    // 칭찬 메세지를 띄우거나, 별도 알림
    alert(`우와~! 대단해요! 문제 #${dailyProblem?.id}를 푸셨군요!`);

    // [NPC 2]에서 확인할 수 있도록, "문제를 푼 유저" 정보에 추가
    if (dailyProblem) {
      const newSolver: SolvedUser = {
        userId: users[myCharacterIndex].id,
        nickname: users[myCharacterIndex].nickname,
        solvedProblemId: dailyProblem.id,
        solvedDate: getTodayString(),
      };
      setDailySolvedUsers((prev) => [...prev, newSolver]);
    }
  };

  // **매일 자정 초기화**:
  // 여기서는 간단히 예시로 setInterval로 매분마다 or 초단위로 체크하는 로직을 둘 수 있지만,
  // 실제로는 **서버**에서 날짜가 바뀔 때마다 초기화 후 가져오거나, **localStorage**에서 날짜 비교 등으로 처리합니다.
  // 아래는 간단한 클라이언트 사이드 예시입니다.
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      // 자정 시각(00:00)이 되었는지 여부를 매 초단위로 확인 (예시)
      if (
        now.getHours() === 0 &&
        now.getMinutes() === 0 &&
        now.getSeconds() === 0
      ) {
        // state 초기화
        setIsProblemSolved(false);
        fetchDailyProblem();
      }
    };

    // 초단위로 체크(예시)
    const interval = setInterval(checkMidnight, 1000);

    // 컴포넌트 마운트 시(최초)에 오늘 문제 설정
    fetchDailyProblem();

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // [NPC 2] 오늘 문제를 푼 유저 리스트
  // ---------------------------
  const [dailySolvedUsers, setDailySolvedUsers] = useState<SolvedUser[]>([
    // 예시로 임의 유저 1명이 푼 상태로 시작
    {
      userId: "testUser",
      nickname: "테스트유저",
      solvedProblemId: 1018, // "체스판 다시 칠하기"라고 가정
      solvedDate: getTodayString(),
    },
  ]);

  // ---------------------------
  // [NPC 3] QnA
  // ---------------------------
  // QNA_LIST = [{ question: string, answer: string }, ...]
  const [selectedQnaIndex, setSelectedQnaIndex] = useState<number | null>(null);

  // QnA 항목 클릭
  const handleQnaClick = (index: number) => {
    setSelectedQnaIndex((prev) => (prev === index ? null : index));
  };

  // ---------------------------
  // 포탈 충돌 체크
  // ---------------------------
  const getPortalRouteIfOnPortal = (): string | null => {
    const myChar = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myChar.x,
      myChar.x + MAP_CONSTANTS.IMG_WIDTH,
      myChar.y,
      myChar.y + MAP_CONSTANTS.IMG_HEIGHT,
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

  // ---------------------------
  // NPC 충돌 체크
  // ---------------------------
  const getNpcIndexIfOnNpc = (): number | null => {
    const myChar = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myChar.x,
      myChar.x + MAP_CONSTANTS.IMG_WIDTH,
      myChar.y,
      myChar.y + MAP_CONSTANTS.IMG_HEIGHT,
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

  // ---------------------------
  // 캐릭터 이동 로직
  // ---------------------------
  useEffect(() => {
    if (isAnyModalOpen) return;
    const updated = [...users];
    const me = updated[myCharacterIndex];

    // --- Up ---
    if (
      (throttledPressedKeys["w"] ||
        throttledPressedKeys["W"] ||
        throttledPressedKeys["ㅈ"] ||
        throttledPressedKeys["ArrowUp"]) &&
      me.y > 0
    ) {
      me.y -= MAP_CONSTANTS.SPEED;
    }

    // --- Left ---
    if (
      (throttledPressedKeys["a"] ||
        throttledPressedKeys["A"] ||
        throttledPressedKeys["ㅁ"] ||
        throttledPressedKeys["ArrowLeft"]) &&
      me.x > 0
    ) {
      me.x -= MAP_CONSTANTS.SPEED;
      setIsFacingRight(false);
    }

    // --- Down ---
    if (
      (throttledPressedKeys["s"] ||
        throttledPressedKeys["S"] ||
        throttledPressedKeys["ㄴ"] ||
        throttledPressedKeys["ArrowDown"]) &&
      me.y < MAP_CONSTANTS.CANVAS_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      me.y += MAP_CONSTANTS.SPEED;
    }

    // --- Right ---
    if (
      (throttledPressedKeys["d"] ||
        throttledPressedKeys["D"] ||
        throttledPressedKeys["ㅇ"] ||
        throttledPressedKeys["ArrowRight"]) &&
      me.x < MAP_CONSTANTS.CANVAS_WIDTH - MAP_CONSTANTS.IMG_WIDTH
    ) {
      me.x += MAP_CONSTANTS.SPEED;
      setIsFacingRight(true);
    }

    setUsers(updated);
  }, [throttledPressedKeys, isAnyModalOpen]);

  // ---------------------------
  // 배경 이미지 로드
  // ---------------------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // ---------------------------
  // 캐릭터 이미지 로드
  // ---------------------------
  useEffect(() => {
    const entries = Object.entries(characterImages);
    if (entries.length === 0) return;

    const tempObj: { [key: string]: HTMLImageElement } = {};
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
  // 키 이벤트
  // ---------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));

      // 스페이스바 → 포탈 / NPC 상호작용
      if (e.key === " ") {
        const portalRoute = getPortalRouteIfOnPortal();
        if (portalRoute) {
          router.push(portalRoute);
          return;
        }
        const npcIndex = getNpcIndexIfOnNpc();
        if (npcIndex !== null) {
          // NPC 1 / NPC 2 / NPC 3
          if (npcIndex === 0) setNpc1ModalOpen(true);
          else if (npcIndex === 1) setNpc2ModalOpen(true);
          else if (npcIndex === 2) setNpc3ModalOpen(true);
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
  // 실제 draw 로직 (LobbyCanvasSurface용)
  // ---------------------------
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
    // 캐릭터들
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
  // 메이플스토리 퀘스트창 스타일 예시
  // (실제로는 별도 CSS/Styled-component로 관리)
  // ---------------------------
  const questModalStyle: React.CSSProperties = {
    background: "#f3d8ae url('/images/quest-window-bg.png') repeat", // 임의 배경
    border: "2px solid #8b4513",
    borderRadius: 8,
    padding: "16px",
    color: "#000",
    fontFamily: "MaplestoryOTFBold, sans-serif", // 실제 메이플 폰트(예시)
  };

  // ---------------------------
  // NPC 1 모달 내용
  // ---------------------------
  const renderNpc1Content = () => {
    if (!dailyProblem) {
      return (
        <>
          <p>더 이상 추천할 문제가 없어요. (또는 로딩중)</p>
        </>
      );
    }
    return (
      <div style={questModalStyle}>
        <h3>오늘의 문제</h3>
        <p>
          <strong>
            {dailyProblem.id} : {dailyProblem.title}
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

  // ---------------------------
  // NPC 2 모달 내용
  // ---------------------------
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

  // ---------------------------
  // NPC 3 모달 내용
  // ---------------------------
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

  return (
    <>
      {/* NPC 모달들 */}
      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="NPC1 대화"
      >
        {renderNpc1Content()}
      </NpcModal>
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        title="NPC2 대화"
      >
        {renderNpc2Content()}
      </NpcModal>
      <NpcModal
        isOpen={npc3ModalOpen}
        onClose={() => setNpc3ModalOpen(false)}
        title="NPC3 대화"
      >
        {renderNpc3Content()}
      </NpcModal>

      {/* 전체 화면 */}
      <div className={Style.canvasContainerClass}>
        {/* 포탈 UI */}
        <PortalList portals={portals} />

        {/* NPC UI */}
        <NpcList npcs={npcs} />

        {/* 캔버스 (requestAnimationFrame 로직) */}
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
