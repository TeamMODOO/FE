"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// 미팅룸 타입 정의
interface MeetingRoom {
  room_id: string;
  title: string;
  clients: string[];
}

// 미팅룸 조회 훅
export function useMeetingRoom() {
  const fetchMeetingRoom = async (): Promise<MeetingRoom> => {
    const { data } = await axios.get<MeetingRoom>(
      `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/list`,
    );
    return data;
  };

  return useQuery({
    queryKey: ["meetingroom"] as const,
    queryFn: fetchMeetingRoom,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
