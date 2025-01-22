"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { User } from "@/model/User";

interface MyRoomKeyboardProps {
  /** 현재 마이룸에 있는 유저(들).
   *  여기서는 한 명이라도, 다중 구조를 위해 배열로 처리 */
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
  /** 포탈 진입 시 호출할 콜백 (e.g. goLobby) */
  onPortalEnter?: () => void;
}

/**
 * 스페이스바 상호작용, 이동 키 입력 등 처리
 */
export function useMyRoomKeyboard({
  users,
  setUsers,
  myUserId,
  isAnyModalOpen,
  portal,
  onPortalEnter,
}: MyRoomKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  /** 캐릭터와 포탈이 겹쳤는지 확인하는 함수 */
  function checkPortalOverlap(): boolean {
    const me = users.find((u) => u.id === myUserId);
    if (!me) return false;

    // 포탈 크기
    const pWidth = portal.width ?? 200;
    const pHeight = portal.height ?? 200;
    // 캐릭터 크기 (예: 60×120×스케일). 여기선 간단히 64×64라고 가정 가능
    // 혹은 실제 MyRoomCanvas.tsx에서 사용하는 크기를 맞춰줘야 합니다.
    // 여기서는 "가로 60, 세로 120" + 스케일 2 → (120, 240) 등등
    // 간단히 '64×64'로 예시:
    const cWidth = 60 * 2;
    const cHeight = 120 * 2;

    const leftA = me.x;
    const rightA = me.x + cWidth;
    const topA = me.y;
    const bottomA = me.y + cHeight;

    const leftB = portal.x;
    const rightB = portal.x + pWidth;
    const topB = portal.y;
    const bottomB = portal.y + pHeight;

    // 겹치는지 여부
    const overlap =
      rightA > leftB && leftA < rightB && bottomA > topB && topA < bottomB;

    return overlap;
  }

  /** 스페이스바 상호작용 */
  function handleSpaceInteraction() {
    if (checkPortalOverlap()) {
      // 포탈과 겹친 상태에서 스페이스 → onPortalEnter 콜백 호출
      onPortalEnter?.();
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isAnyModalOpen) return;

      // 스페이스바
      if (e.key === " " || e.key === "Space") {
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
