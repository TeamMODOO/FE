"use client";

import React, { useEffect, useRef, useState } from "react";

import { useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
// ---- Hooks
import { useMyRoomKeyboard } from "@/hooks/myroom/useMyRoomKeyboard";
import { useMyRoomRenderer } from "@/hooks/myroom/useMyRoomRenderer";
import useLoadSprites from "@/hooks/performance/useLoadSprites";
// ---- Models & Types
import { Funiture } from "@/model/Funiture";
import { Direction, User } from "@/model/User";
// ---- API
import { useMyRoomOwnerProfile } from "@/queries/myroom/useMyRoomOwnerProfile";
import { usePatchMyRoomOwnerProfile } from "@/queries/myroom/usePatchMyRoomOwnerProfile";

// ---- 상수/데이터
import {
  CHAR_SCALE,
  defaultBoard,
  defaultPortfolio,
  defaultResume,
  defaultTechnologyStack,
  interiorImages,
  MAP_CONSTANTS,
  MYROOM_COLLISION_ZONES,
  techStackList,
} from "../../_constant";
// ---- 모달
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PortfolioLinkViewModal from "../PortfolioLinkViewModal/PortfolioLinkViewModal";
import PdfViewerModal from "../PortfolioModal/PdfViewerModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
import TechStackModal from "../TechStackModal/TechStackModal";
// ---- 스타일
import Style from "./Canvas.style";

const MyRoomCanvas: React.FC = () => {
  /** 1) session 훅 */
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  /** 2) 화면 크기 / 캔버스 설정 */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1400, h: 800 });
  useEffect(() => {
    function handleResize() {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** 3) 배경 이미지 로딩 */
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/myroom.png";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  /** 4) 닉네임: session?.user?.name 없으면 "김희원" */
  const userName = session?.user?.name ?? "김희원";

  /** 5) 내 캐릭터 state */
  const [myUser, setMyUser] = useState<User>({
    id: "me",
    x: 500,
    y: 700,
    nickname: userName,
    characterType: "sprite1",
    direction: 0,
    isMoving: false,
  });

  /** 6) 가구/포탈/방명록 */
  const [resume, setResume] = useState<Funiture[]>(defaultResume);
  const [portfolio, setPortfolio] = useState<Funiture[]>(defaultPortfolio);
  const [technologyStack, setTechnologyStack] = useState<Funiture[]>(
    defaultTechnologyStack,
  );
  const [board] = useState<Funiture[]>(defaultBoard);
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  // 방명록 상태
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

  // 포탈
  const [portal, setPortal] = useState({
    x: 20,
    y: 680,
    width: 200,
    height: 150,
    route: "/lobby",
    name: "로비 포탈",
  });

  // 모달 관련
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [portfolioLinkViewModalOpen, setPortfolioLinkViewModalOpen] =
    useState(false);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [selectedTechList, setSelectedTechList] = useState<string[]>([]);

  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [clickedPortfolioLink, setClickedPortfolioLink] = useState("");

  /** 7) 모달 열림 여부 통합 */
  const isAnyModalOpen =
    resumeModalOpen ||
    portfolioModalOpen ||
    techStackModalOpen ||
    viewModalOpen ||
    isBoardOpen ||
    pdfModalOpen ||
    portfolioLinkViewModalOpen;

  /** 8) 키 입력 훅 → 캐릭터 이동 */
  const { pressedKeys } = useMyRoomKeyboard({
    users: [{ ...myUser }],
    setUsers: (action) => {
      setMyUser((prev) => {
        const arr = [prev];
        if (typeof action === "function") {
          const newArr = action(arr);
          return newArr[0];
        } else {
          return action[0] ? action[0] : prev;
        }
      });
    },
    myUserId: "me",
    isAnyModalOpen,
    portal,
  });

  /** 9) 캐릭터 스프라이트 로딩 */
  const spriteImages = useLoadSprites();

  /** 9-1) 가구/포탈/방명록 이미지 로딩 */
  const [furnitureImages, setFurnitureImages] = useState<
    Record<string, HTMLImageElement>
  >({});
  useEffect(() => {
    const entries = Object.entries(interiorImages);
    if (entries.length === 0) return;

    const loaded: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    entries.forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded[key] = img;
        loadedCount++;
        if (loadedCount === entries.length) {
          setFurnitureImages(loaded);
        }
      };
    });
  }, []);

  /** 10) useMyRoomRenderer로 캔버스 렌더링 */
  useMyRoomRenderer({
    canvasRef,
    canvasSize,
    backgroundImage,
    spriteImages,
    myUser,
    charScale: CHAR_SCALE,
    furnitureImages,
    resume,
    portfolio,
    technologyStack,
    board,
    portal,
  });

  /** (충돌 판정) */
  function doRectsOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
  ): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect1.x >= rect2.x + rect2.width ||
      rect1.y + rect1.height <= rect2.y ||
      rect1.y >= rect2.y + rect2.height
    );
  }

  /** 11) 이동 로직 */
  useEffect(() => {
    if (isAnyModalOpen) return;

    setMyUser((prev) => {
      let { x, y } = prev;
      let newDir: Direction | null = null;

      if (pressedKeys["w"] || pressedKeys["W"] || pressedKeys["ArrowUp"]) {
        newDir = 1;
      } else if (
        pressedKeys["s"] ||
        pressedKeys["S"] ||
        pressedKeys["ArrowDown"]
      ) {
        newDir = 0;
      } else if (
        pressedKeys["d"] ||
        pressedKeys["D"] ||
        pressedKeys["ArrowRight"]
      ) {
        newDir = 2;
      } else if (
        pressedKeys["a"] ||
        pressedKeys["A"] ||
        pressedKeys["ArrowLeft"]
      ) {
        newDir = 3;
      }

      if (newDir === null) {
        return { ...prev, isMoving: false };
      }

      const SPEED = MAP_CONSTANTS.SPEED;
      const SPRITE_SIZE = 64 * CHAR_SCALE;
      let moved = false;
      const prevX = x;
      const prevY = y;

      // 맵 경계 처리 + 이동
      switch (newDir) {
        case 1: // up
          if (y > 0) {
            y = Math.max(0, y - SPEED);
            moved = true;
          }
          break;
        case 0: // down
          {
            const maxY = 900 - 128;
            if (y < maxY) {
              y = Math.min(maxY, y + SPEED);
              moved = true;
            }
          }
          break;
        case 2: // right
          {
            const maxX = 2000 - 82;
            if (x < maxX) {
              x = Math.min(maxX, x + SPEED);
              moved = true;
            }
          }
          break;
        case 3: // left
          if (x > 0) {
            x = Math.max(0, x - SPEED);
            moved = true;
          }
          break;
      }

      // 충돌 체크
      if (moved) {
        const newBox = { x, y, width: SPRITE_SIZE, height: SPRITE_SIZE };
        let collision = false;
        for (const zone of MYROOM_COLLISION_ZONES) {
          if (doRectsOverlap(newBox, zone)) {
            collision = true;
            break;
          }
        }
        if (collision) {
          x = prevX;
          y = prevY;
          moved = false;
        }
      }

      return {
        ...prev,
        x,
        y,
        direction: newDir,
        isMoving: moved,
      };
    });
  }, [pressedKeys, isAnyModalOpen]);

  /** 12) 방명록 작성 */
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  /** 13) API 쿼리 & PATCH */
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || undefined;
  const { data: ownerProfile } = useMyRoomOwnerProfile(googleId);

  // ownerProfile → 로컬 state
  useEffect(() => {
    if (!ownerProfile) return;

    // 이력서
    const resumeVal = ownerProfile.resume_url;
    setResume((prev) => {
      if (!resumeVal) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      }
      return prev.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            funitureType: "resume/resume1",
            data: { resumeLink: resumeVal },
          };
        }
        return item;
      });
    });

    // 포트폴리오
    const pArr = ownerProfile.portfolio_url ?? [];
    setPortfolio((prev) => {
      if (pArr.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      }
      return prev.map((item, idx) => {
        if (idx < pArr.length) {
          return {
            ...item,
            funitureType: `portfolio/portfolio${idx + 1}`,
            data: { fileName: pArr[idx] },
          };
        }
        return { ...item, funitureType: "none", data: {} };
      });
    });

    // 기술 스택
    const tArr = ownerProfile.tech_stack ?? [];
    setTechnologyStack((prev) => {
      if (tArr.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      }
      return prev.map((item, idx) => {
        if (idx < tArr.length && idx < 8) {
          return {
            ...item,
            funitureType: `technologyStack/technologyStack${idx + 1}`,
            data: { stack: tArr[idx] },
          };
        }
        return { ...item, funitureType: "none", data: {} };
      });
    });
  }, [ownerProfile]);

  /** 14) canvas 클릭 */
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const handleClick = (e: MouseEvent) => {
      if (isAnyModalOpen) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const scale = canvasSize.h / 900;
      const viewWidth = canvasSize.w / scale;
      let cameraX = 0;

      const centerX = myUser.x + 64 * CHAR_SCALE * 0.5;
      cameraX = centerX - viewWidth / 2;

      const maxCamX = 2000 - viewWidth;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > maxCamX) cameraX = maxCamX;

      const worldX = cameraX + clickX / scale;
      const worldY = clickY / scale;

      const FURNITURE_WIDTH = 100;
      const FURNITURE_HEIGHT = 100;
      const PORTAL_WIDTH = 200;
      const PORTAL_HEIGHT = 200;

      // 방명록
      for (const b of board) {
        if (
          worldX >= b.x &&
          worldX <= b.x + FURNITURE_WIDTH &&
          worldY >= b.y &&
          worldY <= b.y + FURNITURE_HEIGHT
        ) {
          setIsBoardOpen(true);
          return;
        }
      }

      // 포탈
      if (
        worldX >= portal.x &&
        worldX <= portal.x + PORTAL_WIDTH &&
        worldY >= portal.y &&
        worldY <= portal.y + PORTAL_HEIGHT
      ) {
        window.location.href = portal.route;
        return;
      }

      // 가구
      const allFurniture = [...resume, ...portfolio, ...technologyStack];
      for (const f of allFurniture) {
        if (
          worldX >= f.x &&
          worldX <= f.x + FURNITURE_WIDTH &&
          worldY >= f.y &&
          worldY <= f.y + FURNITURE_HEIGHT
        ) {
          handleFurnitureClickCustom(f);
          return;
        }
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [
    canvasRef,
    isAnyModalOpen,
    myUser,
    resume,
    portfolio,
    technologyStack,
    board,
    portal,
    canvasSize,
  ]);

  /** (C) 가구 클릭 로직 */
  const handleFurnitureClickCustom = (item: Funiture) => {
    if (item.funitureType === "none") {
      alert("아직 등록되지 않은 항목입니다.");
      return;
    }
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
    setSelectedFurnitureData(item);
    setViewModalOpen(true);
  };

  /** (D) 이력서/포트폴리오/기술스택 PATCH */
  const { mutate: patchProfile } = usePatchMyRoomOwnerProfile();

  const handleSaveResume = async () => {
    // ...
    // (생략 없이, 기존 로직 동일)
  };

  const handleSavePortfolio = () => {
    // ...
  };

  const handleSaveTechStack = () => {
    // ...
  };

  /** (E) 이력서/포트폴리오/기술스택 모달 열기 버튼 */
  const handleOpenResumeModal = () => setResumeModalOpen(true);
  const handleOpenPortfolioModal = () => setPortfolioModalOpen(true);
  const handleOpenTechStackModal = () => setTechStackModalOpen(true);

  /**
   * 최종 JSX
   */
  return (
    <>
      {isLoadingSession ? (
        <div>Loading...</div>
      ) : (
        <div
          className={Style.canvasContainerClass}
          style={{
            width: `${canvasSize.w}px`,
            height: `${canvasSize.h}px`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* (1) Canvas */}
          <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

          {/* (2) 하단 버튼들 */}
          <div className={Style.bottomButtonsClass}>
            <Button onClick={handleOpenResumeModal} disabled={false}>
              이력서(PDF) 추가
            </Button>
            <Button onClick={handleOpenPortfolioModal} disabled={false}>
              포트폴리오(링크) 추가
            </Button>
            <Button onClick={handleOpenTechStackModal} disabled={false}>
              기술 스택 추가
            </Button>
          </div>

          {/* (모달) 이력서 */}
          <ResumeModal
            open={resumeModalOpen}
            onClose={setResumeModalOpen}
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            onSave={handleSaveResume}
          />

          {/* (모달) 포트폴리오 */}
          <PortfolioModal
            open={portfolioModalOpen}
            onClose={setPortfolioModalOpen}
            portfolioLink={portfolioLink}
            setPortfolioLink={setPortfolioLink}
            onSave={handleSavePortfolio}
          />

          {/* (모달) 기술스택 */}
          <TechStackModal
            open={techStackModalOpen}
            onClose={setTechStackModalOpen}
            techStackList={techStackList}
            selectedTechList={selectedTechList}
            setSelectedTechList={setSelectedTechList}
            onSave={handleSaveTechStack}
          />

          {/* (모달) 가구 정보 */}
          <FurnitureInfoModal
            open={viewModalOpen}
            onClose={setViewModalOpen}
            furniture={selectedFurnitureData ?? null}
          />

          {/* (모달) 방명록 */}
          {isBoardOpen && (
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
          )}

          {/* (모달) PDF 뷰어 */}
          <PdfViewerModal
            open={pdfModalOpen}
            onClose={setPdfModalOpen}
            pdfUrl={pdfUrl}
          />

          {/* (모달) 포트폴리오 링크 뷰어 */}
          <PortfolioLinkViewModal
            open={portfolioLinkViewModalOpen}
            onClose={setPortfolioLinkViewModalOpen}
            link={clickedPortfolioLink}
          />
        </div>
      )}
    </>
  );
};

export default MyRoomCanvas;
