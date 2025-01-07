// src/hooks/myroom/useGuestBookPost.ts
"use client";

import { useState } from "react";

import { useSession } from "next-auth/react";

import axios, { AxiosResponse } from "axios";

// 방명록 작성 요청 본문 타입
interface GuestBookPostRequest {
  content: string;
  is_secret: boolean;
}

// 방명록 작성 성공 응답 타입
interface GuestBookPostResponse {
  message: string;
}

// 방명록 작성 실패 응답 타입
interface GuestBookErrorResponse {
  detail: string;
}

/**
 * **커스텀 훅: useGuestBookPost**
 *방명록을 작성(POST)** 하는 기능
 * @param hostGoogleId - 방명록을 작성할 호스트의 구글 ID
 */
export function useGuestBookPost(hostGoogleId: string) {
  const { data: session, status } = useSession();

  // **방명록 작성 상태 관리**
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postData, setPostData] = useState<GuestBookPostResponse | null>(null);

  /**
   * **방명록 작성 함수**
   *
   * @param content - 방명록 내용
   * @param is_secret - 비밀 방명록 여부
   */
  async function postGuestBook(content: string, is_secret: boolean) {
    try {
      setPostLoading(true);
      setPostError(null);

      // **인증 상태 확인**
      if (status !== "authenticated" || !session?.user?.email) {
        throw new Error("사용자가 인증되지 않았습니다.");
      }

      // **요청 본문 구성**
      const requestBody: GuestBookPostRequest = {
        content,
        is_secret,
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_PATH;
      if (!baseUrl) {
        throw new Error("API 서버 주소가 설정되지 않았습니다.");
      }

      // **POST 요청 보내기**
      const response: AxiosResponse<GuestBookPostResponse> = await axios.post(
        `${baseUrl}/posts/guestbooks/${hostGoogleId}`,
        requestBody,
        {
          withCredentials: true, // 쿠키 설정
          headers: {
            "Content-Type": "application/json",
            // Authorization 헤더 추가 (필요 시)
            // Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      setPostData(response.data);
    } catch (err: unknown) {
      let errorMessage = "방명록 작성 중 오류가 발생했습니다.";

      if (axios.isAxiosError(err)) {
        if (err.response && err.response.data) {
          const errorResponse = err.response.data as GuestBookErrorResponse;
          errorMessage = errorResponse.detail || errorMessage;
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setPostError(errorMessage);
    } finally {
      setPostLoading(false);
    }
  }

  return {
    // **방명록 작성 관련**
    postGuestBook,
    postLoading,
    postError,
    postData,
  };
}
