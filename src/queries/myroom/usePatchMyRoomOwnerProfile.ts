"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 * [질문에서 주신 최종 타입 정의]
 * 이력서(resume_url)는 단일 string or null
 * 포트폴리오(portfolio_url)는 string[] or null
 * 기술 스택(tech_stack)은 string[] or null
 */
export interface PatchMyRoomOwnerProfileParams {
  googleId: string;
  bio?: string | null;

  /** 포트폴리오 - 여러 개 가능하므로 string[] | null */
  portfolio_url?: string[] | null;

  /** 이력서 - 단일 string or null */
  resume_url?: string | null;

  /** 기술 스택 - 여러 개 가능하므로 string[] | null */
  tech_stack?: string[] | null;
}

/** 서버 응답 프로필 구조 (resume_url, portfolio_url 등이 string | null) */
interface PatchMyRoomOwnerProfileResponse {
  bio: string | null;
  resume_url: string | null; // 서버에서는 string or null
  portfolio_url: string | null; // 서버에서는 string or null
  tech_stack: string | null; // 서버에서는 string or null
}

/**
 * [PATCH] 마이룸 주인 프로필 수정 훅
 */
export function usePatchMyRoomOwnerProfile() {
  const queryClient = useQueryClient();

  async function patchOwnerProfile(
    payload: PatchMyRoomOwnerProfileParams,
  ): Promise<PatchMyRoomOwnerProfileResponse> {
    const { googleId, ...body } = payload;
    // PATCH /users/profile/{google_id}
    const { data } = await axios.patch<PatchMyRoomOwnerProfileResponse>(
      `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/users/profile/${googleId}`,
      body,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return data;
  }

  return useMutation<
    PatchMyRoomOwnerProfileResponse,
    Error,
    PatchMyRoomOwnerProfileParams
  >({
    mutationFn: patchOwnerProfile,
    onSuccess: (data, variables) => {
      // 1) 캐시 invalidate ("myRoomOwnerProfile" → GET 재호출)
      queryClient.invalidateQueries({
        queryKey: ["myRoomOwnerProfile", variables.googleId],
      });
      // console.log("[usePatchMyRoomOwnerProfile] success:", data);
    },
    onError: (error) => {
      // console.log("[usePatchMyRoomOwnerProfile] error:", error);
    },
  });
}
