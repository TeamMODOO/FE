// hooks/lobby/useUsersRef.ts
"use client";

import { useRef } from "react";

import { Direction, User } from "@/model/LobbyUser";

/**
 * "ref"로 유저 배열을 관리하는 훅
 *  - updateUserPosition 에서 "보간(lerp)" 데이터 세팅
 *  - rAF에서 drawX, drawY를 매 프레임 보간
 */
export default function useUsersRef() {
  const usersRef = useRef<User[]>([]);

  /** 유저 배열 한번에 세팅 */
  function setUsers(newUsers: User[]) {
    usersRef.current = newUsers;
  }

  /**
   * 유저 이동/갱신
   * - x, y는 "논리 좌표" (스토어상 위치)
   * - drawX, drawY는 "보간용 렌더 좌표" (rAF에서 보간)
   * - 여기서는 새 좌표가 들어올 때, lerpStart ~ lerpTarget 세팅
   */
  function updateUserPosition(
    userId: string,
    x: number,
    y: number,
    direction: number,
    isMoving: boolean,
  ) {
    const draft = [...usersRef.current];
    const now = performance.now();

    for (let i = 0; i < draft.length; i++) {
      if (draft[i].id === userId) {
        // 보간 시작점은 현재 drawX, drawY
        const startX = draft[i].drawX;
        const startY = draft[i].drawY;
        // 보간 목표점은 새 x, y
        const targetX = x;
        const targetY = y;

        draft[i] = {
          ...draft[i],
          // 논리 좌표 업데이트
          x,
          y,
          direction: direction as Direction,
          isMoving,

          // 보간용 데이터 갱신
          lerpStartX: startX,
          lerpStartY: startY,
          lerpTargetX: targetX,
          lerpTargetY: targetY,
          lerpStartTime: now,
          lerpDuration: 50, // ← 50ms 동안 보간 (원하는 값 세팅)

          // drawX, drawY는 여기서 바꾸지 않음(=직전 프레임 위치 유지)
          // rAF에서 실제 보간 계산하여 매 프레임 업데이트
        };
        break;
      }
    }

    usersRef.current = draft;
  }

  /**
   * 유저 추가
   * - 처음 추가 시 drawX, drawY = x, y로 맞춰둠 (보간 필요X)
   */
  function addUser(id: string, nickname: string, x = 500, y = 500) {
    const exists = usersRef.current.find((u) => u.id === id);
    if (exists) {
      // 있으면 위치만 갱신
      updateUserPosition(id, x, y, 0, false);
      return;
    }

    const now = performance.now();
    const newUser: User = {
      id,
      nickname,
      x,
      y,
      direction: 0,
      isMoving: false,

      // 보간용 초기값
      drawX: x,
      drawY: y,
      lerpStartX: x,
      lerpStartY: y,
      lerpTargetX: x,
      lerpTargetY: y,
      lerpStartTime: now,
      lerpDuration: 0,
    };
    usersRef.current = [...usersRef.current, newUser];
  }

  /** 유저 제거 */
  function removeUser(id: string) {
    usersRef.current = usersRef.current.filter((u) => u.id !== id);
  }

  return {
    usersRef,
    setUsers,
    updateUserPosition,
    addUser,
    removeUser,
  };
}
