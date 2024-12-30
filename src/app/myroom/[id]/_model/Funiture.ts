export interface FurnitureData {
  resumeLink?: string;
  fileName?: string;
  stack?: string;
  url?: string;
  // 필요한 필드를 모두 정의
}

export interface Funiture {
  id: string;
  x: number;
  y: number;
  funitureType: string;
  funiturename: string;
  data?: FurnitureData; // 구체 타입
}

export interface FurnitureInfoModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  furniture: Funiture | null;
}
