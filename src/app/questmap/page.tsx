"use client";

import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import QuestMapCanvas from "./_component/QuestMapCanvas/QuestMapCanvas";

export default function Complete() {
  useMainSocketConnect();
  return <QuestMapCanvas></QuestMapCanvas>;
}
