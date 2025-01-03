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
  const content = `“오, 거기 지나가는 용사여!
정글 타워 옥상에 용이 나타나 정글러들을 위협하고 있다네.
자네의 도움이 절실하니, 당장 용을 처단하고 이 땅의 평화를 되찾아주겠나?"`;

  return (
    <div className={Style.container}>
      <h3 className={Style.heading}>정글의 수석코치</h3>
      <p className="my-4 whitespace-pre-line">{content}</p>

      {/* 버튼을 세로로 배치 (flex-col) */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.push("/quest")}
          className="
            cursor-pointer 
            py-2 
            text-left 
            text-blue-600 
            hover:text-blue-800 
            hover:underline
          "
        >
          [일일 퀘스트] 백준 문제를 풀어 용을 처치하자!
        </button>

        <button
          onClick={() => router.push("/questmap")}
          className="
            cursor-pointer 
            py-2 
            text-left 
            text-blue-600 
            hover:text-blue-800 
            hover:underline
          "
        >
          명예의 전당으로 바로 이동…
        </button>
      </div>
    </div>
  );
};

export default DailyProblemContent;
