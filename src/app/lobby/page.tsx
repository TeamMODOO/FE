"use client";

import { useSignIn } from "@/hooks/signin/useSignIn";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import LobbyCanvas from "./_component/Canvas/Canvas";

export default function Page() {
  const { session, status, loginMessage } = useSignIn();

  useMainSocketConnect();
  return <LobbyCanvas></LobbyCanvas>;
}
