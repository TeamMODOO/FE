"use client";

import React from "react";

import { SolvedUsersProps } from "../../_model/SolvedUser";

const SolvedUsersContent: React.FC<SolvedUsersProps> = ({
  dailySolvedUsers,
  getTodayString,
}) => {
  const questModalStyle: React.CSSProperties = {
    background: "#f3d8ae url('/images/quest-window-bg.png') repeat",
    border: "2px solid #8b4513",
    borderRadius: 8,
    padding: "16px",
    color: "#000",
    fontFamily: "MaplestoryOTFBold, sans-serif",
  };

  const today = getTodayString();
  const solvedToday = dailySolvedUsers.filter((s) => s.solvedDate === today);

  return (
    <div style={questModalStyle}>
      <h3>오늘 문제 푼 사람 명단</h3>
      {solvedToday.length === 0 ? (
        <p>아직 아무도 문제를 풀지 않았어요!</p>
      ) : (
        solvedToday.map((u, i) => (
          <p key={i}>
            {u.nickname} 님이 #{u.solvedProblemId} 문제를 해결!
          </p>
        ))
      )}
    </div>
  );
};

export default SolvedUsersContent;
