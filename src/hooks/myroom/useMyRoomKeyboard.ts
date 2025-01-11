// hooks/myroom/useMyRoomKeyboard.ts
"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { User } from "@/model/User";

// src/hooks/myroom/useMyRoomKeyboard.ts
interface MyRoomKeyboardProps {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  myUserId: string;
  isAnyModalOpen: boolean;
  portal: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    route: string;
    name: string;
  };
  /** 추가: 포탈 진입 시 호출 */
  onPortalEnter?: () => void;
}

export function useMyRoomKeyboard({
  users,
  setUsers,
  myUserId,
  isAnyModalOpen,
  portal,
  onPortalEnter, // 콜백
}: MyRoomKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  function checkPortalOverlap(): boolean {
    const me = users.find((u) => u.id === myUserId);
    if (!me) return false;
    const pw = portal.width ?? 200;
    const ph = portal.height ?? 200;
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];
    const [pl, pr, pt, pb] = [portal.x, portal.x + pw, portal.y, portal.y + ph];
    return cr > pl && cl < pr && cb > pt && ct < pb;
  }

  function handleSpaceInteraction() {
    if (checkPortalOverlap()) {
      // 기존: window.location.href = portal.route;
      // 변경: 콜백 호출
      onPortalEnter?.();
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isAnyModalOpen) return;
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
  }, [isAnyModalOpen, users, portal, onPortalEnter]);

  return { pressedKeys };
}
