"use client";

import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
// shadcn ui 컴포넌트
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Funiture } from "../_model/Funiture";
import { User } from "../_model/User";

// --------------------------------------------------
// 모델, 타입, 기타 데이터
// --------------------------------------------------

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

const characterImages: Record<string, string> = {
  character1: "/character/character1.png",
  character2: "/character/character2.png",
};

const MAP_CONSTANTS = {
  IMG_WIDTH: 100,
  IMG_HEIGHT: 150,
  CANVAS_WIDTH: 1500,
  CANVAS_HEIGHT: 830,
};

// --------------------------------------------------
// 본문 시작
// --------------------------------------------------
const MyRoomCanvas: React.FC = () => {
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
  // 가구 데이터 (이력서 / 포트폴리오 / 기술스택)
  //  - 처음엔 "none" 상태
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
  // 게시판 (방명록)
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

  // --------------------------------------------------
  // (1) 게시판 모달 open state
  // --------------------------------------------------
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  // --------------------------------------------------
  // (2) 새 글(게시판 댓글) 관리
  // --------------------------------------------------
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
  // (3) 각 버튼 클릭 시 뜨는 "가구 추가(입력) 모달" 관리
  //     - resume / portfolio / techStack
  // --------------------------------------------------
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);

  // 이력서 입력값
  const [resumeLink, setResumeLink] = useState("");
  // 포트폴리오 PDF
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  // 기술스택 선택
  const [selectedTech, setSelectedTech] = useState("");

  // --------------------------------------------------
  // (4) 이미 바뀐 가구를 클릭하면 "정보 확인 모달" 열기
  //     - 어떤 가구인지, 어떤 데이터인지 표시
  // --------------------------------------------------
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  // --------------------------------------------------
  // 캔버스 그리기
  // --------------------------------------------------
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 유저 캐릭터
    users.forEach((user) => {
      const characterImage = characterImages[user.characterType];
      const img = new Image();
      img.src = characterImage;
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
  };

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

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage, users]);

  // --------------------------------------------------
  // (게시판) 새 글 작성
  // --------------------------------------------------
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: visitorName,
        message: visitorMessage,
      },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  // --------------------------------------------------
  // (가구 추가) 버튼 -> 모달 열기
  //    - 이력서는 1개까지, 포폴은 3개까지, 스택은 9개까지
  // --------------------------------------------------
  const handleOpenResumeModal = () => {
    const count = resume.filter((r) => r.funitureType !== "none").length;
    if (count >= 1) return; // 버튼 비활성 조건
    setResumeModalOpen(true);
  };

  const handleOpenPortfolioModal = () => {
    const count = portfolio.filter((p) => p.funitureType !== "none").length;
    if (count >= 3) return; // 버튼 비활성 조건
    setPortfolioModalOpen(true);
  };

  const handleOpenTechStackModal = () => {
    const count = technologyStack.filter(
      (t) => t.funitureType !== "none",
    ).length;
    if (count >= 9) return; // 버튼 비활성 조건
    setTechStackModalOpen(true);
  };

  // --------------------------------------------------
  // (가구 저장) 모달에서 "저장하기" 클릭 시 실제 업데이트
  // --------------------------------------------------
  const handleSaveResume = () => {
    // 아직 "none" 상태인 이력서 중 첫 번째(혹은 n번째)를 업데이트
    const indexToUpdate = resume.findIndex((r) => r.funitureType === "none");
    if (indexToUpdate !== -1) {
      setResume((prev) =>
        prev.map((item, i) =>
          i === indexToUpdate
            ? {
                ...item,
                funitureType: `resume/resume${indexToUpdate + 1}`,
                data: {
                  resumeLink, // 사용자가 입력한 이력서 링크
                },
              }
            : item,
        ),
      );
    }
    setResumeModalOpen(false);
    setResumeLink("");
  };

  const handleSavePortfolio = () => {
    // 아직 "none" 상태인 포폴 중 첫 번째
    const indexToUpdate = portfolio.findIndex((p) => p.funitureType === "none");
    if (indexToUpdate !== -1 && portfolioFile) {
      setPortfolio((prev) =>
        prev.map((item, i) =>
          i === indexToUpdate
            ? {
                ...item,
                funitureType: `portfolio/portfolio${indexToUpdate + 1}`,
                data: {
                  fileName: portfolioFile.name,
                },
              }
            : item,
        ),
      );
    }
    setPortfolioModalOpen(false);
    setPortfolioFile(null);
  };

  const handleSaveTechStack = () => {
    // 아직 "none" 상태인 기술스택 중 첫 번째
    const indexToUpdate = technologyStack.findIndex(
      (t) => t.funitureType === "none",
    );
    if (indexToUpdate !== -1 && selectedTech) {
      setTechnologyStack((prev) =>
        prev.map((item, i) =>
          i === indexToUpdate
            ? {
                ...item,
                funitureType: `technologyStack/technologyStack${indexToUpdate + 1}`,
                data: {
                  stack: selectedTech,
                },
              }
            : item,
        ),
      );
    }
    setTechStackModalOpen(false);
    setSelectedTech("");
  };

  // --------------------------------------------------
  // (가구 클릭) : 이미 업데이트된 가구면 정보 확인 모달
  // --------------------------------------------------
  const handleFurnitureClick = (f: Funiture) => {
    if (f.funitureType === "none" || f.funitureType === "board") {
      return; // "none" 이거나 게시판이면 스킵 (게시판은 다른 모달이 있음)
    }
    // 이미 바뀐 가구면 해당 데이터 확인
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  // --------------------------------------------------
  // 버튼 비활성화 조건
  // --------------------------------------------------
  const isResumeButtonDisabled =
    resume.filter((r) => r.funitureType !== "none").length >= 1;
  const isPortfolioButtonDisabled =
    portfolio.filter((p) => p.funitureType !== "none").length >= 3;
  const isTechStackButtonDisabled =
    technologyStack.filter((t) => t.funitureType !== "none").length >= 9;

  return (
    <div
      style={{
        position: "relative",
        width: MAP_CONSTANTS.CANVAS_WIDTH,
        height: MAP_CONSTANTS.CANVAS_HEIGHT,
      }}
    >
      {/* -------------------------------------
          "이력서 / 포폴 / 기술스택" 가구 표시
          클릭 시 info 모달 오픈
      -------------------------------------- */}
      {[...resume, ...portfolio, ...technologyStack].map((item, index) => (
        <div
          key={`${item.id}-${index}`}
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
            src={`/interior/${item.funitureType}.gif`} // "none"이면 interior/none.gif (혹은 에러?) => 필요시 placeholder gif
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

      {/* ------------------------------------
          게시판 오브젝트 (방명록)
      ------------------------------------- */}
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

      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* ------------------------------------------
          하단 버튼들: 이력서 / 포폴 / 기술스택 추가
          - 모달로 입력받아야 하므로, 클릭 시 모달 오픈
          - 개수 제한에 따라 버튼 비활성화
      ------------------------------------------- */}
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

      {/* 
        --------------------------------------------------
          (A) 이력서 추가 모달
        --------------------------------------------------
      */}
      <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>이력서 만들기</DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <Label htmlFor="resumeLink">이력서 링크</Label>
            <Input
              id="resumeLink"
              placeholder="이력서 링크(예: Google Docs, Notion 등)"
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
            />
            <Button onClick={handleSaveResume}>저장하기</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 
        --------------------------------------------------
          (B) 포트폴리오 추가 모달
        --------------------------------------------------
      */}
      <Dialog open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>포트폴리오 만들기</DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <Label htmlFor="portfolioPdf">PDF 파일 업로드</Label>
            <Input
              id="portfolioPdf"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setPortfolioFile(e.target.files[0]);
                }
              }}
            />
            {portfolioFile && <div>선택된 파일: {portfolioFile.name}</div>}

            <Button onClick={handleSavePortfolio}>저장하기</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 
        --------------------------------------------------
          (C) 기술 스택 추가 모달
        --------------------------------------------------
      */}
      <Dialog open={techStackModalOpen} onOpenChange={setTechStackModalOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle>기술 스택 선택</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <Input
              placeholder="스택 검색(예: react)... (데모)"
              className="mb-2"
            />
            {/* 추천 스택 목록 */}
            <div className="flex flex-wrap gap-2">
              {techStackList.map((stack) => (
                <Button
                  key={stack}
                  variant={selectedTech === stack ? "default" : "outline"}
                  onClick={() => setSelectedTech(stack)}
                >
                  {stack}
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={handleSaveTechStack}>저장하기</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 
        --------------------------------------------------
          (D) 이미 바뀐 가구를 클릭했을 때,
              저장된 정보 확인 모달
        --------------------------------------------------
      */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>등록 정보 확인</DialogTitle>
          </DialogHeader>

          {selectedFurnitureData && (
            <div className="mt-4 space-y-2">
              {selectedFurnitureData.funitureType.startsWith("resume/") && (
                <>
                  <div className="font-bold">[이력서]</div>
                  <div>링크: {selectedFurnitureData.data?.resumeLink}</div>
                </>
              )}

              {selectedFurnitureData.funitureType.startsWith("portfolio/") && (
                <>
                  <div className="font-bold">[포트폴리오]</div>
                  <div>파일명: {selectedFurnitureData.data?.fileName}</div>
                </>
              )}

              {selectedFurnitureData.funitureType.startsWith(
                "technologyStack/",
              ) && (
                <>
                  <div className="font-bold">[기술 스택]</div>
                  <div>선택 스택: {selectedFurnitureData.data?.stack}</div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 
        --------------------------------------------------
          (E) 게시판 모달 (기존 방명록 기능)
        --------------------------------------------------
      */}
      <Dialog open={isBoardOpen} onOpenChange={setIsBoardOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>방명록</DialogTitle>
          </DialogHeader>

          {/* 댓글 목록 */}
          <div className="mt-4 max-h-[300px] overflow-y-auto border p-2">
            {boardComments.map((comment) => (
              <div key={comment.id} className="mb-4">
                <div className="font-bold text-black">{comment.name}</div>
                <div className="text-black">{comment.message}</div>
              </div>
            ))}
          </div>

          {/* 입력폼 */}
          <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="name" className="text-black">
              이름
            </Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
            />

            <Label htmlFor="message" className="text-black">
              글
            </Label>
            <Input
              id="message"
              placeholder="글 내용을 입력하세요"
              value={visitorMessage}
              onChange={(e) => setVisitorMessage(e.target.value)}
            />

            <Button className="mt-2" onClick={handleAddComment}>
              작성하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRoomCanvas;
