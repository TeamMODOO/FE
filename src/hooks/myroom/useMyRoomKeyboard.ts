// hooks/myroom/useMyRoomKeyboard.ts
"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { User } from "@/model/User";

interface MyRoomKeyboardProps {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  myUserId: string;
  isAnyModalOpen: boolean;

  // 포탈 정보
  portal: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    route: string;
    name: string;
  };
}

/**
 * 마이룸에서 키 입력을 처리하고,
 * 스페이스바로 "포탈 이동" 처리하는 훅 (방명록은 제외)
 */
export function useMyRoomKeyboard({
  users,
  setUsers,
  myUserId,
  isAnyModalOpen,
  portal,
}: MyRoomKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  // (A) 포탈 충돌 체크
  function checkPortalOverlap(): boolean {
    const me = users.find((u) => u.id === myUserId);
    if (!me) return false;

    const portalW = portal.width ?? 200;
    const portalH = portal.height ?? 200;

    // 캐릭터 크기: 64×64 (CHAR_SCALE=3이면 192×192 일 수도 있음)
    // 여기서는 간단히 64×64 가정
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];
    const [pl, pr, pt, pb] = [
      portal.x,
      portal.x + portalW,
      portal.y,
      portal.y + portalH,
    ];

    return cr > pl && cl < pr && cb > pt && ct < pb;
  }

  // (B) 스페이스바 → 포탈
  function handleSpaceInteraction() {
    if (checkPortalOverlap()) {
      window.location.href = portal.route;
    }
  }

  // (C) 키 다운/업
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isAnyModalOpen) return; // 모달 열려있으면 막기

      // 이동 or 스페이스
      if (e.key === " ") {
        e.preventDefault();
        handleSpaceInteraction();
      }
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isAnyModalOpen, portal, users]);

  return { pressedKeys };
}
