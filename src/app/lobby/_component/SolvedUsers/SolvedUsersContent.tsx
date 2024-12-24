"use client";

import React from "react";

import { SolvedUsersProps } from "../../_model/SolvedUser";
import Style from "./SolvedUsersContent.style";

const SolvedUsersContent: React.FC<SolvedUsersProps> = ({
  dailySolvedUsers,
  getTodayString,
}) => {
  const today = getTodayString();
  const solvedToday = dailySolvedUsers.filter((s) => s.solvedDate === today);

  return (
    <div className={Style.container}>
      <h3 className={Style.heading}>오늘 문제 푼 사람 명단</h3>
      {solvedToday.length === 0 ? (
        <p className={Style.message}>아직 아무도 문제를 풀지 않았어요!</p>
      ) : (
        solvedToday.map((u, i) => (
          <p key={i} className={Style.message}>
            {u.nickname} 님이 #{u.solvedProblemId} 문제를 해결!
          </p>
        ))
      )}
    </div>
  );
};

export default SolvedUsersContent;
