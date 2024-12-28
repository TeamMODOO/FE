"use client";

import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
// (3) 스프라이트 로딩 훅 & 상수
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/useLoadSprites";

// (1) 사용자/가구 모델
import { Funiture } from "../../_model/Funiture";
import { Direction, User } from "../../_model/User";
// (2) 모달들
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
import TechStackModal from "../TechStackModal/TechStackModal";
// (4) 스타일, 가구이미지
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
  // (A) 캔버스 & 배경
  // --------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // --------------------------------------------------
  // (B) 사용자 목록
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
  const myUserId = "1";

  // --------------------------------------------------
  // (C) 가구
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
  // (D) 게시판(방명록)
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
  // (E) 모달
  // --------------------------------------------------
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);

  const [resumeLink, setResumeLink] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [selectedTech, setSelectedTech] = useState("");

  // --------------------------------------------------
  // (F) 가구 상세 모달
  // --------------------------------------------------
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  // --------------------------------------------------
  // (G) 스프라이트 로딩 훅
  // --------------------------------------------------
  const spriteImages = useLoadSprites();

  // --------------------------------------------------
  // (H) 배경 로드
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
  // (I) 키 입력 상태
  // --------------------------------------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        [
          "w",
          "a",
          "s",
          "d",
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
  // (I-2) 방향 계산
  // --------------------------------------------------
  function getNewDirection(users: User[]): Direction {
    // 내 캐릭터
    const me = users.find((u) => u.id === myUserId);
    if (!me) return 0;

    // "Try move up" 찍히는지 확인
    if (pressedKeys["w"] || pressedKeys["ArrowUp"]) {
      return 1; // Up
    }
    if (pressedKeys["s"] || pressedKeys["ArrowDown"]) {
      return 0; // Down
    }
    if (pressedKeys["d"] || pressedKeys["ArrowRight"]) {
      return 2; // Right
    }
    if (pressedKeys["a"] || pressedKeys["ArrowLeft"]) {
      return 3; // Left
    }
    // 그대로 유지
    return me.direction ?? 0;
  }

  // --------------------------------------------------
  // (J) 스프라이트 애니메이션 프레임 관리 (Ref)
  // --------------------------------------------------
  const userFrameRef = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  useEffect(() => {
    users.forEach((u) => {
      userFrameRef.current[u.id] = {
        frame: 0,
        lastFrameTime: performance.now(),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // (K) rAF: 이동 & 그리기
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

        // (1) 이동
        setUsers((prevUsers) => {
          const newDir = getNewDirection(prevUsers);
          return prevUsers.map((user) => {
            if (user.id !== myUserId) return user;

            let { x, y } = user;
            let moved = false;

            // Up
            if (pressedKeys["w"] || pressedKeys["ArrowUp"]) {
              if (y > 0) {
                y -= MAP_CONSTANTS.SPEED;
                moved = true;
              }
            }
            // Down
            if (pressedKeys["s"] || pressedKeys["ArrowDown"]) {
              if (
                y + FRAME_HEIGHT * CHAR_SCALE + MAP_CONSTANTS.SPEED <=
                MAP_CONSTANTS.CANVAS_HEIGHT
              ) {
                y += MAP_CONSTANTS.SPEED;
                moved = true;
              }
            }
            // Right
            if (pressedKeys["d"] || pressedKeys["ArrowRight"]) {
              if (
                x + FRAME_WIDTH * CHAR_SCALE + MAP_CONSTANTS.SPEED <=
                MAP_CONSTANTS.CANVAS_WIDTH
              ) {
                x += MAP_CONSTANTS.SPEED;
                moved = true;
              }
            }
            // Left
            if (pressedKeys["a"] || pressedKeys["ArrowLeft"]) {
              if (x > 0) {
                x -= MAP_CONSTANTS.SPEED;
                moved = true;
              }
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

        // (2) 그리기
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

        // 캐릭터
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

          // 보행 프레임
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

            // 닉네임
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
  }, [backgroundImage, spriteImages, users]);

  // --------------------------------------------------
  // (L) 게시판 새 글 작성
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
  // (M) 모달 열기
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
  // (N) 모달 저장
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
  // (O) 가구 클릭 -> 상세
  // --------------------------------------------------
  const handleFurnitureClick = (f: Funiture) => {
    if (f.funitureType === "none" || f.funitureType === "board") return;
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  // --------------------------------------------------
  // 버튼 비활성화
  // --------------------------------------------------
  const isResumeButtonDisabled =
    resume.filter((r) => r.funitureType !== "none").length >= 1;
  const isPortfolioButtonDisabled =
    portfolio.filter((p) => p.funitureType !== "none").length >= 3;
  const isTechStackButtonDisabled =
    technologyStack.filter((t) => t.funitureType !== "none").length >= 9;

  // --------------------------------------------------
  // (P) 렌더
  // --------------------------------------------------
  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

      {/* 가구 표시 */}
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
