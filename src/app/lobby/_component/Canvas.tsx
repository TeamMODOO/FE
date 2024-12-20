"use client";

import React, { useEffect, useRef, useState } from "react";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

const MAP_CONSTANTS = {
  IMG_WIDTH: 60,
  IMG_HEIGHT: 90,
  SPEED: 3,
};

const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [users, setUsers] = useState<User[]>([
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
  ]);
  const myCharacterIndex = 1; // 내 캐릭터의 인덱스
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const [isFacingRight, setIsFacingRight] = useState(false); // false: 왼쪽 바라보기, true: 오른쪽 바라보기

  const moveCharacter = () => {
    const updatedUsers = [...users];
    const myCharacter = updatedUsers[myCharacterIndex];

    if (pressedKeys["w"] && myCharacter.y > 0) {
      myCharacter.y -= MAP_CONSTANTS.SPEED;
    }
    if (pressedKeys["a"] && myCharacter.x > 0) {
      myCharacter.x -= MAP_CONSTANTS.SPEED;
    }
    if (
      pressedKeys["s"] &&
      myCharacter.y <
        (canvasRef.current?.height || 0) - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      myCharacter.y += MAP_CONSTANTS.SPEED;
    }
    if (
      pressedKeys["d"] &&
      myCharacter.x < (canvasRef.current?.width || 0) - MAP_CONSTANTS.IMG_WIDTH
    ) {
      myCharacter.x += MAP_CONSTANTS.SPEED;
    }

    setUsers(updatedUsers);
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 유저 그리기
    users.forEach((user, index) => {
      const characterImage = new Image();
      characterImage.src = characterImages[user.characterType];

      // 내 캐릭터만 방향 반영 (필요시 모든 캐릭터에 적용 가능)
      const facingRight = index === myCharacterIndex ? isFacingRight : false;

      context.save();
      // 캐릭터 중심 기준으로 좌우반전
      if (facingRight) {
        // 오른쪽 바라보는 경우
        // 중심 기준으로 반전하기 위해 translate 후 scale
        context.translate(
          user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
          user.y + MAP_CONSTANTS.IMG_HEIGHT / 2,
        );
        context.scale(-1, 1);
        context.drawImage(
          characterImage,
          -MAP_CONSTANTS.IMG_WIDTH / 2,
          -MAP_CONSTANTS.IMG_HEIGHT / 2,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
      } else {
        // 왼쪽 바라보는 경우(기본)
        context.drawImage(
          characterImage,
          user.x,
          user.y,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
      }
      context.restore();

      // 닉네임 그리기
      context.font = "12px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText(
        user.nickname,
        user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
        user.y + MAP_CONSTANTS.IMG_HEIGHT + 10,
      );
    });

    moveCharacter();
    requestAnimationRef.current = requestAnimationFrame(render);
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
    };
  }, []);

  useEffect(() => {
    if (backgroundImage) {
      requestAnimationRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [backgroundImage, users, isFacingRight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
      // 방향 전환 처리
      if (e.key === "d") {
        setIsFacingRight(true);
      }
      if (e.key === "a") {
        setIsFacingRight(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default LobbyCanvas;
