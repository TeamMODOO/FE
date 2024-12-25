import { create } from "zustand";

export interface User {
  id: string;
  x: number;
  y: number;
  characterType: string;
  nickname: string;
}

interface UsersStore {
  users: User[];
  setUsers: (users: User[]) => void;
  updateUserPosition: (userId: string, x: number, y: number) => void;
}

// 예시: 초기 유저 상태를 정의 (필요에 따라 초기값 없으면 빈 배열로)
const initialUsers: User[] = [
  {
    id: "1",
    x: 550,
    y: 450,
    characterType: "character2",
    nickname: "정글러1",
  },
  {
    id: "2",
    x: 600,
    y: 500,
    characterType: "character1",
    nickname: "정글러2",
  },
  {
    id: "3",
    x: 700,
    y: 400,
    characterType: "character1",
    nickname: "정글러3",
  },
  {
    id: "4",
    x: 800,
    y: 300,
    characterType: "character2",
    nickname: "정글러4",
  },
];

const useUsersStore = create<UsersStore>((set) => ({
  users: initialUsers,
  setUsers: (users) => set({ users }),
  updateUserPosition: (userId, x, y) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, x, y } : user,
      ),
    })),
}));

export default useUsersStore;
