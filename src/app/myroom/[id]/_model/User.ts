export interface User {
  id: string;
  x: number;
  y: number;
  characterType: string;
  nickname: string;

  direction?: Direction; // 0=Down,1=Up,2=Right,3=Left
  isMoving?: boolean;
}

export type Direction = 0 | 1 | 2 | 3;
