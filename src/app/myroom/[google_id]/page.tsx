"use client";

import { useParams } from "next/navigation";

import MyRoomCanvas from "./_components/Canvas/MyRoomCanvas";

const ROOM_TYPE = "my";

export default function Page() {
  const params = useParams();
  const roomId = (params.id as string) ?? "99999";

  // useMainSocketConnect({ roomType: ROOM_TYPE, roomId: roomId });

  return <MyRoomCanvas></MyRoomCanvas>;
}
