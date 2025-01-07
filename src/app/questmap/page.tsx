"use client";

import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import QuestMapCanvas from "./_components/QuestMapCanvas/QuestMapCanvas";

const ROOM_TYPE = "quest";
const ROOM_ID = "quest7";

export default function Page() {
  useMainSocketConnect({ roomType: ROOM_TYPE, roomId: ROOM_ID });

  return <QuestMapCanvas></QuestMapCanvas>;
}
