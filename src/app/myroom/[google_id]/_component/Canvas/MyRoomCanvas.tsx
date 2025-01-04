"use client";

import NextImage from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// ------------------ UI & Hooks ------------------
import { Button } from "@/components/ui/button";
// ------------------ 커스텀 훅 ------------------
import { useMyRoomFurnitureActions } from "@/hooks/myroom/useMyRoomFurnitureActions";
import { useMyRoomKeyboard } from "@/hooks/myroom/useMyRoomKeyboard";
import { useMyRoomRenderer } from "@/hooks/myroom/useMyRoomRenderer";
import useMyRoomSocketEvents from "@/hooks/myroom/useMyRoomSocketEvents";
import useLoadSprites from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
// ------------------ Models & Types ------------------
import { Funiture } from "@/model/Funiture";
import { Direction, User } from "@/model/User";
// (중요) 새로 만든 API 훅 import
import { useMyRoomOwnerProfile } from "@/queries/myroom/useMyRoomOwnerProfile";

// ------------------ 상수/데이터 ------------------
import {
  CHAR_SCALE,
  defaultBoard,
  defaultPortfolio,
  defaultResume,
  defaultTechnologyStack,
  defaultUsers,
  interiorImages,
  MAP_CONSTANTS,
  techStackList,
} from "../../_constant";
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

/**
 * MyRoomCanvas 컴포넌트
 */
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
  const [users, setUsers] = useState<User[]>(defaultUsers);

  // ------------------ 이력서/포트폴리오/기술스택 ------------------
  const [resume, setResume] = useState<Funiture[]>(defaultResume);
  const [portfolio, setPortfolio] = useState<Funiture[]>(defaultPortfolio);
  const [technologyStack, setTechnologyStack] = useState<Funiture[]>(
    defaultTechnologyStack,
  );

  // ------------------ 게시판(방명록) ------------------
  const [board] = useState<Funiture[]>(defaultBoard);
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
  // 구조 분해
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
    // 방명록은 스페이스바로 열지 않음
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
  // (1) 파라미터 (예: /myroom/955419d1-3e76-444a-a647-b086ebe5478f)
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || undefined;

  // (2) 마이룸 주인 프로필 조회
  //   - meta.callbacks의 onSuccess/onError는 훅 내부에 있음
  const { data: ownerProfile } = useMyRoomOwnerProfile(googleId);

  // (3) 프로필 데이터 반영
  useEffect(() => {
    // console.log("googleId : ", googleId);
    if (!ownerProfile) return;
    // console.log(">> [MyRoomCanvas] ownerProfile 갱신:", ownerProfile);

    // 원하는 경우, 여기에서 setResume / setPortfolio / setTechnologyStack 등을
    // ownerProfile에서 받아온 URL 등에 맞춰 업데이트 가능
    // (현재는 defaultXXX 그대로 사용 중)
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

      {/* 가구 (이력서 / 포트폴리오 / 기술스택) */}
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
          onClick={() => setIsBoardOpen(true)} // 클릭으로만 열림
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

      {/* 하단 버튼들 (이력서/포폴/기술스택 추가) */}
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

      {/* 모달: 이력서 */}
      <ResumeModal
        open={resumeModalOpen}
        onClose={setResumeModalOpen}
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
        onSave={handleSaveResume}
      />

      {/* 모달: 포트폴리오 */}
      <PortfolioModal
        open={portfolioModalOpen}
        onClose={setPortfolioModalOpen}
        portfolioLink={portfolioLink}
        setPortfolioLink={setPortfolioLink}
        onSave={handleSavePortfolio}
      />

      {/* 모달: 기술스택 */}
      <TechStackModal
        open={techStackModalOpen}
        onClose={setTechStackModalOpen}
        techStackList={techStackList}
        selectedTechList={selectedTechList}
        setSelectedTechList={setSelectedTechList}
        onSave={handleSaveTechStack}
      />

      {/* 모달: 가구 정보 보기 */}
      <FurnitureInfoModal
        open={viewModalOpen}
        onClose={setViewModalOpen}
        furniture={selectedFurnitureData}
      />

      {/* 모달: 게시판(방명록) */}
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

      {/* 모달: PDF 뷰어 */}
      <PdfViewerModal
        open={pdfModalOpen}
        onClose={setPdfModalOpen}
        pdfUrl={pdfUrl}
      />

      {/* 모달: 포트폴리오 링크 뷰어 */}
      <PortfolioLinkViewModal
        open={portfolioLinkViewModalOpen}
        onClose={setPortfolioLinkViewModalOpen}
        link={clickedPortfolioLink}
      />
    </div>
  );
};

export default MyRoomCanvas;
