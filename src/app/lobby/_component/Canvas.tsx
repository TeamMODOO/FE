"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

// 맵의 요소들 정의(이미지 크기, 한 번에 이동하는 거리 등)
const MAP_CONSTANTS = {
  IMG_WIDTH: 60,
  IMG_HEIGHT: 90,
  SPEED: 30,
  CANVAS_WIDTH: 1150, // 캔버스의 고정된 가로 크기
  CANVAS_HEIGHT: 830, // 캔버스의 고정된 세로 크기
};

const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const requestAnimationRef = useRef<number | null>(null);

  // 배경 이미지 (포탈 이미지는 <img> 태그로 처리)
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
  const myCharacterIndex = 1;

  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledPressedKeys = useThrottle(pressedKeys, 50);
  const [isFacingRight, setIsFacingRight] = useState(false);

  // 포탈 클릭 시 이동할 페이지
  const handlePortalClick = () => {
    router.push("/myroom/123");
  };

  // 캐릭터 이동 로직
  useEffect(() => {
    const updatedUsers = [...users];
    const myCharacter = updatedUsers[myCharacterIndex];

    if (throttledPressedKeys["w"] && myCharacter.y > 0) {
      myCharacter.y -= MAP_CONSTANTS.SPEED;
    }
    if (throttledPressedKeys["a"] && myCharacter.x > 0) {
      myCharacter.x -= MAP_CONSTANTS.SPEED;
      setIsFacingRight(false);
    }
    if (
      throttledPressedKeys["s"] &&
      myCharacter.y < MAP_CONSTANTS.CANVAS_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      myCharacter.y += MAP_CONSTANTS.SPEED;
    }
    if (
      throttledPressedKeys["d"] &&
      myCharacter.x < MAP_CONSTANTS.CANVAS_WIDTH - MAP_CONSTANTS.IMG_WIDTH
    ) {
      myCharacter.x += MAP_CONSTANTS.SPEED;
      setIsFacingRight(true);
    }

    setUsers(updatedUsers);
  }, [throttledPressedKeys]);

  // 실제 그리기 함수
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 유저 그리기
    users.forEach((user, index) => {
      const characterImage = new Image();
      characterImage.src = characterImages[user.characterType];

      const facingRight = index === myCharacterIndex ? isFacingRight : false;

      context.save();
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

      context.font = "bold 12px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText(
        user.nickname,
        user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
        user.y + MAP_CONSTANTS.IMG_HEIGHT + 10,
      );
    });
  };

  // 배경 이미지 로드
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const bgImage = new Image();
    bgImage.src = "/background/lobby.webp";
    bgImage.onload = () => {
      setBackgroundImage(bgImage);
    };
  }, []);

  // 매 프레임마다 캔버스 렌더링
  useEffect(() => {
    if (backgroundImage) {
      requestAnimationRef.current = requestAnimationFrame(function loop() {
        render();
        requestAnimationRef.current = requestAnimationFrame(loop);
      });
    }

    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [backgroundImage, users]);

  // 키보드 이벤트 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
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
      {/* 캔버스 */}
      <canvas ref={canvasRef} />
      <div
        role="button"
        tabIndex={0}
        onClick={handlePortalClick}
        style={{
          position: "absolute",
          left: "650px",
          top: "180px",
          cursor: "pointer",
        }}
        onKeyPress={() => handlePortalClick()}
      >
        <NextImage
          src="/furniture/potal.gif"
          alt="Portal"
          width={130}
          height={130}
          priority
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={handlePortalClick}
        style={{
          position: "absolute",
          left: "400px",
          top: "180px",
          cursor: "pointer",
          transform: "scaleX(-1)",
        }}
        onKeyPress={() => handlePortalClick()}
      >
        <NextImage
          src="/furniture/potal.gif"
          alt="Portal"
          width={130}
          height={130}
          priority
        />
      </div>
    </div>
  );
};

export default LobbyCanvas;
