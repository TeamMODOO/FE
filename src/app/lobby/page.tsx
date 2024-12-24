"use client";

import useMainSocketConnect from "@/hooks/useMainSocketConnect";

import LobbyCanvas from "./_component/Canvas/Canvas";

export default function Page() {
  useMainSocketConnect();

  return <LobbyCanvas></LobbyCanvas>;
}
