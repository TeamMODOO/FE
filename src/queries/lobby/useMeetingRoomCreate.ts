"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// 미팅룸 타입 정의
interface MeetingRoom {
  id: string;
  title: string;
}

// 미팅룸 생성 시 필요한 입력 타입
interface CreateMeetingRoomInput {
  title: string;
}

// 미팅룸 생성 훅
export function useCreateMeetingRoom() {
  async function createMeetingRoom(
    input: CreateMeetingRoomInput,
  ): Promise<MeetingRoom> {
    const { data } = await axios.post<MeetingRoom>("/meeting-rooms", input);
    return data;
  }

  return useMutation<MeetingRoom, Error, CreateMeetingRoomInput>({
    mutationFn: (input) => createMeetingRoom(input),
    meta: {
      callbacks: {
        onSuccess: (data: MeetingRoom) => {
          // console.log("미팅룸 생성 성공:", data);
        },
        onError: (error: Error) => {
          // console.log("미팅룸 생성 실패:", error);
        },
      },
    },
  });
}
