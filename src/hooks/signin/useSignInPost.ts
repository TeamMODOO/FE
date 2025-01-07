// src/hooks/signin/useSignInPost.ts
"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import axios, { AxiosError, AxiosResponse } from "axios";

interface LoginResponse {
  message: string;
}

interface ErrorResponse {
  detail: string;
}

/**
 * 현재 document.cookie에 'access_token' 쿠키가 있는지 확인
 */
function hasAccessTokenCookie(): boolean {
  // 'access_token=...' 형태의 쿠키가 있는지 검사
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("access_token="));
}

export function useSignInPost() {
  const { data: session, status } = useSession();

  // 요청의 상태를 관리하기 위한 state들
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoginResponse | null>(null);

  useEffect(() => {
    if (status === "authenticated" && !hasAccessTokenCookie()) {
      // 이미 로그인된 사용자가 있다면 서버로 로그인 요청을 보냄
      if (session?.user?.email && session.user.name && session.user.id) {
        // console.log(session.user);
        // console.log(hasAccessTokenCookie());
        signIn();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  async function signIn() {
    try {
      setLoading(true);
      setError(null);

      // 필수 데이터 확인
      if (!session?.user?.email || !session?.user?.name || !session?.user?.id) {
        throw new Error("필수 로그인 정보가 없습니다.");
      }

      // console.log(session.user);
      // console.log(session.user.id);

      const requestBody = {
        email: session.user.email,
        name: session.user.name,
        google_id: session.user.id,
        google_image_url: session.user.image || null, // 선택적 필드
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_PATH;
      if (!baseUrl) {
        throw new Error("API 서버 주소가 설정되지 않았습니다.");
      }
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${baseUrl}/users/login`,
        requestBody,
        {
          withCredentials: true, // 쿠키 설정
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // console.log(response.data);
      setData(response.data); // { message: "로그인 성공" }
      // console.log("로그인 성공");
    } catch (err: unknown) {
      // console.error("로그인 요청 실패:", err);
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(
        axiosError.response?.data?.detail ||
          axiosError.message ||
          "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    session,
    status,
    data, // 로그인 응답 { message: string }
    error, // 에러 메시지
    loading, // 로딩 상태
    signIn, // 로그인 요청을 수동으로 재시도하고 싶다면 제공
  };
}
