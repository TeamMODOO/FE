"use client";

import React, { useState } from "react";
import { Typewriter, useTypewriter } from "react-simple-typewriter";

import { QnaProps } from "@/model/Qna";

import styles from "./QnaContent.module.css";
import animationStyles from "@/components/modalAnimation/ModalAnimation.module.css";

const QnaContent: React.FC<QnaProps> = ({ qnaList }) => {
  const [resetKey, setResetKey] = useState(0);
  const [text] = useTypewriter({
    words: ["게임 개발자가 되고 싶다면, 나에게로..."],
    loop: 1,
    typeSpeed: 20,
    deleteSpeed: 0,
  });

  // -1이면 “초기 상태”로, 질문/답변 목록과 안내 문구를 보여줌
  //  0 이상이면 “특정 질문”을 선택한 상태 -> 해당 질문/답변만 표시
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // 질문 클릭 시
  const handleQuestionClick = (index: number) => {
    setSelectedIndex(index);
  };

  // [이전] 버튼 클릭 시
  const handleGoBack = () => {
    setSelectedIndex(-1);
    setResetKey((prev) => prev + 1);
  };

  // ----------------------------
  // 1) 초기 상태 (질문 목록 + 안내문)
  // ----------------------------
  if (selectedIndex === -1) {
    return (
      <div>
        {/* 안내 문구 */}
        <div>
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

  // ------------------------------------------
  // 2) 특정 질문 선택 시 (단일 질문/답변 + [이전] 버튼)
  // ------------------------------------------
  const selectedQna = qnaList[selectedIndex]; // 선택된 질문/답변

  return (
    <div>
      <div className={styles.answerBox}>
        <h2 className="mb-5 text-xl font-bold text-[rgb(15,190,135)]">
          Q. {selectedQna.question}
        </h2>
        {/* <p className="mt-2 whitespace-pre-line">A. {selectedQna.answer}</p> */}
        <div className={styles.answerOutput}>
          <Typewriter
            key={selectedQna.answer} // <-- key를 질문/답변 등으로 부여
            words={[`A. ${selectedQna.answer}`]}
            loop={1}
            typeSpeed={10}
            deleteSpeed={0}
          />
        </div>
      </div>
      <div className="flex flex-row-reverse">
        {/* [이전] 버튼 */}
        <button
          onClick={handleGoBack}
          className="rounded bg-gray-200 px-3 py-1 text-black"
        >
          이전
        </button>
      </div>
    </div>
  );
};

export default QnaContent;
