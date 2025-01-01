// **수정 후 코드**: store/useUsersStore.ts
"use client";

import { create } from "zustand";

type Direction = 0 | 1 | 2 | 3;

export interface User {
  id: string; // 구글 로그인 시 세션의 user.id 를 그대로 사용
  x: number;
  y: number;
  characterType: string;
  nickname: string;

  direction: Direction; // 0=Down,1=Up,2=Right,3=Left
  isMoving?: boolean;
}

interface UsersStore {
  users: User[];
  setUsers: (users: User[]) => void;
  updateUserPosition: (
    userId: string,
    x: number,
    y: number,
    direction: number,
    isMoving: boolean,
  ) => void;
  addUser: (id: string, nickname: string, x?: number, y?: number) => void;
  removeUser: (id: string) => void;
}

// 초기값 제거
const initialUsers: User[] = [];

const useUsersStore = create<UsersStore>((set) => ({
  users: initialUsers,

  setUsers: (users) => set({ users }),

  updateUserPosition: (userId, x, y, direction, isMoving) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? { ...u, x, y, direction: direction as Direction, isMoving }
          : u,
      ),
    })),

  // x,y 파라미터에 기본값(500,400) 등 임의로 지정
  addUser: (id, nickname, x = 500, y = 400) =>
    set((state) => {
      // 이미 존재하면 위치만 갱신
      const exists = state.users.find((u) => u.id === id);
      if (exists) {
        return {
          users: state.users.map((u) => (u.id === id ? { ...u, x, y } : u)),
        };
      }
      // 새 유저 추가
      const newUser: User = {
        id,
        nickname,
        x,
        y,
        characterType: "character1", // 기본값
        direction: 0,
        isMoving: false,
      };
      return { users: [...state.users, newUser] };
    }),

  // 유저 제거 (혹시 필요 시 사용)
  removeUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),
}));

export default useUsersStore;
