"use client";

import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";

// (1) UI & Hooks
import { Button } from "@/components/ui/button";
// (2) 스프라이트 로딩 훅 & 상수
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/useLoadSprites";
// (소켓 연결 관련 훅들)
import useMainSocketConnect from "@/hooks/useMainSocketConnect";
import useMyRoomSocketEvents from "@/hooks/useMyRoomSocketEvents";
// (3) Throttle 훅 (값 쓰로틀링)
import useThrottle from "@/hooks/useThrottle";

// (4) 모델/타입
import { Funiture } from "../../_model/Funiture";
import { Direction, User } from "../../_model/User";
// (5) 모달들
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
import TechStackModal from "../TechStackModal/TechStackModal";
// (6) 스타일 & 가구이미지
import Style from "./Canvas.style";
import interiorImages from "./Interior";

/** 예시: 기술 스택 목록 */
const techStackList = [
  "Figma",
  "React",
  "TypeScript",
  "Python",
  "Slack",
  "JavaScript",
  "Next.js",
  "서비스 기획",
  "JIRA",
  "Confluence",
  "Git",
  "Flutter",
  "GitHub",
  "React Native",
  "Excel",
  "ppt",
  "HTML/CSS",
  "Redux",
  "인공지능(AI)",
  "Photoshop",
  "C++",
  "Swift",
  "SwiftUI",
  "iOS",
];

// --------------------------------------------------
// 캔버스/맵 상수
// --------------------------------------------------
const MAP_CONSTANTS = {
  CANVAS_WIDTH: 1500,
  CANVAS_HEIGHT: 830,
  SPEED: 2, // 캐릭터 이동 속도
};

// ★ 캐릭터를 2배로 크게 표시
const CHAR_SCALE = 2; // 2배

const MyRoomCanvas: React.FC = () => {
  // --------------------------------------------------
  // (A) 공통 소켓 연결 + 마이룸 소켓 이벤트
  // --------------------------------------------------
  useMainSocketConnect();
  const myUserId = "1"; // 실제 로그인된 사용자의 id
  const { emitMovement } = useMyRoomSocketEvents({
    roomId: "myRoom-123",
    userId: myUserId,
  });

  // --------------------------------------------------
  // (B) 캔버스 & 배경
  // --------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // --------------------------------------------------
  // (C) 사용자 목록 (간단 예시: local state)
  // --------------------------------------------------
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      x: 500,
      y: 500,
      nickname: "정글러1",
      characterType: "sprite1",
      direction: 0,
      isMoving: false,
    },
    {
      id: "2",
      x: 500,
      y: 450,
      nickname: "정글러2",
      characterType: "sprite2",
      direction: 0,
      isMoving: false,
    },
  ]);

  // --------------------------------------------------
  // (D) 가구
  // --------------------------------------------------
  const [resume, setResume] = useState<Funiture[]>([
    {
      id: "resume-1",
      x: 100,
      y: 100,
      funitureType: "none",
      funiturename: "이력서",
    },
  ]);
  const [portfolio, setPortfolio] = useState<Funiture[]>([
    {
      id: "portfolio-1",
      x: 600,
      y: 100,
      funitureType: "none",
      funiturename: "포트폴리오1",
    },
    {
      id: "portfolio-2",
      x: 780,
      y: 180,
      funitureType: "none",
      funiturename: "포트폴리오2",
    },
    {
      id: "portfolio-3",
      x: 900,
      y: 90,
      funitureType: "none",
      funiturename: "포트폴리오3",
    },
  ]);
  const [technologyStack, setTechnologyStack] = useState<Funiture[]>([
    {
      id: "technologyStack-1",
      x: 230,
      y: 470,
      funitureType: "none",
      funiturename: "기술스택1",
    },
    {
      id: "technologyStack-2",
      x: 370,
      y: 550,
      funitureType: "none",
      funiturename: "기술스택2",
    },
    {
      id: "technologyStack-3",
      x: 1050,
      y: 600,
      funitureType: "none",
      funiturename: "기술스택3",
    },
    {
      id: "technologyStack-4",
      x: 950,
      y: 700,
      funitureType: "none",
      funiturename: "기술스택4",
    },
    {
      id: "technologyStack-5",
      x: 1150,
      y: 680,
      funitureType: "none",
      funiturename: "기술스택5",
    },
    {
      id: "technologyStack-6",
      x: 1000,
      y: 450,
      funitureType: "none",
      funiturename: "기술스택6",
    },
    {
      id: "technologyStack-7",
      x: 1160,
      y: 400,
      funitureType: "none",
      funiturename: "기술스택7",
    },
    {
      id: "technologyStack-8",
      x: 1250,
      y: 200,
      funitureType: "none",
      funiturename: "기술스택8",
    },
    {
      id: "technologyStack-9",
      x: 1350,
      y: 100,
      funitureType: "none",
      funiturename: "기술스택9",
    },
  ]);

  // --------------------------------------------------
  // (E) 게시판(방명록)
  // --------------------------------------------------
  const [board] = useState<Funiture[]>([
    {
      id: "board1",
      x: 190,
      y: 60,
      funitureType: "board",
      funiturename: "게시판",
    },
  ]);
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  interface BoardComment {
    id: number;
    name: string;
    message: string;
  }
  const [boardComments, setBoardComments] = useState<BoardComment[]>([
    { id: 1, name: "WellBeingGuru", message: "방명록 첫 댓글!" },
    { id: 2, name: "John", message: "안녕하세요 :)" },
  ]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");

  // --------------------------------------------------
  // (F) 모달
  // --------------------------------------------------
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);

  const [resumeLink, setResumeLink] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [selectedTech, setSelectedTech] = useState("");

  // --------------------------------------------------
  // (G) 가구 상세 모달
  // --------------------------------------------------
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  // --------------------------------------------------
  // (H) 스프라이트 로딩 훅
  // --------------------------------------------------
  const spriteImages = useLoadSprites();

  // --------------------------------------------------
  // (I) 배경 로드
  // --------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const bg = new Image();
    bg.src = "/background/myroom.webp";
    bg.onload = () => {
      setBackgroundImage(bg);
    };
  }, []);

  // --------------------------------------------------
  // (J) 키 입력 상태
  // --------------------------------------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 이동키(WASD, ㅈㄴㅇㅁ, Arrow*)에 대해서는 기본 스크롤 동작 방지
      if (
        [
          "w",
          "W",
          "ㅈ",
          "s",
          "S",
          "ㄴ",
          "a",
          "A",
          "ㅁ",
          "d",
          "D",
          "ㅇ",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
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
  }, []);

  // --------------------------------------------------
  // (K) 방향 계산 함수
  // --------------------------------------------------
  function getNewDirection(usersList: User[]): Direction {
    const me = usersList.find((u) => u.id === myUserId);
    if (!me) return 0;

    // Up
    if (
      pressedKeys["w"] ||
      pressedKeys["W"] ||
      pressedKeys["ㅈ"] ||
      pressedKeys["ArrowUp"]
    ) {
      return 1; // Up
    }
    // Down
    if (
      pressedKeys["s"] ||
      pressedKeys["S"] ||
      pressedKeys["ㄴ"] ||
      pressedKeys["ArrowDown"]
    ) {
      return 0; // Down
    }
    // Right
    if (
      pressedKeys["d"] ||
      pressedKeys["D"] ||
      pressedKeys["ㅇ"] ||
      pressedKeys["ArrowRight"]
    ) {
      return 2; // Right
    }
    // Left
    if (
      pressedKeys["a"] ||
      pressedKeys["A"] ||
      pressedKeys["ㅁ"] ||
      pressedKeys["ArrowLeft"]
    ) {
      return 3; // Left
    }

    // 아무 키도 누르지 않은 상태면 기존 유지
    return me.direction ?? 0;
  }

  // --------------------------------------------------
  // (L) 스프라이트 애니메이션 프레임 관리 (Ref)
  // --------------------------------------------------
  const userFrameRef = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  useEffect(() => {
    // 초기화
    users.forEach((u) => {
      userFrameRef.current[u.id] = {
        frame: 0,
        lastFrameTime: performance.now(),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // (M) "이동 좌표" state + throttledMovementData
  //     ⇒ useThrottle에 "값"을 넣어서 100ms 단위로 emitMovement
  // --------------------------------------------------
  // 1) 이동 좌표를 state로 관리
  const [movementData, setMovementData] = useState<{
    x: number;
    y: number;
    dir: Direction;
  }>({ x: 500, y: 500, dir: 0 });

  // 2) movementData를 100ms 단위로 쓰로틀링
  const throttledMovementData = useThrottle(movementData, 100);

  // 3) throttledMovementData가 변할 때 emitMovement
  useEffect(() => {
    // 만약 값이 처음 초기화된 상태(기존 값 x=0,y=0...)와 같으면 굳이 emit 안 해도 됨
    // 여기서는 단순히 무조건 emitMovement 하는 예시
    emitMovement(
      throttledMovementData.x,
      throttledMovementData.y,
      throttledMovementData.dir,
    );
  }, [throttledMovementData, emitMovement]);

  // --------------------------------------------------
  // (N) rAF로 이동 & 그리기
  // --------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;

    const frameInterval = 200;
    const maxMovingFrame = 3;

    const loop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // (1) 캐릭터 이동 계산
        setUsers((prevUsers) => {
          const newDir = getNewDirection(prevUsers);

          return prevUsers.map((user) => {
            if (user.id !== myUserId) return user; // 자기 자신만 이동 처리

            let { x, y } = user;
            let moved = false;

            // Up
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
            // Down
            if (
              pressedKeys["s"] ||
              pressedKeys["S"] ||
              pressedKeys["ㄴ"] ||
              pressedKeys["ArrowDown"]
            ) {
              if (
                y + FRAME_HEIGHT * CHAR_SCALE + MAP_CONSTANTS.SPEED <=
                MAP_CONSTANTS.CANVAS_HEIGHT
              ) {
                y += MAP_CONSTANTS.SPEED;
                moved = true;
              }
            }
            // Right
            if (
              pressedKeys["d"] ||
              pressedKeys["D"] ||
              pressedKeys["ㅇ"] ||
              pressedKeys["ArrowRight"]
            ) {
              if (
                x + FRAME_WIDTH * CHAR_SCALE + MAP_CONSTANTS.SPEED <=
                MAP_CONSTANTS.CANVAS_WIDTH
              ) {
                x += MAP_CONSTANTS.SPEED;
                moved = true;
              }
            }
            // Left
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

            // 이동이 있었다면
            if (moved) {
              // (2) movementData 업데이트만 함
              setMovementData({ x, y, dir: newDir });
            }

            return {
              ...user,
              x,
              y,
              direction: newDir,
              isMoving: moved,
            };
          });
        });

        // (3) 캔버스 그리기
        ctx.clearRect(
          0,
          0,
          MAP_CONSTANTS.CANVAS_WIDTH,
          MAP_CONSTANTS.CANVAS_HEIGHT,
        );

        // 배경
        if (backgroundImage) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            MAP_CONSTANTS.CANVAS_WIDTH,
            MAP_CONSTANTS.CANVAS_HEIGHT,
          );
        }

        // 캐릭터 스프라이트
        const now = performance.now();
        users.forEach((user) => {
          const frameData = userFrameRef.current[user.id];
          if (!frameData) {
            userFrameRef.current[user.id] = {
              frame: 0,
              lastFrameTime: now,
            };
            return;
          }

          if (user.isMoving) {
            if (now - frameData.lastFrameTime > frameInterval) {
              frameData.lastFrameTime = now;
              frameData.frame++;
              if (frameData.frame > maxMovingFrame) {
                frameData.frame = 1;
              }
            }
          } else {
            frameData.frame = 0;
            frameData.lastFrameTime = now;
          }

          const sx = frameData.frame * FRAME_WIDTH;
          const sy = user.direction! * FRAME_HEIGHT;

          if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
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
                user.x,
                user.y,
                FRAME_WIDTH * CHAR_SCALE,
                FRAME_HEIGHT * CHAR_SCALE,
              );
            });
            ctx.restore();

            // 닉네임 표시
            ctx.font = "bold 14px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(
              user.nickname,
              user.x + (FRAME_WIDTH * CHAR_SCALE) / 2,
              user.y + FRAME_HEIGHT * CHAR_SCALE + 15,
            );
          }
        });
      }
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [backgroundImage, spriteImages, users, pressedKeys]);

  // --------------------------------------------------
  // (O) 게시판 새 글 작성
  // --------------------------------------------------
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  // --------------------------------------------------
  // (P) 모달 열기
  // --------------------------------------------------
  const handleOpenResumeModal = () => {
    if (resume.filter((r) => r.funitureType !== "none").length >= 1) return;
    setResumeModalOpen(true);
  };
  const handleOpenPortfolioModal = () => {
    if (portfolio.filter((p) => p.funitureType !== "none").length >= 3) return;
    setPortfolioModalOpen(true);
  };
  const handleOpenTechStackModal = () => {
    if (technologyStack.filter((t) => t.funitureType !== "none").length >= 9)
      return;
    setTechStackModalOpen(true);
  };

  // --------------------------------------------------
  // (Q) 모달 저장
  // --------------------------------------------------
  const handleSaveResume = () => {
    const idx = resume.findIndex((r) => r.funitureType === "none");
    if (idx !== -1) {
      setResume((prev) =>
        prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                funitureType: `resume/resume${idx + 1}`,
                data: { resumeLink },
              }
            : item,
        ),
      );
    }
    setResumeModalOpen(false);
    setResumeLink("");
  };
  const handleSavePortfolio = () => {
    if (!portfolioFile) {
      setPortfolioModalOpen(false);
      return;
    }
    const idx = portfolio.findIndex((p) => p.funitureType === "none");
    if (idx !== -1) {
      setPortfolio((prev) =>
        prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                funitureType: `portfolio/portfolio${idx + 1}`,
                data: { fileName: portfolioFile.name },
              }
            : item,
        ),
      );
    }
    setPortfolioModalOpen(false);
    setPortfolioFile(null);
  };
  const handleSaveTechStack = () => {
    if (!selectedTech) {
      setTechStackModalOpen(false);
      return;
    }
    const idx = technologyStack.findIndex((t) => t.funitureType === "none");
    if (idx !== -1) {
      setTechnologyStack((prev) =>
        prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                funitureType: `technologyStack/technologyStack${idx + 1}`,
                data: { stack: selectedTech },
              }
            : item,
        ),
      );
    }
    setTechStackModalOpen(false);
    setSelectedTech("");
  };

  // --------------------------------------------------
  // (R) 가구 클릭 → 상세
  // --------------------------------------------------
  const handleFurnitureClick = (f: Funiture) => {
    // "none" 또는 "board" 타입이면 상세 모달 없음
    if (f.funitureType === "none" || f.funitureType === "board") return;
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  // --------------------------------------------------
  // 버튼 비활성화 여부
  // --------------------------------------------------
  const isResumeButtonDisabled =
    resume.filter((r) => r.funitureType !== "none").length >= 1;
  const isPortfolioButtonDisabled =
    portfolio.filter((p) => p.funitureType !== "none").length >= 3;
  const isTechStackButtonDisabled =
    technologyStack.filter((t) => t.funitureType !== "none").length >= 9;

  // --------------------------------------------------
  // (S) 렌더
  // --------------------------------------------------
  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

      {/* 가구 표시 (이력서/포트폴리오/기술스택) */}
      {[...resume, ...portfolio, ...technologyStack].map((item) => (
        <div
          key={item.id}
          className={Style.furnitureContainerClass}
          style={{ left: item.x, top: item.y }}
          onClick={() => handleFurnitureClick(item)}
        >
          <NextImage
            src={interiorImages[item.funitureType] || interiorImages["none"]}
            alt={item.funiturename}
            width={120}
            height={120}
            priority
          />
          <div className={Style.furnitureTextClass}>{item.funiturename}</div>
        </div>
      ))}

      {/* 게시판(방명록) */}
      {board.map((item) => (
        <div
          key={item.id}
          className={Style.boardContainerClass}
          style={{ left: item.x, top: item.y }}
          onClick={() => setIsBoardOpen(true)}
        >
          <NextImage
            src="/furniture/board.png"
            alt={item.funiturename}
            width={300}
            height={200}
            priority
          />
          <div className="mt-[-10px] text-[14px] font-bold text-white">
            {item.funiturename}
          </div>
        </div>
      ))}

      {/* 우측 하단 버튼 */}
      <div className={Style.bottomButtonsClass}>
        <Button
          onClick={handleOpenResumeModal}
          disabled={isResumeButtonDisabled}
        >
          이력서 추가
        </Button>
        <Button
          onClick={handleOpenPortfolioModal}
          disabled={isPortfolioButtonDisabled}
        >
          포트폴리오 추가
        </Button>
        <Button
          onClick={handleOpenTechStackModal}
          disabled={isTechStackButtonDisabled}
        >
          기술 스택 추가
        </Button>
      </div>

      {/* 모달들 */}
      <ResumeModal
        open={resumeModalOpen}
        onClose={setResumeModalOpen}
        resumeLink={resumeLink}
        setResumeLink={setResumeLink}
        onSave={handleSaveResume}
      />
      <PortfolioModal
        open={portfolioModalOpen}
        onClose={setPortfolioModalOpen}
        portfolioFile={portfolioFile}
        setPortfolioFile={setPortfolioFile}
        onSave={handleSavePortfolio}
      />
      <TechStackModal
        open={techStackModalOpen}
        onClose={setTechStackModalOpen}
        techStackList={techStackList}
        selectedTech={selectedTech}
        setSelectedTech={setSelectedTech}
        onSave={handleSaveTechStack}
      />
      <FurnitureInfoModal
        open={viewModalOpen}
        onClose={setViewModalOpen}
        furniture={selectedFurnitureData}
      />
      <BoardModal
        open={isBoardOpen}
        onClose={setIsBoardOpen}
        boardComments={boardComments}
        visitorName={visitorName}
        visitorMessage={visitorMessage}
        setVisitorName={setVisitorName}
        setVisitorMessage={setVisitorMessage}
        handleAddComment={handleAddComment}
      />
    </div>
  );
};

export default MyRoomCanvas;
