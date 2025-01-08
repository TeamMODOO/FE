"use client";

import React from "react";
import { useTypewriter } from "react-simple-typewriter";

// import { Typewriter } from "@/components/Typewriter";
import { QnaProps } from "@/model/Qna";

import styles from "./QnaContent.module.css";
import animationStyles from "@/components/modalAnimation/ModalAnimation.module.css";

// import Style from "./QnaContent.style";

const QnaContent: React.FC<QnaProps> = ({
  qnaList,
  selectedQnaIndex,
  handleQnaClick,
}) => {
  const [text] = useTypewriter({
    words: ["게임 개발자가 되고 싶다면, 나에게로..."],
    loop: 1,
    typeSpeed: 20,
    deleteSpeed: 0,
  });
  return (
    <div>
      <div>
        {/* <Typewriter
          text={`" 게임 개발자가 되고 싶다면, 나에게로..."`}
          speed={30}
        /> */}
        <p>{text}</p>
      </div>
      {qnaList.map((item, index) => {
        const isOpen = selectedQnaIndex === index;

        // 열림/닫힘 상태에 따라 텍스트 색상 분기
        // const textColor = isOpen ? Style.openText : Style.closedText;

        return (
          <div
            key={index}
            className={`opacity-0 ${animationStyles.fadeInShortDelayed}`}
          >
            <div
              className={styles.qnaItem}
              onClick={() => handleQnaClick(index)}
            >
              Q. {item.question}
            </div>
            {isOpen && <div>A. {item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
};

export default QnaContent;
