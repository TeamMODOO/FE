"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// ★ Auth.js(NextAuth) 훅
import { useSession } from "next-auth/react";

/**
 * 마이룸 주인 프로필을 가져오는 훅
 *  - SessionProvider로 감싸져 있어야 함
 *  - 세션에서 구글 ID를 꺼내, /users/profile/{google_id}로 GET
 */
export function useMyRoomOwnerProfile() {
  // 1) 세션에서 유저 정보
  //    session.user?.id 또는 session.user?.email 등에 실제 구글 ID나 식별자가 있을 것
  //    (프로젝트 설정에 따라 다를 수 있음)
  const { data: session } = useSession();
  const googleId = session?.user?.id || null;
  // ↑ 예: session.user.id 가 곧 구글 OAuth ID라고 가정

  // 2) queryFn
  async function fetchMyRoomOwnerProfile(googleIdParam: string) {
    const { data } = await axios.get(`/users/profile/${googleIdParam}`);
    // data 예: { bio, resume_url, portfolio_url, tech_stack }
    return data;
  }

  // 3) useQuery
  const query = useQuery({
    queryKey: ["myroom-owner", googleId],
    queryFn: () => fetchMyRoomOwnerProfile(googleId as string),
    enabled: !!googleId, // googleId가 있을 때만 (로그인되어 세션에 id 존재할 때만) 요청
  });

  return query; // { data, isLoading, isError, ... }
}
