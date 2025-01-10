// src/app/lobby/_components/Qna/QnaContent.tsx
"use client";

import React, { useState } from "react";
import { Typewriter, useTypewriter } from "react-simple-typewriter";

import { QnaProps } from "@/model/Qna";

import styles from "./QnaContent.module.css";
import animationStyles from "@/components/modalAnimation/ModalAnimation.module.css";

const QnaContent: React.FC<QnaProps> = ({ qnaList }) => {
  const [text] = useTypewriter({
    words: ["게임 개발자가 되고 싶다면, 나에게로..."],
    loop: 1,
    typeSpeed: 20,
    deleteSpeed: 0,
  });

  // 선택된 질문의 인덱스 (-1은 초기 상태)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  // 선택된 질문의 현재 답변 인덱스
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState<number>(0);

  // 질문 클릭 시
  const handleQuestionClick = (index: number) => {
    setSelectedIndex(index);
    setCurrentAnswerIndex(0); // 새로운 질문 선택 시 답변 인덱스 초기화
  };

  // [이전] 버튼 클릭 시
  const handleGoBack = () => {
    setSelectedIndex(-1);
    setCurrentAnswerIndex(0);
  };

  // [다음] 버튼 클릭 시
  const handleNext = () => {
    const selectedQna = qnaList[selectedIndex];
    if (currentAnswerIndex < selectedQna.answers.length - 1) {
      setCurrentAnswerIndex(currentAnswerIndex + 1);
    }
  };

  // [처음으로] 버튼 클릭 시
  const handleReset = () => {
    setSelectedIndex(-1);
    setCurrentAnswerIndex(0);
  };

  // 초기 상태 (질문 목록 + 안내문)
  if (selectedIndex === -1) {
    return (
      <div>
        {/* 안내 문구 */}
        <div className={styles.mentSection}>
          <p>{text}</p>
        </div>

        {/* 질문 목록 */}
        {qnaList.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col space-x-4 opacity-0 ${animationStyles.fadeInShortDelayed}`}
          >
            <div
              className={`my-2 ${styles.qnaItem}`}
              onClick={() => handleQuestionClick(index)}
            >
              Q. {item.question}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 특정 질문 선택 시
  const selectedQna = qnaList[selectedIndex];
  const currentAnswer = selectedQna.answers[currentAnswerIndex];
  const isLastAnswer = currentAnswerIndex === selectedQna.answers.length - 1;

  return (
    <div>
      <div className={styles.answerBox}>
        <h2 className="mb-5 text-xl font-bold text-[rgb(15,190,135)]">
          Q. {selectedQna.question}
        </h2>
        <div className={styles.answerOutput} style={{ whiteSpace: "pre-line" }}>
          <Typewriter
            key={`${selectedQna.question}-${currentAnswerIndex}`} // 유니크한 키 설정
            words={[`A. ${currentAnswer}`]}
            loop={1}
            typeSpeed={10}
            deleteSpeed={0}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-row-reverse gap-4">
        {!isLastAnswer ? (
          <button onClick={handleNext} className={styles.btn}>
            다음
          </button>
        ) : (
          <button onClick={handleReset} className={styles.btn}>
            처음으로
          </button>
        )}
        <button onClick={handleGoBack} className={styles.btn}>
          이전
        </button>
      </div>
    </div>
  );
};

export default QnaContent;
