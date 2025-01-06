"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { NoticeData } from "@/model/NoticeBoard";

/** 게시글 상세 조회용 훅 */
export function useNoticeDetailQuery(noticeId: number | null) {
  return useQuery<NoticeData>({
    queryKey: ["noticeDetail", noticeId],
    queryFn: async () => {
      const { data } = await axios.get<NoticeData>(
        `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/posts/notices/${noticeId}`,
      );
      //   console.log(`GET /posts/notices/${noticeId} response:`, data);
      return data;
    },
    enabled: noticeId !== null, // noticeId가 있어야만 fetch 실행
    // 필요하면 select, onSuccess 등 추가
  });
}
