"use client";

import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { Funiture } from "../_model/Funiture";
import { User } from "../_model/User";
import PortfolioModal from "./ PortfolioModal";
import BoardModal from "./BoardModal";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";
import FurnitureInfoModal from "./FurnitureInfoModal";
import interiorImages from "./Interior";
import ResumeModal from "./ResumeModal";
import TechStackModal from "./TechStackModal";

// 예시: 기술 스택 목록
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

// Canvas 크기 상수
const MAP_CONSTANTS = {
  IMG_WIDTH: 100,
  IMG_HEIGHT: 150,
  CANVAS_WIDTH: 1500,
  CANVAS_HEIGHT: 830,
};

const MyRoomCanvas: React.FC = () => {
  // --------------------------------------------------
  // 캔버스 Ref
  // --------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // --------------------------------------------------
  // 유저 데이터
  // --------------------------------------------------
  const [users] = useState<User[]>([
    {
      id: "1",
      x: 350,
      y: 350,
      characterType: "character1",
      nickname: "정글러1",
    },
    {
      id: "2",
      x: 580,
      y: 400,
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

  // --------------------------------------------------
  // (A) 가구 데이터 (이력서 / 포트폴리오 / 기술스택)
  // --------------------------------------------------
  const [resume, setResume] = useState<Funiture[]>([
    { id: "1", x: 100, y: 100, funitureType: "none", funiturename: "이력서" },
  ]);

  const [portfolio, setPortfolio] = useState<Funiture[]>([
    {
      id: "1",
      x: 600,
      y: 100,
      funitureType: "none",
      funiturename: "포트폴리오1",
    },
    {
      id: "2",
      x: 780,
      y: 180,
      funitureType: "none",
      funiturename: "포트폴리오2",
    },
    {
      id: "3",
      x: 900,
      y: 90,
      funitureType: "none",
      funiturename: "포트폴리오3",
    },
  ]);

  const [technologyStack, setTechnologyStack] = useState<Funiture[]>([
    {
      id: "1",
      x: 230,
      y: 470,
      funitureType: "none",
      funiturename: "기술스택1",
    },
    {
      id: "2",
      x: 370,
      y: 550,
      funitureType: "none",
      funiturename: "기술스택2",
    },
    {
      id: "3",
      x: 1050,
      y: 600,
      funitureType: "none",
      funiturename: "기술스택3",
    },
    {
      id: "4",
      x: 950,
      y: 700,
      funitureType: "none",
      funiturename: "기술스택4",
    },
    {
      id: "5",
      x: 1150,
      y: 680,
      funitureType: "none",
      funiturename: "기술스택5",
    },
    {
      id: "6",
      x: 1000,
      y: 450,
      funitureType: "none",
      funiturename: "기술스택6",
    },
    {
      id: "7",
      x: 1160,
      y: 400,
      funitureType: "none",
      funiturename: "기술스택7",
    },
    {
      id: "8",
      x: 1250,
      y: 200,
      funitureType: "none",
      funiturename: "기술스택8",
    },
    {
      id: "9",
      x: 1350,
      y: 100,
      funitureType: "none",
      funiturename: "기술스택9",
    },
  ]);

  // --------------------------------------------------
  // (B) 게시판(방명록)
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
  const [isBoardOpen, setIsBoardOpen] = useState(false); // 게시판 모달

  // 게시판 댓글들
  interface BoardComment {
    id: number;
    name: string;
    message: string;
  }
  const [boardComments, setBoardComments] = useState<BoardComment[]>([
    { id: 1, name: "WellBeingGuru", message: "포스팅 잘 보고 갑니다!" },
    { id: 2, name: "살펴민", message: "저도 잘 보고 가요~" },
    { id: 3, name: "서툴왕자", message: "게시글 잘 보고 갑니다" },
  ]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");

  // --------------------------------------------------
  // (C) 모달 - 이력서 / 포트폴리오 / 기술스택
  // --------------------------------------------------
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);

  // 이력서 링크 입력
  const [resumeLink, setResumeLink] = useState("");
  // 포트폴리오 PDF 파일
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  // 기술 스택 선택
  const [selectedTech, setSelectedTech] = useState("");

  // --------------------------------------------------
  // (D) 가구 상세 보기(이미 등록된 것) 모달
  // --------------------------------------------------
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  // --------------------------------------------------
  // 캔버스 초기화 & 배경 로드
  // --------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const bgImage = new Image();
    bgImage.src = "/background/myroom.webp";
    bgImage.onload = () => {
      setBackgroundImage(bgImage);
    };
  }, []);

  // --------------------------------------------------
  // 배경, 캐릭터 그리기
  // --------------------------------------------------
  useEffect(() => {
    if (!backgroundImage || !canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    // 1) 배경 그리기
    context.clearRect(
      0,
      0,
      MAP_CONSTANTS.CANVAS_WIDTH,
      MAP_CONSTANTS.CANVAS_HEIGHT,
    );
    context.drawImage(
      backgroundImage,
      0,
      0,
      MAP_CONSTANTS.CANVAS_WIDTH,
      MAP_CONSTANTS.CANVAS_HEIGHT,
    );

    // 2) 유저 캐릭터
    users.forEach((user) => {
      const img = new Image();
      img.src = characterImages[user.characterType];
      img.onload = () => {
        context.drawImage(
          img,
          user.x,
          user.y,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
        context.font = "bold 14px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText(
          user.nickname,
          user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
          user.y + MAP_CONSTANTS.IMG_HEIGHT + 10,
        );
      };
    });
  }, [backgroundImage, users]);

  // --------------------------------------------------
  // 게시판 새 글 작성
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
  // "이력서 / 포폴 / 기술스택" 추가 모달 열기
  //   - 개수 제한
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
  // 모달에서 "저장하기" 눌렀을 때 실제 가구 업데이트
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
  // 이미 등록된 가구 클릭 → 상세 보기 모달
  // --------------------------------------------------
  const handleFurnitureClick = (f: Funiture) => {
    if (f.funitureType === "none" || f.funitureType === "board") return;
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  // --------------------------------------------------
  // 버튼 비활성화 체크
  // --------------------------------------------------
  const isResumeButtonDisabled =
    resume.filter((r) => r.funitureType !== "none").length >= 1;
  const isPortfolioButtonDisabled =
    portfolio.filter((p) => p.funitureType !== "none").length >= 3;
  const isTechStackButtonDisabled =
    technologyStack.filter((t) => t.funitureType !== "none").length >= 9;

  return (
    <div className={Style.canvasContainerClass} /* Tailwind 스타일 적용 */>
      {/* -------------------------
          캔버스 (배경 & 캐릭터)
      ------------------------- */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* -------------------------
          이력서/포폴/스택 가구 표시
      ------------------------- */}
      {[...resume, ...portfolio, ...technologyStack].map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            width: 80,
            height: 80,
            textAlign: "center",
            zIndex: 3,
            cursor: item.funitureType !== "none" ? "pointer" : "default",
          }}
          onClick={() => handleFurnitureClick(item)}
        >
          <NextImage
            src={interiorImages[item.funitureType] || interiorImages["none"]}
            alt={item.funiturename}
            width={120}
            height={120}
            priority
          />
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              marginTop: -10,
            }}
          >
            {item.funiturename}
          </div>
        </div>
      ))}

      {/* -------------------------
          게시판
      ------------------------- */}
      {board.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            width: 300,
            height: 200,
            textAlign: "center",
            zIndex: 3,
            cursor: "pointer",
          }}
          onClick={() => setIsBoardOpen(true)}
        >
          <NextImage
            src="/furniture/board.png"
            alt={item.funiturename}
            width={300}
            height={200}
            priority
          />
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              marginTop: -10,
            }}
          >
            {item.funiturename}
          </div>
        </div>
      ))}

      {/* -------------------------
          우측 하단 버튼들
      ------------------------- */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 3,
        }}
      >
        <Button
          onClick={handleOpenResumeModal}
          disabled={isResumeButtonDisabled}
          variant="outline"
        >
          이력서 추가
        </Button>
        <Button
          onClick={handleOpenPortfolioModal}
          disabled={isPortfolioButtonDisabled}
          variant="outline"
        >
          포트폴리오 추가
        </Button>
        <Button
          onClick={handleOpenTechStackModal}
          disabled={isTechStackButtonDisabled}
          variant="outline"
        >
          기술 스택 추가
        </Button>
      </div>

      {/* --------------------------------------------------
          각 모달을 자식 컴포넌트로 분리
      -------------------------------------------------- */}
      {/* (1) 이력서 모달 */}
      <ResumeModal
        open={resumeModalOpen}
        onClose={setResumeModalOpen}
        resumeLink={resumeLink}
        setResumeLink={setResumeLink}
        onSave={handleSaveResume}
      />

      {/* (2) 포트폴리오 모달 */}
      <PortfolioModal
        open={portfolioModalOpen}
        onClose={setPortfolioModalOpen}
        portfolioFile={portfolioFile}
        setPortfolioFile={setPortfolioFile}
        onSave={handleSavePortfolio}
      />

      {/* (3) 기술 스택 모달 */}
      <TechStackModal
        open={techStackModalOpen}
        onClose={setTechStackModalOpen}
        techStackList={techStackList}
        selectedTech={selectedTech}
        setSelectedTech={setSelectedTech}
        onSave={handleSaveTechStack}
      />

      {/* (4) 이미 등록된 가구 상세 모달 */}
      <FurnitureInfoModal
        open={viewModalOpen}
        onClose={setViewModalOpen}
        furniture={selectedFurnitureData}
      />

      {/* (5) 게시판(방명록) 모달 */}
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
