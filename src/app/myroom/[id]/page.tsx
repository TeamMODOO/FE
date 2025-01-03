"use client";

import { useParams } from "next/navigation";

import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import MyRoomCanvas from "./_component/Canvas/Canvas";

const ROOM_TYPE = "my";

export default function Page() {
  const params = useParams();
  const roomId = (params.id as string) ?? "99999";

  useMainSocketConnect({ roomType: ROOM_TYPE, roomId: roomId });

  return <MyRoomCanvas></MyRoomCanvas>;
}
