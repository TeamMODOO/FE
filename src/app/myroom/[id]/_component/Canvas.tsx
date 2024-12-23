"use client";

import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { Funiture } from "../_model/Funiture";
import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

const MAP_CONSTANTS = {
  IMG_WIDTH: 100,
  IMG_HEIGHT: 150,
  CANVAS_WIDTH: 1500,
  CANVAS_HEIGHT: 830,
};

const MyRoomCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // 유저 데이터
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

  // 가구 데이터
  const [resume, setResume] = useState<Funiture[]>([
    {
      id: "1",
      x: 100,
      y: 100,
      funitureType: "none",
      funiturename: "이력서",
    },
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

  // 가구 데이터 업데이트 함수
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
                funitureType: `${category}/${category}${index + 1}`, // 동적 문자열 생성
              }
            : item,
        ),
      );
    }
  };

  // 캔버스 렌더링
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 유저 캐릭터 그리기
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

  // 초기화 및 배경 이미지 로드
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

  // 캔버스 업데이트
  useEffect(() => {
    renderCanvas();
  }, [backgroundImage, users]);

  return (
    <div
      className={Style.canvasContainerClass}
      style={{
        position: "relative",
        width: MAP_CONSTANTS.CANVAS_WIDTH,
        height: MAP_CONSTANTS.CANVAS_HEIGHT,
      }}
    >
      {/* 가구 배치 */}
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
            src={`/interior/${item.funitureType}.gif`} // 확장자 추가
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

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* 버튼 */}
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
    </div>
  );
};

export default MyRoomCanvas;
