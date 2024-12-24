"use client";

import React from "react";

interface DailyProblemProps {
  dailyProblem: {
    id: number;
    title: string;
    link: string;
  } | null;
  isProblemSolved: boolean;
  handleSolveDailyProblem: () => void;
}

const DailyProblemContent: React.FC<DailyProblemProps> = ({
  dailyProblem,
  isProblemSolved,
  handleSolveDailyProblem,
}) => {
  const questModalStyle: React.CSSProperties = {
    background: "#f3d8ae url('/images/quest-window-bg.png') repeat",
    border: "2px solid #8b4513",
    borderRadius: 8,
    padding: "16px",
    color: "#000",
    fontFamily: "MaplestoryOTFBold, sans-serif",
  };

  if (!dailyProblem) {
    return (
      <div style={questModalStyle}>
        <p>서버에서 오늘의 문제를 아직 받지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div style={questModalStyle}>
      <h3>오늘의 문제</h3>
      <p>
        <strong>
          #{dailyProblem.id} : {dailyProblem.title}
        </strong>
      </p>
      <p>
        <a
          href={dailyProblem.link}
          target="_blank"
          rel="noreferrer"
          style={{ color: "blue" }}
        >
          문제 보러가기
        </a>
      </p>
      {!isProblemSolved ? (
        <button onClick={handleSolveDailyProblem}>풀었어요!</button>
      ) : (
        <p style={{ color: "green" }}>문제 해결 완료! 잘하셨어요!</p>
      )}
    </div>
  );
};

export default DailyProblemContent;
