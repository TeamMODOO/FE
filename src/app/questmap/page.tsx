"use client";

import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import QuestMapCanvas from "./_component/QuestMapCanvas/QuestMapCanvas";

const ROOM_TYPE = "quest";
const ROOM_ID = "7";

export default function Page() {
  useMainSocketConnect({ roomType: ROOM_TYPE, roomId: ROOM_ID });

  return <QuestMapCanvas></QuestMapCanvas>;
}
