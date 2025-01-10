import { useEffect } from "react";

import axios from "axios";

import useClientIdStore from "@/store/useClientIdStore";

interface UseMeetingRoomParams {
  roomId: string;
}

export const useMeetingRoomAttend = ({ roomId }: UseMeetingRoomParams) => {
  const { clientId } = useClientIdStore();

  useEffect(() => {
    const joinMeetingRoom = async () => {
      const payload = {
        room_id: roomId,
        client_id: clientId,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/join`,
        payload,
      );
    };

    const leaveMeetingRoom = async () => {
      const payload = {
        room_id: roomId,
        client_id: clientId,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/leave`,
        payload,
      );
    };

    joinMeetingRoom();

    return () => {
      leaveMeetingRoom();
    };
  }, [roomId]);
};
