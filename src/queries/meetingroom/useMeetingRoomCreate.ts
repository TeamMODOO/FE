"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { CreateMeetingRoomPayload } from "@/model/MeetingRoom";

export function useCreateMeetingRoom() {
  const queryClient = useQueryClient();

  async function createMeetingRoom(
    payload: CreateMeetingRoomPayload,
  ): Promise<void> {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/create`,
      payload,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return useMutation<void, Error, CreateMeetingRoomPayload>({
    mutationFn: async (payload) => await createMeetingRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetingroom"] });
    },
  });
}
