export interface QnaItem {
  question: string;
  answer: string;
}

export interface QnaProps {
  qnaList: QnaItem[];
  selectedQnaIndex: number | null;
  handleQnaClick: (index: number) => void;
}
