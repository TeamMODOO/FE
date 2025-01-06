"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface PatchMyRoomOwnerProfileParams {
  googleId: string;
  bio?: string | null;
  portfolio_url?: string[] | null; // 명세 상 포트폴리오는 여러 URL
  resume_url?: string[] | null; // 명세 상 이력서는 여러 URL
  tech_stack?: string[] | null;
}

interface PatchMyRoomOwnerProfileResponse {
  // 서버에서 반환하는 업데이트된 사용자 프로필
  bio: string | null;
  resume_url: string | null; // 혹은 string[] | null (명세에 따라)
  portfolio_url: string | null; // 혹은 string[] | null
  tech_stack: string | null; // 혹은 string[] | null
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
      // 1) 캐시 invalidate or update
      //    예: "myRoomOwnerProfile" 리페치
      // v4 권장 사용 방식
      queryClient.invalidateQueries({
        queryKey: ["myRoomOwnerProfile", variables.googleId],
      });

      // 2) 성공 시 로직
      // console.log("[usePatchMyRoomOwnerProfile] success:", data);
    },
    onError: (error) => {
      // 실패 시 로직
      // console.log("[usePatchMyRoomOwnerProfile] error:", error);
    },
  });
}
