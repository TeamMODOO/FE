"use client";

import NextImage from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// UI & Hooks
import { Button } from "@/components/ui/button";
import { useMyRoomFurnitureActions } from "@/hooks/myroom/useMyRoomFurnitureActions";
import { useMyRoomKeyboard } from "@/hooks/myroom/useMyRoomKeyboard";
import { useMyRoomRenderer } from "@/hooks/myroom/useMyRoomRenderer";
import useMyRoomSocketEvents from "@/hooks/myroom/useMyRoomSocketEvents";
import useLoadSprites from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
// Models & Types
import { Funiture } from "@/model/Funiture";
import { Direction, User } from "@/model/User";
// API
import { useMyRoomOwnerProfile } from "@/queries/myroom/useMyRoomOwnerProfile";
import { usePatchMyRoomOwnerProfile } from "@/queries/myroom/usePatchMyRoomOwnerProfile";

// 상수/데이터
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
// 모달들
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PortfolioLinkViewModal from "../PortfolioLinkViewModal/PortfolioLinkViewModal";
import PdfViewerModal from "../PortfolioModal/PdfViewerModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
import TechStackModal from "../TechStackModal/TechStackModal";
// 스타일
import Style from "./Canvas.style";

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

  // 예: 방명록 댓글
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
  const furnitureActions = useMyRoomFurnitureActions({
    resume,
    setResume,
    portfolio,
    setPortfolio,
    technologyStack,
    setTechnologyStack,
  });
  const {
    // 모달 State
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

    // UI disable
    isResumeButtonDisabled,
    isPortfolioButtonDisabled,
    isTechStackButtonDisabled,

    // open modals
    handleOpenResumeModal,
    handleOpenPortfolioModal,
    handleOpenTechStackModal,
  } = furnitureActions;

  // 모달 열림 여부
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

  // 키보드 훅
  const { pressedKeys: myRoomPressedKeys } = useMyRoomKeyboard({
    users,
    setUsers,
    myUserId,
    isAnyModalOpen,
    portal,
  });
  useEffect(() => {
    setPressedKeys(myRoomPressedKeys);
  }, [myRoomPressedKeys]);

  // 스프라이트 로딩
  const spriteImages = useLoadSprites();

  // rAF 렌더링
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

  // 이동 로직 (throttle)
  const throttledPressedKeys = useThrottle(pressedKeys, 100);
  useEffect(() => {
    if (isAnyModalOpen) return;

    setUsers((prev) => {
      const newArr = [...prev];
      const meIndex = newArr.findIndex((u) => u.id === myUserId);
      if (meIndex < 0) return prev;

      const me = newArr[meIndex];
      let { x, y } = me;

      let newDir: Direction | null = null;
      if (
        throttledPressedKeys["w"] ||
        throttledPressedKeys["W"] ||
        throttledPressedKeys["ㅈ"] ||
        throttledPressedKeys["ArrowUp"]
      ) {
        newDir = 1; // Up
      } else if (
        throttledPressedKeys["s"] ||
        throttledPressedKeys["S"] ||
        throttledPressedKeys["ㄴ"] ||
        throttledPressedKeys["ArrowDown"]
      ) {
        newDir = 0; // Down
      } else if (
        throttledPressedKeys["d"] ||
        throttledPressedKeys["D"] ||
        throttledPressedKeys["ㅇ"] ||
        throttledPressedKeys["ArrowRight"]
      ) {
        newDir = 2; // Right
      } else if (
        throttledPressedKeys["a"] ||
        throttledPressedKeys["A"] ||
        throttledPressedKeys["ㅁ"] ||
        throttledPressedKeys["ArrowLeft"]
      ) {
        newDir = 3; // Left
      }

      if (newDir === null) {
        newArr[meIndex] = { ...me, isMoving: false };
        return newArr;
      }

      let moved = false;
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

      newArr[meIndex] = {
        ...me,
        x,
        y,
        direction: newDir,
        isMoving: moved,
      };

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

  // 방명록 작성
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  // PATCH 훅
  const { mutate: patchProfile } = usePatchMyRoomOwnerProfile();

  // 파라미터 (googleId)
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || undefined;

  // GET
  const { data: ownerProfile } = useMyRoomOwnerProfile(googleId);

  // ownerProfile → 가구 state
  useEffect(() => {
    if (!ownerProfile) return;

    // (A) 이력서
    setResume((prev) => {
      const resumeUrl = ownerProfile.resume_url;
      if (!resumeUrl || resumeUrl.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      } else {
        return prev.map((item, idx) => {
          if (idx === 0) {
            return {
              ...item,
              funitureType: "resume/resume1",
              data: { resumeLink: resumeUrl[0] },
            };
          }
          return item;
        });
      }
    });

    // (B) 포트폴리오
    setPortfolio((prev) => {
      const portfolioUrl = ownerProfile.portfolio_url;
      if (!portfolioUrl || portfolioUrl.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      } else {
        return prev.map((item, idx) => {
          if (idx < portfolioUrl.length) {
            return {
              ...item,
              funitureType: `portfolio/portfolio${idx + 1}`,
              data: { fileName: portfolioUrl[idx] },
            };
          } else {
            return {
              ...item,
              funitureType: "none",
              data: {},
            };
          }
        });
      }
    });

    // (C) 기술 스택
    setTechnologyStack((prev) => {
      const techStack = ownerProfile.tech_stack;
      if (!techStack || techStack.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      } else {
        return prev.map((item, idx) => {
          if (idx < techStack.length && idx < 9) {
            return {
              ...item,
              funitureType: `technologyStack/technologyStack${idx + 1}`,
              data: { stack: techStack[idx] },
            };
          } else {
            return {
              ...item,
              funitureType: "none",
              data: {},
            };
          }
        });
      }
    });
  }, [ownerProfile]);

  // 클릭 시 분기
  const handleFurnitureClickCustom = (item: Funiture) => {
    if (item.funitureType === "none") {
      alert("아직 등록되지 않은 항목입니다.");
      return;
    }

    // resume → PDF Modal
    if (item.funitureType.startsWith("resume/")) {
      const pdf = item.data?.resumeLink;
      if (!pdf) {
        alert("PDF 링크가 없습니다.");
        return;
      }
      setPdfUrl(pdf);
      setPdfModalOpen(true);
      return;
    }

    // portfolio/, technologyStack/ → FurnitureInfoModal
    setSelectedFurnitureData(item);
    setViewModalOpen(true);
  };

  // (C) PATCH 로직 - 기존 배열에 새 값 append
  // 이력서
  const handleSaveResume = async () => {
    if (!resumeFile) {
      setResumeModalOpen(false);
      return;
    }
    try {
      // 1) S3 업로드
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      // 2) s3Url
      const s3Url = data.url;
      if (!googleId) {
        alert("googleId가 없음, 수정 불가");
        return;
      }

      // 3) 기존 + 새값
      const oldResumeUrls = (ownerProfile?.resume_url ?? []) as string[];
      const newResumeUrls = [...oldResumeUrls, s3Url];

      // 4) PATCH
      patchProfile(
        { googleId, resume_url: newResumeUrls },
        {
          onSuccess: () => {
            alert("이력서(PDF) 저장 (append)");
            setResumeModalOpen(false);
            setResumeFile(null);
          },
          onError: (err: Error) => {
            alert("프로필 수정 실패: " + err.message);
          },
        },
      );
    } catch (error: unknown) {
      alert("파일 업로드 실패: " + error);
    }
  };

  // 포트폴리오
  const handleSavePortfolio = () => {
    if (!portfolioLink.trim()) {
      setPortfolioModalOpen(false);
      return;
    }
    if (!googleId) {
      alert("googleId가 없음, 수정 불가");
      return;
    }

    const old = ownerProfile?.portfolio_url || [];
    const newArr = [...old, portfolioLink];

    patchProfile(
      { googleId, portfolio_url: newArr },
      {
        onSuccess: () => {
          alert("포트폴리오 링크 추가 (append)");
          setPortfolioModalOpen(false);
          setPortfolioLink("");
        },
        onError: (err: Error) => {
          alert("프로필 수정 실패: " + err.message);
        },
      },
    );
  };

  // 기술 스택
  const handleSaveTechStack = () => {
    if (selectedTechList.length === 0) {
      setTechStackModalOpen(false);
      return;
    }
    if (!googleId) {
      alert("googleId가 없음, 수정 불가");
      return;
    }

    const old = ownerProfile?.tech_stack || [];
    const newArr = [...old, ...selectedTechList];

    patchProfile(
      { googleId, tech_stack: newArr },
      {
        onSuccess: () => {
          alert("기술 스택 추가 (append)");
          setTechStackModalOpen(false);
          setSelectedTechList([]);
        },
        onError: (err: Error) => {
          alert("프로필 수정 실패: " + err.message);
        },
      },
    );
  };

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
      {/* ------------------ Canvas ------------------ */}
      <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

      {/* ------------------ 이력서/포트폴리오/기술스택 표시 ------------------ */}
      {[...resume, ...portfolio, ...technologyStack].map((item) => {
        const imageSrc =
          interiorImages[item.funitureType] || interiorImages["none"];

        return (
          <div
            key={item.id}
            className={Style.furnitureContainerClass}
            style={{ left: item.x, top: item.y }}
            onClick={() => handleFurnitureClickCustom(item)}
          >
            <NextImage
              src={imageSrc}
              alt={item.funiturename}
              width={120}
              height={120}
              priority
            />
            <div className={Style.furnitureTextClass}>{item.funiturename}</div>
          </div>
        );
      })}

      {/* ------------------ 게시판(방명록) ------------------ */}
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

      {/* ------------------ 포탈 ------------------ */}
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

      {/* ------------------ 하단 버튼들 ------------------ */}
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

      {/* ------------------ 모달: 이력서 ------------------ */}
      <ResumeModal
        open={resumeModalOpen}
        onClose={setResumeModalOpen}
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
        onSave={handleSaveResume}
      />

      {/* ------------------ 모달: 포트폴리오 ------------------ */}
      <PortfolioModal
        open={portfolioModalOpen}
        onClose={setPortfolioModalOpen}
        portfolioLink={portfolioLink}
        setPortfolioLink={setPortfolioLink}
        onSave={handleSavePortfolio}
      />

      {/* ------------------ 모달: 기술스택 ------------------ */}
      <TechStackModal
        open={techStackModalOpen}
        onClose={setTechStackModalOpen}
        techStackList={techStackList}
        selectedTechList={selectedTechList}
        setSelectedTechList={setSelectedTechList}
        onSave={handleSaveTechStack}
      />

      {/* ------------------ 모달: FurnitureInfo (포트폴리오/기술스택) ------------------ */}
      <FurnitureInfoModal
        open={viewModalOpen}
        onClose={setViewModalOpen}
        furniture={selectedFurnitureData}
      />

      {/* ------------------ 모달: 게시판 ------------------ */}
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

      {/* ------------------ 모달: PDF (이력서) ------------------ */}
      <PdfViewerModal
        open={pdfModalOpen}
        onClose={setPdfModalOpen}
        pdfUrl={pdfUrl}
      />

      {/* ------------------ 모달: 포트폴리오 링크 뷰 ------------------ */}
      <PortfolioLinkViewModal
        open={portfolioLinkViewModalOpen}
        onClose={setPortfolioLinkViewModalOpen}
        link={clickedPortfolioLink}
      />
    </div>
  );
};

export default MyRoomCanvas;
