"use client";

import useMainSocketConnect from "@/hooks/useMainSocketConnect";

import LobbyCanvas from "./_component/Canvas";

export default function Page() {
  useMainSocketConnect();

  return <LobbyCanvas></LobbyCanvas>;
}
