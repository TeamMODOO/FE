"use client";

import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

// 맵의 요소들 정의(이미지 크기, 한 번에 이동하는 거리 등)
const MAP_CONSTANTS = {
  IMG_WIDTH: 60,
  IMG_HEIGHT: 90,
  SPEED: 100,
};

const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // 유저 더미 데이터
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
  // 내 캐릭터 인덱스
  const myCharacterIndex = 1;
  // 사용자가 누른 키보드 상태를 기록
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  // 500ms 단위로 pressedKeys를 업데이트
  const throttledPressedKeys = useThrottle(pressedKeys, 500);
  // false: 왼쪽 바라보기, true: 오른쪽 바라보기
  const [isFacingRight, setIsFacingRight] = useState(false);

  // throttledPressedKeys가 변경될 때마다 캐릭터의 위치(x, y)를 업데이트.throttledPressedKeys가 변경될 때마다 캐릭터의 위치(x, y)를 업데이트.
  useEffect(() => {
    const updatedUsers = [...users];
    const myCharacter = updatedUsers[myCharacterIndex];

    // 키 입력에 따라 캐릭터가 한 번에 SPEED 값만큼 이동
    // 화면 경계(canvas.width와 canvas.height)를 넘지 않도록 제한
    if (throttledPressedKeys["w"] && myCharacter.y > 0) {
      myCharacter.y -= MAP_CONSTANTS.SPEED;
    }
    if (throttledPressedKeys["a"] && myCharacter.x > 0) {
      myCharacter.x -= MAP_CONSTANTS.SPEED;
      setIsFacingRight(false);
    }
    if (
      throttledPressedKeys["s"] &&
      myCharacter.y <
        (canvasRef.current?.height || 0) - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      myCharacter.y += MAP_CONSTANTS.SPEED;
    }
    if (
      throttledPressedKeys["d"] &&
      myCharacter.x < (canvasRef.current?.width || 0) - MAP_CONSTANTS.IMG_WIDTH
    ) {
      myCharacter.x += MAP_CONSTANTS.SPEED;
      setIsFacingRight(true);
    }

    setUsers(updatedUsers);
  }, [throttledPressedKeys]);

  // 배경 이미지가 캔버스 크기에 맞게 그려짐
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

      const facingRight = index === myCharacterIndex ? isFacingRight : false;

      context.save();

      // 캐릭터 중심 기준으로 좌우반전하여 캐릭터 그리기
      if (facingRight) {
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
      context.font = "bold 12px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText(
        user.nickname,
        user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
        user.y + MAP_CONSTANTS.IMG_HEIGHT + 10,
      );
    });

    requestAnimationRef.current = requestAnimationFrame(render);
  };

  // 배경 그리기
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
  }, [backgroundImage, users]);

  // 사용자가 누른 키를 pressedKeys 상태로 관리
  useEffect(() => {
    // 키를 누를 때(keydown) 해당 키를 true로 설정.
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };

    // 키를 뗄 때(keyup) 해당 키를 false로 설정.
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
