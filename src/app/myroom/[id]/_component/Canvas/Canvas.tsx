"use client";

import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";

// (1) UI & Hooks
import { Button } from "@/components/ui/button";
// (6) 스타일 & 가구이미지
import useThrottle from "@/hooks/performance/useThrottle";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";
// (2) 스프라이트 로딩 훅 & 상수
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/useLoadSprites";
// (소켓 연결 관련 훅들)
import useMyRoomSocketEvents from "@/hooks/useMyRoomSocketEvents";

// (3) Throttle 훅 (값 쓰로틀 → 이번엔 “키 입력”을 쓰로틀)
// (4) 모델/타입
import { Funiture } from "../../_model/Funiture";
import { Direction, User } from "../../_model/User";
// (5) 모달들
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
import TechStackModal from "../TechStackModal/TechStackModal";
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
  SPEED: 30, // 캐릭터 이동 속도
};

// ★ 캐릭터를 2배로 크게 표시
const CHAR_SCALE = 3; // 2배

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
  // (F) 모달 (이력서/포트폴리오/기술스택)
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

  // (J-1) 포탈 overlap 체크 함수
  const checkPortalOverlap = () => {
    // 우선 내 캐릭터(quest-user, 여기서는 myUserId=1) 찾아서 좌표 얻음
    const me = users.find((u) => u.id === myUserId);
    if (!me) return false;

    // 캐릭터 크기 64×64
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];

    // 아래에서 portalBox를 정의
    // portalWidth = 200, portalHeight = 200 (조금 크게 표시)
    const portalWidth = 200;
    const portalHeight = 200;
    const [pl, pr, pt, pb] = [
      portal.x,
      portal.x + portalWidth,
      portal.y,
      portal.y + portalHeight,
    ];

    // 충돌 판정
    const overlap = cr > pl && cl < pr && cb > pt && ct < pb;
    if (overlap) {
      // 겹쳤을 때 콘솔 로그
      // console.log(
      //   `캐릭터 위치: (${me.x}, ${me.y}), 포탈 위치: (${portal.x}, ${portal.y})`,
      // );
    }
    return overlap;
  };

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

      // 스페이스바
      if (e.key === " ") {
        e.preventDefault();
        // 스페이스바로 포탈 겹치면 이동
        const overlapped = checkPortalOverlap();
        if (overlapped) {
          // 이동 (콘솔에 이미 캐릭터/포탈 위치 찍었음)
          window.location.href = portal.route;
          // 혹은 router.push(portal.route);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  // --------------------------------------------------
  // (K) 방향 계산 함수
  // --------------------------------------------------
  function getNewDirection(usersList: User[]): Direction | null {
    const me = usersList.find((u) => u.id === myUserId);
    if (!me) return 0;

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

    // 아무 키도 없으면 null (멈춤)
    return null;
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
  // (M) 키 입력 자체를 쓰로틀(로비 방식)
  // --------------------------------------------------
  // → 100ms마다 "pressedKeys"를 "throttledPressedKeys"로 동기화
  const throttledPressedKeys = useThrottle(pressedKeys, 100);

  // --------------------------------------------------
  // (N) useEffect: throttledPressedKeys 기반으로 "이동 자체"를 100ms 간격 수행
  // --------------------------------------------------
  useEffect(() => {
    setUsers((prevUsers) => {
      const newUsers = [...prevUsers];
      const meIndex = newUsers.findIndex((u) => u.id === myUserId);
      if (meIndex < 0) return newUsers;

      const me = newUsers[meIndex];
      let { x, y } = me;

      // (a) 방향 계산
      const newDir = getNewDirection(newUsers);
      if (newDir === null) {
        // 아무 키도 없으면 → 멈춤
        newUsers[meIndex] = { ...me, isMoving: false };
        return newUsers;
      }

      // (b) 실제 이동
      let moved = false;
      if (newDir === 1 && y > 0) {
        // Up
        y -= MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (
        newDir === 0 &&
        y < MAP_CONSTANTS.CANVAS_HEIGHT - FRAME_HEIGHT * CHAR_SCALE
      ) {
        // Down
        y += MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (
        newDir === 2 &&
        x < MAP_CONSTANTS.CANVAS_WIDTH - FRAME_WIDTH * CHAR_SCALE
      ) {
        // Right
        x += MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (newDir === 3 && x > 0) {
        // Left
        x -= MAP_CONSTANTS.SPEED;
        moved = true;
      }

      // (c) 반영
      newUsers[meIndex] = {
        ...me,
        x,
        y,
        direction: newDir,
        isMoving: moved,
      };

      // (d) 소켓 emit
      if (moved) {
        emitMovement(x, y, newDir);
      }

      return newUsers;
    });
  }, [throttledPressedKeys, emitMovement]);

  // --------------------------------------------------
  // (O) rAF로 그리기
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

        // 3) 캐릭터 스프라이트
        const now = performance.now();
        users.forEach((user) => {
          // 보행 프레임 관리
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

          // 스프라이트 그리기
          const sx = frameData.frame * FRAME_WIDTH;
          const sy = (user.direction ?? 0) * FRAME_HEIGHT;

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
  }, [backgroundImage, spriteImages, users]);

  // --------------------------------------------------
  // (P) 게시판 새 글 작성
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
  // (Q) 모달 열기
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
  // (R) 모달 저장 (이력서/포트폴리오/기술스택)
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

  const handleSavePortfolio = async () => {
    if (!portfolioFile) {
      setPortfolioModalOpen(false);
      return;
    }

    try {
      // 1) FormData 생성
      const formData = new FormData();
      formData.append("file", portfolioFile);

      // 2) /api/portfolio 로 POST
      const res = await fetch("/api/portfolio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // 3) 업로드된 S3 URL
      const s3Url = data.url;

      // 4) 기존 로직 (state 갱신)
      const idx = portfolio.findIndex((p) => p.funitureType === "none");
      if (idx !== -1) {
        setPortfolio((prev) =>
          prev.map((item, i) =>
            i === idx
              ? {
                  ...item,
                  funitureType: `portfolio/portfolio${idx + 1}`,
                  data: { fileName: portfolioFile.name, url: s3Url },
                }
              : item,
          ),
        );
      }

      // 5) 모달 닫기 & 파일 초기화
      setPortfolioModalOpen(false);
      setPortfolioFile(null);
    } catch (error) {
      // 업로드 실패 처리
    }
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
  // (S) 가구 클릭 → 상세
  // --------------------------------------------------
  const handleFurnitureClick = (f: Funiture) => {
    // "none" 또는 "board" 타입이면 상세 모달 없음
    if (f.funitureType === "none" || f.funitureType === "board") return;
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  // --------------------------------------------------
  // (T) 포탈 (로비 이동용) - 크기 크게(200×200)
  // --------------------------------------------------
  const [portal] = useState({
    id: "portal-to-lobby",
    x: 1300,
    y: 600,
    route: "/lobby",
    name: "로비 포탈",
  });

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
  // (U) 렌더
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

      {/* 포탈 (크기를 200×200으로 증가) */}
      <div
        className={Style.furnitureContainerClass}
        style={{
          left: portal.x,
          top: portal.y,
          width: 200,
          height: 200, // 포탈 크게
        }}
        onClick={() => {
          // 클릭 시 로비로 이동(옵션)
          window.location.href = portal.route;
        }}
      >
        <NextImage
          src="/furniture/portal.gif"
          alt={portal.name}
          width={200} // 이미지 자체도 200×200
          height={200}
          priority
        />
        <div className={Style.furnitureTextClass}>{portal.name}</div>
      </div>

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
