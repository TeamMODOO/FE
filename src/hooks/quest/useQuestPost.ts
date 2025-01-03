// src/hooks/quest/useQuestPost.ts
"use client";

import axios, { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";

interface QuestResultResponse {
  message: string; // "문제 해결 정보 생성 성공"
}

interface ErrorResponse {
  detail?: string; // 백엔드 에러 상세
  message?: string; // 백엔드 에러 메시지
}

/**
 * 문제 결과(해결 시간 등)를 서버에 전송하는 커스텀 훅
 */
export function useQuestPost(questNumber: number) {
  const [data, setData] = useState<QuestResultResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * timeTaken(문자열, "HH:mm:SS")를 받아서
   * POST /quests/results/{quest_number}로 전송
   */
  async function submitQuestResult(timeTaken: string) {
    try {
      setLoading(true);
      setError(null);

      // 환경 변수 예시: NEXT_PUBLIC_API_SERVER_PATH=https://api.jgtower.com
      const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_PATH ?? "";
      const url = `${baseUrl}/quests/results/${questNumber}`;

      // 요청 본문: { time_taken: "HH:mm:SS" }
      const response: AxiosResponse<QuestResultResponse> = await axios.post(
        url,
        { time_taken: timeTaken },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setData(response.data);
      // 예: { message: "문제 해결 정보 생성 성공" }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "문제 해결 정보 생성 중 오류가 발생했습니다.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return {
    data, // { message: "문제 해결 정보 생성 성공" }
    loading, // 로딩 상태
    error, // 에러 메시지
    submitQuestResult, // POST 요청을 트리거하는 함수
  };
}
