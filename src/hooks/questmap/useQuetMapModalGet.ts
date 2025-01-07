// src/hooks/questmap/useQuestMapModalGet.ts

"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import { getRandomQuestNumber } from "@/app/quest/utils/getRandomQuestNumber";

/**
 * 백엔드 API로부터 특정 퀘스트의 문제 해결 결과 목록을 가져오는 훅
 * - 난수 기반으로 quest_number를 정해 GET /quests/results/{quest_number} 요청
 */
interface QuestResult {
  id: number;
  quest_number: number;
  user_email: string;
  user_name: string;
  time_taken: string;
  created_at: string;
}

export function useQuestMapModalGet() {
  const [questNumber, setQuestNumber] = useState<number>(
    getRandomQuestNumber(),
  );
  const [data, setData] = useState<QuestResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 실제 GET 요청을 수행하는 함수
  async function fetchQuestResults() {
    try {
      setLoading(true);
      setError(null);

      // 백엔드 서버 URL
      const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_PATH;
      if (!baseUrl) {
        throw new Error("API 서버 주소가 설정되지 않았습니다.");
      }

      // GET /quests/results/{quest_number} 요청
      const response = await axios.get<QuestResult[]>(
        `${baseUrl}/quests/results/${questNumber}`,
      );

      // 응답 데이터를 상태에 저장
      setData(response.data);
    } catch (err: unknown) {
      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      // (예시) axios 사용 시
      if (axios.isAxiosError(err)) {
        errorMessage = err.message || errorMessage;
      } else if (err instanceof Error) {
        // 일반적인 Error 객체라면
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // 컴포넌트 마운트 시 자동 호출
  useEffect(() => {
    // questNumber가 바뀔 때마다 재요청 (처음에도 1번 요청)
    fetchQuestResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questNumber]);

  // 필요하다면 questNumber를 재설정 할 수 있게 setQuestNumber를 함께 반환
  return {
    questNumber,
    data,
    loading,
    error,
    refetch: fetchQuestResults,
    setQuestNumber,
  };
}
