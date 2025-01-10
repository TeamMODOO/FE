/** 가구(혹은 아이템) 한 개의 기본 정보 */
export interface FurnitureData {
  /** PDF URL, 이미지 URL, 링크, 스택 등 여러 경우를 모두 허용 */
  url?: string; // 이력서 PDF etc.
  link?: string; // 포트폴리오 링크
  fileName?: string; // 파일명 (PDF 등)
  stack?: string; // 기술 스택
  resumeLink?: string;
}

export interface Funiture {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  funitureType: string; // 예: "none" | "resume/resume1" | "portfolio/portfolio2" ...
  funiturename: string; // 예: "이력서(PDF)" 등
  data?: FurnitureData; // data 속성 (link, url 등)
}

export interface FurnitureInfoModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  furniture: Funiture | null;
}
