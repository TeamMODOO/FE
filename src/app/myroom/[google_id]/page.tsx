"use client";

import { useEffect } from "react";

import { useParams } from "next/navigation";

import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";

import MyRoomCanvas from "./_components/Canvas/MyRoomCanvas";

const ROOM_TYPE = "myroom";

export default function Page() {
  const params = useParams();
  const roomId = (params.google_id as string) ?? "99999";

  const { clientId } = useClientIdStore();
  const { socket, isConnected } = useSocketStore();

  useEffect(() => {
    if (!clientId || !socket || !isConnected) return;

    // 새로운 방 입장
    socket.emit("CS_JOIN_ROOM", {
      client_id: clientId,
      room_type: ROOM_TYPE,
      room_id: roomId,
    });

    return () => {
      if (socket && isConnected) {
        socket.emit("CS_LEAVE_ROOM", {
          client_id: clientId,
          room_id: roomId,
        });
      }
    };
  }, [socket, isConnected]);

  return <MyRoomCanvas></MyRoomCanvas>;
}
