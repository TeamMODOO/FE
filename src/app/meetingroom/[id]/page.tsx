"use client";

import useAudioSocketConnect from "@/hooks/socket/useAudioSocketConnect";

import MeetingRoomCanvas from "./_component/Canvas";

export default function Page() {
  useAudioSocketConnect({ roomId: "" });

  return <MeetingRoomCanvas></MeetingRoomCanvas>;
}
