"use client";

import useMainSocketConnect from "@/hooks/useMainSocketConnect";

import QuestMapCanvas from "./_component/QuestMapCanvas/QuestMapCanvas";

export default function Complete() {
  useMainSocketConnect();
  return <QuestMapCanvas></QuestMapCanvas>;
}
