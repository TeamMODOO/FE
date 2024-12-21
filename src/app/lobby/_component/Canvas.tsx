"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

const MAP_CONSTANTS = {
  IMG_WIDTH: 60,
  IMG_HEIGHT: 90,
  SPEED: 30,
  CANVAS_WIDTH: 1150,
  CANVAS_HEIGHT: 830,
};

// 포탈 정보 (x, y, width, height, route, name)
const portals = [
  {
    x: 650,
    y: 180,
    width: 130,
    height: 130,
    route: "/myroom/123",
    name: "마이룸",
  },
  {
    x: 400,
    y: 180,
    width: 130,
    height: 130,
    route: "/meetingroom/123",
    name: "회의실",
  },
];

const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
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

  const myCharacterIndex = 1;
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledPressedKeys = useThrottle(pressedKeys, 50);
  const [isFacingRight, setIsFacingRight] = useState(false);

  /**
   * 포탈 위에 있을 경우 해당 route 반환, 아니면 null
   */
  const getPortalRouteIfOnPortal = (): string | null => {
    const myCharacter = users[myCharacterIndex];
    const charLeft = myCharacter.x;
    const charRight = myCharacter.x + MAP_CONSTANTS.IMG_WIDTH;
    const charTop = myCharacter.y;
    const charBottom = myCharacter.y + MAP_CONSTANTS.IMG_HEIGHT;

    for (const portal of portals) {
      const portalLeft = portal.x;
      const portalRight = portal.x + portal.width;
      const portalTop = portal.y;
      const portalBottom = portal.y + portal.height;

      const isOverlap =
        charLeft < portalRight &&
        charRight > portalLeft &&
        charTop < portalBottom &&
        charBottom > portalTop;

      if (isOverlap) {
        return portal.route;
      }
    }
    return null;
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

  // 캔버스에 배경/캐릭터 그리기
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 캐릭터 그리기
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

      // 닉네임
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

  // 매 프레임마다 render
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

  // 스페이스바 -> 포탈 이동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
      if (e.key === " ") {
        const route = getPortalRouteIfOnPortal();
        if (route) {
          router.push(route);
        }
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
  }, [users]);

  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} />
      {portals.map((portal, index) => {
        const isFlipped = index === 1; // 두 번째 포탈만 좌우 반전
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${portal.x}px`,
              top: `${portal.y}px`,
              width: `${portal.width}px`,
              height: `${portal.height}px`,
              textAlign: "center",
            }}
          >
            {/* 이미지만 반전 */}
            <div
              style={{
                transform: isFlipped ? "scaleX(-1)" : "none",
              }}
            >
              <NextImage
                src="/furniture/potal.gif"
                alt="Portal"
                width={portal.width}
                height={portal.height}
                priority
              />
            </div>
            {/* 텍스트는 반전되지 않게 그대로 */}
            <div
              style={{
                marginTop: "5px",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              {portal.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LobbyCanvas;
