// store/useUsersStore.ts
"use client";

import { create } from "zustand";

type Direction = 0 | 1 | 2 | 3;

export interface User {
  id: string; // 유일 식별자 (user_id)
  x: number;
  y: number;
  nickname: string; // 화면에 표시할 이름 (user_name)
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

// 초기값
const initialUsers: User[] = [];

const useUsersStore = create<UsersStore>((set) => ({
  users: initialUsers,

  setUsers: (users) => set({ users }),

  /** (1) 캐릭터 이동/갱신 */
  updateUserPosition: (userId, x, y, direction, isMoving) =>
    set((state) => {
      // 새 상태 준비
      const updatedUsers = state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              x,
              y,
              direction: direction as Direction,
              isMoving,
            }
          : u,
      );

      // 변경된 배열 콘솔 출력
      // console.log("[updateUserPosition]", updatedUsers);

      return { users: updatedUsers };
    }),

  /** (2) 유저 추가 */
  addUser: (id, nickname, x = 500, y = 500) =>
    set((state) => {
      // 이미 존재하는지 체크
      const exists = state.users.find((u) => u.id === id);

      if (exists) {
        // 이미 있으면 위치만 업데이트
        const updatedUsers = state.users.map((u) =>
          u.id === id ? { ...u, x, y } : u,
        );

        // 변경된 배열 콘솔 출력
        // console.log("[addUser - existed]", updatedUsers);

        return { users: updatedUsers };
      }

      // 새 유저 생성
      const newUser: User = {
        id,
        nickname,
        x,
        y,
        direction: 0,
        isMoving: false,
      };
      const finalUsers = [...state.users, newUser];

      // 변경된 배열 콘솔 출력
      // console.log("[addUser - new user]", finalUsers);

      return { users: finalUsers };
    }),

  /** (3) 유저 제거 */
  removeUser: (id) =>
    set((state) => {
      // console.log("[removeUser] before:", state.users);
      const filtered = state.users.filter((u) => u.id !== id);
      // console.log("[removeUser] after:", filtered);
      return { users: filtered };
    }),
}));

export default useUsersStore;
