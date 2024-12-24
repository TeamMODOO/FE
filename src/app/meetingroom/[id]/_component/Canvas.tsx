"use client";

import React, { useEffect, useRef, useState } from "react";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

// 맵의 요소들 정의(이미지 크기 등)
const MAP_CONSTANTS = {
  IMG_WIDTH: 100,
  IMG_HEIGHT: 150,
  CANVAS_WIDTH: 1150,
  CANVAS_HEIGHT: 830,
};

const MeetingRoomCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // 유저 더미 데이터
  const users: User[] = [
    {
      id: "1",
      x: 350,
      y: 350,
      characterType: "character1",
      nickname: "정글러1",
    },
    {
      id: "2",
      x: 600,
      y: 550,
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
  ];

  // 캔버스 그리기 함수
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !backgroundImage) return;

    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 유저 캐릭터 그리기
    users.forEach((user) => {
      const charImg = new Image();
      charImg.src = characterImages[user.characterType];

      charImg.onload = () => {
        ctx.drawImage(
          charImg,
          user.x,
          user.y,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );

        // 닉네임
        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
          user.nickname,
          user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
          user.y + MAP_CONSTANTS.IMG_HEIGHT + 10,
        );
      };
    });
  };

  // 초기화 (캔버스 크기 고정 설정 및 배경 이미지 로드)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 고정 크기 설정
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    // 배경 이미지 로드
    const bgImg = new Image();
    bgImg.src = "/background/meetingRoom.webp";
    bgImg.onload = () => {
      setBackgroundImage(bgImg);
    };
  }, []);

  // 배경 이미지나 기타 상태가 변할 때마다 재렌더
  useEffect(() => {
    renderCanvas();
  }, [backgroundImage]);

  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default MeetingRoomCanvas;
