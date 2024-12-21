"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";
import { NpcModal } from "./NpcModal";

// 맵의 요소들 정의(이미지 크기, 한 번에 이동하는 거리, 맵 크기)
const MAP_CONSTANTS = {
  IMG_WIDTH: 60,
  IMG_HEIGHT: 90,
  SPEED: 30,
  CANVAS_WIDTH: 1150,
  CANVAS_HEIGHT: 830,
};

// 포탈 정보
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

// NPC 정보
const npcs = [
  {
    x: 350,
    y: 600,
    width: 50,
    height: 80,
    image: "/character/npc1.png",
    modalTitle: "NPC1 대화",
  },
  {
    x: 800,
    y: 500,
    width: 50,
    height: 80,
    image: "/character/npc2.png",
    modalTitle: "NPC2 대화",
  },
  {
    x: 300,
    y: 300,
    width: 60,
    height: 90,
    image: "/character/npc3.png",
    modalTitle: "NPC3 대화",
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

  // 내 캐릭터 인덱스
  const myCharacterIndex = 1;
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledPressedKeys = useThrottle(pressedKeys, 50);
  const [isFacingRight, setIsFacingRight] = useState(false);

  // 모달 상태
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false);

  // 모달 열림 여부 확인
  const isAnyModalOpen = npc1ModalOpen || npc2ModalOpen || npc3ModalOpen;

  // 캐릭터, 포탈 충돌여부
  const getPortalRouteIfOnPortal = (): string | null => {
    const myCharacter = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myCharacter.x,
      myCharacter.x + MAP_CONSTANTS.IMG_WIDTH,
      myCharacter.y,
      myCharacter.y + MAP_CONSTANTS.IMG_HEIGHT,
    ];

    for (const portal of portals) {
      const [pl, pr, pt, pb] = [
        portal.x,
        portal.x + portal.width,
        portal.y,
        portal.y + portal.height,
      ];

      const overlap = cl < pr && cr > pl && ct < pb && cb > pt;
      if (overlap) return portal.route;
    }
    return null;
  };

  // 캐릭터, NPC 충돌여부
  const getNpcIndexIfOnNpc = (): number | null => {
    const myCharacter = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myCharacter.x,
      myCharacter.x + MAP_CONSTANTS.IMG_WIDTH,
      myCharacter.y,
      myCharacter.y + MAP_CONSTANTS.IMG_HEIGHT,
    ];

    for (let i = 0; i < npcs.length; i++) {
      const npc = npcs[i];
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cl < nr && cr > nl && ct < nb && cb > nt;
      if (overlap) return i;
    }
    return null;
  };

  // 캐릭터 이동
  useEffect(() => {
    // 모달이 떠있다면 이동 금지
    if (isAnyModalOpen) return;

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
  }, [throttledPressedKeys, isAnyModalOpen]);

  // 캔버스에 배경, 캐릭터 그리기
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 캐릭터
    users.forEach((user, index) => {
      const characterImage = new Image();
      characterImage.src = characterImages[user.characterType];

      const facingRight = index === myCharacterIndex ? isFacingRight : false;
      ctx.save();
      if (facingRight) {
        ctx.translate(
          user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
          user.y + MAP_CONSTANTS.IMG_HEIGHT / 2,
        );
        ctx.scale(-1, 1);
        ctx.drawImage(
          characterImage,
          -MAP_CONSTANTS.IMG_WIDTH / 2,
          -MAP_CONSTANTS.IMG_HEIGHT / 2,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
      } else {
        ctx.drawImage(
          characterImage,
          user.x,
          user.y,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
      }
      ctx.restore();

      // 닉네임
      ctx.font = "bold 12px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
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

    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // 유저 위치 변경시 다시 렌더링
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

  // 키 이벤트 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 모달이 열려 있다면 그대로 무시(배경 입력 차단)
      if (isAnyModalOpen) return;

      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));

      // 스페이스바 처리
      if (e.key === " ") {
        // 포탈 충돌 체크
        const route = getPortalRouteIfOnPortal();
        if (route) {
          router.push(route);
          return;
        }
        // NPC 충돌 체크
        const npcIndex = getNpcIndexIfOnNpc();
        if (npcIndex !== null) {
          // NPC에 따라 다른 모달 열기
          if (npcIndex === 0) setNpc1ModalOpen(true);
          else if (npcIndex === 1) setNpc2ModalOpen(true);
          else if (npcIndex === 2) setNpc3ModalOpen(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // 모달이 열려 있다면 그대로 무시
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    users,
    isAnyModalOpen, // 모달 열림 상태가 바뀔 때마다 effect 재등록
  ]);

  return (
    <>
      {/* NPC 모달들 */}
      <NpcModal
        isOpen={npc1ModalOpen}
        onClose={() => setNpc1ModalOpen(false)}
        title="NPC1 대화"
      >
        <p>여기는 NPC1 대화 내용 입니다.</p>
      </NpcModal>

      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => setNpc2ModalOpen(false)}
        title="NPC2 대화"
      >
        <p>여기는 NPC2 대화 내용 입니다.</p>
      </NpcModal>

      <NpcModal
        isOpen={npc3ModalOpen}
        onClose={() => setNpc3ModalOpen(false)}
        title="NPC3 대화"
      >
        <p>여기는 NPC3 대화 내용 입니다.</p>
      </NpcModal>

      {/* 로비 Canvas */}
      <div
        className={Style.canvasContainerClass}
        style={{
          position: "relative",
          width: MAP_CONSTANTS.CANVAS_WIDTH,
          height: MAP_CONSTANTS.CANVAS_HEIGHT,
        }}
      >
        {/* 포탈, NPC 등 HTML 요소 */}
        <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
          {portals.map((portal, i) => {
            const isFlipped = i === 1;
            return (
              <div
                key={`portal-${i}`}
                style={{
                  position: "absolute",
                  left: portal.x,
                  top: portal.y,
                  width: portal.width,
                  height: portal.height,
                  textAlign: "center",
                }}
              >
                <div style={{ transform: isFlipped ? "scaleX(-1)" : "none" }}>
                  <NextImage
                    src="/furniture/potal.gif"
                    alt="Portal"
                    width={portal.width}
                    height={portal.height}
                    priority
                  />
                </div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {portal.name}
                </div>
              </div>
            );
          })}

          {/* NPC UI */}
          {npcs.map((npc, idx) => (
            <div
              key={`npc-${idx}`}
              style={{
                position: "absolute",
                left: npc.x,
                top: npc.y,
                width: npc.width,
                height: npc.height,
                textAlign: "center",
              }}
            >
              <NextImage
                src={npc.image}
                alt={`NPC-${idx}`}
                width={npc.width}
                height={npc.height}
                priority
              />
              <div
                style={{
                  color: "yellow",
                  fontWeight: "bold",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                NPC {idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* 배경 + 캐릭터 Canvas (zIndex: 2) */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>
    </>
  );
};

export default LobbyCanvas;
