// components/QuestMapCanvas/QuestMapCanvas.tsx
"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import useLoadSprites from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";
// (1) 커스텀 훅
import { useQuestMapKeyboard } from "@/hooks/questmap/useQuestMapKeyboard";
import { useQuestMapNpcPortal } from "@/hooks/questmap/useQuestMapNpcPortal";
import { useQuestMapRenderer } from "@/hooks/questmap/useQuestMapRenderer";
// (2) 모델/타입
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import { User } from "@/model/User";

// (3) 모달들
import { NpcModal } from "../Npc/NpcModal";
import RankingModal from "../RankingModal/RankingModal";
// (4) 스타일
import Style from "./QuestMapCanvas.style";

// (5) 상수
const QUEST_MAP_SPEED = 20;
const CHAR_SCALE = 2; // 2배
const MAP_DEFAULT_WIDTH = 1400;
const MAP_DEFAULT_HEIGHT = 700;

// (6) 초기 NPC/포탈 데이터
const initialNpcs: NpcInfo[] = [
  {
    x: 580,
    y: 250,
    width: 200,
    height: 200,
    name: "퀘스트NPC1",
    image: "/character/npc4.webp",
    modalTitle: "퀘스트 NPC #1",
  },
  {
    x: 200,
    y: 300,
    width: 60,
    height: 90,
    name: "퀘스트NPC2",
    image: "/character/character2.png",
    modalTitle: "퀘스트 NPC #2",
  },
];
const initialPortals: PortalInfo[] = [
  {
    x: 620,
    y: 50,
    width: 120,
    height: 120,
    name: "포탈1",
    // DOM 으로 표시 or Canvas 내 표시 중 원하는대로
    image: "/furniture/portal.gif",
    route: "/lobby",
  },
];

const QuestMapCanvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ------------------ (A) 화면 크기 ------------------
  const [canvasSize, setCanvasSize] = useState({
    w: MAP_DEFAULT_WIDTH,
    h: MAP_DEFAULT_HEIGHT,
  });
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCanvasSize({ w, h });
  }, []);

  // ------------------ (B) 사용자 목록 ------------------
  const [users, setUsers] = useState<User[]>([
    {
      id: "quest-user",
      x: 220,
      y: 400,
      nickname: "정글러1",
      characterType: "sprite1",
      direction: 0, // Down
      isMoving: false,
    },
  ]);

  // ------------------ (C) NPC / 포탈 ------------------
  const [questNpcs, setQuestNpcs] = useState<NpcInfo[]>(initialNpcs);
  const [portals, setPortals] = useState<PortalInfo[]>(initialPortals);

  // ------------------ (D) NPC 모달 상태 ------------------
  const [npc1ModalOpen, setNpc1ModalOpen] = useState(false);
  const [npc2ModalOpen, setNpc2ModalOpen] = useState(false);

  // **모달이 하나라도 열려 있으면 true**
  const isAnyModalOpen = npc1ModalOpen || npc2ModalOpen;

  // ------------------ (E) 스프라이트 로딩 ------------------
  const spriteImages = useLoadSprites();

  // ------------------ (F) 키 입력 훅 ------------------
  // spacePressed: "스페이스가 눌린 순간"을 나타내는 flag
  const { pressedKeys, setPressedKeys, spacePressed } = useQuestMapKeyboard({
    isAnyModalOpen,
  });

  // ------------------ (F-2) 스페이스바 시점: NPC/포탈 overlap → 모달 or route 이동
  useEffect(() => {
    // 스페이스가 눌린 '이번 이벤트'에만 검사
    if (!spacePressed) return;
    // 이미 모달이 열려 있다면 새로 열거나 포탈 이동하지 않음
    if (isAnyModalOpen) return;

    const me = users.find((u) => u.id === "quest-user");
    if (!me) return;

    // 캐릭터 사각형
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];

    // 1) NPC 검사
    let foundNpc = false;
    questNpcs.forEach((npc, idx) => {
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cr > nl && cl < nr && cb > nt && ct < nb;
      if (overlap) {
        foundNpc = true;
        if (idx === 0) setNpc1ModalOpen(true);
        if (idx === 1) setNpc2ModalOpen(true);
      }
    });
    if (foundNpc) {
      return;
    }

    // 2) NPC와 겹치지 않았다면 → 포탈 검사
    for (let i = 0; i < portals.length; i++) {
      const p = portals[i];
      const [pl, pr, pt, pb] = [p.x, p.x + p.width, p.y, p.y + p.height];
      const overlap = cr > pl && cl < pr && cb > pt && ct < pb;
      if (overlap) {
        // **여기가 '포탈 이동 로직을 한 번만 수행'하는 지점**
        router.push(p.route);
        return;
      }
    }
  }, [spacePressed, isAnyModalOpen, users, questNpcs, portals, router]);

  // ------------------ (G) NPC/포탈 위치조정 훅 ------------------
  useQuestMapNpcPortal({
    canvasSize,
    questNpcs,
    setQuestNpcs,
    portals,
    setPortals,
  });

  // ------------------ (H) rAF 렌더링 훅 ------------------
  // 포탈을 캔버스에서 그리지 않으려면 portalList: [] 로 넘김
  useQuestMapRenderer({
    canvasRef,
    canvasSize,
    users,
    npcList: questNpcs,
    portalList: [],
    spriteImages,
    charScale: CHAR_SCALE,
    backgroundUrl: "/background/quest_map.webp",
  });

  // ------------------ (I) 이동 로직 ------------------
  const throttledKeys = useThrottle(pressedKeys, 100);

  useEffect(() => {
    // 모달 열려 있으면 이동 막기
    if (isAnyModalOpen) return;

    function getDirection(): number | null {
      if (
        throttledKeys["w"] ||
        throttledKeys["W"] ||
        throttledKeys["ㅈ"] ||
        throttledKeys["ArrowUp"]
      )
        return 1; // up
      if (
        throttledKeys["s"] ||
        throttledKeys["S"] ||
        throttledKeys["ㄴ"] ||
        throttledKeys["ArrowDown"]
      )
        return 0; // down
      if (
        throttledKeys["d"] ||
        throttledKeys["D"] ||
        throttledKeys["ㅇ"] ||
        throttledKeys["ArrowRight"]
      )
        return 2; // right
      if (
        throttledKeys["a"] ||
        throttledKeys["A"] ||
        throttledKeys["ㅁ"] ||
        throttledKeys["ArrowLeft"]
      )
        return 3; // left
      return null;
    }

    setUsers((prev) => {
      const newArr = [...prev];
      const meIdx = newArr.findIndex((u) => u.id === "quest-user");
      if (meIdx < 0) return prev;

      const me = newArr[meIdx];
      let { x, y } = me;
      let moved = false;
      let finalDir = me.direction;

      const dir = getDirection();
      if (dir === 1 && y > 0) {
        y -= QUEST_MAP_SPEED;
        moved = true;
        finalDir = 1;
      } else if (dir === 0 && y < canvasSize.h - 64 * CHAR_SCALE) {
        y += QUEST_MAP_SPEED;
        moved = true;
        finalDir = 0;
      } else if (dir === 2 && x < canvasSize.w - 64 * CHAR_SCALE) {
        x += QUEST_MAP_SPEED;
        moved = true;
        finalDir = 2;
      } else if (dir === 3 && x > 0) {
        x -= QUEST_MAP_SPEED;
        moved = true;
        finalDir = 3;
      }

      newArr[meIdx] = {
        ...me,
        x,
        y,
        direction: finalDir,
        isMoving: moved,
      };
      return newArr;
    });
  }, [throttledKeys, isAnyModalOpen, canvasSize]);

  // ------------------ (J) 포탈(DOM) 표시 ------------------
  const renderPortalsAsDom = () => {
    return portals.map((portal, idx) => (
      <div
        key={`dom-portal-${idx}`}
        style={{
          position: "absolute",
          left: portal.x,
          top: portal.y,
          width: portal.width,
          height: portal.height,
          cursor: "pointer",
          overflow: "hidden",
        }}
        onClick={() => {
          // 클릭 시 이동 (테스트용)
          if (!isAnyModalOpen) {
            router.push(portal.route);
          }
        }}
      >
        <img
          src={portal.image}
          alt={portal.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    ));
  };

  // ------------------ (K) 모달들: 닫을 때도 잘 닫히도록 처리 ------------------
  return (
    <>
      <div
        className={Style.canvasContainerClass}
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* Canvas */}
        <canvas ref={canvasRef} />

        {/* 포탈(DOM) */}
        {renderPortalsAsDom()}
      </div>

      {/* NPC1 모달 */}
      {npc1ModalOpen && (
        <RankingModal
          onClose={() => {
            // 닫기
            setNpc1ModalOpen(false);
          }}
        />
      )}

      {/* NPC2 모달 */}
      <NpcModal
        isOpen={npc2ModalOpen}
        onClose={() => {
          // 닫기
          setNpc2ModalOpen(false);
        }}
        title="퀘스트 NPC2 대화"
      >
        <div>
          <h3>NPC2 대화내용</h3>
          <p>이곳에 퀘스트 NPC2 대사를 넣어보세요.</p>
        </div>
      </NpcModal>
    </>
  );
};

export default QuestMapCanvas;
