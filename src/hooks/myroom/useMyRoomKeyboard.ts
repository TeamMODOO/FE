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
 * 스페이스바로 "포탈 이동"만 처리하는 훅 (방명록은 제외)
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

    // 현재 캐릭터 64×64로 가정
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];
    const [pl, pr, pt, pb] = [
      portal.x,
      portal.x + portalW,
      portal.y,
      portal.y + portalH,
    ];

    // 충돌 여부
    return cr > pl && cl < pr && cb > pt && ct < pb;
  }

  // (B) 스페이스바 → 포탈만 처리
  function handleSpaceInteraction() {
    if (checkPortalOverlap()) {
      // 페이지 이동
      window.location.href = portal.route;
    }
    // 방명록(게시판) 로직은 제거
  }

  // (C) 키 다운/업
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isAnyModalOpen) return; // 모달 열려있으면 입력 막기

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
