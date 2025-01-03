"use client";

import NextImage from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// ------------------ UI & Hooks ------------------
import { Button } from "@/components/ui/button";
// ------------------ 커스텀 훅 ------------------
import { useMyRoomFurnitureActions } from "@/hooks/myroom/useMyRoomFurnitureActions";
import { useMyRoomKeyboard } from "@/hooks/myroom/useMyRoomKeyboard";
import { useMyRoomOwnerProfile } from "@/hooks/myroom/useMyRoomOwnerProfile";
import { useMyRoomRenderer } from "@/hooks/myroom/useMyRoomRenderer";
import useMyRoomSocketEvents from "@/hooks/myroom/useMyRoomSocketEvents";
import useLoadSprites from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
// ------------------ Models & Types ------------------
import { Funiture } from "@/model/Funiture";
import { User } from "@/model/User";
import { Direction } from "@/model/User";

// ------------------ Modals ------------------
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PortfolioLinkViewModal from "../PortfolioLinkViewModal/PortfolioLinkViewModal";
import PdfViewerModal from "../PortfolioModal/PdfViewerModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
import TechStackModal from "../TechStackModal/TechStackModal";
// ------------------ Style & Assets ------------------
import Style from "./Canvas.style";
import interiorImages from "./Interior";

/** 기술스택 목록 예 */
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

// ------------------ 상수 ------------------
const MAP_CONSTANTS = {
  SPEED: 30, // 이동 속도
};
const CHAR_SCALE = 3;

const MyRoomCanvas: React.FC = () => {
  // ------------------ 소켓 연결 ------------------
  const myUserId = "1";
  const { emitMovement } = useMyRoomSocketEvents({
    roomId: "myRoom-123",
    userId: myUserId,
  });

  // ------------------ 화면/캔버스 ------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1500, h: 830 });
  useEffect(() => {
    setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  // ------------------ 배경 이미지 ------------------
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = canvasSize.w;
    canvasRef.current.height = canvasSize.h;

    const bg = new Image();
    bg.src = "/background/myroom.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, [canvasSize]);

  // ------------------ 사용자 목록 ------------------
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

  // ------------------ 이력서/포트폴리오/기술스택 ------------------
  const [resume, setResume] = useState<Funiture[]>([
    {
      id: "resume-1",
      x: 100,
      y: 100,
      funitureType: "none",
      funiturename: "이력서(PDF)",
    },
  ]);
  const [portfolio, setPortfolio] = useState<Funiture[]>([
    {
      id: "portfolio-1",
      x: 600,
      y: 100,
      funitureType: "none",
      funiturename: "포트폴리오 링크1",
    },
    {
      id: "portfolio-2",
      x: 780,
      y: 180,
      funitureType: "none",
      funiturename: "포트폴리오 링크2",
    },
    {
      id: "portfolio-3",
      x: 900,
      y: 90,
      funitureType: "none",
      funiturename: "포트폴리오 링크3",
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
      x: 600,
      y: 300,
      funitureType: "none",
      funiturename: "기술스택3",
    },
    {
      id: "technologyStack-4",
      x: 650,
      y: 550,
      funitureType: "none",
      funiturename: "기술스택4",
    },
    {
      id: "technologyStack-5",
      x: 1150,
      y: 600,
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
      x: 750,
      y: 400,
      funitureType: "none",
      funiturename: "기술스택9",
    },
  ]);

  // ------------------ 게시판(방명록) ------------------
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

  // 게시판 댓글
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

  // ------------------ 포탈 ------------------
  const [portal, setPortal] = useState({
    id: "portal-to-lobby",
    x: 1300,
    y: 600,
    route: "/lobby",
    name: "로비 포탈",
  });
  useEffect(() => {
    setPortal((prev) => ({
      ...prev,
      x: 50,
      y: Math.max((canvasSize.h - 200) / 2, 0),
    }));
  }, [canvasSize]);

  // ------------------ 모달/키 입력 ------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  // ------------------ (가구) 모달 로직 훅 ------------------
  const furnitureActions = useMyRoomFurnitureActions({
    resume,
    setResume,
    portfolio,
    setPortfolio,
    technologyStack,
    setTechnologyStack,
  });
  // 구조분해
  const {
    resumeModalOpen,
    setResumeModalOpen,
    resumeFile,
    setResumeFile,
    portfolioModalOpen,
    setPortfolioModalOpen,
    portfolioLink,
    setPortfolioLink,
    techStackModalOpen,
    setTechStackModalOpen,
    selectedTechList,
    setSelectedTechList,
    viewModalOpen,
    setViewModalOpen,
    selectedFurnitureData,
    setSelectedFurnitureData,
    pdfModalOpen,
    setPdfModalOpen,
    pdfUrl,
    setPdfUrl,
    portfolioLinkViewModalOpen,
    setPortfolioLinkViewModalOpen,
    clickedPortfolioLink,
    setClickedPortfolioLink,

    isResumeButtonDisabled,
    isPortfolioButtonDisabled,
    isTechStackButtonDisabled,

    handleOpenResumeModal,
    handleOpenPortfolioModal,
    handleOpenTechStackModal,
    handleSaveResume,
    handleSavePortfolio,
    handleSaveTechStack,
    handleFurnitureClick,
  } = furnitureActions;

  // ------------------ 모달 열림 여부 종합 ------------------
  const isAnyModalOpen =
    resumeModalOpen ||
    portfolioModalOpen ||
    techStackModalOpen ||
    viewModalOpen ||
    isBoardOpen ||
    pdfModalOpen ||
    portfolioLinkViewModalOpen;

  // 모달 닫힐 때 => 키 초기화
  useEffect(() => {
    if (!isAnyModalOpen) {
      setPressedKeys({});
    }
  }, [isAnyModalOpen]);

  // ------------------ 키보드 훅 ------------------
  const { pressedKeys: myRoomPressedKeys } = useMyRoomKeyboard({
    users,
    setUsers,
    myUserId,
    isAnyModalOpen,
    portal,

    // (1) 방명록은 스페이스바로 열지 않으므로, boardOpenSetter는 전달 X
    // 예) boardOpenSetter: setIsBoardOpen,
    //   → 주석/삭제: (우리 요구사항: 방명록은 스페이스로 열지 않기)
  });

  // 통합 pressedKeys에 동기화
  useEffect(() => {
    setPressedKeys(myRoomPressedKeys);
  }, [myRoomPressedKeys]);

  // ------------------ 스프라이트 로딩 ------------------
  const spriteImages = useLoadSprites();

  // ------------------ rAF 렌더링 ------------------
  useMyRoomRenderer({
    canvasRef,
    canvasSize,
    backgroundImage,
    spriteImages,
    users,
    charScale: CHAR_SCALE,
    emitMovement,
    mapSpeed: MAP_CONSTANTS.SPEED,
    myUserId,
  });

  // ------------------ 이동 로직 (throttle) ------------------
  const throttledPressedKeys = useThrottle(pressedKeys, 100);

  useEffect(() => {
    if (isAnyModalOpen) return;

    setUsers((prev) => {
      const newArr = [...prev];
      const meIndex = newArr.findIndex((u) => u.id === myUserId);
      if (meIndex < 0) return prev;

      const me = newArr[meIndex];
      let { x, y } = me;

      // 1) 방향 계산
      let newDir: Direction | null = null;
      if (
        throttledPressedKeys["w"] ||
        throttledPressedKeys["W"] ||
        throttledPressedKeys["ㅈ"] ||
        throttledPressedKeys["ArrowUp"]
      ) {
        newDir = 1 as Direction; // Up
      } else if (
        throttledPressedKeys["s"] ||
        throttledPressedKeys["S"] ||
        throttledPressedKeys["ㄴ"] ||
        throttledPressedKeys["ArrowDown"]
      ) {
        newDir = 0 as Direction; // Down
      } else if (
        throttledPressedKeys["d"] ||
        throttledPressedKeys["D"] ||
        throttledPressedKeys["ㅇ"] ||
        throttledPressedKeys["ArrowRight"]
      ) {
        newDir = 2 as Direction; // Right
      } else if (
        throttledPressedKeys["a"] ||
        throttledPressedKeys["A"] ||
        throttledPressedKeys["ㅁ"] ||
        throttledPressedKeys["ArrowLeft"]
      ) {
        newDir = 3 as Direction; // Left
      }

      if (newDir === null) {
        // 움직이지 않음
        newArr[meIndex] = { ...me, isMoving: false };
        return newArr;
      }

      // 2) x,y 이동
      let moved = false;
      // (64×CHAR_SCALE → 64×3 = 192)
      const SPRITE_SIZE = 64 * CHAR_SCALE;

      if (newDir === 1 && y > 0) {
        y -= MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (newDir === 0 && y < canvasSize.h - SPRITE_SIZE) {
        y += MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (newDir === 2 && x < canvasSize.w - SPRITE_SIZE) {
        x += MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (newDir === 3 && x > 0) {
        x -= MAP_CONSTANTS.SPEED;
        moved = true;
      }

      // 3) 업데이트
      newArr[meIndex] = {
        ...me,
        x,
        y,
        direction: newDir,
        isMoving: moved,
      };

      // 4) 소켓 emitMovement
      if (moved) {
        emitMovement(x, y, newDir);
      }

      return newArr;
    });
  }, [
    throttledPressedKeys,
    isAnyModalOpen,
    myUserId,
    canvasSize,
    emitMovement,
  ]);

  // ------------------ 방명록 작성 ------------------
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  // ------------------ API(profile) ------------------
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || null;
  const { data: ownerProfile } = useMyRoomOwnerProfile(googleId);
  useEffect(() => {
    if (!ownerProfile) return;
    // 이력서/포트폴리오/기술스택 업데이트 로직
  }, [ownerProfile]);

  return (
    <div
      className={Style.canvasContainerClass}
      style={{
        width: `${canvasSize.w}px`,
        height: `${canvasSize.h}px`,
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

      {/* 가구 */}
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

      {/* 게시판 */}
      {board.map((item) => (
        <div
          key={item.id}
          className={Style.boardContainerClass}
          style={{ left: item.x, top: item.y }}
          onClick={() => setIsBoardOpen(true)} // ← 게시판은 클릭으로만
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

      {/* 포탈 */}
      <div
        className={Style.furnitureContainerClass}
        style={{
          left: portal.x,
          top: portal.y,
          width: 200,
          height: 200,
        }}
        onClick={() => {
          window.location.href = portal.route;
        }}
      >
        <NextImage
          src="/furniture/portal.gif"
          alt={portal.name}
          width={200}
          height={200}
          priority
        />
        <div className={Style.furnitureTextClass}>{portal.name}</div>
      </div>

      {/* 버튼 */}
      <div className={Style.bottomButtonsClass}>
        <Button
          onClick={handleOpenResumeModal}
          disabled={isResumeButtonDisabled}
        >
          이력서(PDF) 추가
        </Button>
        <Button
          onClick={handleOpenPortfolioModal}
          disabled={isPortfolioButtonDisabled}
        >
          포트폴리오(링크) 추가
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
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
        onSave={handleSaveResume}
      />
      <PortfolioModal
        open={portfolioModalOpen}
        onClose={setPortfolioModalOpen}
        portfolioLink={portfolioLink}
        setPortfolioLink={setPortfolioLink}
        onSave={handleSavePortfolio}
      />
      <TechStackModal
        open={techStackModalOpen}
        onClose={setTechStackModalOpen}
        techStackList={techStackList}
        selectedTechList={selectedTechList}
        setSelectedTechList={setSelectedTechList}
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
      <PdfViewerModal
        open={pdfModalOpen}
        onClose={setPdfModalOpen}
        pdfUrl={pdfUrl}
      />
      <PortfolioLinkViewModal
        open={portfolioLinkViewModalOpen}
        onClose={setPortfolioLinkViewModalOpen}
        link={clickedPortfolioLink}
      />
    </div>
  );
};

export default MyRoomCanvas;
