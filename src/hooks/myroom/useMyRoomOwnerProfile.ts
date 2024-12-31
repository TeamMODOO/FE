"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * 마이룸 주인 프로필을 가져오는 훅
 * @param googleId string (URL 경로에서 추출한 사용자의 구글 ID)
 *
 * 서버 엔드포인트: GET /users/profile/{google_id}
 */
export function useMyRoomOwnerProfile(googleId: string | null) {
  // 1) 실제 GET 함수
  async function fetchMyRoomOwnerProfile(googleIdParam: string) {
    const { data } = await axios.get(`/users/profile/${googleIdParam}`);
    // data 예: { bio, resume_url, portfolio_url, tech_stack }
    return data;
  }

  // 2) useQuery
  const query = useQuery({
    queryKey: ["myroom-owner", googleId],
    queryFn: () => fetchMyRoomOwnerProfile(googleId as string),
    enabled: !!googleId, // googleId가 있을 때만 요청
  });

  return query; // { data, isLoading, isError, ... }
}
