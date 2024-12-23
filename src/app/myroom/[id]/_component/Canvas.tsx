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

// --------------------------------------------------
// 모델, 타입, 기타 데이터
// --------------------------------------------------
interface Funiture {
  id: string;
  x: number;
  y: number;
  funitureType: string;
  funiturename: string;
}

interface User {
  id: string;
  x: number;
  y: number;
  characterType: string;
  nickname: string;
}

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
  // 유저, 가구, 게시판 데이터
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

  // 이력서
  const [resume, setResume] = useState<Funiture[]>([
    {
      id: "1",
      x: 100,
      y: 100,
      funitureType: "none",
      funiturename: "이력서",
    },
  ]);

  // 포트폴리오
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

  // 기술 스택
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

  // ---------------------------
  // 중앙에 표시될 게시판(한 개)
  //  - 보드 이미지 크기를 키웠으므로 좌표값을 약간 조정
  // ---------------------------
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
  // 게시판 모달을 열기 위한 state
  // --------------------------------------------------
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  // --------------------------------------------------
  // 게시판에 작성되는 글 목록
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

  // 새 글 입력값
  const [visitorName, setVisitorName] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");

  // --------------------------------------------------
  // 가구 데이터 업데이트 함수 (이력서/포폴/기술스택)
  // --------------------------------------------------
  const updateFurniture = (
    furniture: Funiture[],
    setFurniture: React.Dispatch<React.SetStateAction<Funiture[]>>,
    index: number,
    category: "resume" | "portfolio" | "technologyStack",
  ) => {
    if (index < furniture.length) {
      setFurniture((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                funitureType: `${category}/${category}${index + 1}`,
              }
            : item,
        ),
      );
    }
  };

  // --------------------------------------------------
  // 캔버스에 배경 & 캐릭터들 그리기
  // --------------------------------------------------
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // 배경이미지
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

  // --------------------------------------------------
  // 초기화 및 배경 이미지 로드
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
  // 배경/캐릭터 갱신
  // --------------------------------------------------
  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage, users]);

  // --------------------------------------------------
  // 게시판에 새 글 작성
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

  return (
    <div
      style={{
        position: "relative",
        width: MAP_CONSTANTS.CANVAS_WIDTH,
        height: MAP_CONSTANTS.CANVAS_HEIGHT,
      }}
    >
      {/* 이력서, 포트폴리오, 기술스택 가구 표시 */}
      {[...resume, ...portfolio, ...technologyStack].map((item, index) => (
        <div
          key={`${item.funitureType}-${item.id}-${index}`}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            width: 80,
            height: 80,
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <NextImage
            src={`/interior/${item.funitureType}.gif`}
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
          게시판 오브젝트 (크기 키움)
         ------------------------- */}
      {board.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            // 컨테이너 자체도 어느 정도 크기 확보 (300×200)
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
            // 보드 이미지 자체의 표시 크기
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

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* --------------------------------------------------
          하단에 가구 추가 버튼들
         -------------------------------------------------- */}
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
        <button
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => updateFurniture(resume, setResume, 0, "resume")}
        >
          이력서 추가
        </button>
        <button
          style={{
            backgroundColor: "#28A745",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() =>
            updateFurniture(
              portfolio,
              setPortfolio,
              portfolio.filter((p) => p.funitureType !== "none").length,
              "portfolio",
            )
          }
        >
          포트폴리오 추가
        </button>
        <button
          style={{
            backgroundColor: "#FFC107",
            color: "black",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() =>
            updateFurniture(
              technologyStack,
              setTechnologyStack,
              technologyStack.filter((t) => t.funitureType !== "none").length,
              "technologyStack",
            )
          }
        >
          기술 스택 추가
        </button>
      </div>

      {/* --------------------------------------------------
          게시판 모달 (shadcn Dialog)
         -------------------------------------------------- */}
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
            <Label htmlFor="name" className="text-white">
              이름
            </Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
            />

            <Label htmlFor="message" className="text-white">
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
