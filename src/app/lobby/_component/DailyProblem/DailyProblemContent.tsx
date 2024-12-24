"use client";

import React from "react";

import { DailyProblemProps } from "../../_model/DailyProblem";
// Tailwind 스타일 파일
import Style from "./DailyProblemContent.style";

const DailyProblemContent: React.FC<DailyProblemProps> = ({
  dailyProblem,
  isProblemSolved,
  handleSolveDailyProblem,
}) => {
  if (!dailyProblem) {
    return (
      <div className={Style.container}>
        <p>서버에서 오늘의 문제를 아직 받지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className={Style.container}>
      <h3 className={Style.heading}>오늘의 문제</h3>
      <p>
        <strong className={Style.problemNumber}>
          #{dailyProblem.id} : {dailyProblem.title}
        </strong>
      </p>
      <p>
        <a
          href={dailyProblem.link}
          target="_blank"
          rel="noreferrer"
          className={Style.linkText}
        >
          문제 보러가기
        </a>
      </p>

      {!isProblemSolved ? (
        <button onClick={handleSolveDailyProblem}>풀었어요!</button>
      ) : (
        <p className={Style.solvedMessage}>문제 해결 완료! 잘하셨어요!</p>
      )}
    </div>
  );
};

export default DailyProblemContent;
