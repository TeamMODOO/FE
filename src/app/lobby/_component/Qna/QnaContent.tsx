"use client";

import React from "react";

import { QnaProps } from "../../_model/Qma";
import Style from "./QnaContent.style";

const QnaContent: React.FC<QnaProps> = ({
  qnaList,
  selectedQnaIndex,
  handleQnaClick,
}) => {
  return (
    <div className={Style.container}>
      <h3 className={Style.heading}>QnA</h3>
      {qnaList.map((item, index) => {
        const isOpen = selectedQnaIndex === index;

        // 열림/닫힘 상태에 따라 텍스트 색상 분기
        const textColor = isOpen ? Style.openText : Style.closedText;

        return (
          <div key={index} className={Style.questionWrapper}>
            <div
              onClick={() => handleQnaClick(index)}
              className={`${Style.questionLine} ${textColor}`}
            >
              Q. {item.question}
            </div>
            {isOpen && <div className={Style.answer}>A. {item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
};

export default QnaContent;
