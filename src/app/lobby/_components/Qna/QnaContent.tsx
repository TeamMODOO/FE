"use client";

import React, { useEffect, useState } from "react";
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

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState<number>(0);

  // 질문 클릭 시
  const handleQuestionClick = (index: number) => {
    setSelectedIndex(index);
    setCurrentAnswerIndex(0);
  };

  // [이전] 버튼
  const handleGoBack = () => {
    setSelectedIndex(-1);
    setCurrentAnswerIndex(0);
  };

  // [다음] 버튼
  const handleNext = () => {
    const selectedQna = qnaList[selectedIndex];
    if (currentAnswerIndex < selectedQna.answers.length - 1) {
      setCurrentAnswerIndex(currentAnswerIndex + 1);
    }
  };

  // [처음으로] 버튼
  const handleReset = () => {
    setSelectedIndex(-1);
    setCurrentAnswerIndex(0);
  };

  /**
   * 스페이스바로 [다음] 또는 [처음으로] 실행
   * - selectedIndex !== -1 인 상태에서만 동작
   * - 마지막 답변인 경우(handleReset), 아닌 경우(handleNext)
   */
  useEffect(() => {
    const handleSpaceKey = (e: KeyboardEvent) => {
      // 질문 하나 이상을 이미 선택한 경우에만 동작
      if (selectedIndex === -1) return;

      // 스페이스바인지 체크
      if (e.key === " ") {
        e.preventDefault(); // 기본 스크롤 막기

        const selectedQna = qnaList[selectedIndex];
        const isLastAnswer =
          currentAnswerIndex === selectedQna.answers.length - 1;

        // 마지막 답변이라면 -> handleReset()
        // 마지막 답변이 아니라면 -> handleNext()
        if (isLastAnswer) {
          handleReset();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleSpaceKey);
    return () => {
      window.removeEventListener("keydown", handleSpaceKey);
    };
  }, [selectedIndex, currentAnswerIndex, qnaList]);

  // 초기 상태 (질문 목록 + 안내문)
  if (selectedIndex === -1) {
    return (
      <div>
        <div className={styles.mentSection}>
          <p>{text}</p>
        </div>
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
        <h2 className="mb-5 text-[1.7rem] font-bold text-yellow-300">
          Q. {selectedQna.question}
        </h2>
        <div className={styles.answerOutput} style={{ whiteSpace: "pre-line" }}>
          <Typewriter
            key={`${selectedQna.question}-${currentAnswerIndex}`}
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
