"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// 미팅룸 타입 정의
interface MeetingRoom {
  id: string;
  title: string;
}

// 미팅룸 생성 시 필요한 입력 타입
export interface CreateMeetingRoomPayload {
  room_id: string;
  title: string;
  client_id: string;
}

// 미팅룸 생성 훅
export function useCreateMeetingRoom() {
  const queryClient = useQueryClient();

  async function createMeetingRoom(
    payload: CreateMeetingRoomPayload,
  ): Promise<MeetingRoom> {
    const { data } = await axios.post<MeetingRoom>(
      `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/create`,
      payload,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return data;
  }

  return useMutation<MeetingRoom, Error, CreateMeetingRoomPayload>({
    mutationFn: async (payload) => await createMeetingRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetingroom"] });
    },
  });
}
