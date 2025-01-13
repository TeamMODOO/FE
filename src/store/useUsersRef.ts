"use client";

import { useRef } from "react";

import { Direction } from "@/model/User";

export interface LobbyUser {
  id: string;
  nickname: string;

  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;

  drawX: number;
  drawY: number;
  lerpStartX: number;
  lerpStartY: number;
  lerpTargetX: number;
  lerpTargetY: number;
  lerpStartTime: number;
  lerpDuration: number;
}

export default function useUsersRef() {
  const usersRef = useRef<LobbyUser[]>([]);

  /** 특정 유저 정보 가져오기 */
  function getUser(id: string) {
    return usersRef.current.find((u) => u.id === id);
  }

  /** 유저 추가 */
  function addUser(id: string, nickname: string, x = 500, y = 500) {
    // console.log(usersRef.current);
    const found = usersRef.current.find((u) => u.id === id);
    if (found) {
      // 이미 있으면 위치만 업데이트
      updateUserPosition(id, x, y, found.direction, false, nickname);
      return;
    }

    const now = performance.now();
    const newUser: LobbyUser = {
      id,
      nickname,
      x,
      y,
      direction: 0,
      isMoving: false,

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

  /** 유저 이동/갱신 (보간) */
  function updateUserPosition(
    userId: string,
    x: number,
    y: number,
    direction: Direction,
    isMoving: boolean,
    nickname: string,
  ) {
    const draft = [...usersRef.current];
    const now = performance.now();
    // console.log(usersRef.current);

    for (let i = 0; i < draft.length; i++) {
      if (draft[i].id === userId) {
        const startX = draft[i].drawX;
        const startY = draft[i].drawY;

        draft[i] = {
          ...draft[i],
          x,
          y,
          direction,
          isMoving,

          lerpStartX: startX,
          lerpStartY: startY,
          lerpTargetX: x,
          lerpTargetY: y,
          lerpStartTime: now,
          lerpDuration: 50, // 50ms 보간
        };
        break;
      }
    }
    usersRef.current = draft;
  }

  return {
    usersRef,
    getUser,
    addUser,
    removeUser,
    updateUserPosition,
  };
}
