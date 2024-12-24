"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useThrottle from "@/hooks/useThrottle"; // 실제 경로

import { NpcInfo } from "../../_model/Npc";
import { PortalInfo } from "../../_model/Portal";
import { User } from "../../_model/User";
import { MAP_CONSTANTS } from "../../data/config";
import LobbyCanvasSurface from "../LobbyCanvasSurface/LobbyCanvasSurface";
import NpcList from "../Npc/NpcList";
import { NpcModal } from "../Npc/NpcModal"; // NPC 모달 컴포넌트
import PortalList from "../Portal/PortalList";
// ★ Tailwind 스타일 임포트
import Style from "./Canvas.style";
import characterImages from "./CharacterArray";

// ---------------------------
// 포탈 정보
// ---------------------------
const portals: PortalInfo[] = [
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

// ---------------------------
// NPC 정보
// ---------------------------
const npcs: NpcInfo[] = [
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

// 메인 로비 캔버스 컴포넌트
const LobbyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  // 배경 이미지
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // 캐릭터 이미지들
  const [loadedCharacterImages, setLoadedCharacterImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  // 유저 데이터(내 캐릭터 포함)
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

  // 키 입력
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const throttledPressedKeys = useThrottle(pressedKeys, 50);

  // 좌우 방향
  const [isFacingRight, setIsFacingRight] = useState(false);

  // 모달(NPC 대화)
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);
  const [npc3ModalOpen, setNpc3ModalOpen] = useState(false);

  const isAnyModalOpen = npc1ModalOpen || npc2ModalOpen || npc3ModalOpen;

  // 포탈 충돌 체크
  const getPortalRouteIfOnPortal = (): string | null => {
    const myChar = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myChar.x,
      myChar.x + MAP_CONSTANTS.IMG_WIDTH,
      myChar.y,
      myChar.y + MAP_CONSTANTS.IMG_HEIGHT,
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
    const myChar = users[myCharacterIndex];
    const [cl, cr, ct, cb] = [
      myChar.x,
      myChar.x + MAP_CONSTANTS.IMG_WIDTH,
      myChar.y,
      myChar.y + MAP_CONSTANTS.IMG_HEIGHT,
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

  // 캐릭터 이동 로직
  useEffect(() => {
    if (isAnyModalOpen) return;
    const updated = [...users];
    const me = updated[myCharacterIndex];

    if (throttledPressedKeys["w"] && me.y > 0) {
      me.y -= MAP_CONSTANTS.SPEED;
    }
    if (throttledPressedKeys["a"] && me.x > 0) {
      me.x -= MAP_CONSTANTS.SPEED;
      setIsFacingRight(false);
    }
    if (
      throttledPressedKeys["s"] &&
      me.y < MAP_CONSTANTS.CANVAS_HEIGHT - MAP_CONSTANTS.IMG_HEIGHT
    ) {
      me.y += MAP_CONSTANTS.SPEED;
    }
    if (
      throttledPressedKeys["d"] &&
      me.x < MAP_CONSTANTS.CANVAS_WIDTH - MAP_CONSTANTS.IMG_WIDTH
    ) {
      me.x += MAP_CONSTANTS.SPEED;
      setIsFacingRight(true);
    }
    setUsers(updated);
  }, [throttledPressedKeys, isAnyModalOpen]);

  // 배경 이미지 로드
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = MAP_CONSTANTS.CANVAS_WIDTH;
    canvas.height = MAP_CONSTANTS.CANVAS_HEIGHT;

    const bg = new Image();
    bg.src = "/background/lobby.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  // 캐릭터 이미지 로드
  useEffect(() => {
    const entries = Object.entries(characterImages);
    if (entries.length === 0) return;

    const tempObj: { [key: string]: HTMLImageElement } = {};
    let loadedCount = 0;
    const total = entries.length;

    entries.forEach(([charType, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        tempObj[charType] = img;
        loadedCount++;
        if (loadedCount === total) {
          setLoadedCharacterImages(tempObj);
        }
      };
    });
  }, []);

  // 키 이벤트
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));

      // 스페이스바 → 포탈 / NPC 상호작용
      if (e.key === " ") {
        const portalRoute = getPortalRouteIfOnPortal();
        if (portalRoute) {
          router.push(portalRoute);
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

    const onKeyUp = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isAnyModalOpen]);

  // 실제 draw 로직 (LobbyCanvasSurface용)
  const renderCanvas = (
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
  ) => {
    if (backgroundImage) {
      ctx.drawImage(
        backgroundImage,
        0,
        0,
        MAP_CONSTANTS.CANVAS_WIDTH,
        MAP_CONSTANTS.CANVAS_HEIGHT,
      );
    }
    // 캐릭터들
    users.forEach((user, idx) => {
      const charImg = loadedCharacterImages[user.characterType];
      if (!charImg) return;

      const facingRight = idx === myCharacterIndex ? isFacingRight : false;

      ctx.save();
      if (facingRight) {
        ctx.translate(
          user.x + MAP_CONSTANTS.IMG_WIDTH / 2,
          user.y + MAP_CONSTANTS.IMG_HEIGHT / 2,
        );
        ctx.scale(-1, 1);
        ctx.drawImage(
          charImg,
          -MAP_CONSTANTS.IMG_WIDTH / 2,
          -MAP_CONSTANTS.IMG_HEIGHT / 2,
          MAP_CONSTANTS.IMG_WIDTH,
          MAP_CONSTANTS.IMG_HEIGHT,
        );
      } else {
        ctx.drawImage(
          charImg,
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

      {/* 전체 화면 */}
      <div className={Style.canvasContainerClass}>
        {/* 포탈 UI */}
        <PortalList portals={portals} />

        {/* NPC UI */}
        <NpcList npcs={npcs} />

        {/* 캔버스 (requestAnimationFrame 로직) */}
        <LobbyCanvasSurface
          canvasRef={canvasRef}
          renderCanvas={renderCanvas}
          users={users}
        />
      </div>
    </>
  );
};

export default LobbyCanvas;
