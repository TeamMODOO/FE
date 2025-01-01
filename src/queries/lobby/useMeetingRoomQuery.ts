"use client";

import { useQuery } from "@tanstack/react-query";

// 미팅룸 타입 정의
interface MeetingRoom {
  id: string;
  title: string;
}

// 미팅룸 조회 훅
export function useMeetingRoom() {
  async function fetchMeetingRoom(): Promise<MeetingRoom> {
    const { data } = { data: { id: "id", title: "title" } };
    // await axios.get<MeetingRoom>("/meeting-rooms");
    return data;
  }

  return useQuery<MeetingRoom, Error>({
    queryKey: ["meeting-room"],
    queryFn: () => fetchMeetingRoom(),
    staleTime: 1000 * 60 * 5, // 5분
    meta: {
      callbacks: {
        onSuccess: (data: MeetingRoom) => {
          // console.log("미팅룸 조회 성공:", data);
        },
        onError: (error: Error) => {
          // console.log("미팅룸 조회 실패:", error);
        },
      },
    },
  });
}
