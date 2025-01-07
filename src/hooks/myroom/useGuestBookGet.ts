// src/hooks/myroom/useGuestBookGet.ts
"use client";

import { useEffect, useState } from "react";

import axios, { AxiosResponse } from "axios";

/**
 * **타입 정의**
 */

// 방명록 목록 조회 응답 타입
export interface GuestBookEntry {
  id: number;
  content: string;
  author_name: string;
  guest_google_id: string;
  host_google_id: string;
  is_secret: boolean;
  created_at: string;
}

// 에러 응답 타입 (백엔드가 detail 필드를 내려준다 가정)
interface GuestBookErrorResponse {
  detail: string;
}

/**
 * **커스텀 훅: useGuestBookGet**
 * - 특정 호스트의 방명록 목록을 불러온다. (인증 불필요)
 *
 * @param hostGoogleId - 마이룸 주인의 구글 ID
 * @returns
 *   - guestBooks: 방명록 배열
 *   - loading: 로딩 상태
 *   - error: 에러 메시지
 *   - fetchGuestBookList: 재조회 함수
 */
export function useGuestBookGet(hostGoogleId: string) {
  const [guestBooks, setGuestBooks] = useState<GuestBookEntry[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * **방명록 조회 요청 함수**
   */
  async function fetchGuestBookList() {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_PATH;
      if (!baseUrl) {
        throw new Error("API 서버 주소가 설정되지 않았습니다.");
      }

      // GET 요청
      const response: AxiosResponse<GuestBookEntry[]> = await axios.get(
        `${baseUrl}/posts/guestbooks/${hostGoogleId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setGuestBooks(response.data);
    } catch (err: unknown) {
      let errorMessage = "방명록 목록 조회 중 오류가 발생했습니다.";

      // Axios Error 처리
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.data) {
          const errorResponse = err.response.data as GuestBookErrorResponse;
          errorMessage = errorResponse.detail || errorMessage;
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        // 일반 JS Error
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /**
   * **초기화**
   * - hostGoogleId가 유효할 때 자동으로 방명록 목록 조회
   */
  useEffect(() => {
    if (hostGoogleId) {
      fetchGuestBookList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostGoogleId]);

  return {
    // **방명록 목록**
    guestBooks,
    // **로딩 / 에러 상태**
    loading,
    error,
    // **재조회 함수**
    fetchGuestBookList,
  };
}
