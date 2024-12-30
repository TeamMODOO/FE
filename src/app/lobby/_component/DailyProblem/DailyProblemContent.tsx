"use client";

import { useRouter } from "next/navigation";
import React from "react";

import Style from "./DailyProblemContent.style";

/**
 * 기존 DailyProblemProps 등은 더 이상 사용하지 않습니다.
 * 오직 모달에서 "백준 문제 푸시겠습니까?" 메시지 + 이동 버튼만 표시.
 */
const DailyProblemContent: React.FC = () => {
  const router = useRouter();

  return (
    <div className={Style.container}>
      <h3 className={Style.heading}>백준 문제를 풀러 가시겠습니까?</h3>
      <p className="my-4">이동 버튼을 누르면 /quest 페이지로 이동합니다.</p>

      <button
        onClick={() => router.push("/quest")}
        className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        이동하기
      </button>
      <button
        onClick={() => router.push("/questmap")}
        className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        이동하기22
      </button>
    </div>
  );
};

export default DailyProblemContent;
