export interface QA {
  category: string; // Q&A의 카테고리
  question: string; // 질문
  answer: string; // 답변
}

export interface QnaItem {
  question: string;
  answer: string;
}

export interface QnaProps {
  qnaList: QnaItem[];
  selectedQnaIndex: number | null;
  handleQnaClick: (index: number) => void;
}
