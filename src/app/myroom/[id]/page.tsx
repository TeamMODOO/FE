"use client";

import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import MyRoomCanvas from "./_component/Canvas/MyRoomCanvas";

export default function Page() {
  useMainSocketConnect();
  return <MyRoomCanvas></MyRoomCanvas>;
}
