// src/hooks/quest/useQuestGet.ts
"use client";

import { useEffect, useState } from "react";

import axios, { AxiosError, AxiosResponse } from "axios";

/**
 * API가 반환하는 Quest 데이터 타입
 */
interface QuestResponse {
  quest_number: number;
  title: string;
  content: string;
  input_example: string;
  output_example: string;
}

/**
 * 오류 응답 타입 (백엔드 구현에 따라 수정)
 */
interface ErrorResponse {
  detail?: string;
  message?: string;
  // 등등 필요하다면 추가
}

/**
 * 특정 문제 정보를 가져오는 커스텀 훅
 *
 * @param questNumber 문제 번호 (정수)
 * @returns data, loading, error, fetchQuest
 */
export function useQuestGet(questNumber?: number) {
  const [data, setData] = useState<QuestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * API 호출 함수
   */
  const fetchQuest = async (questNum: number) => {
    try {
      setLoading(true);
      setError(null);

      // .env(.env.local 등)에 설정된 NEXT_PUBLIC_API_SERVER_PATH를 이용
      // 예: NEXT_PUBLIC_API_SERVER_PATH=https://api.jgtower.com
      const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_PATH ?? "";
      const url = `${baseUrl}/quests/${questNum}`;

      const response: AxiosResponse<QuestResponse> = await axios.get(url, {
        // GET 요청이라면 withCredentials가 꼭 필요한 건 아니지만,
        // 쿠키 사용이 필요한 경우에는 true로 설정.
        withCredentials: false,
      });

      setData(response.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "문제 조회 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * questNumber가 주어지면 자동으로 조회
   */
  useEffect(() => {
    if (questNumber !== undefined && questNumber !== null) {
      void fetchQuest(questNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questNumber]);

  return {
    data, // 성공 시, { quest_number, title, content, ... }
    loading, // 로딩 중인지 여부
    error, // 에러 메시지
    fetchQuest, // 필요하다면 수동으로 다시 호출 가능
  };
}
