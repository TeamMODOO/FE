"use client";

import { useRef } from "react";

import { Direction, User } from "@/model/User";

/**
 * "ref"를 이용해 유저 배열을 관리하는 커스텀 훅
 * - React state가 아니라 ref에 저장하므로,
 *   변경되어도 React 리렌더링이 발생하지 않음
 */
export default function useUsersRef() {
  // users 배열을 ref에 저장
  const usersRef = useRef<User[]>([]);

  // (1) 유저 목록 한번에 세팅
  function setUsers(newUsers: User[]) {
    usersRef.current = newUsers;
  }

  // (2) 유저 이동/갱신
  function updateUserPosition(
    userId: string,
    x: number,
    y: number,
    direction: number,
    isMoving: boolean,
  ) {
    const draft = [...usersRef.current];
    for (let i = 0; i < draft.length; i++) {
      if (draft[i].id === userId) {
        draft[i] = {
          ...draft[i],
          x,
          y,
          direction: direction as Direction,
          isMoving,
        };
        break;
      }
    }
    usersRef.current = draft;
  }

  // (3) 유저 추가
  function addUser(id: string, nickname: string, x = 500, y = 500) {
    // 이미 있는지 체크
    const exists = usersRef.current.find((u) => u.id === id);
    if (exists) {
      // 있으면 위치만 갱신
      updateUserPosition(id, x, y, 0, false);
      return;
    }
    // 없으면 새 유저
    const newUser: User = {
      id,
      nickname,
      x,
      y,
      direction: 0,
      isMoving: false,
    };
    usersRef.current = [...usersRef.current, newUser];
  }

  // (4) 유저 제거
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
