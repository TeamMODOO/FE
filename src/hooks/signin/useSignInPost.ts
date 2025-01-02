// src/hooks/signin/useSignIn.ts
"use client";

import axios, { AxiosError, AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface LoginResponse {
  message: string;
}

interface ErrorResponse {
  detail: string;
}

export function useSignInPost() {
  const { data: session, status } = useSession();

  // 요청의 상태를 관리하기 위한 state들
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoginResponse | null>(null);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.email &&
      session.user.name &&
      session.user.id // NextAuth에서 id를 어떤 필드명으로 주는지 확인 필요
    ) {
      // 이미 로그인된 사용자가 있다면 서버로 로그인 요청을 보냄
      signIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  async function signIn() {
    try {
      setLoading(true);
      setError(null);

      // 백엔드 명세에 따른 필드들
      const requestBody = {
        email: session?.user?.email,
        name: session?.user?.name,
        google_id: session?.user?.id,
        // API 명세에 따라 필요하다면 google_image_url도 포함
        // google_image_url: session?.user?.image,
      };

      const response: AxiosResponse<LoginResponse> = await axios.post(
        "https://api.jgtower.com/users/login",
        requestBody,
        {
          withCredentials: true, // 쿠키 설정
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setData(response.data); // { message: "로그인 성공" }
      // console.log("로그인 성공");
    } catch (err: unknown) {
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
