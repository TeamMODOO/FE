import { useEffect } from "react";

import axios from "axios";

interface UseMeetingRoomParams {
  roomId: string;
}

export const useMeetingRoomAttend = ({ roomId }: UseMeetingRoomParams) => {
  useEffect(() => {
    const joinMeetingRoom = async () => {
      const clientId = localStorage.getItem("client_id") ?? "";
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
      const clientId = localStorage.getItem("client_id") ?? "";
      const payload = {
        room_id: roomId,
        client_id: clientId,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/leave`,
        payload,
      );
    };

    // Join meeting room when component mounts
    joinMeetingRoom();

    // Leave meeting room when component unmounts
    return () => {
      leaveMeetingRoom();
    };
  }, [roomId]); // Add roomId as dependency
};
