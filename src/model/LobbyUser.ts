export interface User {
  /** 고유 ID */
  id: string;
  /** 닉네임 */
  nickname: string;

  /** 논리 좌표 (실제 스토어상 위치) */
  x: number;
  y: number;
  direction: Direction;
  isMoving?: boolean;

  /** 보간용: 렌더 좌표 (rAF에서 그릴 때 사용) */
  drawX: number;
  drawY: number;

  /** 보간용: 시작좌표 & 목표좌표 & 시작시각 & 지속시간 */
  lerpStartX: number;
  lerpStartY: number;
  lerpTargetX: number;
  lerpTargetY: number;
  lerpStartTime: number;
  lerpDuration: number; // ms 단위 (예: 100)
}

export type Direction = 0 | 1 | 2 | 3;
