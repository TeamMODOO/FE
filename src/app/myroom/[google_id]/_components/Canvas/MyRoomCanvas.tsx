"use client";

import React, { useEffect, useRef, useState } from "react";

import { useParams } from "next/navigation";

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

/**
 * MyRoomCanvas
 * - 다른 유저 없이 내 캐릭터만
 * - (중요) 이력서/포트폴리오/기술스택/방명록/포탈 등도 전부 canvas에 그린다.
 * - canvas 단일 클릭으로 모달 작동
 */
const MyRoomCanvas: React.FC = () => {
  // (1) 화면 크기 / 캔버스 설정
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1400, h: 800 });

  useEffect(() => {
    function handleResize() {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    }
    handleResize(); // 초기값
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // (2) 배경 이미지 (2000×900)
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/myroom.png"; // 2000×900 이미지
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // (3) 내 캐릭터 (1명)
  const [myUser, setMyUser] = useState<User>({
    id: "me",
    x: 500,
    y: 500,
    nickname: "나",
    characterType: "sprite1",
    direction: 0,
    isMoving: false,
  });

  // (4) 가구 배열 (이력서 / 포트폴리오 / 기술스택)
  //  - canvas 상에서 그릴 위치 (x,y)를 저장하고 있음
  const [resume, setResume] = useState<Funiture[]>(defaultResume);
  const [portfolio, setPortfolio] = useState<Funiture[]>(defaultPortfolio);
  const [technologyStack, setTechnologyStack] = useState<Funiture[]>(
    defaultTechnologyStack,
  );

  // (5) 방명록
  const [board] = useState<Funiture[]>(defaultBoard);
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

  // (6) 포탈
  const [portal, setPortal] = useState({
    x: 1300,
    y: 600,
    width: 200,
    height: 200,
    route: "/lobby",
    name: "로비 포탈",
  });

  // (7) 모달 관련 state
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

  // 선택된 가구 (모달 표시용)
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  // PDF 뷰어에서 사용할 pdfUrl
  const [pdfUrl, setPdfUrl] = useState("");

  // 포트폴리오 링크 뷰어에서 사용할 링크
  const [clickedPortfolioLink, setClickedPortfolioLink] = useState("");

  // 버튼 disabled 여부 (예시로 false 처리)
  const isResumeButtonDisabled = false;
  const isPortfolioButtonDisabled = false;
  const isTechStackButtonDisabled = false;

  // 모달 열림 여부 통합
  const isAnyModalOpen =
    resumeModalOpen ||
    portfolioModalOpen ||
    techStackModalOpen ||
    viewModalOpen ||
    isBoardOpen ||
    pdfModalOpen ||
    portfolioLinkViewModalOpen;

  // (8) 키 입력 훅 → myUser 이동 + 포탈
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

  // (9) 스프라이트(캐릭터 레이어) 로딩
  const spriteImages = useLoadSprites();

  /**
   * (9-1) 가구/포탈/방명록 이미지 로딩
   *  interiorImages = { key: url } 이므로,
   *  전부 HTMLImageElement로 로딩한 뒤, useState로 관리
   * */
  const [furnitureImages, setFurnitureImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  useEffect(() => {
    const entries = Object.entries(interiorImages);
    if (entries.length === 0) return;

    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    entries.forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages[key] = img;
        loadedCount++;
        if (loadedCount === entries.length) {
          setFurnitureImages(loadedImages);
        }
      };
    });
  }, []);

  // (10) canvas 렌더링 (배경/캐릭터/가구/포털/방명록)
  useMyRoomRenderer({
    canvasRef,
    canvasSize,
    backgroundImage,
    spriteImages,
    myUser,
    charScale: CHAR_SCALE,

    // 추가: 아래 props 받아서 내부에서 drawImage
    furnitureImages,
    resume,
    portfolio,
    technologyStack,
    board,
    portal,
  });

  // (11) 이동 로직
  useEffect(() => {
    if (isAnyModalOpen) return;

    setMyUser((prev) => {
      const { x: prevX, y: prevY } = prev;
      let x = prevX;
      let y = prevY;
      let newDir: Direction | null = null;

      if (pressedKeys["w"] || pressedKeys["W"] || pressedKeys["ArrowUp"]) {
        newDir = 1; // Up
      } else if (
        pressedKeys["s"] ||
        pressedKeys["S"] ||
        pressedKeys["ArrowDown"]
      ) {
        newDir = 0; // Down
      } else if (
        pressedKeys["d"] ||
        pressedKeys["D"] ||
        pressedKeys["ArrowRight"]
      ) {
        newDir = 2; // Right
      } else if (
        pressedKeys["a"] ||
        pressedKeys["A"] ||
        pressedKeys["ArrowLeft"]
      ) {
        newDir = 3; // Left
      }

      if (newDir === null) {
        return { ...prev, isMoving: false };
      }

      const SPEED = MAP_CONSTANTS.SPEED; // 30
      const SPRITE_SIZE = 64 * CHAR_SCALE;

      let moved = false;

      // 세로: 0~900
      // 가로: 0~2000
      if (newDir === 1 && y > 0) {
        y -= SPEED;
        moved = true;
      } else if (newDir === 0 && y < 900 - SPRITE_SIZE) {
        y += SPEED;
        moved = true;
      } else if (newDir === 2 && x < 2000 - SPRITE_SIZE) {
        x += SPEED;
        moved = true;
      } else if (newDir === 3 && x > 0) {
        x -= SPEED;
        moved = true;
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

  // (12) 방명록 작성
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  // (13) API 쿼리 & PATCH
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || undefined;
  const { data: ownerProfile } = useMyRoomOwnerProfile(googleId);
  const { mutate: patchProfile } = usePatchMyRoomOwnerProfile();

  // (A) ownerProfile → 로컬 state
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

  /**
   * (B) canvas 클릭 → 좌표를 월드 좌표로 변환 → 가구/포탈/방명록 히트 테스트
   *  - 히트 시 모달 또는 이동 로직
   */
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const handleClick = (e: MouseEvent) => {
      // 이미 모달 열려 있으면 무시
      if (isAnyModalOpen) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // (1) 전체 스케일 / 카메라 계산
      const scale = canvasSize.h / 900; // 세로 기준
      const viewWidth = canvasSize.w / scale; // 월드 좌표계에서 뷰 너비
      let cameraX = 0;
      // myUser 중심
      const centerX = myUser.x + 64 * CHAR_SCALE * 0.5; // 캐릭터 기준
      cameraX = centerX - viewWidth / 2;

      // 맵 최대 범위 보정
      const maxCamX = 2000 - viewWidth;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > maxCamX) cameraX = maxCamX;

      // 최종 월드 좌표
      const worldX = cameraX + clickX / scale;
      const worldY = clickY / scale;

      // (2) furniture, board, portal 영역과 충돌 체크
      // 임의로 가구 너비=100, 높이=100 지정 (필요하다면 Funiture에 width/height 저장)
      const FURNITURE_WIDTH = 100;
      const FURNITURE_HEIGHT = 100;
      const PORTAL_WIDTH = 200;
      const PORTAL_HEIGHT = 200;

      // (2-1) 방명록(board)
      for (const b of board) {
        if (
          worldX >= b.x &&
          worldX <= b.x + FURNITURE_WIDTH &&
          worldY >= b.y &&
          worldY <= b.y + FURNITURE_HEIGHT
        ) {
          // 방명록 열기
          setIsBoardOpen(true);
          return;
        }
      }

      // (2-2) 포탈
      if (
        worldX >= portal.x &&
        worldX <= portal.x + PORTAL_WIDTH &&
        worldY >= portal.y &&
        worldY <= portal.y + PORTAL_HEIGHT
      ) {
        // 포탈로 이동
        window.location.href = portal.route;
        return;
      }

      // (2-3) 기타 가구 (이력서/포트폴리오/기술스택)
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

  // (C) 가구 클릭 로직
  const handleFurnitureClickCustom = (item: Funiture) => {
    if (item.funitureType === "none") {
      alert("아직 등록되지 않은 항목입니다.");
      return;
    }
    // 이력서인지
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
    // 그 외 (포트폴리오/기술스택)
    setSelectedFurnitureData(item);
    setViewModalOpen(true);
  };

  // (D) 이력서/포트폴리오/기술스택 PATCH
  const handleSaveResume = async () => {
    if (!resumeFile) {
      setResumeModalOpen(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      const s3Url = data.url;
      if (!googleId) {
        alert("googleId가 없음, 수정 불가");
        return;
      }
      patchProfile(
        { googleId, resume_url: s3Url },
        {
          onSuccess: () => {
            alert("이력서(PDF) 저장 완료");
            setResumeModalOpen(false);
            setResumeFile(null);
          },
          onError: (err: Error) => {
            alert("프로필 수정 실패: " + err.message);
          },
        },
      );
    } catch (error) {
      alert("파일 업로드 실패: " + (error as Error).message);
    }
  };

  const handleSavePortfolio = () => {
    if (!portfolioLink.trim()) {
      setPortfolioModalOpen(false);
      return;
    }
    if (!googleId) {
      alert("googleId가 없음, 수정 불가");
      return;
    }
    const oldArr = ownerProfile?.portfolio_url ?? [];
    const newArr = [...oldArr, portfolioLink];
    patchProfile(
      { googleId, portfolio_url: newArr },
      {
        onSuccess: () => {
          alert("포트폴리오 링크 추가 완료");
          setPortfolioModalOpen(false);
          setPortfolioLink("");
        },
        onError: (err: Error) => {
          alert("프로필 수정 실패: " + err.message);
        },
      },
    );
  };

  const handleSaveTechStack = () => {
    if (selectedTechList.length === 0) {
      setTechStackModalOpen(false);
      return;
    }
    if (!googleId) {
      alert("googleId가 없음, 수정 불가");
      return;
    }
    const oldArr = ownerProfile?.tech_stack ?? [];
    const newArr = [...oldArr, ...selectedTechList];
    patchProfile(
      { googleId, tech_stack: newArr },
      {
        onSuccess: () => {
          alert("기술 스택 추가 완료");
          setTechStackModalOpen(false);
          setSelectedTechList([]);
        },
        onError: (err: Error) => {
          alert("프로필 수정 실패: " + err.message);
        },
      },
    );
  };

  // (E) 이력서/포트폴리오/기술스택 모달 열기 버튼
  const handleOpenResumeModal = () => setResumeModalOpen(true);
  const handleOpenPortfolioModal = () => setPortfolioModalOpen(true);
  const handleOpenTechStackModal = () => setTechStackModalOpen(true);

  return (
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
  );
};

export default MyRoomCanvas;
