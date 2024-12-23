"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle";

import { User } from "../_model/User";
import Style from "./Canvas.style";
import characterImages from "./CharacterArray"; // { character1: "/path.png", character2: "/path2.png", ... }
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

  // **배경 이미지** (1회 로드)
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // **캐릭터 이미지** 사전 로드 (character1, character2 등)
  // key: "character1", value: <HTMLImageElement>
  const [loadedCharacterImages, setLoadedCharacterImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

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

  // 키 입력 상태
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  // 키 입력을 50ms 단위로만 반영 (최적화)
  const throttledPressedKeys = useThrottle(pressedKeys, 50);

  // 좌우 방향 전환
  const [isFacingRight, setIsFacingRight] = useState(false);

  // 모달 상태
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false);
  const isAnyModalOpen = npc1ModalOpen || npc2ModalOpen || npc3ModalOpen;

  // 포탈 충돌 체크
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

  // NPC 충돌 체크
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

  // **캐릭터 이동 로직**
  useEffect(() => {
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

  // **캔버스 렌더링 로직**
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1) 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2) 배경 그리기
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 3) 캐릭터 그리기
    users.forEach((user, index) => {
      const img = loadedCharacterImages[user.characterType];
      if (!img) return; // 아직 이미지 로드가 안 됐을 때 안전처리

      const facingRight = index === myCharacterIndex ? isFacingRight : false;
      ctx.save();
      if (facingRight) {
        // 캐릭터 이미지 좌우 반전
        ctx.translate(
          user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
          user.y + MAP_CONSTANTS.IMG_HEIGHT / 2,
        );
        ctx.scale(-1, 1);
        ctx.drawImage(
          img,
          -MAP_CONSTANTS.IMG_WIDTH / 2,
          -MAP_CONSTANTS.IMG_HEIGHT / 2,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
      } else {
        ctx.drawImage(
          img,
          user.x,
          user.y,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
      }
      ctx.restore();

      // **닉네임 표시**
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

  // **배경 이미지 1회 로드**
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => {
      setBackgroundImage(bg);
    };
  }, []);

  // **캐릭터 이미지 1회 로드**
  // characterImages = { character1: "/char1.png", character2: "/char2.png", ... }
  useEffect(() => {
    const entries = Object.entries(characterImages);
    if (entries.length === 0) return;

    const tempObj: { [key: string]: HTMLImageElement } = {};
    let loadedCount = 0;
    const totalCount = entries.length;

    entries.forEach(([charType, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        tempObj[charType] = img;
        loadedCount++;
        if (loadedCount === totalCount) {
          setLoadedCharacterImages(tempObj);
        }
      };
    });
  }, []);

  // **requestAnimationFrame**: 배경 및 캐릭터 계속 그리기 (30프레임 제한)
  useEffect(() => {
    if (!backgroundImage) return;

    const FRAME_RATE = 30; // 초당 프레임 수
    const FRAME_INTERVAL = 1000 / FRAME_RATE; // 프레임 간격 (ms)
    let lastFrameTime = performance.now(); // 마지막 프레임 시간 초기화

    const loop = (currentTime: number) => {
      const delta = currentTime - lastFrameTime;

      if (delta >= FRAME_INTERVAL) {
        render(); // 프레임 간격에 도달하면 렌더링
        lastFrameTime = currentTime; // 마지막 렌더링 시간 업데이트
      }

      requestAnimationRef.current = requestAnimationFrame(loop);
    };

    requestAnimationRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [backgroundImage, users, loadedCharacterImages]);

  // **키보드 이벤트 등록**
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return; // 모달 열려 있으면 무시
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));

      // 스페이스바 시 포탈 & NPC 체크
      if (e.key === " ") {
        const route = getPortalRouteIfOnPortal();
        if (route) {
          router.push(route);
          return;
        }
        const npcIndex = getNpcIndexIfOnNpc();
        if (npcIndex !== null) {
          if (npcIndex === 0) setNpc1ModalOpen(true);
          else if (npcIndex === 1) setNpc2ModalOpen(true);
          else if (npcIndex === 2) setNpc3ModalOpen(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return; // 모달 열려 있으면 무시
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isAnyModalOpen]);

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
