"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { NoticeData } from "@/model/NoticeBoard";

/** 게시글 목록 조회용 훅 */
export function useNoticesListQuery() {
  return useQuery<NoticeData[]>({
    queryKey: ["noticesList"], // 캐싱 키
    queryFn: async () => {
      const { data } = await axios.get<NoticeData[]>(
        `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/posts/notices`,
      );
      return data;
    },
  });
}
