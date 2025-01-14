"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface OwnerProfileResponse {
  bio: string | null; // 자기소개
  resume_url: string | null; // 이력서 URL
  portfolio_url: string[] | null; // 포트폴리오 링크들
  tech_stack: string[] | null; // 기술 스택들
}

export type OwnerProfile = OwnerProfileResponse;

export function useMyRoomOwnerProfile(googleId?: string) {
  // googleId가 없으면 쿼리를 비활성화
  const enabledFlag = !!googleId;

  // queryFn: GET 호출
  async function fetchOwnerProfile(): Promise<OwnerProfile> {
    // 실제 API URL 예시: /users/profile/955419d1-3e76-444a-a647-b086ebe5478f
    const { data } = await axios.get<OwnerProfile>(
      `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/users/profile/${googleId}`,
    );

    return data;
  }

  return useQuery<OwnerProfile, Error>({
    queryKey: ["myRoomOwnerProfile", googleId],
    queryFn: fetchOwnerProfile,
    enabled: enabledFlag, // googleId가 있어야만 fetch
    staleTime: 1000 * 60 * 5, // 5분 (예시)
    // ------------------ meta.callbacks로 onSuccess / onError 전달 ------------------
    meta: {
      callbacks: {
        onSuccess: (data: OwnerProfile) => {
          // console.log(">> [useMyRoomOwnerProfile] onSuccess:", data);
        },
        onError: (error: Error) => {
          // console.log(">> [useMyRoomOwnerProfile] onError:", error);
        },
      },
    },
  });
}
