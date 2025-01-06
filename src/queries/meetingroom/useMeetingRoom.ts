"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { MeetingRoom } from "@/model/MeetingRoom";

// 미팅룸 타입 정의

// 미팅룸 조회 훅
export function useMeetingRoom() {
  const fetchMeetingRoom = async (): Promise<MeetingRoom[]> => {
    const { data } = await axios.get<MeetingRoom[]>(
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
