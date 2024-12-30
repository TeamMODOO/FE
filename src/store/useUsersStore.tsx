// store/useUsersStore.ts
"use client";

import { create } from "zustand";

export interface User {
  id: string;
  nickname: string;
  x: number;
  y: number;
  characterType: string;
  avatarUrl?: string;

  // 4방향(0=down,1=up,2=right,3=left)
  direction: number;
  // 움직이고 있는지 여부
  isMoving: boolean;
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
  addUser: (
    id: string,
    nickname: string,
    x: number,
    y: number,
    avatarUrl?: string,
  ) => void;
}

// 초기 값 (예시)
const initialUsers: User[] = [
  {
    id: "1",
    nickname: "정글러1",
    x: 550,
    y: 450,
    characterType: "character2",
    avatarUrl: "/character/character2.png",

    direction: 0,
    isMoving: false,
  },
  {
    id: "2",
    nickname: "정글러2",
    x: 600,
    y: 500,
    characterType: "character1",
    avatarUrl: "/character/character1.png",

    direction: 0,
    isMoving: false,
  },
  {
    id: "3",
    nickname: "정글러3",
    x: 700,
    y: 400,
    characterType: "character1",
    avatarUrl: "/character/character1.png",

    direction: 0,
    isMoving: false,
  },
  {
    id: "4",
    nickname: "정글러4",
    x: 800,
    y: 300,
    characterType: "character2",
    avatarUrl: "/character/character2.png",

    direction: 0,
    isMoving: false,
  },
];

const useUsersStore = create<UsersStore>((set) => ({
  users: initialUsers,

  setUsers: (users) => set({ users }),

  updateUserPosition: (userId, x, y, direction, isMoving) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, x, y, direction, isMoving } : u,
      ),
    })),

  addUser: (id, nickname, x, y, avatarUrl) =>
    set((state) => {
      // 이미 존재하면 위치만 갱신 or 무시
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
        avatarUrl,
        direction: 0,
        isMoving: false,
      };
      return { users: [...state.users, newUser] };
    }),
}));

export default useUsersStore;
