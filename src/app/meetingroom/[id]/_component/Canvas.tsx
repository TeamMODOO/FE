"use client";

import React, { useEffect, useRef, useState } from "react";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

// 맵의 요소들 정의(이미지 크기 등)
const MAP_CONSTANTS = {
  IMG_WIDTH: 100,
  IMG_HEIGHT: 150,
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

  // 화면에 그리기
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    users.forEach((user) => {
      // 유저 그리기
      const character = new Image();
      character.src = characterImages[user.characterType];

      character.onload = () => {
        context.drawImage(
          character,
          user.x,
          user.y,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );

        // 닉네임 그리시
        context.font = "12px Arial";
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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bgImage = new Image();
    bgImage.src = "/background/meetingRoom.webp";
    bgImage.onload = () => {
      setBackgroundImage(bgImage);
      // 배경 이미지 로드 완료 후 렌더링
      render();
    };
  }, []);

  useEffect(() => {
    render();
  }, [backgroundImage]);

  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default MeetingRoomCanvas;
