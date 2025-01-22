export interface TU {
  category: string; // Q&A의 카테고리
  question: string; // 질문
  answers: string[]; // 답변
}

export interface TutorialItem {
  question: string;
  answers: string[];
}

export interface TutorialProps {
  tutorialList: TutorialItem[];
  selectedTutorialIndex: number | null;
  handleTutorialClick: (index: number) => void;
}
