"use client";

import React from "react";

import { QnaProps } from "../../_model/Qma";

// 예시 QNA 타입
const QnaContent: React.FC<QnaProps> = ({
  qnaList,
  selectedQnaIndex,
  handleQnaClick,
}) => {
  const questModalStyle: React.CSSProperties = {
    background: "#f3d8ae url('/images/quest-window-bg.png') repeat",
    border: "2px solid #8b4513",
    borderRadius: 8,
    padding: "16px",
    color: "#000",
    fontFamily: "MaplestoryOTFBold, sans-serif",
  };

  return (
    <div style={questModalStyle}>
      <h3>QnA</h3>
      {qnaList.map((item, index) => {
        const isOpen = selectedQnaIndex === index;
        return (
          <div key={index} style={{ marginBottom: "8px" }}>
            <div
              onClick={() => handleQnaClick(index)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: isOpen ? "blue" : "black",
              }}
            >
              Q. {item.question}
            </div>
            {isOpen && (
              <div style={{ marginLeft: "16px", marginTop: "4px" }}>
                A. {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QnaContent;
