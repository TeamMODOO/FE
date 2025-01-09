"use client";

import React, { useEffect, useRef, useState } from "react";

import NextImage from "next/image";
import { useParams } from "next/navigation";

// ---- UI & Hooks
import { Button } from "@/components/ui/button";
import { useMyRoomKeyboard } from "@/hooks/myroom/useMyRoomKeyboard";
import { useMyRoomRenderer } from "@/hooks/myroom/useMyRoomRenderer";
import useLoadSprites from "@/hooks/performance/useLoadSprites";
// ---- Models & Types
import { Funiture } from "@/model/Funiture";
import { Direction, User } from "@/model/User";
// ---- API
import { useMyRoomOwnerProfile } from "@/queries/myroom/useMyRoomOwnerProfile";
import { usePatchMyRoomOwnerProfile } from "@/queries/myroom/usePatchMyRoomOwnerProfile";

// ---- 데이터/상수
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
// ---- 모달들
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
 * - 소켓 제거
 * - 다른 유저 없이 내 캐릭터만
 * - 카메라(좌우 스크롤) & 세로 전체 표시 (2000×900)
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
    bg.src = "/background/myroom.png"; // 2000×900짜리 이미지
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // (3) 내 캐릭터 1명
  const [myUser, setMyUser] = useState<User>({
    id: "me",
    x: 500,
    y: 500,
    nickname: "나",
    characterType: "sprite1",
    direction: 0,
    isMoving: false,
  });

  // (4) 가구 (이력서/포트폴리오/기술스택)
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

  // (7) 모달들
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

  // 가구 클릭 시 정보 표시 위해 저장
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null); // <-- 타입을 null로 통일

  const [pdfUrl, setPdfUrl] = useState("");
  const [clickedPortfolioLink, setClickedPortfolioLink] = useState("");

  const isResumeButtonDisabled = false;
  const isPortfolioButtonDisabled = false;
  const isTechStackButtonDisabled = false;

  const handleOpenResumeModal = () => setResumeModalOpen(true);
  const handleOpenPortfolioModal = () => setPortfolioModalOpen(true);
  const handleOpenTechStackModal = () => setTechStackModalOpen(true);

  // 모달 열림 여부
  const isAnyModalOpen =
    resumeModalOpen ||
    portfolioModalOpen ||
    techStackModalOpen ||
    viewModalOpen ||
    isBoardOpen ||
    pdfModalOpen ||
    portfolioLinkViewModalOpen;

  // (8) 키 입력 훅 → myUser 이동 + 포탈
  /**
   * 여기서 `setUsers` 사용 시,
   *  React.SetStateAction<User[]> = User[] | ((prev: User[]) => User[])
   *  형태이므로 typeof로 함수 여부를 구분해 주어야 합니다.
   */
  const { pressedKeys } = useMyRoomKeyboard({
    users: [{ ...myUser }],
    setUsers: (action) => {
      setMyUser((prev) => {
        const arr = [prev];
        // action이 함수인지( (prevState: User[]) => User[] )  아닌지 체크
        if (typeof action === "function") {
          const newArr = action(arr);
          return newArr[0];
        } else {
          // action이 배열이라면 newArr[0] 사용
          // 만약 빈 배열일 경우 prev 그대로
          return action[0] ? action[0] : prev;
        }
      });
    },
    myUserId: "me",
    isAnyModalOpen,
    portal,
  });

  // (9) 스프라이트 로딩
  const spriteImages = useLoadSprites();

  // (10) rAF 렌더링: 내 캐릭터 + 카메라
  useMyRoomRenderer({
    canvasRef,
    canvasSize,
    backgroundImage,
    spriteImages,
    myUser,
    charScale: CHAR_SCALE,
  });

  // (11) 이동 로직
  useEffect(() => {
    if (isAnyModalOpen) return;

    setMyUser((prev) => {
      // direction, isMoving을 destructuring으로 받아오되
      // 재할당이 전혀 필요하지 않다면 굳이 let으로 받을 필요 X
      // 사용하지 않는다면 제거하거나, 아래처럼 const만 받아 사용해도 됨.
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
        // 움직이지 않는 상태
        return { ...prev, isMoving: false };
      }

      const SPEED = MAP_CONSTANTS.SPEED; // 30
      const SPRITE_SIZE = 64 * CHAR_SCALE; // 캐릭터 실제 크기

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
        } else {
          return { ...item, funitureType: "none", data: {} };
        }
      });
    });

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
        } else {
          return { ...item, funitureType: "none", data: {} };
        }
      });
    });
  }, [ownerProfile]);

  // (B) 가구 클릭
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

  // (C) 이력서/포트폴리오/기술스택 PATCH
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
      {/* Canvas */}
      <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

      {/* 가구 */}
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

      {/* 방명록 */}
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

      {/* 포탈 */}
      <div
        className={Style.furnitureContainerClass}
        style={{ left: portal.x, top: portal.y, width: 200, height: 200 }}
        onClick={() => (window.location.href = portal.route)}
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

      {/* 하단 버튼들 */}
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
        // selectedFurnitureData 가 undefined일 수 있으니, 기본값으로 null을 주어 넘깁니다.
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
