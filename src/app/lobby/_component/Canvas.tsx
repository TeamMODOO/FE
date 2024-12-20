"use client";

import React, { useEffect, useRef, useState } from "react";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

const MAP_CONSTANTS = {
  IMG_WIDTH: 60,
  IMG_HEIGHT: 90,
};

const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  const users: User[] = [
    {
      id: "1",
      x: 850,
      y: 350,
      characterType: "character1",
      nickname: "정글러1",
    },
    {
      id: "2",
      x: 600,
      y: 500,
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

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background first
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Render users
    users.forEach((user) => {
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

        // Draw nickname
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
    bgImage.src = "/background/lobby.webp";
    bgImage.onload = () => {
      setBackgroundImage(bgImage);
      // 배경 이미지 로드 완료 후 캐릭터를 렌더링
      render();
    };
  }, []);

  // backgroundImage 혹은 window 사이즈 변경 시 재렌더 필요하면 실행
  useEffect(() => {
    render();
  }, [backgroundImage]);

  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default LobbyCanvas;
